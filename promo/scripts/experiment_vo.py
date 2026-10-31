#!/usr/bin/env python3
"""Goslint voice-over experiment lab.

Generates one complete narration track for every combination of script variant, Spanish Kokoro
voice and audio technique, in parallel, so they can be compared by ear. Nothing outside the
output directory is written: the original narration, WAV files, manifest and videos are only read.

    .venv/bin/python scripts/experiment_vo.py --workers 4            # the 36-track core matrix
    .venv/bin/python scripts/experiment_vo.py --extras --blend em_alex+em_santa --mp3
    .venv/bin/python scripts/experiment_vo.py --smoke                # short end-to-end check
    .venv/bin/python scripts/experiment_vo.py --probe                # pronunciation probes

Two stages, kept apart so a difference can be traced to one of them:
  synthesis  text -> trimmed clips (one model pass each), cached in <out>/work/raw
  finishing  clips -> assembled, processed, level-matched WAV in <out>/tracks
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.metadata
import json
import multiprocessing as mp
import os
import re
import shutil
import subprocess
import sys
import time
import traceback
from concurrent.futures import FIRST_COMPLETED, Future, ProcessPoolExecutor, wait
from concurrent.futures.process import BrokenProcessPool
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SCRIPT_DIR = ROOT / "scripts" / "vo_scripts"
NARRATION = ROOT / "scripts" / "narration.json"
MAKE_VO = ROOT / "scripts" / "make_vo.py"
ORIGINAL_VO = ROOT / "public" / "audio" / "vo"
SR = 24000  # Kokoro's output rate, and the rate of the existing clips

# Originals that must come out of a run byte-identical. Hashed before and after.
PROTECTED_GLOBS = ("scripts/narration.json", "scripts/make_vo.py", "src/vo-manifest.json",
                   "src/timeline.ts", "public/audio/vo/*.wav", "public/audio/*.wav", "out/*.mp4")
# The output directory may not be, or be inside, any of these.
PROTECTED_DIRS = ("public", "src", "scripts", "node_modules", ".venv")

# Silence between lines when they are synthesized one by one. In the video the gaps come from the
# cue sheet (src/timeline.ts), which follows the picture; an audio-only track has no picture, so
# the baseline uses one fixed gap, the median gap between lines in the 45 s Reel cut.
LINE_GAP_S = 0.45
SPEED_RANGE = (0.85, 1.10)  # scripts may only ask for conservative speed changes
MAX_PAUSE_S = 1.5
PRIORITY_VOICES = ("em_alex", "em_santa", "ef_dora")
BLEND_TECHNIQUE = "T03"


@dataclass(frozen=True)
class Synth:
    """How text becomes clips."""
    segmentation: str   # "line": one pass per line | "group": one pass per phrase group
    pauses: str         # "fixed": LINE_GAP_S everywhere | "script": each group's pause_after_s
    library_trim: bool  # kokoro_onnx's own trim (its default, which make_vo.py relies on)
    edge_trim: str      # "make_vo": lines 30-32 of make_vo.py | "soft": wider margins and fades
    lang: str           # espeak-ng voice used for phonemes


@dataclass(frozen=True)
class Technique:
    id: str
    slug: str
    synth: str
    finish: str
    core: bool
    summary: str


SYNTHS: dict[str, Synth] = {
    "line-es": Synth("line", "fixed", True, "make_vo", "es"),
    "group-es": Synth("group", "script", False, "soft", "es"),
    "group-es419": Synth("group", "script", False, "soft", "es-419"),
}

FINISHES: dict[str, str] = {
    "make_vo": "per clip: make_vo.py compress() (peak-normalize, 3:1 above -18 dB, attack 4 ms, "
               "release 90 ms, peak to -1.5 dBFS); then assemble",
    "natural": "no per-clip gain and no compression: assemble the clips at the level the model "
               "produced them",
    "gentle": "as natural, then one pass of FFmpeg acompressor over the whole track "
              "(2:1 above -21 dB, RMS detection, attack 15 ms, release 150 ms, soft knee)",
}
GENTLE_FILTER = "acompressor=threshold=0.089:ratio=2:attack=15:release=150:knee=2:detection=rms:makeup=1"

TECHNIQUES: dict[str, Technique] = {t.id: t for t in (
    Technique("T00", "baseline", "line-es", "make_vo", True,
              "Current pipeline: one pass per line, fixed gap, make_vo.py trim and compressor."),
    Technique("T01", "natural-prosody", "group-es", "make_vo", True,
              "Related lines spoken in one model pass, pauses that follow the meaning; baseline finishing."),
    Technique("T02", "natural-finishing", "line-es", "natural", True,
              "Baseline synthesis; no compression or per-clip normalization, one gain for the whole track."),
    Technique("T03", "combined", "group-es", "natural", False,
              "T01 synthesis with T02 finishing."),
    Technique("T04", "gentle-compression", "line-es", "gentle", False,
              "Baseline synthesis; gentle whole-track compression instead of none."),
    Technique("T05", "combined-es419", "group-es419", "natural", False,
              "T03 with Latin American phonemes (espeak es-419: seseo instead of the Castilian z)."),
)}

PROBE_SENTENCES = {
    "canonical": "Entrenamos en C++, Python y Java, y competimos en la Regional del ICPC con la UCEVA.",
    "hinted": "Entrenamos en ce más más, Páiton y Yava, y competimos en la Regional del I C P C con la Uceva.",
}
PROBE_TERMS = ("C++", "ce más más", "ICPC", "I C P C", "i ce pe ce", "I.C.P.C.", "UCEVA", "Uceva",
               "Python", "Páiton", "Java", "Yava", "Goslint", "cinco", "juez", "ejercicio")


# ---------------------------------------------------------------------------------------------
# small helpers
# ---------------------------------------------------------------------------------------------

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def fingerprint(data: Any) -> str:
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]


def write_atomic(path: Path, data: bytes | str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    if isinstance(data, str):
        tmp.write_text(data, encoding="utf-8")
    else:
        tmp.write_bytes(data)
    os.replace(tmp, path)


def db(x: float) -> float:
    return float(20 * np.log10(max(x, 1e-12)))


def clock(seconds: float) -> str:
    return f"{int(seconds // 60):02d}:{int(seconds % 60):02d}"


def snapshot_originals() -> dict[str, str]:
    files = sorted({p for g in PROTECTED_GLOBS for p in ROOT.glob(g) if p.is_file()})
    return {str(p.relative_to(ROOT)): sha256_file(p) for p in files}


def safe_out_dir(out: Path) -> Path:
    """Refuse output locations where a run could touch project assets."""
    out = out.resolve()
    if out in (ROOT, ROOT / "out"):
        raise SystemExit(f"--out must be a dedicated subdirectory, not {out}")
    for name in PROTECTED_DIRS:
        protected = (ROOT / name).resolve()
        if out == protected or protected in out.parents:
            raise SystemExit(f"--out may not be inside {protected}")
    return out


# ---------------------------------------------------------------------------------------------
# scripts
# ---------------------------------------------------------------------------------------------

def spoken_text(text: str, hints: list[dict]) -> str:
    """Apply a script's pronunciation hints: whole-token, case-sensitive replacements."""
    for hint in hints:
        text = re.sub(rf"(?<!\w){re.escape(hint['match'])}(?!\w)", hint["say"], text)
    return text


