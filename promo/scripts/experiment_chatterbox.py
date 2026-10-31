#!/usr/bin/env python3
"""Goslint voice-over evaluation with Chatterbox Multilingual V3.

Generates the S02 narration with the general Multilingual V3 model and with the Latin American
Spanish V3 finetune, three generation settings each, so the six tracks can be compared by ear.
The audio is the model's own output: segments are trimmed at their silent edges and joined with
silence, and nothing else is done to them. Only the output directory is written.

    .venv-chatterbox/bin/python scripts/experiment_chatterbox.py --smoke     # load both models, short probes
    .venv-chatterbox/bin/python scripts/experiment_chatterbox.py             # the six tracks
    .venv-chatterbox/bin/python scripts/experiment_chatterbox.py --extras --mp3

Needs its own environment (see out/chatterbox-experiments/README.md); the Kokoro lab in
scripts/experiment_vo.py and its .venv are separate and untouched.
"""
from __future__ import annotations

import argparse
import hashlib
import html
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
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT_FILE = ROOT / "scripts" / "vo_scripts" / "S02_dynamic.json"
KOKORO_OUT = ROOT / "out" / "audio-experiments"
PROTECTED_GLOBS = ("scripts/narration.json", "scripts/make_vo.py", "scripts/vo_scripts/*.json",
                   "src/vo-manifest.json", "src/timeline.ts", "public/audio/vo/*.wav", "public/audio/*.wav",
                   "out/*.mp4", "out/audio-experiments/tracks/*.wav", "out/audio-experiments/tracks-extra/*.wav",
                   "out/audio-experiments/mp3/*.mp3", "out/audio-experiments/manifest.json")
PROTECTED_DIRS = ("public", "src", "scripts", "node_modules", ".venv", ".venv-chatterbox", "out/audio-experiments")

SR = 24000          # S3GEN_SR, the rate Chatterbox synthesizes at
TOKEN_RATE = 25     # speech tokens per second
MAX_NEW_TOKENS = 1000  # hard-coded in ChatterboxMultilingualTTS.generate: one call tops out at 40 s
MAX_CHARS = 300     # what Resemble's own demos accept per call
# A block spoken far slower or faster than speech allows has invented, repeated or dropped words.
# Such a take is rejected and the block generated again with another seed; the rule is the same
# for every track and looks only at length, never at how a take sounds.
PACE_RANGE = (9.0, 24.0)  # characters per second
MAX_TAKES = 3
TAKE_SEED_STEP = 1000
LANGUAGE_ID = "es"

BASE_REPO, BASE_REV = "ResembleAI/chatterbox", "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
LATAM_REPO, LATAM_REV = "ResembleAI/Chatterbox-Multilingual-es-mx-latam", "27e595bf2fe7be0533ca299d9afafcde08b7cca7"
SHARED_FILES = ("ve.pt", "grapheme_mtl_merged_expanded_v1.json", "conds.pt", "Cangjie5_TC.json")
# s3gen_v3.pt does not carry these two buffers; S3Gen builds them itself and they are not learned.
DECODER_BUFFERS = {"tokenizer._mel_filters", "tokenizer.window"}


@dataclass(frozen=True)
class Model:
    key: str
    slug: str
    label: str
    loader: str                     # "v3-decoder": assembled here | "stock": the package's from_pretrained
    t3: tuple[str, str, str]        # repo, revision, file
    decoder: tuple[str, str, str]
    note: str


MODELS = {m.key: m for m in (
    Model("v3", "chatterbox-v3", "Chatterbox Multilingual V3", "v3-decoder",
          (BASE_REPO, BASE_REV, "t3_mtl23ls_v3.safetensors"), (LATAM_REPO, LATAM_REV, "s3gen_v3.pt"),
          "General 23-language V3 language model with the V3 speech decoder. s3gen_v3.pt is read from the "
          "LatAm repository; ResembleAI/chatterbox publishes the same file (identical SHA-256)."),
    Model("latam", "chatterbox-latam", "Chatterbox Latin American Spanish V3", "v3-decoder",
          (LATAM_REPO, LATAM_REV, "t3_es_mx_latam.safetensors"), (LATAM_REPO, LATAM_REV, "s3gen_v3.pt"),
          "Single-language V3 finetune (es-419 / es-MX), loaded the way Resemble's demo Space loads it."),
    Model("v3-stock", "chatterbox-v3", "Chatterbox Multilingual V3, stock loader", "stock",
          (BASE_REPO, "main", "t3_mtl23ls_v3.safetensors"), (BASE_REPO, "main", "s3gen.pt"),
          "ChatterboxMultilingualTTS.from_pretrained(device, t3_model=\"v3\") exactly as documented. "
          "The package pairs the V3 language model with the original decoder, s3gen.pt."),
)}


@dataclass(frozen=True)
class Config:
    slug: str
    label: str
    exaggeration: float
    cfg_weight: float


CONFIGS = (
    Config("default", "Default", 0.50, 0.50),
    Config("conversational", "Restrained and conversational", 0.35, 0.30),
    Config("expressive", "More expressive", 0.65, 0.30),
)
# Left at the values ChatterboxMultilingualTTS.generate() uses when they are not passed.
SAMPLING = {"temperature": 0.8, "repetition_penalty": 1.2, "min_p": 0.05, "top_p": 1.0}

# Spoken forms for the two things in the script that are not words. The tokenizer works on letters
# (lower-cased), so "C++" and "ICPC" reach the model as "c++" and "icpc"; these are the respellings
# the project's own narration.json already uses. Everything else is sent as written.
SAY = {"C++": "ce más más", "ICPC": "i ce pe ce"}

# One generation call per block: a few sentences that belong together, each well under MAX_CHARS,
# so the model shapes intonation and pauses across a whole idea instead of line by line.
BLOCKS = (("S02-B1", ("S02-L01", "S02-L02", "S02-L03")), ("S02-B2", ("S02-L04", "S02-L05", "S02-L06")),
          ("S02-B3", ("S02-L07", "S02-L08", "S02-L09")), ("S02-B4", ("S02-L10", "S02-L11", "S02-L12")))

PROBE_TEXT = "Problema tras problema. En C++, en Python y en Java. Y competimos afuera, en la Regional del ICPC."
PROBES = (("canonical", "as written", {}),
          ("spoken", "the spoken forms the tracks use", SAY),
          ("spoken-hinted", "spoken forms plus Páiton and Yava", {**SAY, "Python": "Páiton", "Java": "Yava"}))


# ---------------------------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------------------------

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 22), b""):
            h.update(block)
    return h.hexdigest()


def fingerprint(data) -> str:
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]


