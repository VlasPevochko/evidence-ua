#!/usr/bin/env python3
"""Generate per-scene Ukrainian narration with Piper and write a duration manifest.

Piper is the local/offline fallback. Final provider choice remains a listening-QC decision.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import wave
from pathlib import Path


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as handle:
        return handle.getnframes() / float(handle.getframerate())


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="JSON exported by src/tools/export-voiceover.ts")
    parser.add_argument("--voice", default="uk_UA-mykyta-high")
    parser.add_argument("--data-dir", default=".piper-voices")
    parser.add_argument("--output-dir", default="public/audio/creatine-journey")
    parser.add_argument("--length-scale", type=float, default=1.0)
    parser.add_argument("--sentence-silence", type=float, default=0.2)
    args = parser.parse_args()

    source = json.loads(Path(args.input).read_text(encoding="utf-8"))
    scenes = source.get("scenes", [])
    if not scenes:
        raise SystemExit("voiceover JSON contains no scenes")

    data_dir = Path(args.data_dir)
    output_dir = Path(args.output_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    run([sys.executable, "-m", "piper.download_voices", args.voice, "--data-dir", str(data_dir)])

    manifest_scenes: list[dict[str, object]] = []
    for scene in scenes:
        scene_id = str(scene["id"])
        text = str(scene["text"])
        text_file = output_dir / f"{scene_id}.txt"
        wav_file = output_dir / f"{scene_id}.wav"
        text_file.write_text(text, encoding="utf-8")

        run([
            sys.executable,
            "-m",
            "piper",
            "--model",
            args.voice,
            "--data-dir",
            str(data_dir),
            "--length-scale",
            str(args.length_scale),
            "--sentence-silence",
            str(args.sentence_silence),
            "--input-file",
            str(text_file),
            "-f",
            str(wav_file),
        ])

        manifest_scenes.append({
            "id": scene_id,
            "file": wav_file.name,
            "durationSeconds": round(wav_duration(wav_file), 3),
        })
        text_file.unlink(missing_ok=True)

    manifest = {
        "compositionId": source.get("compositionId", "CreatineJourney"),
        "locale": source.get("locale", "uk-UA"),
        "provider": "piper",
        "voice": args.voice,
        "scenes": manifest_scenes,
        "totalDurationSeconds": round(sum(float(scene["durationSeconds"]) for scene in manifest_scenes), 3),
    }
    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