def load_script(path: Path) -> dict:
    script = json.loads(path.read_text(encoding="utf-8"))
    sid = script.get("id", path.stem)
    for key in ("id", "slug", "title", "lines", "groups", "pronunciation"):
        if key not in script:
            raise ValueError(f"{path.name}: missing '{key}'")
    line_ids = [ln["id"] for ln in script["lines"]]
    if len(set(line_ids)) != len(line_ids):
        raise ValueError(f"{sid}: duplicate line ids")
    for ln in script["lines"]:
        if not ln["text"].strip():
            raise ValueError(f"{sid}/{ln['id']}: empty text")
        if not SPEED_RANGE[0] <= ln.get("speed", 1.0) <= SPEED_RANGE[1]:
            raise ValueError(f"{sid}/{ln['id']}: speed outside {SPEED_RANGE}")
    grouped = [i for g in script["groups"] for i in g["lines"]]
    if grouped != line_ids:
        raise ValueError(f"{sid}: groups must cover every line once, in order")
    for g in script["groups"]:
        if not 0 <= g.get("pause_after_s", 0) <= MAX_PAUSE_S:
            raise ValueError(f"{sid}/{g['id']}: pause outside 0..{MAX_PAUSE_S} s")
        if "speed" in g and not SPEED_RANGE[0] <= g["speed"] <= SPEED_RANGE[1]:
            raise ValueError(f"{sid}/{g['id']}: speed outside {SPEED_RANGE}")
    script["file"] = path.name
    script["sha256"] = sha256_file(path)
    script["words"] = sum(len(ln["text"].split()) for ln in script["lines"])
    return script


def check_control_script(script: dict) -> None:
    """S00 has to stay the existing narration, word for word."""
    original = json.loads(NARRATION.read_text(encoding="utf-8"))
    ours = [(ln["id"], ln["text"], ln.get("speed", 1.0)) for ln in script["lines"]]
    theirs = [(ln["id"], ln["text"], ln.get("speed", 1.0)) for ln in original]
    if ours != theirs:
        raise ValueError(f"{script['file']} no longer matches scripts/narration.json line for line")


def truncate_for_smoke(script: dict, lines: int = 2) -> dict:
    keep = [ln["id"] for ln in script["lines"][:lines]]
    groups = [g for g in script["groups"] if set(g["lines"]) <= set(keep)]
    if [i for g in groups for i in g["lines"]] != keep:
        groups = [{"id": f"{script['id']}-smoke-{i}", "lines": [i], "pause_after_s": 0.4} for i in keep]
    return {**script, "lines": script["lines"][:lines], "groups": groups}


def segments_for(script: dict, synth: Synth) -> list[dict]:
    """The model passes a script needs under a synthesis spec, with their pauses."""
    hints = script["pronunciation"]
    lines = {ln["id"]: ln for ln in script["lines"]}
    if synth.segmentation == "line":
        units = [{"id": ln["id"], "lines": [ln["id"]], "speed": ln.get("speed", 1.0),
                  "pause_after_s": LINE_GAP_S} for ln in script["lines"]]
    else:
        units = []
        for g in script["groups"]:
            speeds = {lines[i].get("speed", 1.0) for i in g["lines"]}
            if "speed" not in g and len(speeds) > 1:
                raise ValueError(f"{g['id']}: lines have different speeds, give the group its own")
            units.append({"id": g["id"], "lines": g["lines"], "speed": g.get("speed", speeds.pop()),
                          "pause_after_s": g.get("pause_after_s", 0.0)})
    units[-1]["pause_after_s"] = 0.0
    for u in units:
        u["text"] = " ".join(lines[i]["text"] for i in u["lines"])
        u["spoken_text"] = spoken_text(u["text"], hints)
    return units


# ---------------------------------------------------------------------------------------------
# voices
# ---------------------------------------------------------------------------------------------

def parse_voice(spec: str) -> list[tuple[str, float]]:
    """'em_alex' or a blend such as 'em_alex+em_santa' / 'em_alex:0.7+ef_dora:0.3'."""
    parts = []
    for item in spec.split("+"):
        name, _, weight = item.partition(":")
        parts.append((name.strip(), float(weight) if weight else 1.0))
    total = sum(w for _, w in parts)
    if total <= 0 or any(w < 0 for _, w in parts):
        raise ValueError(f"bad voice weights in {spec!r}")
    return [(n, w / total) for n, w in parts]


def voice_label(spec: str) -> str:
    parts = parse_voice(spec)
    if len(parts) == 1:
        return parts[0][0]
    return "blend-" + "-".join(f"{n}{round(w * 100)}" for n, w in parts)


def discover_voices(voices_file: Path) -> dict[str, list[str]]:
    """Voice names really present in the voices file, by Kokoro language prefix."""
    with np.load(voices_file) as data:
        names = sorted(data.files)
    return {"all": names, "spanish": [n for n in names if re.match(r"e[fm]_", n)]}


# ---------------------------------------------------------------------------------------------
# audio: trims, assembly, measurement
# ---------------------------------------------------------------------------------------------

_MAKE_VO_TRIM = (
    "    thr = 0.01 * np.abs(s).max()\n"
    "    idx = np.where(np.abs(s) > thr)[0]\n"
    "    s = s[max(idx[0] - int(0.02 * sr), 0): idx[-1] + int(0.12 * sr)]\n"
)


def trim_make_vo(s: np.ndarray, sr: int) -> np.ndarray:
    """The silence trim of scripts/make_vo.py, lines 30-32, verbatim."""
    thr = 0.01 * np.abs(s).max()
    idx = np.where(np.abs(s) > thr)[0]
    s = s[max(idx[0] - int(0.02 * sr), 0): idx[-1] + int(0.12 * sr)]
    return s