def write_atomic(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


def clock(seconds: float) -> str:
    return f"{int(seconds // 60):02d}:{int(seconds % 60):02d}"


def snapshot_originals() -> dict[str, str]:
    files = sorted({p for g in PROTECTED_GLOBS for p in ROOT.glob(g) if p.is_file()})
    return {str(p.relative_to(ROOT)): sha256_file(p) for p in files}


def safe_out_dir(out: Path) -> Path:
    out = out.resolve()
    if out in (ROOT, ROOT / "out"):
        raise SystemExit(f"--out must be a dedicated subdirectory, not {out}")
    for name in PROTECTED_DIRS:
        protected = (ROOT / name).resolve()
        if out == protected or protected in out.parents:
            raise SystemExit(f"--out may not be inside {protected}")
    return out


def check_reference(path: Path) -> Path:
    """A reference voice must be a real, consenting speaker, never one of the synthetic tracks."""
    path = path.resolve()
    if not path.is_file():
        raise SystemExit(f"reference recording not found: {path}")
    synthetic = [(ROOT / "out").resolve(), (ROOT / "public" / "audio").resolve()]
    if any(s in path.parents for s in synthetic) or re.search(r"kokoro|em_alex|em_santa|ef_dora|chatterbox", path.name, re.I):
        raise SystemExit("the reference must be a recording of a real speaker; synthetic narration "
                         "(Kokoro, the Alex samples, earlier Chatterbox output) is not accepted")
    return path


def apply_say(text: str, say: dict[str, str]) -> str:
    for written, spoken in say.items():
        text = re.sub(rf"(?<!\w){re.escape(written)}(?!\w)", spoken, text)
    return text


def load_script() -> dict:
    script = json.loads(SCRIPT_FILE.read_text(encoding="utf-8"))
    script["sha256"] = sha256_file(SCRIPT_FILE)
    return script


def segments_for(script: dict, mode: str, seed: int, lines_limit: int | None = None) -> list[dict]:
    """The generation calls for a track: text sent, the silence after it, and its seed."""
    lines = {ln["id"]: ln["text"] for ln in script["lines"]}
    pause_after = {g["lines"][-1]: g.get("pause_after_s", 0.0) for g in script["groups"]}
    units = BLOCKS if mode == "blocks" else tuple((g["id"], tuple(g["lines"])) for g in script["groups"])
    segments = []
    for n, (sid, ids) in enumerate(units):
        written = " ".join(lines[i] for i in ids)
        text = apply_say(written, SAY)
        if len(text) > MAX_CHARS:
            raise ValueError(f"{sid}: {len(text)} characters, more than the {MAX_CHARS} a call should carry")
        segments.append({"id": sid, "lines": list(ids), "written": written, "text": text,
                         "pause_after_s": pause_after[ids[-1]], "seed": seed + n})
    segments[-1]["pause_after_s"] = 0.0
    return segments


# ---------------------------------------------------------------------------------------------
# audio
# ---------------------------------------------------------------------------------------------

def trim_edges(x, lead: float = 0.04, tail: float = 0.15, floor_db: float = -50.0,
               fade_in: float = 0.008, fade_out: float = 0.04):
    """Cut the silence before and after the speech, keeping a margin, and fade the cut edges.

    Silence is judged on 10 ms frames against the loudest frame, so quiet breaths and decays inside
    the margin survive. Nothing between the first and last audible frame is touched.
    """
    import numpy as np
    frame = SR // 100
    usable = len(x) // frame * frame
    rms = np.sqrt((x[:usable].reshape(-1, frame) ** 2).mean(1))
    loud = np.where(rms > rms.max() * 10 ** (floor_db / 20))[0]
    start = max(int(loud[0]) * frame - int(lead * SR), 0)
    stop = min((int(loud[-1]) + 1) * frame + int(tail * SR), len(x))
    y = x[start:stop].astype(np.float32).copy()
    n_in, n_out = min(int(fade_in * SR), len(y)), min(int(fade_out * SR), len(y))
    y[:n_in] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n_in, dtype=np.float32))
    y[len(y) - n_out:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n_out, dtype=np.float32))
    return y, start / SR, (len(x) - stop) / SR


def measure(path: Path) -> dict:
    """EBU R128 loudness and true peak of a finished file. A measurement only; no gain is applied."""
    empty = {"integrated_lufs": None, "lra_lu": None, "true_peak_dbtp": None}
    if not shutil.which("ffmpeg"):
        return empty
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af",
                          "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True).stderr.decode(errors="replace")
    try:
        stats = json.loads(err[err.rindex("{"): err.rindex("}") + 1])
        values = [float(stats[k]) for k in ("input_i", "input_lra", "input_tp")]
    except (ValueError, KeyError):
        return empty
    return dict(zip(empty, (round(v, 2) for v in values))) if all(abs(v) != float("inf") for v in values) else empty


# ---------------------------------------------------------------------------------------------
# worker side: one process holds one model for all of its jobs
# ---------------------------------------------------------------------------------------------

def load_model(spec: dict, files: dict[str, str]):
    """Build the model on CPU. Returns it with a description of what was really loaded."""
    import torch
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS, Conditionals
    if spec["loader"] == "stock":
        model = ChatterboxMultilingualTTS.from_pretrained("cpu", t3_model="v3")
        return model, {"call": 'ChatterboxMultilingualTTS.from_pretrained("cpu", t3_model="v3")'}
    from safetensors.torch import load_file
    from chatterbox.models.s3gen import S3Gen
    from chatterbox.models.t3 import T3
    from chatterbox.models.t3.modules.t3_config import T3Config
    from chatterbox.models.tokenizers import MTLTokenizer
    from chatterbox.models.voice_encoder import VoiceEncoder
    # Same steps as ChatterboxMultilingualTTS.from_local, with the decoder file chosen explicitly
    # (the package always reads s3gen.pt) and loaded as Resemble's LatAm demo Space loads it.
    ve = VoiceEncoder()
    ve.load_state_dict(torch.load(files["ve.pt"], map_location="cpu", weights_only=True))
    ve.eval()
    t3 = T3(T3Config.multilingual())
    state = load_file(files["t3"])
    if "model" in state:
        state = state["model"][0]
    t3.load_state_dict(state)
    t3.eval()
    s3gen = S3Gen()
    result = s3gen.load_state_dict(torch.load(files["decoder"], map_location="cpu", weights_only=True), strict=False)
    if result.unexpected_keys or set(result.missing_keys) - DECODER_BUFFERS:
        raise ValueError(f"decoder checkpoint does not fit the installed S3Gen: missing {result.missing_keys}, "
                         f"unexpected {result.unexpected_keys}")
    s3gen.eval()
    conds = Conditionals.load(files["conds.pt"], map_location="cpu").to("cpu")
    model = ChatterboxMultilingualTTS(t3, s3gen, ve, MTLTokenizer(files["grapheme_mtl_merged_expanded_v1.json"]), "cpu", conds=conds)
    return model, {"call": "T3(T3Config.multilingual()) + S3Gen() with explicit checkpoint files",
                   "decoder_keys_left_at_init": sorted(result.missing_keys)}


