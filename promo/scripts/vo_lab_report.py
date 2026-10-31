"""Review files for the voice-over experiment lab: manifest.csv, README.md and index.html.

Everything here is derived from the manifest that scripts/experiment_vo.py writes, so the review
files always describe the tracks that are really on disk.
"""
from __future__ import annotations

import csv
import html
import io
import os
from pathlib import Path


def _write(path: Path, text: str) -> None:
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


def _num(value, fmt: str = "{:.1f}") -> str:
    return "" if value is None else fmt.format(value)


def _ok(manifest: dict, group: str | None = None) -> list[dict]:
    return [t for t in manifest["tracks"] if t["status"] == "ok" and (group is None or t["set"] == group)]


def write_csv(out: Path, manifest: dict) -> None:
    columns = ["track_id", "filename", "set", "status", "script", "voice", "technique", "technique_name",
               "phoneme_lang", "segmentation", "pause_strategy", "model_passes", "finishing", "duration_s",
               "speech_s", "pause_s", "integrated_lufs", "lra_lu", "true_peak_dbtp", "level_match_gain_db",
               "lufs_before_level_match", "sample_rate", "bit_depth", "channels", "bytes", "sha256",
               "warnings", "error"]
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=columns, lineterminator="\n")
    writer.writeheader()
    for t in manifest["tracks"]:
        audio, loud = t.get("audio", {}), t.get("loudness", {})
        writer.writerow({
            "track_id": t["track_id"], "filename": t["filename"], "set": t["set"], "status": t["status"],
            "script": t["script"]["id"], "voice": t["voice"]["id"], "technique": t["technique"]["id"],
            "technique_name": t["technique"]["slug"], "phoneme_lang": t["synthesis"]["lang"],
            "segmentation": t["synthesis"]["segmentation"], "pause_strategy": t["synthesis"]["pauses"],
            "model_passes": t["synthesis"]["passes"], "finishing": t["finishing"],
            "duration_s": audio.get("duration_s"), "speech_s": audio.get("speech_s"), "pause_s": audio.get("pause_s"),
            "integrated_lufs": loud.get("integrated_lufs"), "lra_lu": loud.get("lra_lu"),
            "true_peak_dbtp": loud.get("true_peak_dbtp"), "level_match_gain_db": loud.get("level_match_gain_db"),
            "lufs_before_level_match": (loud.get("before_level_match") or {}).get("integrated_lufs"),
            "sample_rate": audio.get("sample_rate"), "bit_depth": audio.get("bit_depth"),
            "channels": audio.get("channels"), "bytes": audio.get("bytes"), "sha256": audio.get("sha256"),
            "warnings": " | ".join(t.get("warnings", [])), "error": t.get("error") or "",
        })
    _write(out / "manifest.csv", buffer.getvalue())


def _matrix(tracks: list[dict], script_id: str) -> list[str]:
    """Voice x technique table for one script: duration, loudness and true peak of each track."""
    rows = [t for t in tracks if t["script"]["id"] == script_id]
    techs = sorted({t["technique"]["id"] for t in rows})
    voices = sorted({t["voice"]["id"] for t in rows}, key=lambda v: (v.startswith("blend"), v))
    slug = {t["technique"]["id"]: t["technique"]["slug"] for t in rows}
    lines = ["| Voice | " + " | ".join(f"{i} {slug[i]}" for i in techs) + " |", "|---|" + "---|" * len(techs)]
    for voice in voices:
        cells = []
        for tech in techs:
            t = next((r for r in rows if r["voice"]["id"] == voice and r["technique"]["id"] == tech), None)
            cells.append("" if t is None else
                         f"[{t['audio']['duration_s']:.1f} s]({t['filename']}) · "
                         f"{_num(t['loudness']['integrated_lufs'])} LUFS · {_num(t['loudness']['true_peak_dbtp'])} dBTP")
        lines.append(f"| `{voice}` | " + " | ".join(cells) + " |")
    return lines