def trim_soft(s: np.ndarray, sr: int, floor_db: float = -50.0, lead: float = 0.03,
              tail: float = 0.15, fade_in: float = 0.005, fade_out: float = 0.03) -> np.ndarray:
    """Trim the untrimmed model output with room around the speech and faded edges."""
    idx = np.where(np.abs(s) > np.abs(s).max() * 10 ** (floor_db / 20))[0]
    s = s[max(idx[0] - int(lead * sr), 0): idx[-1] + int(tail * sr)].copy()
    n_in, n_out = min(int(fade_in * sr), len(s)), min(int(fade_out * sr), len(s))
    s[:n_in] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n_in, dtype=np.float32))
    s[len(s) - n_out:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n_out, dtype=np.float32))
    return s


def load_make_vo_compressor():
    """compress() taken from scripts/make_vo.py itself, without running that script.

    make_vo.py synthesizes and overwrites the project's clips at import time, so it cannot be
    imported. Its compressor is compiled from the source instead, and the three trim lines copied
    into trim_make_vo() are checked against the file, so a later edit to make_vo.py cannot leave
    the baseline quietly out of date.
    """
    source = MAKE_VO.read_text(encoding="utf-8")
    if _MAKE_VO_TRIM not in source:
        raise ValueError("scripts/make_vo.py changed its silence trim; update trim_make_vo() to match")
    node = next((n for n in ast.parse(source).body
                 if isinstance(n, ast.FunctionDef) and n.name == "compress"), None)
    if node is None:
        raise ValueError("scripts/make_vo.py no longer defines compress()")
    namespace: dict[str, Any] = {"np": np}
    exec(compile(ast.Module([node], []), str(MAKE_VO), "exec"), namespace)
    return namespace["compress"]


def assemble(clips: list[np.ndarray], pauses: list[float]) -> tuple[np.ndarray, list[float]]:
    """Join clips with silence after each one; returns the track and each clip's start time."""
    parts, starts, pos = [], [], 0
    for clip, pause in zip(clips, pauses):
        starts.append(pos / SR)
        gap = np.zeros(int(round(pause * SR)), dtype=np.float32)
        parts += [clip.astype(np.float32), gap]
        pos += len(clip) + len(gap)
    return np.concatenate(parts), starts


def _ffmpeg(args: list[str], audio: np.ndarray) -> subprocess.CompletedProcess:
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "1",
           "-i", "pipe:0", *args]
    return subprocess.run(cmd, input=audio.astype("<f4").tobytes(), capture_output=True, check=False)


def measure(audio: np.ndarray) -> dict[str, float | None]:
    """Integrated loudness, loudness range and true peak (EBU R128, via FFmpeg loudnorm's analysis)."""
    empty = {"integrated_lufs": None, "lra_lu": None, "true_peak_dbtp": None}
    if not shutil.which("ffmpeg"):
        return empty
    err = _ffmpeg(["-af", "loudnorm=print_format=json", "-f", "null", "-"], audio).stderr.decode(errors="replace")
    try:
        stats = json.loads(err[err.rindex("{"): err.rindex("}") + 1])
        values = [float(stats[k]) for k in ("input_i", "input_lra", "input_tp")]
    except (ValueError, KeyError):
        return empty
    if not all(np.isfinite(values)):
        return empty
    return dict(zip(empty, (round(v, 2) for v in values)))


def gentle_compress(audio: np.ndarray) -> np.ndarray:
    if not shutil.which("ffmpeg"):
        raise ValueError("the gentle-compression finish needs FFmpeg (acompressor), which is not installed")
    run = _ffmpeg(["-af", GENTLE_FILTER, "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"], audio)
    if run.returncode != 0:
        raise RuntimeError(f"ffmpeg acompressor failed: {run.stderr.decode(errors='replace')[-300:]}")
    out = np.frombuffer(run.stdout, dtype="<f4").astype(np.float32)
    if abs(len(out) - len(audio)) > 2:
        raise RuntimeError(f"acompressor changed the length ({len(audio)} -> {len(out)} samples)")
    return out[: len(audio)]


def level_gain(m: dict, target_lufs: float, ceiling_dbtp: float) -> tuple[float, bool]:
    """One static gain that reaches the target, held back if it would pass the true-peak ceiling."""
    if m["integrated_lufs"] is None:
        return 0.0, False
    gain = target_lufs - m["integrated_lufs"]
    headroom = ceiling_dbtp - m["true_peak_dbtp"]
    return (round(headroom, 2), True) if gain > headroom else (round(gain, 2), False)


# ---------------------------------------------------------------------------------------------
# worker side
# ---------------------------------------------------------------------------------------------

_KOKORO: dict[tuple, Any] = {}


def _kokoro(model: str, voices_file: str, threads: int):
    """One model session per worker process, created on first use and reused for every clip."""
    key = (model, voices_file, threads)
    if key not in _KOKORO:
        import onnxruntime as rt
        from kokoro_onnx import Kokoro
        options = rt.SessionOptions()
        options.intra_op_num_threads = threads
        options.inter_op_num_threads = 1
        session = rt.InferenceSession(model, sess_options=options, providers=["CPUExecutionProvider"])
        _KOKORO[key] = Kokoro.from_session(session, voices_file)
    return _KOKORO[key]


def _style(k, spec: str):
    """A voice name as the library takes it, or the weighted mix of several style tensors."""
    parts = parse_voice(spec)
    for name, _ in parts:
        if name not in k.voices:
            raise ValueError(f"voice {name!r} is not in the voices file")
    if len(parts) == 1:
        return parts[0][0]
    return np.sum([k.get_voice_style(n) * w for n, w in parts], axis=0).astype(np.float32)


def _phonemes(k, text: str, lang: str) -> tuple[str, str]:
    """Phonemes as the model receives them, and any symbols its vocabulary dropped on the way."""
    import phonemizer
    raw = phonemizer.phonemize(text.strip(), lang, preserve_punctuation=True, with_stress=True)
    kept = k.tokenizer.phonemize(text, lang)
    dropped = "".join(sorted({c for c in raw if c not in k.tokenizer.vocab and not c.isspace()}))
    return kept, dropped