def run_session(payload: dict) -> dict:
    """Load one model and run all of its jobs, one after another. A failed job does not stop the rest."""
    os.environ.setdefault("TQDM_DISABLE", "1")
    import warnings
    warnings.filterwarnings("ignore")
    import logging
    logging.disable(logging.WARNING)
    import numpy as np
    import soundfile as sf
    import torch
    torch.set_num_threads(payload["threads"])
    tag = f"[{payload['model']['key']:<8} pid {os.getpid()}]"
    say = lambda msg: print(f"{clock(time.time() - payload['t0'])} {tag} {msg}", flush=True)
    session = {"model": payload["model"]["key"], "jobs": [], "error": None}
    try:
        started = time.time()
        model, how = load_model(payload["model"], payload["files"])
        from chatterbox.mtl_tts import punc_norm
        session.update(loaded=how, load_s=round(time.time() - started, 1), sample_rate=int(model.sr))
        say(f"model loaded in {session['load_s']} s ({payload['threads']} threads)")
        if model.sr != SR:
            raise ValueError(f"model synthesizes at {model.sr} Hz, expected {SR}")
    except Exception as error:  # noqa: BLE001 - the real error is recorded for every job of this model
        session["error"] = f"{type(error).__name__}: {error}"
        session["resource_error"] = isinstance(error, MemoryError) or "memory" in str(error).lower()
        say(f"MODEL FAILED TO LOAD: {session['error']}")
        return session

    for job in payload["jobs"]:
        t_job = time.time()
        result = {"id": job["id"], "status": "ok", "error": None, "warnings": [], "segments": []}
        try:
            clips, gen_total = [], 0.0
            for n, seg in enumerate(job["segments"], 1):
                takes = []
                for take in range(1, MAX_TAKES + 1):
                    seed = seg["seed"] + (take - 1) * TAKE_SEED_STEP
                    raw_path = Path(job["work_dir"]) / (f"{seg['id']}.wav" if take == 1 else f"{seg['id']}.take{take}.wav")
                    meta_path = raw_path.with_suffix(".json")
                    key = fingerprint([job["segment_key"], seg["text"], seed])
                    if not payload["force"] and raw_path.exists() and meta_path.exists() \
                            and json.loads(meta_path.read_text())["key"] == key:
                        raw, _ = sf.read(raw_path, dtype="float32")
                        gen_s, cached = json.loads(meta_path.read_text())["gen_s"], True
                    else:
                        torch.manual_seed(seed)
                        np.random.seed(seed)
                        t = time.time()
                        wav = model.generate(seg["text"], language_id=LANGUAGE_ID, audio_prompt_path=job["reference"],
                                             exaggeration=job["exaggeration"], cfg_weight=job["cfg_weight"], **SAMPLING)
                        gen_s, cached = round(time.time() - t, 1), False
                        raw = wav.squeeze(0).numpy().astype(np.float32)
                        raw_path.parent.mkdir(parents=True, exist_ok=True)
                        sf.write(raw_path, raw, SR, subtype="FLOAT")  # the untouched model output
                        write_atomic(meta_path, json.dumps({"key": key, "gen_s": gen_s}))
                    gen_total += gen_s
                    seconds = len(raw) / SR
                    if not len(raw) or float(np.abs(raw).max()) < 1e-3:
                        raise ValueError(f"{seg['id']}: the model returned silence")
                    clip, cut_head, cut_tail = trim_edges(raw)
                    pace = len(seg["text"]) / (len(clip) / SR)
                    cut_off = len(raw) >= (MAX_NEW_TOKENS - 2) * (SR // TOKEN_RATE)
                    takes.append({"take": take, "seed": seed, "raw_file": str(raw_path.relative_to(payload["out"])),
                                  "raw_s": round(seconds, 3), "chars_per_s": round(pace, 1), "hit_token_limit": cut_off,
                                  "generation_s": gen_s, "from_cache": cached,
                                  "_audio": (clip, cut_head, cut_tail)})
                    say(f"{job['id']}  segment {n}/{len(job['segments'])}  take {take}  {seconds:.1f} s of audio"
                        + ("  (cached)" if cached else f" in {gen_s:.0f} s"))
                    if PACE_RANGE[0] <= pace <= PACE_RANGE[1] and not cut_off:
                        break
                    say(f"{job['id']}  segment {n}  take {take} rejected: {pace:.1f} characters per second")
                good = takes[-1] if PACE_RANGE[0] <= takes[-1]["chars_per_s"] <= PACE_RANGE[1] and not takes[-1]["hit_token_limit"] else None
                used = good or takes[0]
                if used["hit_token_limit"]:
                    raise ValueError(f"{seg['id']}: every take hit the {MAX_NEW_TOKENS}-token limit, the text was cut off")
                if good is None:
                    result["warnings"].append(f"{seg['id']}: all {len(takes)} takes had an unusual pace "
                                              f"({', '.join(str(t['chars_per_s']) for t in takes)} characters per second); "
                                              "the first is used. Listen for skipped or repeated words")
                elif len(takes) > 1:
                    result["warnings"].append(
                        f"{seg['id']}: " + "; ".join(f"take {t['take']} (seed {t['seed']}) ran {t['raw_s']:.1f} s, "
                                                      f"{t['chars_per_s']} characters per second" for t in takes[:-1])
                        + f". Rejected by the pace rule and regenerated with seed {used['seed']}. The rejected audio is kept at "
                        + ", ".join(t["raw_file"] for t in takes[:-1]))
                clip, cut_head, cut_tail = used["_audio"]
                clips.append(clip)
                result["segments"].append({
                    **{k: v for k, v in seg.items() if k != "seed"}, "seed": used["seed"], "take": used["take"],
                    "normalized_text": punc_norm(seg["text"]), "raw_file": used["raw_file"],
                    "raw_s": used["raw_s"], "duration_s": round(len(clip) / SR, 3),
                    "trimmed_head_s": round(cut_head, 3), "trimmed_tail_s": round(cut_tail, 3),
                    "chars_per_s": used["chars_per_s"], "generation_s": used["generation_s"], "from_cache": used["from_cache"],
                    "rejected_takes": [{k: v for k, v in t.items() if k != "_audio"} for t in takes if t is not used]})

            parts, pos = [], 0
            for clip, seg in zip(clips, result["segments"]):
                seg["start_s"] = round(pos / SR, 3)
                gap = np.zeros(int(round(seg["pause_after_s"] * SR)), dtype=np.float32)
                parts += [clip, gap]
                pos += len(clip) + len(gap)
            track = np.concatenate(parts)
            peak = float(np.abs(track).max())
            if peak > 1.0:  # would clip in 16-bit; one static gain, the smallest that avoids it
                track = track / peak * 0.999
                result["level_note"] = (f"the model's output peaked {20 * np.log10(peak):.2f} dB over full scale; the whole "
                                        "track was lowered by that amount so that it does not clip")
            out = Path(job["out_path"])
            out.parent.mkdir(parents=True, exist_ok=True)
            tmp = out.with_name(f".{out.stem}.{os.getpid()}.tmp.wav")
            try:
                sf.write(tmp, track, SR, subtype="PCM_16")
                back, sr = sf.read(tmp, dtype="float32", always_2d=True)
                info = sf.info(tmp)
                checks = {"format_24k_mono_pcm16": (sr, info.channels, info.subtype) == (SR, 1, "PCM_16"),
                          "length_matches_segments_and_pauses": back.shape[0] == pos,
                          "every_segment_present": len(clips) == len(job["segments"]),
                          "no_clipped_samples": float(np.abs(back).max()) < 1.0}
                bad = [k for k, ok in checks.items() if not ok]
                if bad:
                    raise ValueError("output failed validation: " + ", ".join(bad))
                os.replace(tmp, out)
            finally:
                tmp.unlink(missing_ok=True)
            if job.get("mp3_path"):
                Path(job["mp3_path"]).parent.mkdir(parents=True, exist_ok=True)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-c:a", "libmp3lame", "-q:a", "2",
                                job["mp3_path"]], capture_output=True, check=True)
            speech = sum(len(c) for c in clips) / SR
            result.update(
                validation=checks,
                audio={"sample_rate": SR, "bit_depth": 16, "channels": 1, "codec": "pcm_s16le", "samples": int(pos),
                       "duration_s": round(pos / SR, 3), "speech_s": round(speech, 3), "pause_s": round(pos / SR - speech, 3),
                       "bytes": out.stat().st_size, "sha256": sha256_file(out),
                       "sample_peak_dbfs": round(float(20 * np.log10(max(float(np.abs(back).max()), 1e-9))), 2)},
                measured=measure(out),
                timing={"generation_s": round(gen_total, 1), "realtime_factor": round(gen_total / speech, 2),
                        "wall_s": round(time.time() - t_job, 1)})
            say(f"{job['id']}  done: {pos / SR:.1f} s track, generated in {gen_total:.0f} s "
                f"(x{gen_total / speech:.1f} real time)")
        except Exception as error:  # noqa: BLE001 - recorded, and the next configuration still runs
            result.update(status="failed", error=f"{type(error).__name__}: {error}",
                          resource_error=isinstance(error, MemoryError) or "memory" in str(error).lower(),
                          traceback=traceback.format_exc(limit=4))
            say(f"{job['id']}  FAILED: {result['error']}")
        session["jobs"].append(result)
    return session