def _level_spread(tracks: list[dict], target: float) -> str:
    """Whether the level match held for every track, in words, from the measured values."""
    levels = [t["loudness"]["integrated_lufs"] for t in tracks if t["loudness"]["integrated_lufs"] is not None]
    held = [t["track_id"] for t in tracks if t["loudness"]["level_match_capped"]]
    if not levels:
        return "Loudness could not be measured on this install. "
    spread = f"The {len(levels)} tracks measure {min(levels):.2f} to {max(levels):.2f} LUFS. "
    if held:
        return spread + (f"{len(held)} of them stopped short of the target at the ceiling ({', '.join(held)}); "
                         "a lower `--target-lufs` brings every track to the same level. ")
    return spread + ("The target is low because uncompressed Kokoro speech peaks 21 to 23 dB above its "
                     "loudness: it is the highest round level every track reaches under the ceiling. ")


def _mean(tracks: list[dict], key) -> float | None:
    values = [key(t) for t in tracks if key(t) is not None]
    return sum(values) / len(values) if values else None


def write_readme(out: Path, manifest: dict, scripts: list[dict]) -> None:
    env, settings, voices = manifest["environment"], manifest["settings"], manifest["voices"]
    ok, core, extra = _ok(manifest), _ok(manifest, "core"), _ok(manifest, "extra")
    failed = [t for t in manifest["tracks"] if t["status"] != "ok"]
    techs = {t["id"]: t for t in manifest["techniques"]}
    used = sorted({t["technique"]["id"] for t in ok})
    has_durations = any(t.get("model_has_duration_output") for t in ok)
    pk = env["packages"]
    L: list[str] = []
    add = L.append

    add("# Goslint · voice-over experiment lab\n")
    add("Complete Spanish narration tracks for the Goslint promo, one per combination of script, voice and "
        "audio technique, made to be compared by ear. **Every track here is an experiment: nothing has been "
        "ranked, because nobody has listened yet.** Loudness, duration and the other numbers below describe "
        "the files; they do not say which one sounds better.\n")
    add(f"- **Tracks:** {len(ok)} generated ({len(core)} core, {len(extra)} extra), {len(failed)} failed")
    add(f"- **Listen:** open [`index.html`](index.html) in a browser (players for every track, grouped by script)")
    add(f"- **Inventory:** [`manifest.csv`](manifest.csv) to skim, [`manifest.json`](manifest.json) for everything "
        "(exact text, phonemes, segment times, processing chain, checksums)")
    add(f"- **Last run:** `{manifest['command']}` · {manifest['generated_at']} · {manifest['elapsed_s']} s")
    add(f"- **Project originals:** {'verified byte-identical before and after the run' if manifest['originals_untouched'] else 'CHANGED DURING THE RUN, see the console output'}"
        " (checksums in [`initial-state.json`](initial-state.json))\n")

    add("## Reproduce\n")
    add("```bash\n# once: Python 3.10-3.13 environment and the model files (see \"Locución\" in the project README)\n"
        "python3.13 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile\n\n"
        ".venv/bin/python scripts/experiment_vo.py --smoke          # short end-to-end check\n"
        ".venv/bin/python scripts/experiment_vo.py --workers 4      # the core matrix\n"
        ".venv/bin/python scripts/experiment_vo.py --workers 4 --extras --blend em_alex+em_santa --mp3\n"
        ".venv/bin/python scripts/experiment_vo.py --probe          # pronunciation probe clips\n```\n")
    add("Runs resume: a combination whose inputs have not changed is skipped (`--force` redoes it). "
        "`--scripts`, `--voices` and `--techniques` narrow a run. The script only writes under `--out` and refuses "
        "an output directory inside `public/`, `src/` or `scripts/`.\n")

    add("## Layout\n")
    add("| Path | Contents |\n|---|---|\n"
        "| `tracks/` | the core matrix: every script x Spanish voice x T00, T01, T02 |\n"
        "| `tracks-extra/` | extra techniques (T03 to T05) and blended voices |\n"
        "| `scripts/` | the exact script files the tracks were made from |\n"
        "| `manifest.json`, `manifest.csv` | one entry per track |\n"
        "| `index.html` | players for every track |\n"
        "| `mp3/` | lossy audition copies, written with `--mp3`; the WAV files are the reference |\n"
        "| `pronunciation-probes/` | short clips from `--probe` |\n"
        "| `smoke/` | output of `--smoke`: the same pipeline on the first two lines of each script |\n"
        "| `work/` | cached synthesis and per-track metadata used to resume; safe to delete |\n"
        "| `errors.log` | present only when a track failed |\n")

    add("## Scripts\n")
    add("| ID | Variant | Words | Lines | File |\n|---|---|---|---|---|")
    for s in manifest["scripts"]:
        add(f"| {s['id']} | {s['title']} | {s['words']} | {s['lines']} | [`scripts/{s['file']}`](scripts/{s['file']}) |")
    add("")
    for s in scripts:
        add(f"**{s['id']} · {s['title']}.** {s['intent']}\n")
        add("> " + " ".join(ln.get("caption", ln["text"]) for ln in s["lines"]) + "\n")
    add("S00 is checked against `scripts/narration.json` on every run and the run stops if a word differs. "
        "S01 to S03 keep the original's facts and call to action and add none.\n")

    add("### Pronunciation\n")
    add("The only pronunciation controls this install really has are the spelling of the text, the espeak-ng "
        "language that turns it into phonemes (`lang`), and passing phonemes directly. What was found:\n")
    add("| Written | Phonemes with `es` | Used in S01 to S03 |\n|---|---|---|\n"
        "| `C++` | `θˈe mˈasmˈas` | canonical spelling, it is already read correctly |\n"
        "| `UCEVA` | `uθˈeβa` | canonical spelling, same phonemes as the respelling \"Uceva\" |\n"
        "| `ICPC` | `ˈikpk` (one garbled word) | hint: `I C P C`, same phonemes as the original \"i ce pe ce\" |\n"
        "| `Python` | `pˈiton` | hint: `Páiton` gives `pˈaiton` |\n"
        "| `Java` | `xˈaβa` (Spanish jota) | hint: `Yava` gives `ʝˈaβa` |\n")
    add("Hints live in each script's `pronunciation` list and are applied only to whole tokens; each track's "
        "manifest entry has both the written and the spoken text. S00 has no hints, so it keeps the original "
        "\"píton\" and jota \"Java\".\n")
    add("**Accent.** The project synthesizes with `lang=\"es\"`, which is Castilian: *cinco*, *juez*, *UCEVA* and "
        "the *ce* of C++ and ICPC get the `θ` sound. `es-419` (Latin American) gives `s` instead, and the model "
        "renders the two differently. The core matrix keeps `es` so that it differs from the baseline in one "
        "thing at a time; T05 is the same as T03 with `es-419`.\n")
    if (out / "pronunciation-probes" / "README.md").exists():
        add("Short clips of one sentence in each spelling and each `lang`: "
            "[`pronunciation-probes/`](pronunciation-probes/README.md).\n")

    add("## Voices\n")
    add(f"`{env['voices_file']['file']}` holds {voices['in_voices_file']} voices. Spanish ones (prefix `ef_`/`em_`): "
        + ", ".join(f"`{v}`" for v in voices["spanish_detected"]) + ". All of them were tested"
        + (f"; missing from the file: {', '.join(voices['priority_missing'])}" if voices["priority_missing"] else "")
        + ". There are no other Spanish voices (`pf_dora`, `pm_alex` and `pm_santa` are Portuguese).\n")
    if voices["blends"]:
        add("Blend: " + ", ".join(f"`{b}`" for b in voices["blends"]) + ". `Kokoro.create()` accepts a style tensor "
            "in place of a voice name, and a blend is the weighted average of the voices' tensors. It is an extra, "
            "not an expected improvement.\n")

    add("## Techniques\n")
    add("Synthesis and finishing are separate stages, and each core technique changes one of them:\n")
    add("| | Synthesis | Finishing | Set |\n|---|---|---|---|")
    for tid in sorted(techs):
        t = techs[tid]
        s = t["synthesis"]
        synth = (f"one pass per {s['segmentation']}, lang `{s['lang']}`, "
                 + ("fixed " + str(settings["line_gap_s"]) + " s gap" if s["pauses"] == "fixed" else "pauses from the script")
                 + f", {'library trim + make_vo.py trim' if s['edge_trim'] == 'make_vo' else 'soft trim with fades'}")
        add(f"| **{tid} {t['slug']}** | {synth} | {t['finish']} | {'core' if t['core'] else 'extra'} |")
    add("")
    add("**Finishing chains**\n")
    for name, text in sorted({t["finish"]: t["finishing"] for t in techs.values()}.items()):
        add(f"- `{name}`: {text}")
    add("")
    fidelity = next((t["baseline_fidelity"] for t in ok if t.get("baseline_fidelity")), None)
    add(f"**T00 baseline.** `compress()` is compiled from `scripts/make_vo.py` itself and the silence trim is "
        "its lines 30 to 32, checked against the file on every run. The call to Kokoro is the same "
        "(`lang=\"es\"`, per-line `speed`, the library's default trim). The one thing an audio-only track cannot "
        f"reuse is the video's cue sheet, so lines are joined with a fixed {settings['line_gap_s']} s gap, the median "
        "gap between lines in the Reel cut."
        + ("" if not fidelity else
           f" Regenerated `S00_em_alex_T00` clips against the project's own `public/audio/vo/*.wav`: lengths within "
           f"{fidelity['max_length_diff_samples']} samples, waveform correlation at least {fidelity['min_correlation']}.")
        + "\n")
    add("**T01 natural prosody.** Lines that belong together are sent to the model as one text, so one pass "
        "shapes the intonation across them (each script's `groups`; a group must fit one pass of 510 phonemes, "
        "and the run fails if it does not). Silence between groups is set per group in the script, by meaning, "
        "instead of one fixed gap. The trim keeps 30 ms before and 150 ms after the speech with short fades. "
        "Speed changes are limited to 0.85 to 1.10: the closing line at 0.9 as in the original, and in S01 to S03 "
        "the line listing the languages at 0.96. Pauses inside a group are whatever the model produced.\n")
    add(f"**T02 natural finishing.** The baseline peak-normalizes and compresses every clip, which makes each line "
        "as loud as its loudest peak allows. T02 leaves the clips at the level the model produced, assembles the "
        "track and applies one gain to all of it.\n")

    if has_durations:
        add("**Not used.** This model reports durations, so `continuous=True` may be available; the lab does not use it.\n")
    else:
        add(f"**Not available on this install (kokoro-onnx {pk['kokoro-onnx']}, `{env['model']['file']}`).** "
            "`create(continuous=True)` raises, because this model file has no duration output. "
            "`sentence_pause` and `clause_pause` change nothing for texts that fit one pass. There are no pitch, "
            "emphasis or SSML controls. None of these are used or claimed; the prosody work in T01 is grouping, "
            "punctuation, speed and silence.\n")

    add("## Levels\n")
    if settings["level_match"]:
        add(f"After its own chain, every track gets one static gain to **{settings['target_lufs']} LUFS** integrated "
            f"(EBU R128), limited so the true peak stays at or under {settings['true_peak_ceiling_dbtp']} dBTP, the "
            "ceiling the project README documents for its masters. A static gain changes level, not dynamics, so the "
            "tracks can be compared without the louder one winning. "
            + _level_spread(ok, settings["target_lufs"])
            + "The gain and the level before it are in the manifest; "
            "`--no-level-match` writes each chain's own level (the baseline's clips then peak at -1.5 dBFS as in the "
            "project).\n")
    else:
        add("Level matching was off for this run: tracks are at the level each chain produces.\n")
    add("Measured means over the generated tracks:\n")
    add("| Technique | Tracks | Loudness before match (LUFS) | Loudness range (LU) | True peak minus loudness (dB) |\n|---|---|---|---|---|")
    for tid in used:
        rows = [t for t in ok if t["technique"]["id"] == tid]
        before = _mean(rows, lambda t: t["loudness"]["before_level_match"]["integrated_lufs"])
        lra = _mean(rows, lambda t: t["loudness"]["lra_lu"])
        crest = _mean(rows, lambda t: None if t["loudness"]["true_peak_dbtp"] is None
                      else t["loudness"]["true_peak_dbtp"] - t["loudness"]["integrated_lufs"])
        add(f"| {tid} {techs[tid]['slug']} | {len(rows)} | {_num(before)} | {_num(lra)} | {_num(crest)} |")
    add("\nT04 is measured after its compressor, which is fed at the target level, so its \"before\" value shows "
        "how much level the compression took off.\n")

    add("## Tracks\n")
    for group, title in (("core", "Core matrix"), ("extra", "Extras")):
        rows = _ok(manifest, group)
        if not rows:
            continue
        add(f"### {title} ({len(rows)})\n")
        for sid in sorted({t["script"]["id"] for t in rows}):
            add(f"**{sid}**\n")
            L.extend(_matrix(rows, sid))
            add("")
    if failed:
        add("### Failed\n")
        L.extend(f"- `{t['track_id']}`: {t['error']}" for t in failed)
        add("\nSee [`errors.log`](errors.log).\n")
    warned = [t for t in ok if t.get("warnings")]
    if warned:
        add("### Warnings\n")
        L.extend(f"- `{t['track_id']}`: {w}" for t in warned for w in t["warnings"])
        add("")

    add("## Listening guide\n")
    add("Change one thing at a time. File names are `<script>_<voice>_<technique>_<name>.wav`.\n")
    add("| To judge | Hold fixed | Compare |\n|---|---|---|\n"
        "| Technique | script and voice | `S00_em_alex_T00` / `S00_em_alex_T01` / `S00_em_alex_T02` |\n"
        "| Voice | script and technique | `S01_em_alex_T01` / `S01_em_santa_T01` / `S01_ef_dora_T01` |\n"
        "| Script | voice and technique | `S00_em_alex_T01` / `S01_…` / `S02_…` / `S03_…` |\n")
    add("Suggested order:\n")
    add("1. **Is the baseline reproduced?** `S00_em_alex_T00` is the clips now in the video, regenerated and joined "
        "with a fixed gap.\n"
        "2. **Phrasing and pauses:** `S00_em_alex_T00` against `S00_em_alex_T01`. Same words, voice and finishing.\n"
        "3. **Finishing:** `S00_em_alex_T00` against `S00_em_alex_T02`. Same synthesized clips, sample for sample.\n"
        "4. **Voice:** the three `S01_*_T01` tracks.\n"
        "5. **Script:** `S00` to `S03` on the voice you preferred, with T01.")
    if extra:
        add("6. **Both changes together:** `tracks-extra/*_T03_combined` against the matching T01 and T02.\n"
            "7. **Accent:** `*_T03_combined` against `*_T05_combined-es419`. Listen to *cinco*, *UCEVA*, *C++*, *juez*.\n"
            "8. **Compression:** `*_T02` (none) against `*_T04_gentle-compression`.")
    add("\nThings worth listening for: whether sentence endings fall naturally or every line lands the same way; "
        "whether pauses arrive where the meaning turns; how C++, Python, Java, ICPC and UCEVA come out; and "
        "whether the quieter line endings survive.\n")

    add("## Limitations\n")
    add("- Nothing was auditioned. The checks are mechanical: each file decodes, is 24 kHz mono 16-bit, has no "
        "clipped samples, contains every segment in order, and is exactly as long as its clips and pauses.\n"
        "- Completeness is checked against the synthesis plan, not by transcribing the audio.\n"
        "- A track is a voice-only stem at the audition level. Putting one in the video means cutting it into the "
        "clips Remotion expects and re-timing `CUES` and `SYNC` in `src/timeline.ts`; each manifest entry lists "
        "its segments with start times for that.\n"
        f"- Output samples depend on the ONNX Runtime thread count; this run used {env['threads_per_worker']} per "
        "worker. A different count gives the same speech with slightly different samples.\n")

    add("## Environment\n")
    add(f"- Model `{env['model']['file']}` ({env['model']['bytes']:,} bytes, sha256 `{env['model']['sha256'][:16]}…`), "
        f"voices `{env['voices_file']['file']}` (sha256 `{env['voices_file']['sha256'][:16]}…`)\n"
        f"- kokoro-onnx {pk['kokoro-onnx']}, onnxruntime {pk['onnxruntime']} ({env['execution_provider']}), "
        f"phonemizer {pk['phonemizer']}, espeakng-loader {pk['espeakng-loader']}, numpy {pk['numpy']}, "
        f"soundfile {pk['soundfile']}, Python {env['python']}\n"
        f"- {env['ffmpeg'] or 'FFmpeg not installed'}\n"
        f"- {settings['workers']} worker processes, one model session each, {env['threads_per_worker']} threads per session, "
        f"on {env['cpus']} logical CPUs\n")
    _write(out / "README.md", "\n".join(L))


_PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Goslint voice-over lab</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#16181d;--mute:#5d6470;--line:#dfe3ea;--accent:#0a7d5a}
@media (prefers-color-scheme:dark){:root{--bg:#0f1115;--card:#171a21;--ink:#e8eaf0;--mute:#9aa3b2;--line:#2a2f3a;--accent:#3ddc97}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,sans-serif}
main{max-width:1280px;margin:0 auto;padding:24px 16px 64px}h1{font-size:24px;margin:0 0 4px}
h2{font-size:18px;margin:36px 0 6px}h3{font-size:13px;margin:18px 0 8px;color:var(--mute);text-transform:uppercase;letter-spacing:.06em}
p{margin:6px 0}.mute{color:var(--mute)}.text{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:6px;padding:10px 14px;margin:8px 0 4px}
.wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:720px}
th,td{border:1px solid var(--line);padding:8px;vertical-align:top;text-align:left;background:var(--card)}
th{font-size:13px;font-weight:600}td.v{font-family:ui-monospace,monospace;font-size:13px;white-space:nowrap}
audio{width:100%;min-width:200px;height:34px;display:block}small{color:var(--mute);font-size:12px}
a{color:var(--accent)}code{font-family:ui-monospace,monospace;font-size:13px}
</style></head><body><main>
<h1>Goslint voice-over lab</h1>
<p class="mute">__SUMMARY__ Tracks are level-matched; starting one player pauses the others. Details in <a href="README.md">README.md</a> and <a href="manifest.csv">manifest.csv</a>.</p>
<p class="mute">All of these are experiments. Nothing here has been ranked.</p>
__BODY__
</main><script>
document.addEventListener('play',e=>{document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true);
</script></body></html>
"""


def write_html(out: Path, manifest: dict, scripts: list[dict]) -> None:
    ok = _ok(manifest)
    body: list[str] = []
    for s in scripts:
        rows = [t for t in ok if t["script"]["id"] == s["id"]]
        if not rows:
            continue
        text = " ".join(ln.get("caption", ln["text"]) for ln in s["lines"])
        body.append(f"<h2>{html.escape(s['id'])} · {html.escape(s['title'])}</h2>"
                    f"<p class=mute>{html.escape(s['intent'])}</p><div class=text>{html.escape(text)}</div>")
        for group, title in (("core", "Core matrix"), ("extra", "Extras")):
            part = [t for t in rows if t["set"] == group]
            if not part:
                continue
            techs = sorted({t["technique"]["id"] for t in part})
            slug = {t["technique"]["id"]: t["technique"] for t in part}
            voices = sorted({t["voice"]["id"] for t in part}, key=lambda v: (v.startswith("blend"), v))
            head = "".join(f"<th>{i} · {html.escape(slug[i]['slug'])}<br><small>{html.escape(slug[i]['summary'])}</small></th>" for i in techs)
            trs = []
            for voice in voices:
                tds = []
                for tech in techs:
                    t = next((r for r in part if r["voice"]["id"] == voice and r["technique"]["id"] == tech), None)
                    if t is None:
                        tds.append("<td></td>")
                        continue
                    loud = t["loudness"]
                    tds.append(f"<td><audio controls preload=none src=\"{html.escape(t['filename'])}\"></audio>"
                               f"<small>{t['audio']['duration_s']:.1f} s · {_num(loud['integrated_lufs'])} LUFS · "
                               f"{_num(loud['true_peak_dbtp'])} dBTP · <a href=\"{html.escape(t['filename'])}\">wav</a></small></td>")
                trs.append(f"<tr><td class=v>{html.escape(voice)}</td>{''.join(tds)}</tr>")
            body.append(f"<h3>{title}</h3><div class=wrap><table><tr><th>Voice</th>{head}</tr>{''.join(trs)}</table></div>")
    summary = (f"{len(ok)} tracks ({manifest['summary']['core_ok']} core, {manifest['summary']['extra_ok']} extra), "
               f"generated {html.escape(manifest['generated_at'])}.")
    _write(out / "index.html", _PAGE.replace("__SUMMARY__", summary).replace("__BODY__", "\n".join(body)))


def write_all(out: Path, manifest: dict, scripts: list[dict]) -> None:
    write_csv(out, manifest)
    write_readme(out, manifest, scripts)
    write_html(out, manifest, scripts)