def synth_unit(p: dict) -> dict:
    """Synthesize every segment of one script x voice x synthesis spec and cache the clips."""
    from kokoro_onnx.chunker import split_phonemes
    from kokoro_onnx.config import MAX_PHONEME_LENGTH
    started = time.time()
    print(f"    [pid {os.getpid()}] synth  {p['label']}", flush=True)
    synth = Synth(**p["synth"])
    k = _kokoro(p["model"], p["voices_file"], p["threads"])
    style = _style(k, p["voice"])
    arrays, meta, warnings = {}, [], []
    for n, seg in enumerate(p["segments"]):
        phonemes, dropped = _phonemes(k, seg["spoken_text"], synth.lang)
        passes = len(split_phonemes(phonemes, MAX_PHONEME_LENGTH))
        if passes != 1:
            raise ValueError(f"{seg['id']}: {len(phonemes)} phonemes need {passes} model passes; "
                             f"a segment has to fit one pass ({MAX_PHONEME_LENGTH} phonemes)")
        if dropped:
            warnings.append(f"{seg['id']}: symbols not in the model vocabulary were dropped: {dropped}")
        audio, sr = k.create(seg["spoken_text"], voice=style, speed=seg["speed"], lang=synth.lang,
                             trim=synth.library_trim)
        if sr != SR:
            raise ValueError(f"model returned {sr} Hz, expected {SR}")
        audio = np.asarray(audio, dtype=np.float32)
        if not len(audio) or np.abs(audio).max() < 1e-4:
            raise RuntimeError(f"{seg['id']}: the model returned silence")
        clip = (trim_make_vo if synth.edge_trim == "make_vo" else trim_soft)(audio, sr)
        per_phoneme = len(clip) / sr / max(len(phonemes), 1)
        if not 0.035 <= per_phoneme <= 0.2:
            warnings.append(f"{seg['id']}: unusual pace, {per_phoneme * 1000:.0f} ms per phoneme")
        arrays[f"seg{n:02d}"] = clip
        meta.append({**seg, "phonemes": phonemes, "n_phonemes": len(phonemes), "model_passes": passes,
                     "raw_samples": len(audio), "samples": len(clip),
                     "raw_peak_dbfs": round(db(float(np.abs(clip).max())), 2)})
    info = {"fingerprint": p["fingerprint"], "segments": meta, "warnings": warnings,
            "has_duration_output": bool(k.has_timings), "synth": p["synth"], "voice": p["voice"],
            "elapsed_s": round(time.time() - started, 2)}
    path = Path(p["raw_path"])
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.stem}.{os.getpid()}.tmp.npz")
    np.savez(tmp, meta=np.array(json.dumps(info, ensure_ascii=False)), **arrays)
    os.replace(tmp, path)
    return {"elapsed_s": info["elapsed_s"], "audio_s": round(sum(len(a) for a in arrays.values()) / SR, 2),
            "pid": os.getpid()}


def read_unit(path: Path) -> tuple[dict, list[np.ndarray]]:
    with np.load(path) as data:
        info = json.loads(str(data["meta"]))
        clips = [data[f"seg{n:02d}"] for n in range(len(info["segments"]))]
    return info, clips


def _fidelity(clips: list[np.ndarray], segments: list[dict]) -> dict | None:
    """How closely regenerated baseline clips match the project's existing ones (read only)."""
    import soundfile as sf
    rows = []
    for clip, seg in zip(clips, segments):
        original = ORIGINAL_VO / f"{seg['id']}.wav"
        if not original.exists():
            return None
        ref, _ = sf.read(original, dtype="float32")
        best = 0.0
        for lag in range(-8, 9):  # the trims can land a few samples apart
            a, b = (clip[lag:], ref) if lag >= 0 else (clip, ref[-lag:])
            n = min(len(a), len(b))
            best = max(best, float(np.corrcoef(a[:n], b[:n])[0, 1]))
        rows.append({"id": seg["id"], "length_diff_samples": int(len(clip) - len(ref)),
                     "correlation": round(best, 4)})
    return {"compared_with": "public/audio/vo/*.wav",
            "max_length_diff_samples": max(abs(r["length_diff_samples"]) for r in rows),
            "min_correlation": min(r["correlation"] for r in rows), "lines": rows}