# ---------------------------------------------------------------------------------------------
# planning
# ---------------------------------------------------------------------------------------------

def resolve_files(model: Model) -> tuple[dict[str, str], dict]:
    """Local paths of a model's checkpoint files (downloaded once into the Hugging Face cache)."""
    from huggingface_hub import hf_hub_download
    files, identity = {}, {}
    wanted = {"t3": model.t3, "decoder": model.decoder} | {f: (BASE_REPO, BASE_REV if model.loader != "stock" else "main", f)
                                                         for f in SHARED_FILES}
    for role, (repo, rev, name) in wanted.items():
        path = Path(hf_hub_download(repo_id=repo, filename=name, revision=rev, repo_type="model"))
        files[role] = str(path)
        if role in ("t3", "decoder", "conds.pt"):
            identity[role] = {"repo": repo, "revision": path.parent.name, "file": name,
                              "bytes": path.stat().st_size, "sha256": sha256_file(path)}
    return files, identity


def environment(threads: int, workers: int) -> dict:
    def version(name):
        try:
            return importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            return None
    source = None
    try:
        direct = json.loads(importlib.metadata.distribution("chatterbox-tts").read_text("direct_url.json"))
        source = f"{direct['url']}@{direct['vcs_info']['commit_id']}"
    except Exception:  # noqa: BLE001 - a PyPI install has no direct_url.json
        pass
    import torch
    ffmpeg = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True).stdout.split("\n")[0] if shutil.which("ffmpeg") else None
    return {"chatterbox_source": source,
            "packages": {n: version(n) for n in ("chatterbox-tts", "torch", "torchaudio", "transformers", "diffusers",
                                                 "resemble-perth", "s3tokenizer", "numpy", "soundfile")},
            "device": "cpu", "cuda_available": bool(torch.cuda.is_available()), "threads_per_worker": threads,
            "workers": workers, "python": sys.version.split()[0], "cpus": os.cpu_count(), "ffmpeg": ffmpeg}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path, default=ROOT / "out" / "chatterbox-experiments")
    ap.add_argument("--workers", type=int, default=2, help="model sessions running at once; each holds one model (about 5 GB RAM). Default 2, one per model")
    ap.add_argument("--threads", type=int, default=None, help="PyTorch threads per session (default: 6 shared between the workers)")
    ap.add_argument("--models", type=lambda s: s.split(","), default=["v3", "latam"], help="default: v3,latam")
    ap.add_argument("--configs", type=lambda s: s.split(","), default=None, help="default: default,conversational,expressive")
    ap.add_argument("--seed", type=int, default=1234, help="segment n of every track is generated with seed + n")
    ap.add_argument("--extras", action="store_true", help="also: each model's default setting split by sentence group, and V3 through the stock loader")
    ap.add_argument("--reference", type=Path, default=None, help="recording of a real, consenting speaker to use as the voice; runs as a separate set")
    ap.add_argument("--reference-note", default=None, help="who the speaker is and how they agreed; required with --reference, stored in the manifest")
    ap.add_argument("--mp3", action="store_true", help="also write MP3 audition copies")
    ap.add_argument("--force", action="store_true", help="regenerate segments that are already cached")
    ap.add_argument("--smoke", action="store_true", help="load each model and generate short Spanish probes into <out>/probes")
    args = ap.parse_args()
    t0 = time.time()
    out = safe_out_dir(args.out)
    reference = None
    if args.reference:
        if not args.reference_note:
            raise SystemExit("--reference needs --reference-note: who the speaker is and that they agreed to this use")
        reference = check_reference(args.reference)
    unknown = [m for m in args.models if m not in MODELS]
    if unknown:
        raise SystemExit(f"unknown model(s) {unknown}; choose from {sorted(MODELS)}")
    configs = [c for c in CONFIGS if not args.configs or c.slug in args.configs]
    # Measured on the i5-12600KF (6 performance cores): one session is fastest at 6 threads (x2.9 real
    # time), and two sessions at 3 threads each (x5.4 each) get slightly more done per minute than
    # that. More threads or more sessions were slower: the work is limited by memory, not cores.
    threads = args.threads or max(1, min(6, (os.cpu_count() or 2) // 2) // max(1, args.workers))
    if not shutil.which("ffmpeg"):
        args.mp3 = False
        print("warning: FFmpeg not found; no loudness measurement or MP3 copies")

    before = snapshot_originals()
    script = load_script()
    env = environment(threads, args.workers)
    suffix = f"_ref-{re.sub(r'[^A-Za-z0-9]+', '-', reference.stem).strip('-')}" if reference else ""
    subdir = "tracks-reference" if reference else "tracks"
    voice = ({"reference": str(reference), "sha256": sha256_file(reference), "note": args.reference_note} if reference else
             {"reference": None, "note": "the model's built-in voice (conds.pt from ResembleAI/chatterbox); no reference recording"})

    plans: dict[str, dict] = {}
    entries: dict[str, dict] = {}

    def add(model_key: str, job_id: str, rel: str, kind: str, segments: list[dict], cfg: Config, extra: dict) -> None:
        model = MODELS[model_key]
        if model_key not in plans:
            files, identity = resolve_files(model)
            plans[model_key] = {"model": asdict(model), "files": files, "identity": identity, "jobs": []}
        identity = plans[model_key]["identity"]
        seg_key = [identity["t3"]["sha256"], identity["decoder"]["sha256"], identity["conds.pt"]["sha256"], cfg.exaggeration,
                   cfg.cfg_weight, SAMPLING, LANGUAGE_ID, voice.get("sha256"), env["packages"], env["chatterbox_source"], threads]
        plans[model_key]["jobs"].append({
            "id": job_id, "out_path": str(out / rel), "work_dir": str(out / "work" / "segments" / job_id),
            "segments": segments, "segment_key": seg_key, "exaggeration": cfg.exaggeration, "cfg_weight": cfg.cfg_weight,
            "reference": str(reference) if reference else None,
            "mp3_path": str(out / "mp3" / (Path(rel).stem + ".mp3")) if args.mp3 and kind != "probe" else None})
        entries[job_id] = {
            "id": job_id, "filename": rel, "kind": kind, "status": "pending", "error": None,
            "model": {"key": model.key, "label": model.label, "loader": model.loader, "note": model.note,
                      "language_model": identity["t3"], "decoder": identity["decoder"]},
            "voice": voice | {"builtin_conds": identity["conds.pt"]},
            "configuration": {"slug": cfg.slug, "label": cfg.label},
            "settings": {"exaggeration": cfg.exaggeration, "cfg_weight": cfg.cfg_weight, **SAMPLING,
                         "language_id": LANGUAGE_ID, "audio_prompt_path": str(reference) if reference else None,
                         "seed_base": args.seed},
            "script": {"id": script["id"], "file": str(SCRIPT_FILE.relative_to(ROOT)), "sha256": script["sha256"],
                       "spoken_forms": SAY, "text": " ".join(s["text"] for s in segments)},
            "post_processing": "segments trimmed at their silent edges and joined with silence; no gain, EQ, "
                               "compression, speed or pitch change", **extra}

    if args.smoke:
        for model_key in args.models:
            for slug, label, say in PROBES:
                text = apply_say(PROBE_TEXT, say)
                seg = [{"id": "probe", "lines": [], "written": PROBE_TEXT, "text": text, "pause_after_s": 0.0, "seed": args.seed}]
                add(model_key, f"probe_{MODELS[model_key].slug}_{slug}", f"probes/probe_{MODELS[model_key].slug}_{slug}.wav",
                    "probe", seg, CONFIGS[0], {"probe": {"variant": slug, "what": label}})
    else:
        blocks = segments_for(script, "blocks", args.seed)
        for model_key in args.models:
            for cfg in configs:
                add(model_key, f"S02_{MODELS[model_key].slug}_{cfg.slug}{suffix}",
                    f"{subdir}/S02_{MODELS[model_key].slug}_{cfg.slug}{suffix}.wav", "reference" if reference else "core",
                    blocks, cfg, {"segmentation": "4 blocks of related sentences, one generation call each"})
        if args.extras and not reference:
            groups = segments_for(script, "groups", args.seed)
            for model_key in args.models:
                add(model_key, f"S02_{MODELS[model_key].slug}_default_sentence-segments",
                    f"extras/S02_{MODELS[model_key].slug}_default_sentence-segments.wav", "extra", groups, CONFIGS[0],
                    {"segmentation": f"{len(groups)} sentence groups, one generation call each",
                     "compare_with": f"S02_{MODELS[model_key].slug}_default"})
            add("v3-stock", "S02_chatterbox-v3_default_stock-decoder", "extras/S02_chatterbox-v3_default_stock-decoder.wav",
                "extra", blocks, CONFIGS[0], {"segmentation": "4 blocks of related sentences, one generation call each",
                                              "compare_with": "S02_chatterbox-v3_default"})

    n_jobs = sum(len(p["jobs"]) for p in plans.values())
    print(f"{n_jobs} {'probes' if args.smoke else 'tracks'} over {len(plans)} model session(s), {args.workers} at a time, "
          f"{threads} threads each, CPU  |  out: {out}\n")
    sessions = []
    with ProcessPoolExecutor(max_workers=max(1, args.workers), mp_context=mp.get_context("spawn"), max_tasks_per_child=1) as pool:
        futures = {pool.submit(run_session, {**p, "threads": threads, "force": args.force, "t0": t0, "out": str(out)}): key
                   for key, p in plans.items()}
        for future in as_completed(futures):
            try:
                sessions.append(future.result())
            except Exception as error:  # noqa: BLE001 - a crashed session (for example killed for memory) fails its own jobs only
                sessions.append({"model": futures[future], "jobs": [], "error": f"{type(error).__name__}: {error}",
                                 "resource_error": True})

    stamp = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    for session in sessions:
        done = {j["id"]: j for j in session["jobs"]}
        for job in plans[session["model"]]["jobs"]:
            entry = entries[job["id"]]
            entry["generated_at"] = stamp
            if job["id"] in done:
                entry.update({k: v for k, v in done[job["id"]].items() if k != "id"})
                entry["model"]["loaded_with"] = session.get("loaded")
            else:
                entry.update(status="failed", error=f"model session failed: {session['error']}",
                             resource_error=session.get("resource_error", False))
        for key in ("load_s",):
            plans[session["model"]][key] = session.get(key)

    meta_dir = out / "work" / "meta"
    for entry in entries.values():
        write_atomic(meta_dir / f"{entry['id']}.json", json.dumps(entry, ensure_ascii=False, indent=2))
    inventory = sorted((json.loads(p.read_text(encoding="utf-8")) for p in meta_dir.glob("*.json")),
                       key=lambda e: (("core", "extra", "reference", "probe").index(e["kind"]), e["id"]))
    after = snapshot_originals()
    failed_now = [e for e in entries.values() if e["status"] != "ok"]
    manifest = {
        "generated_at": stamp, "command": " ".join([Path(sys.executable).parent.parent.name + "/bin/python", *sys.argv]),
        "elapsed_s": round(time.time() - t0, 1), "environment": env,
        "script": {"id": script["id"], "title": script["title"], "file": str(SCRIPT_FILE.relative_to(ROOT)),
                   "sha256": script["sha256"], "written_text": " ".join(ln["text"] for ln in script["lines"]),
                   "spoken_forms": SAY, "text_sent_to_the_models": apply_say(" ".join(ln["text"] for ln in script["lines"]), SAY)},
        "models": [asdict(m) for m in MODELS.values()],
        "configurations": [asdict(c) | SAMPLING for c in CONFIGS],
        "this_run": {"planned": n_jobs, "ok": n_jobs - len(failed_now), "failed": len(failed_now), "smoke": args.smoke},
        "summary": {kind: sum(e["kind"] == kind and e["status"] == "ok" for e in inventory) for kind in ("core", "extra", "reference", "probe")}
                   | {"failed": sum(e["status"] != "ok" for e in inventory)},
        "originals_untouched": after == before, "tracks": inventory,
    }
    write_atomic(out / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
    failures = [e for e in inventory if e["status"] != "ok"]
    write_atomic(out / "errors.log", "".join(f"{e['generated_at']}  {e['id']}  {e['error']}\n{e.get('traceback', '')}" for e in failures)
                 or f"{stamp}  no errors: every generated file listed in manifest.json succeeded\n")
    write_index(out, manifest)
    write_readme(out, manifest)

    print(f"\nthis run: {n_jobs - len(failed_now)} ok, {len(failed_now)} failed of {n_jobs} in {clock(time.time() - t0)}  ->  {out}")
    for e in failed_now:
        print(f"  FAILED {e['id']}: {e['error']}")
    if after != before:
        print("ERROR: project originals changed during the run: " + ", ".join(sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))))
        return 2
    print(f"originals verified unchanged ({len(before)} files, including the Kokoro tracks)")
    return 1 if failed_now else 0


# ---------------------------------------------------------------------------------------------
# listening page and README, written from the manifest
# ---------------------------------------------------------------------------------------------

_PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Goslint · Chatterbox V3</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#16181d;--mute:#5d6470;--line:#dfe3ea;--accent:#0a7d5a}
@media (prefers-color-scheme:dark){:root{--bg:#0f1115;--card:#171a21;--ink:#e8eaf0;--mute:#9aa3b2;--line:#2a2f3a;--accent:#3ddc97}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,sans-serif}
main{max-width:1180px;margin:0 auto;padding:24px 16px 64px}h1{font-size:24px;margin:0 0 4px}h2{font-size:18px;margin:36px 0 8px}
p{margin:6px 0}.mute{color:var(--mute)}.text{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:6px;padding:10px 14px;margin:10px 0}
.wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:680px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top;text-align:left;background:var(--card)}
th{font-size:13px}th small,td small{display:block;font-weight:400;color:var(--mute);font-size:12px}audio{width:100%;min-width:210px;height:36px;display:block;margin-bottom:4px}
label{display:inline-flex;gap:8px;align-items:center;margin:8px 0}a{color:var(--accent)}code{font-family:ui-monospace,monospace;font-size:13px}
</style></head><body><main>
<h1>Goslint · Chatterbox V3 voice-over comparison</h1>
<p class="mute">__SUMMARY__</p>
<p class="mute">Nothing here has been ranked. The files are the models' own output; the numbers under each player describe the file, not how natural it sounds.</p>
<label><input type="checkbox" id="match" checked> Match loudness during playback (turns the louder files down in the player; the WAV files are not changed)</label>
__BODY__
</main><script>
const players=[...document.querySelectorAll('audio')];
const level=a=>parseFloat(a.dataset.lufs);
const quietest=Math.min(...players.map(level).filter(v=>!isNaN(v)));
function apply(){const on=document.getElementById('match').checked;
  players.forEach(a=>{const l=level(a);a.volume=on&&!isNaN(l)?Math.min(1,Math.pow(10,(quietest-l)/20)):1})}
document.getElementById('match').addEventListener('change',apply);apply();
document.addEventListener('play',e=>players.forEach(a=>{if(a!==e.target)a.pause()}),true);
</script></body></html>
"""


def _player(e: dict, path: str | None = None) -> str:
    if e["status"] != "ok":
        return f"<small>failed: {html.escape(e['error'] or '')}</small>"
    lufs = e["measured"]["integrated_lufs"]
    return (f"<audio controls preload=none data-lufs=\"{'' if lufs is None else lufs}\" src=\"{html.escape(path or e['filename'])}\"></audio>"
            f"<small><code>{html.escape(Path(e['filename']).name)}</code></small>"
            f"<small>{e['audio']['duration_s']:.1f} s · {'' if lufs is None else f'{lufs:.1f} LUFS · '}"
            f"peak {e['audio']['sample_peak_dbfs']:.1f} dBFS</small>"
            + "".join(f"<small>{html.escape(s['id'])}: take {s['take']} is used; an earlier take was rejected for its pace</small>"
                      for s in e["segments"] if s.get("rejected_takes")))


def write_index(out: Path, manifest: dict) -> None:
    tracks = manifest["tracks"]
    core = [e for e in tracks if e["kind"] == "core"]
    body = [f"<div class=text>{html.escape(manifest['script']['written_text'])}</div>"]
    if core:
        models = [m for m in ("v3", "latam") if any(e["model"]["key"] == m for e in core)]
        head = "".join(f"<th>{html.escape(c.label)}<small>exaggeration {c.exaggeration:.2f} · cfg_weight {c.cfg_weight:.2f}</small></th>" for c in CONFIGS)
        rows = ""
        for m in models:
            cells = "".join("<td>" + next((_player(e) for e in core if e["model"]["key"] == m and e["configuration"]["slug"] == c.slug), "") + "</td>" for c in CONFIGS)
            rows += f"<tr><th>{html.escape(MODELS[m].label)}<small>{html.escape(MODELS[m].t3[2])}</small></th>{cells}</tr>"
        body.append(f"<h2>The six tracks</h2><div class=wrap><table><tr><th>Model</th>{head}</tr>{rows}</table></div>")
    for kind, title, intro in (
            ("reference", "With a reference voice", "Same script and settings, with a real speaker's recording as the voice."),
            ("extra", "Extras", "One change each against the matching track above: the script split by sentence group instead of four blocks, and V3 loaded with the package's stock decoder."),
            ("probe", "Pronunciation probes", "One short sentence, default settings, in three spellings.")):
        rows = [e for e in tracks if e["kind"] == kind]
        if rows:
            trs = "".join(f"<tr><th>{html.escape(e['model']['label'])}<small>{html.escape(e.get('probe', {}).get('what') or e.get('segmentation', ''))}</small>"
                          f"<small>{html.escape(e['script']['text'] if kind == 'probe' else '')}</small></th><td>{_player(e)}</td></tr>" for e in rows)
            body.append(f"<h2>{title}</h2><p class=mute>{intro}</p><div class=wrap><table>{trs}</table></div>")
    kokoro = sorted(list((KOKORO_OUT / "tracks").glob("S02_em_alex_*.wav")) + list((KOKORO_OUT / "tracks-extra").glob("S02_em_alex_*.wav")))
    if kokoro:
        trs = "".join(f"<tr><th>Kokoro em_alex<small>{html.escape(p.stem.split('_', 3)[3])}</small></th><td>"
                      f"<audio controls preload=none data-lufs=\"-25\" src=\"{html.escape(os.path.relpath(p, out))}\"></audio>"
                      f"<small><code>{html.escape(p.name)}</code></small></td></tr>" for p in kokoro)
        body.append("<h2>Kokoro baseline (existing files, for reference)</h2><p class=mute>The earlier <code>em_alex</code> tracks of the same script, "
                    f"played from <code>out/audio-experiments</code>. They are untouched and were not used as a voice reference.</p><div class=wrap><table>{trs}</table></div>")
    s = manifest["summary"]
    summary = (f"{s['core']} tracks, {s['extra']} extras, {s['probe']} probes, {s['failed']} failed. Same script, built-in voice, CPU. "
               f"Updated {html.escape(manifest['generated_at'])}. Details in <a href=\"README.md\">README.md</a> and <a href=\"manifest.json\">manifest.json</a>.")
    write_atomic(out / "index.html", _PAGE.replace("__SUMMARY__", summary).replace("__BODY__", "\n".join(body)))


def write_readme(out: Path, manifest: dict) -> None:
    env, tracks = manifest["environment"], manifest["tracks"]
    ok = [e for e in tracks if e["status"] == "ok"]
    L: list[str] = []
    add = L.append
    add("# Goslint · Chatterbox Multilingual V3 voice-over evaluation\n")
    add("The S02 narration generated with two Chatterbox V3 models and three settings each. **Nobody has listened to "
        "these yet, so nothing is ranked.** Open [`index.html`](index.html) to compare them.\n")
    s = manifest["summary"]
    add(f"- **Generated:** {s['core']} tracks, {s['extra']} extras, {s['probe']} probes; {s['failed']} failed (see [`errors.log`](errors.log))")
    add(f"- **Inference:** CPU ({env['workers']} model sessions at a time, {env['threads_per_worker']} threads each). No GPU was used.")
    add(f"- **Voice:** the models' built-in voice. No reference recording, and no Kokoro audio, was given to the models.")
    add(f"- **Last run:** `{manifest['command']}` · {manifest['generated_at']} · {manifest['elapsed_s']} s")
    add(f"- **Project originals and Kokoro tracks:** {'verified byte-identical before and after the run' if manifest['originals_untouched'] else 'CHANGED DURING THE RUN'}\n")

    add("## Tracks\n")
    add("| File | Model | Setting | exaggeration | cfg_weight | Length | Loudness (measured) | Generation |\n|---|---|---|---:|---:|---:|---:|---:|")
    for e in tracks:
        if e["kind"] == "probe":
            continue
        if e["status"] != "ok":
            add(f"| `{e['filename']}` | {e['model']['label']} | {e['configuration']['label']} | | | | failed | |")
            continue
        lufs = e["measured"]["integrated_lufs"]
        add(f"| [`{e['filename']}`]({e['filename']}) | {e['model']['label']} | {e['configuration']['label']}"
            f"{'' if e['kind'] == 'core' else ' · ' + e.get('segmentation', '')} | {e['settings']['exaggeration']:.2f} | "
            f"{e['settings']['cfg_weight']:.2f} | {e['audio']['duration_s']:.1f} s | {'n/a' if lufs is None else f'{lufs:.1f} LUFS'} | "
            f"{e['timing']['generation_s']:.0f} s (x{e['timing']['realtime_factor']:.1f}) |")
    add("\nLoudness is reported so differences in level are known. The listening page can match loudness during "
        "playback without changing the files. The models' output reaches full scale: where a track peaked above it, "
        "the whole track was lowered by that fraction of a decibel so the 16-bit file does not clip (`level_note` in "
        "the manifest); no other gain, and no limiter, was applied, so true peaks sit at about 0 to +1 dBTP.\n")
    warned = [(e["id"], w) for e in ok for w in e.get("warnings", [])]
    if warned:
        add("**Warnings**\n")
        L.extend(f"- `{i}`: {w}" for i, w in warned)
        add("")

    add("## Checkpoints loaded\n")
    add("| Model | Language model | Speech decoder | How it is loaded |\n|---|---|---|---|")
    seen = {}
    for e in tracks:
        seen.setdefault(e["model"]["key"], e["model"])
    for key, m in seen.items():
        lm, dec = m["language_model"], m["decoder"]
        add(f"| {m['label']} | `{lm['repo']}` / `{lm['file']}` · rev `{lm['revision'][:10]}` · sha256 `{lm['sha256'][:12]}…` | "
            f"`{dec['repo']}` / `{dec['file']}` · sha256 `{dec['sha256'][:12]}…` | {m['note']} |")
    add("")
    add("- **V3, not V2.** `from_pretrained()` without `t3_model` loads the legacy `t3_mtl23ls_v2.safetensors`. This lab names "
        "`t3_mtl23ls_v3.safetensors` explicitly and records the SHA-256 of the file it read.\n"
        "- **Decoder.** `s3gen_v3.pt` differs from `s3gen.pt` only in the vocoder (328 of 2,488 tensors, all under `mel2wav`); "
        "the rest is identical. The pip package reads `s3gen.pt` even for V3, while Resemble's Latin American demo reads "
        "`s3gen_v3.pt`. The six tracks use `s3gen_v3.pt` for both models, so they differ only in the language model. "
        "The extra `…_stock-decoder` track is V3 through the package's own loader; with the same seed it is the same speech "
        "tokens through the other vocoder.\n"
        "- **Latin American model.** The pip package has no loader for it. This lab follows Resemble's demo Space: "
        "`t3_es_mx_latam.safetensors` and `s3gen_v3.pt` from the LatAm repository, with the voice encoder, tokenizer and built-in "
        "voice from `ResembleAI/chatterbox`.\n")

    add("## Settings\n")
    add("`exaggeration` and `cfg_weight` are the parameter names of `ChatterboxMultilingualTTS.generate()`. Everything else is "
        f"left at that function's defaults and is the same for every track: `temperature={SAMPLING['temperature']}`, "
        f"`repetition_penalty={SAMPLING['repetition_penalty']}`, `min_p={SAMPLING['min_p']}`, `top_p={SAMPLING['top_p']}`, "
        f"`language_id=\"{LANGUAGE_ID}\"`. The multilingual models have no emotion or stage-direction tags, and none are used.\n")
    add(f"**Rejected takes.** This kind of model sometimes invents, repeats or drops words. A block spoken slower than "
        f"{PACE_RANGE[0]:.0f} or faster than {PACE_RANGE[1]:.0f} characters per second is rejected and generated again with "
        f"another seed, up to {MAX_TAKES} takes. The rule looks only at length, is the same for every track, and every "
        "rejected take is kept in `work/segments/` and listed under Warnings above. How often a setting needed it is "
        "itself a result.\n")
    add("Generation samples at random. Segment *n* of every track uses seed `--seed + n`, so a run is repeatable and the tracks "
        "share their random numbers, but **one take per setting is not enough to tell a setting's effect from chance**: a "
        "different seed gives a different reading of the same setting.\n")

    add("## Script\n")
    add(f"`{manifest['script']['file']}`, the words of the `S02_em_alex_*` Kokoro samples (all six used the same words).\n")
    add("> " + manifest["script"]["written_text"] + "\n")
    add("Sent to the models as written, except two items that are not words: "
        + ", ".join(f"`{k}` → \"{v}\"" for k, v in manifest["script"]["spoken_forms"].items())
        + ". The tokenizer works on lower-cased letters, and these are the respellings the project's `narration.json` already "
        "uses. `Python`, `Java`, `UCEVA` and `Goslint` are sent as written. `probes/` has one sentence in three spellings per "
        "model to check that choice by ear (`--smoke`). The models also turn `:` into `,` themselves.\n")
    add("**Segmentation.** One `generate()` call produces at most 1000 speech tokens (40 s), and Resemble's demos cut input at "
        "300 characters, so the 720-character script cannot go in one call. The tracks use four blocks of related sentences "
        "(hook and identity, training and competing, team and research, call to action), each 130 to 240 characters; pauses "
        "inside a block are the model's own. Each block is trimmed at its silent edges (40 ms kept before, 150 ms after, "
        "short fades) and the blocks are joined with the silences the script lists for those points (0.6 to 0.8 s). "
        "The untrimmed output of every call is kept in `work/segments/`.\n")

    add("## Listening guide\n")
    add("1. **Model:** `S02_chatterbox-v3_default` against `S02_chatterbox-latam_default`. Same text, settings, seeds and decoder.\n"
        "2. **Settings, within the model you preferred:** default, conversational, expressive.\n"
        "3. **Against Kokoro:** the `em_alex` tracks at the bottom of the page.\n"
        "4. **Decoder** (extras): `S02_chatterbox-v3_default` against `…_stock-decoder`.\n"
        "5. **Segmentation** (extras): `…_default` against `…_default_sentence-segments`.\n")
    add("Listen for: Spanish intonation and how sentences end; whether the accent is Latin American or carries a foreign "
        "colour; C++, ICPC, Python, Java, UCEVA and Goslint; skipped, repeated or invented words (this kind of model can "
        "do that, and only the pace is checked automatically); whether the voice stays the same across the three joins.\n")

    add("## Limitations\n")
    add("- **Not auditioned.** Checks are mechanical: format, length, no clipping, no call cut off at the token limit, and a "
        "plausible speaking pace per block.\n"
        "- **Built-in voice.** With no reference, the voice comes from `conds.pt`, one built-in speaker shipped with the base "
        "model; its native language is not documented. Resemble's own demos pass a Spanish reference clip by default. "
        "`--reference FILE --reference-note \"who, and how they agreed\"` runs the same matrix with a real speaker's recording "
        "into `tracks-reference/`; synthetic narration is refused as a reference.\n"
        "- **CPU only.** The Radeon RX 6600 is not on AMD's ROCm support list and no ROCm runtime is installed; it was not "
        "used. On this CPU one session generates at about 3 times real time with 6 threads, and two sessions at 3 threads "
        "each at about 5.4 times real time each, which is slightly more audio per minute. More threads or sessions were "
        "slower.\n"
        "- **Watermark.** Chatterbox embeds Resemble's inaudible PerTh watermark in everything it generates.\n"
        "- **Not in the video.** These are voice-only tracks; nothing in `src/`, `public/` or the Kokoro outputs was changed.\n")

    add("## Setup and reproduction\n")
    add("```bash\n# isolated environment: Python 3.11, CPU-only PyTorch, Chatterbox from the official repository (V3 is not on PyPI yet)\n"
        "uv venv --python 3.11 .venv-chatterbox\n"
        "uv pip install --python .venv-chatterbox/bin/python torch==2.6.0+cpu torchaudio==2.6.0+cpu --index-url https://download.pytorch.org/whl/cpu\n"
        f"uv pip install --python .venv-chatterbox/bin/python \"chatterbox-tts @ git+{env['chatterbox_source'] or 'https://github.com/resemble-ai/chatterbox'}\" soundfile\n\n"
        ".venv-chatterbox/bin/python scripts/experiment_chatterbox.py --smoke            # loads both models, writes probes/\n"
        ".venv-chatterbox/bin/python scripts/experiment_chatterbox.py --mp3              # the six tracks\n"
        ".venv-chatterbox/bin/python scripts/experiment_chatterbox.py --extras --mp3     # plus the extras\n```\n")
    add("The first run downloads 6.4 GB of weights into `~/.cache/huggingface` (3.2 GB per model). Each loaded model needs "
        "about 5 GB of RAM. Generated segments are cached in `work/`, so a re-run only regenerates what changed "
        "(`--force` regenerates everything). `--workers 1` runs the models one after the other.\n")
    pk = env["packages"]
    add(f"Environment: chatterbox-tts {pk['chatterbox-tts']} from `{env['chatterbox_source']}`, torch {pk['torch']}, "
        f"transformers {pk['transformers']}, resemble-perth {pk['resemble-perth']}, Python {env['python']}; {env['ffmpeg'] or 'no FFmpeg'}.\n")
    write_atomic(out / "README.md", "\n".join(L))


if __name__ == "__main__":
    sys.exit(main())