def build_track(p: dict) -> dict:
    """Finish one track from cached clips: process, assemble, level-match, write, verify."""
    import soundfile as sf
    started = time.time()
    print(f"    [pid {os.getpid()}] finish {p['track_id']}", flush=True)
    info, clips = read_unit(Path(p["raw_path"]))
    segments, chain, warnings = info["segments"], [], list(info["warnings"])
    if len(clips) != len(p["expected_segments"]) or [s["id"] for s in segments] != p["expected_segments"]:
        raise ValueError("cached clips do not match the script's segments")

    extra: dict[str, Any] = {}
    if p["finish"] == "make_vo":
        compress = load_make_vo_compressor()
        # A clip that starts on exact digital silence makes compress() evaluate 0 ** negative for
        # samples whose gain it then discards (np.where keeps 1.0 there); only the warning is silenced.
        with np.errstate(divide="ignore"):
            clips = [np.asarray(compress(c, SR), dtype=np.float32) for c in clips]
        chain.append(FINISHES["make_vo"])
        if p["check_fidelity"]:
            extra["baseline_fidelity"] = _fidelity(clips, segments)
    else:
        chain.append(FINISHES["natural"])
    pauses = [s["pause_after_s"] for s in segments]
    track, starts = assemble(clips, pauses)
    chain.append("assemble: clips in script order, silence after each as listed under segments")

    if p["finish"] == "gentle":
        pre, _ = level_gain(measure(track), p["target_lufs"], 0.0)
        track = gentle_compress(track * 10 ** (pre / 20))
        chain.append(f"gain {pre:+.2f} dB to {p['target_lufs']} LUFS, then FFmpeg {GENTLE_FILTER}")

    native = measure(track)
    gain, capped = (0.0, False) if p["no_level_match"] else level_gain(native, p["target_lufs"], p["ceiling_dbtp"])
    if native["integrated_lufs"] is None and not p["no_level_match"]:
        warnings.append("loudness could not be measured (FFmpeg missing or clip too short); no level match")
    if capped:
        warnings.append(f"level match held {p['target_lufs'] - native['integrated_lufs'] - gain:.2f} dB "
                        f"below target by the {p['ceiling_dbtp']} dBTP ceiling")
    track = track * 10 ** (gain / 20)
    chain.append("level match off" if p["no_level_match"] else
                 f"level match: one static gain of {gain:+.2f} dB for the whole track "
                 f"(target {p['target_lufs']} LUFS, ceiling {p['ceiling_dbtp']} dBTP)")
    chain.append("write 24 kHz mono 16-bit PCM WAV")

    out = Path(p["out_path"])
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_name(f".{out.stem}.{os.getpid()}.tmp.wav")
    try:
        sf.write(tmp, track, SR, subtype="PCM_16")
        # Everything below reads the file back, so what is verified is what was written.
        decoded, sr = sf.read(tmp, dtype="float32", always_2d=True)
        pcm, _ = sf.read(tmp, dtype="int16")
        fmt = sf.info(tmp)
        final = measure(decoded[:, 0])
        expected = sum(len(c) for c in clips) + sum(int(round(x * SR)) for x in pauses)
        ffmpeg_ok = None
        if shutil.which("ffmpeg"):
            run = subprocess.run(["ffmpeg", "-v", "error", "-i", str(tmp), "-f", "null", "-"],
                                 capture_output=True, check=False)
            ffmpeg_ok = run.returncode == 0 and not run.stderr.strip()
        clipped = int(np.sum(np.abs(pcm.astype(np.int32)) >= 32767))
        checks = {
            "format_24k_mono_pcm16": (sr, fmt.channels, fmt.subtype) == (SR, 1, "PCM_16"),
            "length_matches_segments_and_pauses": decoded.shape[0] == expected,
            "all_segments_present_in_order": len(clips) == len(p["expected_segments"]),
            "every_segment_audible": all(len(c) > 0.2 * SR and np.sqrt(np.mean(c ** 2)) > 1e-3 for c in clips),
            "no_clipped_samples": clipped == 0,
            "decodes_with_ffmpeg": ffmpeg_ok,
            "true_peak_within_ceiling": None if final["true_peak_dbtp"] is None or p["no_level_match"]
            else final["true_peak_dbtp"] <= p["ceiling_dbtp"] + 0.1,
        }
        failed = [name for name, ok in checks.items() if ok is False]
        if failed:
            raise ValueError("output failed validation: " + ", ".join(failed))
        os.replace(tmp, out)
    finally:
        tmp.unlink(missing_ok=True)

    if p["mp3_path"]:
        mp3 = Path(p["mp3_path"])
        mp3.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-c:a", "libmp3lame", "-q:a", "2",
                        str(mp3)], capture_output=True, check=True)

    speech = sum(len(c) for c in clips) / SR
    seg_out = [{"id": s["id"], "lines": s["lines"], "text": s["text"], "spoken_text": s["spoken_text"],
                "phonemes": s["phonemes"], "speed": s["speed"], "start_s": round(st, 3),
                "duration_s": round(len(c) / SR, 3), "pause_after_s": s["pause_after_s"]}
               for s, c, st in zip(segments, clips, starts)]
    return {
        "segments": seg_out, "processing_chain": chain, "warnings": warnings, "validation": checks,
        "audio": {"sample_rate": sr, "bit_depth": 16, "channels": fmt.channels, "codec": "pcm_s16le",
                  "samples": int(decoded.shape[0]), "duration_s": round(decoded.shape[0] / SR, 3),
                  "speech_s": round(speech, 3), "pause_s": round(decoded.shape[0] / SR - speech, 3),
                  "bytes": out.stat().st_size, "sha256": sha256_file(out)},
        "loudness": {**final, "sample_peak_dbfs": round(db(float(np.abs(decoded).max())), 2),
                     "clipped_samples": clipped, "before_level_match": native,
                     "level_match_gain_db": gain, "level_match_capped": capped},
        "model_has_duration_output": info["has_duration_output"],
        "elapsed_s": round(time.time() - started, 2), "pid": os.getpid(), **extra,
    }


def probe_clip(p: dict) -> dict:
    """One short pronunciation probe: a sentence in one voice and one phoneme language."""
    import soundfile as sf
    started = time.time()
    print(f"    [pid {os.getpid()}] probe  {p['label']}", flush=True)
    k = _kokoro(p["model"], p["voices_file"], p["threads"])
    phonemes, dropped = _phonemes(k, p["text"], p["lang"])
    audio, sr = k.create(p["text"], voice=_style(k, p["voice"]), lang=p["lang"], trim=False)
    clip = trim_soft(np.asarray(audio, dtype=np.float32), sr)
    clip = clip / np.abs(clip).max() * 10 ** (-3 / 20)
    out = Path(p["out_path"])
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_name(f".{out.stem}.{os.getpid()}.tmp.wav")
    sf.write(tmp, clip, sr, subtype="PCM_16")
    os.replace(tmp, out)
    terms = {t: {lang: _phonemes(k, t, lang)[0] for lang in ("es", "es-419")} for t in p.get("terms", ())}
    return {"file": out.name, "voice": p["voice"], "lang": p["lang"], "variant": p["variant"],
            "text": p["text"], "phonemes": phonemes, "dropped": dropped,
            "duration_s": round(len(clip) / sr, 3), "terms": terms,
            "elapsed_s": round(time.time() - started, 2)}


WORKERS = {"synth": synth_unit, "track": build_track, "probe": probe_clip}


def run_task(kind: str, payload: dict) -> dict:
    return WORKERS[kind](payload)


# ---------------------------------------------------------------------------------------------
# scheduler
# ---------------------------------------------------------------------------------------------

@dataclass
class Task:
    id: str
    kind: str
    payload: dict
    deps: tuple[str, ...] = ()
    status: str = "pending"   # pending | running | ok | failed | skipped
    attempts: int = 0
    error: str | None = None
    result: dict | None = None


# Wrong input or a failed check gives the same answer every time, so it is not retried.
PERMANENT = (ValueError, FileNotFoundError, AssertionError, KeyError, TypeError)


def run_pool(tasks: dict[str, Task], workers: int, retries: int, t0: float) -> None:
    """Run tasks in a bounded process pool, releasing each one when its dependencies are done."""
    todo = [t for t in tasks.values() if t.status == "pending"]
    total, done = len(todo), 0
    if not todo:
        return
    context = mp.get_context("spawn")  # a clean interpreter per worker; ONNX Runtime is never forked
    pool = ProcessPoolExecutor(max_workers=workers, mp_context=context)
    running: dict[Future, Task] = {}

    def report(task: Task, note: str) -> None:
        active = ", ".join(t.id for t in running.values()) or "-"
        waiting = sum(t.status == "pending" for t in todo)
        print(f"[{done:3d}/{total}  {clock(time.time() - t0)}] {task.status:<7}{task.kind:<6} {task.id}{note}"
              f"   | running {len(running)}: {active}   | waiting {waiting}", flush=True)

    try:
        while True:
            for task in [t for t in todo if t.status == "pending"]:
                broken = [d for d in task.deps if tasks[d].status == "failed"]
                if broken:
                    task.status, task.error = "failed", f"synthesis failed ({broken[0]}): {tasks[broken[0]].error}"
                    done += 1
                    report(task, "")
                elif len(running) < workers and all(tasks[d].status in ("ok", "skipped") for d in task.deps):
                    # Only as many tasks as there are workers are handed over, so "running" is the truth
                    task.status = "running"
                    task.attempts += 1
                    running[pool.submit(run_task, task.kind, task.payload)] = task
            if not running:
                break
            finished, _ = wait(running, return_when=FIRST_COMPLETED)
            pool_died = False
            for future in finished:
                task = running.pop(future)
                try:
                    task.result, task.status, task.error = future.result(), "ok", None
                    done += 1
                    report(task, f"  {task.result.get('elapsed_s', 0):.1f}s")
                except Exception as error:  # noqa: BLE001 - every failure is recorded, none stops the run
                    pool_died = pool_died or isinstance(error, BrokenProcessPool)
                    detail = f"{type(error).__name__}: {error}"
                    if not isinstance(error, PERMANENT) and task.attempts <= retries:
                        task.status = "pending"
                        print(f"          retry  {task.kind:<6} {task.id}  ({detail})", flush=True)
                    else:
                        task.status, task.error = "failed", detail
                        done += 1
                        report(task, f"  {detail}")
            if pool_died:  # a worker crashed: its siblings are lost too, start a fresh pool
                for task in running.values():
                    task.status = "pending" if task.attempts <= retries else "failed"
                    if task.status == "failed":
                        task.error, done = "worker process died", done + 1
                running.clear()
                pool.shutdown(wait=False, cancel_futures=True)
                pool = ProcessPoolExecutor(max_workers=workers, mp_context=context)
    finally:
        pool.shutdown(wait=True, cancel_futures=True)


# ---------------------------------------------------------------------------------------------
# planning
# ---------------------------------------------------------------------------------------------

def default_workers(threads: int) -> int:
    """A conservative pool size: each worker holds its own model (about 1 GB) and `threads` cores."""
    cpus = os.cpu_count() or 2
    available_gb = 4.0
    try:
        for line in Path("/proc/meminfo").read_text().splitlines():
            if line.startswith("MemAvailable"):
                available_gb = int(line.split()[1]) / 1e6
    except OSError:
        pass
    return max(1, min(4, cpus // (2 * threads), int(available_gb // 2)))


def environment(model: Path, voices_file: Path, threads: int) -> dict:
    def version(name: str) -> str | None:
        try:
            return importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            return None
    ffmpeg = None
    if shutil.which("ffmpeg"):
        ffmpeg = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True).stdout.split("\n")[0]
    return {
        "model": {"file": model.name, "bytes": model.stat().st_size, "sha256": sha256_file(model)},
        "voices_file": {"file": voices_file.name, "bytes": voices_file.stat().st_size,
                        "sha256": sha256_file(voices_file)},
        "packages": {n: version(n) for n in ("kokoro-onnx", "onnxruntime", "phonemizer",
                                             "espeakng-loader", "numpy", "soundfile")},
        "execution_provider": "CPUExecutionProvider", "threads_per_worker": threads,
        "python": sys.version.split()[0], "ffmpeg": ffmpeg, "cpus": os.cpu_count(),
    }


def plan(args, scripts: list[dict], voices: list[str], blends: list[str], env: dict, out: Path
         ) -> tuple[dict[str, Task], list[dict]]:
    """Every synthesis unit and track of this run, with what is already done marked as skipped."""
    tasks: dict[str, Task] = {}
    entries: list[dict] = []
    wanted = [t for t in TECHNIQUES.values()
              if (t.core or args.extras) and (not args.techniques or t.id in args.techniques)]
    make_vo_sha = sha256_file(MAKE_VO)
    combos = [(s, v, t) for s in scripts for v in voices for t in wanted]
    combos += [(s, b, TECHNIQUES[BLEND_TECHNIQUE]) for s in scripts for b in blends]
    for script, voice, tech in combos:
        synth = SYNTHS[tech.synth]
        label = voice_label(voice)
        segments = segments_for(script, synth)
        unit_id = f"{script['id']}_{label}_{tech.synth}"
        unit_fp = fingerprint([segments, parse_voice(voice), asdict(synth), env["model"]["sha256"],
                               env["voices_file"]["sha256"], env["packages"], env["threads_per_worker"]])
        raw_path = out / "work" / "raw" / f"{unit_id}.npz"
        if unit_id not in tasks:
            task = Task(unit_id, "synth", {
                "label": unit_id, "segments": segments, "voice": voice, "synth": asdict(synth),
                "model": str(args.model), "voices_file": str(args.voices_file),
                "threads": args.threads_per_worker, "fingerprint": unit_fp, "raw_path": str(raw_path)})
            if not args.force and raw_path.exists():
                try:
                    if read_unit(raw_path)[0]["fingerprint"] == unit_fp:
                        task.status = "skipped"
                except Exception:  # noqa: BLE001 - an unreadable cache entry is simply rebuilt
                    pass
            tasks[unit_id] = task

        track_id = f"{script['id']}_{label}_{tech.id}"
        subdir = "tracks" if tech.core and "+" not in voice else "tracks-extra"
        filename = f"{subdir}/{track_id}_{tech.slug}.wav"
        track_fp = fingerprint([unit_fp, tech.finish, FINISHES[tech.finish], GENTLE_FILTER, make_vo_sha,
                                args.target_lufs, args.true_peak, args.no_level_match])
        entry = {
            "track_id": track_id, "filename": filename, "set": "core" if subdir == "tracks" else "extra",
            "status": "pending", "error": None, "fingerprint": track_fp,
            "script": {"id": script["id"], "slug": script["slug"], "title": script["title"],
                       "file": f"scripts/{script['file']}", "sha256": script["sha256"]},
            "voice": {"id": label, "components": [{"name": n, "weight": round(w, 4)} for n, w in parse_voice(voice)]},
            "technique": {"id": tech.id, "slug": tech.slug, "summary": tech.summary},
            "synthesis": {**asdict(synth), "line_gap_s": LINE_GAP_S if synth.pauses == "fixed" else None,
                          "speeds": {s["id"]: s["speed"] for s in segments}, "passes": len(segments),
                          "threads": args.threads_per_worker},
            "finishing": tech.finish,
            "model": f"{env['model']['file']} sha256:{env['model']['sha256'][:12]} / "
                     f"kokoro-onnx {env['packages']['kokoro-onnx']}",
        }
        sidecar = out / "work" / "meta" / f"{track_id}.json"
        task = Task(track_id, "track", {
            "track_id": track_id, "raw_path": str(raw_path), "out_path": str(out / filename),
            "expected_segments": [s["id"] for s in segments], "finish": tech.finish,
            "target_lufs": args.target_lufs, "ceiling_dbtp": args.true_peak,
            "no_level_match": args.no_level_match,
            "mp3_path": str(out / "mp3" / f"{track_id}_{tech.slug}.mp3") if args.mp3 else None,
            "check_fidelity": (script["id"], voice, tech.id) == ("S00", "em_alex", "T00") and not args.smoke,
        }, deps=(unit_id,))
        if not args.force and tasks[unit_id].status == "skipped" and sidecar.exists():
            try:
                old = json.loads(sidecar.read_text(encoding="utf-8"))
                wav, mp3 = out / filename, task.payload["mp3_path"]
                if (old["status"] == "ok" and old["fingerprint"] == track_fp and wav.exists()
                        and sha256_file(wav) == old["audio"]["sha256"] and (not mp3 or Path(mp3).exists())):
                    task.status, entry = "skipped", old
            except Exception:  # noqa: BLE001 - a damaged sidecar means the track is rebuilt
                pass
        tasks[track_id] = task
        entries.append(entry)
    return tasks, entries


# ---------------------------------------------------------------------------------------------
# modes
# ---------------------------------------------------------------------------------------------

def run_probe(args, voices: list[str], out: Path, t0: float) -> int:
    """Short clips comparing canonical spelling with hinted spelling, in both phoneme languages."""
    tasks: dict[str, Task] = {}
    for voice in voices:
        for lang in ("es", "es-419"):
            for variant, text in PROBE_SENTENCES.items():
                tid = f"probe_{voice}_{lang}_{variant}"
                tasks[tid] = Task(tid, "probe", {
                    "label": tid, "voice": voice, "lang": lang, "variant": variant, "text": text,
                    "model": str(args.model), "voices_file": str(args.voices_file),
                    "threads": args.threads_per_worker, "out_path": str(out / f"{tid}.wav"),
                    "terms": PROBE_TERMS if (voice, lang, variant) == (voices[0], "es", "canonical") else ()})
    run_pool(tasks, args.workers, args.retries, t0)
    clips = [t.result for t in tasks.values() if t.status == "ok"]
    terms = next((c.pop("terms") for c in clips if c["terms"]), {})
    for c in clips:
        c.pop("terms", None)
    write_atomic(out / "pronunciation.json", json.dumps({"terms": terms, "clips": clips}, ensure_ascii=False, indent=2))
    lines = ["# Pronunciation probes", "",
             "Phonemes the model receives for each spelling (espeak-ng `es` is what the project uses, "
             "`es-419` is Latin American Spanish).", "", "| Written | `es` | `es-419` |", "|---|---|---|"]
    lines += [f"| {t} | `{p['es']}` | `{p['es-419']}` |" for t, p in terms.items()]
    lines += ["", "Clips (the same sentence, canonical spelling against hinted spelling):", ""]
    lines += [f"- `{c['file']}` · {c['duration_s']} s · `{c['phonemes']}`" for c in clips]
    write_atomic(out / "README.md", "\n".join(lines) + "\n")
    failed = [t for t in tasks.values() if t.status == "failed"]
    print(f"\nprobes: {len(clips)} written, {len(failed)} failed -> {out}")
    return 1 if failed else 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", type=Path, default=ROOT / "kokoro-v1.0.onnx")
    ap.add_argument("--voices-file", type=Path, default=ROOT / "voices-v1.0.bin")
    ap.add_argument("--out", type=Path, default=ROOT / "out" / "audio-experiments")
    ap.add_argument("--workers", type=int, default=None, help="parallel worker processes, each with its own model session (default: from CPU and RAM, at most 4)")
    ap.add_argument("--threads-per-worker", type=int, default=2, help="ONNX Runtime threads per session; changing it changes the samples slightly")
    ap.add_argument("--scripts", type=lambda s: s.split(","), default=None, help="e.g. S00,S02 (default: all)")
    ap.add_argument("--voices", type=lambda s: s.split(","), default=None, help="default: every Spanish voice in the voices file")
    ap.add_argument("--techniques", type=lambda s: s.split(","), default=None, help="e.g. T00,T02 (default: all selected sets)")
    ap.add_argument("--extras", action="store_true", help="also run the extra techniques (T03 combined, T04 gentle compression, T05 es-419)")
    ap.add_argument("--blend", action="append", default=[], metavar="A+B", help=f"extra voice made by mixing styles, e.g. em_alex+em_santa or em_alex:0.7+ef_dora:0.3; runs with {BLEND_TECHNIQUE}")
    # -25 LUFS: uncompressed Kokoro speech peaks 21 to 23 dB above its loudness, so this is the
    # highest round level that every track reaches without passing the true-peak ceiling.
    ap.add_argument("--target-lufs", type=float, default=-25.0, help="integrated loudness every track is matched to")
    ap.add_argument("--true-peak", type=float, default=-1.0, help="true-peak ceiling for the level match, dBTP")
    ap.add_argument("--no-level-match", action="store_true", help="leave every track at the level its own chain produces")
    ap.add_argument("--mp3", action="store_true", help="also write MP3 audition copies")
    ap.add_argument("--retries", type=int, default=1, help="retries for failures that may be transient")
    ap.add_argument("--force", action="store_true", help="redo combinations that are already complete")
    ap.add_argument("--smoke", action="store_true", help="short end-to-end check: first two lines of each script, into <out>/smoke")
    ap.add_argument("--probe", action="store_true", help="write pronunciation probe clips into <out>/pronunciation-probes")
    ap.add_argument("--list-voices", action="store_true")
    args = ap.parse_args()
    t0 = time.time()

    for path, what in ((args.model, "model"), (args.voices_file, "voices file")):
        if not path.exists():
            raise SystemExit(f"{what} not found: {path}\nSee the 'Locución' section of README.md for the download commands.")
    out = safe_out_dir(args.out)
    found = discover_voices(args.voices_file)
    if args.list_voices:
        print(f"{len(found['all'])} voices in {args.voices_file.name}; Spanish: {', '.join(found['spanish']) or 'none'}")
        print("all: " + " ".join(found["all"]))
        return 0
    if args.workers is None:
        args.workers = default_workers(args.threads_per_worker)
    if args.workers * args.threads_per_worker > (os.cpu_count() or 1):
        print(f"warning: {args.workers} workers x {args.threads_per_worker} threads exceeds {os.cpu_count()} CPUs")
    if not shutil.which("ffmpeg"):
        print("warning: FFmpeg not found: no loudness measurement, level match, T04 or MP3")
        args.mp3 = False

    unavailable = [v for v in (args.voices or []) if v not in found["all"]]
    voices = [v for v in (args.voices or found["spanish"]) if v in found["all"]]
    blends = [b for b in args.blend if all(n in found["all"] for n, _ in parse_voice(b))]
    unavailable += [b for b in args.blend if b not in blends]
    for name in unavailable:
        print(f"warning: voice {name!r} is not in {args.voices_file.name}; skipped")
    if not voices:
        raise SystemExit("no usable voice")
    missing_priority = [v for v in PRIORITY_VOICES if v not in found["all"]]

    print(f"voices: {', '.join(voices)}" + (f" + blends {', '.join(blends)}" if blends else "")
          + f"  |  {args.workers} workers x {args.threads_per_worker} threads  |  out: {out}")
    if args.probe:
        return run_probe(args, voices, out / "pronunciation-probes", t0)

    before = snapshot_originals()
    all_scripts = [load_script(p) for p in sorted(SCRIPT_DIR.glob("S*.json"))]
    check_control_script(next(s for s in all_scripts if s["id"] == "S00"))
    if args.smoke:
        out = out / "smoke"
        all_scripts = [truncate_for_smoke(s) for s in all_scripts]
    scripts = [s for s in all_scripts if not args.scripts or s["id"] in args.scripts]
    if not scripts:
        raise SystemExit("no script selected")
    env = environment(args.model, args.voices_file, args.threads_per_worker)
    for script in all_scripts:
        dest = out / "scripts" / script["file"]
        if not dest.exists() or sha256_file(dest) != script["sha256"]:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(SCRIPT_DIR / script["file"], dest)
    state = out / "initial-state.json"
    if not state.exists():
        write_atomic(state, json.dumps({"recorded_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                                        "git": "not a git repository" if not (ROOT / ".git").exists() else "see git log",
                                        "sha256": before}, indent=2))

    tasks, entries = plan(args, scripts, voices, blends, env, out)
    tracks = [t for t in tasks.values() if t.kind == "track"]
    n_synth = sum(t.kind == "synth" and t.status == "pending" for t in tasks.values())
    print(f"{len(tracks)} tracks planned ({sum(t.status == 'skipped' for t in tracks)} already complete), "
          f"{n_synth} synthesis units to run\n")
    run_pool(tasks, args.workers, args.retries, t0)

    stamp = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    for entry in entries:
        task = tasks[entry["track_id"]]
        if task.status == "skipped":
            continue
        entry.update(status=task.status, error=task.error, attempts=task.attempts, generated_at=stamp)
        if task.result:
            entry.update(task.result)
        write_atomic(out / "work" / "meta" / f"{entry['track_id']}.json", json.dumps(entry, ensure_ascii=False, indent=2))

    after = snapshot_originals()
    untouched = after == before
    # The inventory covers everything this output directory holds, not only what this run selected.
    inventory = sorted((json.loads(p.read_text(encoding="utf-8")) for p in (out / "work" / "meta").glob("*.json")),
                       key=lambda e: (e["set"], e["track_id"]))
    ok = [e for e in inventory if e["status"] == "ok"]
    failed = [e for e in inventory if e["status"] != "ok"]
    this_run = {s: sum(t.status == s for t in tracks) for s in ("ok", "skipped", "failed")}
    manifest = {
        "generated_at": stamp, "command": " ".join([Path(sys.executable).name, *sys.argv]),
        "elapsed_s": round(time.time() - t0, 1), "environment": env,
        "settings": {"workers": args.workers, "threads_per_worker": args.threads_per_worker,
                     "target_lufs": args.target_lufs, "true_peak_ceiling_dbtp": args.true_peak,
                     "level_match": not args.no_level_match, "line_gap_s": LINE_GAP_S, "smoke": args.smoke},
        "voices": {"in_voices_file": len(found["all"]), "spanish_detected": found["spanish"],
                   "tested": voices, "blends": blends, "requested_but_unavailable": unavailable,
                   "priority_missing": missing_priority},
        "scripts": [{k: s[k] for k in ("id", "slug", "title", "intent", "file", "sha256", "words")}
                    | {"lines": len(s["lines"]), "groups": len(s["groups"]), "pronunciation": s["pronunciation"]}
                    for s in all_scripts],
        "techniques": [asdict(t) | {"synthesis": asdict(SYNTHS[t.synth]), "finishing": FINISHES[t.finish]}
                       for t in TECHNIQUES.values()],
        "this_run": {"tracks_planned": len(tracks), **this_run},
        "summary": {"tracks": len(inventory), "ok": len(ok), "failed": len(failed),
                    "core_ok": sum(e["set"] == "core" for e in ok), "extra_ok": sum(e["set"] == "extra" for e in ok)},
        "originals_untouched": untouched, "tracks": inventory,
    }
    write_atomic(out / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
    errors = out / "errors.log"
    if failed:
        write_atomic(errors, "".join(f"{e.get('generated_at', stamp)}  {e['track_id']}  {e['error']}\n" for e in failed))
    else:
        errors.unlink(missing_ok=True)
    try:
        import vo_lab_report
        vo_lab_report.write_all(out, manifest, scripts=all_scripts)
    except Exception:  # noqa: BLE001 - the audio and manifest are the deliverable; a report bug must not hide them
        print("warning: the report files could not be written:\n" + traceback.format_exc())

    print(f"\nthis run: {this_run['ok']} generated, {this_run['skipped']} already complete, {this_run['failed']} failed "
          f"of {len(tracks)} tracks in {clock(time.time() - t0)}")
    print(f"inventory: {len(ok)} ok ({manifest['summary']['core_ok']} core, {manifest['summary']['extra_ok']} extra), "
          f"{len(failed)} failed  ->  {out}")
    for e in failed:
        print(f"  FAILED {e['track_id']}: {e['error']}")
    if not untouched:
        changed = sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))
        print("ERROR: project originals changed during the run: " + ", ".join(changed))
        return 2
    print("originals verified unchanged (" + str(len(before)) + " files)")
    return 1 if this_run["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
