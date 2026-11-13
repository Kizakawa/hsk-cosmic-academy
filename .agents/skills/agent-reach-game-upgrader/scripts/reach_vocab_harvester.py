# -*- coding: utf-8 -*-
"""
Agent-Reach Vocabulary Harvester & Unit Formatter for HSK Space Shooter Game
- Wraps `D:\\Python312\\Scripts\\agent-reach.exe` to search Bilibili, YouTube, GitHub, Reddit, or read URLs.
- Normalizes tone-marked Pinyin into clean ASCII (`pinyinClean`) matching `VocabDatabase.normalizePinyin`.
- Outputs ready-to-paste JavaScript Unit blocks for `js/data/vocabDatabase.js`.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

AGENT_REACH_BIN = r"D:\Python312\Scripts\agent-reach.exe"

TONE_MAP = {
    "ā": "a", "á": "a", "ǎ": "a", "à": "a",
    "ē": "e", "é": "e", "ě": "e", "è": "e",
    "ī": "i", "í": "i", "ǐ": "i", "ì": "i",
    "ō": "o", "ó": "o", "ǒ": "o", "ò": "o",
    "ū": "u", "ú": "u", "ǔ": "u", "ù": "u",
    "ǖ": "v", "ǘ": "v", "ǚ": "v", "ǜ": "v", "ü": "v",
    "ń": "n", "ň": "n", "ǹ": "n",
}


def normalize_pinyin(raw_pinyin: str) -> str:
    if not raw_pinyin:
        return ""
    out = []
    for ch in raw_pinyin.lower().strip():
        if ch in TONE_MAP:
            out.append(TONE_MAP[ch])
        elif "a" <= ch <= "z":
            out.append(ch)
    return "".join(out)


def run_agent_reach(channel: str, action: str, query_or_url: str, limit: int = 5) -> dict:
    if channel == "read":
        cmd = [AGENT_REACH_BIN, "read", query_or_url]
    else:
        cmd = [AGENT_REACH_BIN, channel, action, query_or_url]
        if action in ("search", "hot", "node", "tweets", "posts"):
            cmd.extend(["--limit", str(limit)])

    res = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    stdout = res.stdout.strip()
    try:
        return json.loads(stdout.splitlines()[-1]) if stdout else {"ok": False, "raw": res.stderr}
    except Exception:
        return {"ok": res.returncode == 0, "raw_stdout": stdout, "raw_stderr": res.stderr}


def format_js_unit(unit_number: int, stage_label: str, title: str, raw_words: str) -> str:
    words_list = []
    for entry in raw_words.split(";"):
        entry = entry.strip()
        if not entry:
            continue
        parts = [p.strip() for p in entry.replace("|", "-").split("-") if p.strip()]
        if len(parts) >= 3:
            hanzi, pinyin, meaning = parts[0], parts[1], " - ".join(parts[2:])
            words_list.append({
                "hanzi": hanzi,
                "pinyin": pinyin,
                "pinyinClean": normalize_pinyin(pinyin),
                "meaning": meaning,
            })

    lines = [
        "                {",
        f"                    unitNumber: {unit_number},",
        f"                    stageLabel: {json.dumps(stage_label, ensure_ascii=False)},",
        f"                    title: {json.dumps(title, ensure_ascii=False)},",
        "                    words: [",
    ]
    for idx, w in enumerate(words_list):
        comma = "," if idx < len(words_list) - 1 else ""
        lines.append(
            f"                        {{ hanzi: {json.dumps(w['hanzi'], ensure_ascii=False)}, "
            f"pinyin: {json.dumps(w['pinyin'], ensure_ascii=False)}, "
            f"pinyinClean: {json.dumps(w['pinyinClean'], ensure_ascii=False)}, "
            f"meaning: {json.dumps(w['meaning'], ensure_ascii=False)} }}{comma}"
        )
    lines.append("                    ]")
    lines.append("                }")
    return "\n".join(lines)


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Agent-Reach Vocab Harvester & Unit Formatter")
    parser.add_argument("--channel", default="bilibili", help="bilibili | youtube | github | reddit | web | read")
    parser.add_argument("--action", default="search", help="search | read | subtitle | hot")
    parser.add_argument("--query", help="Search query or target URL")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--format-unit", help="Title for formatted JS unit")
    parser.add_argument("--unit-number", type=int, default=30)
    parser.add_argument("--stage", default="Màn Mới • Unit 30")
    parser.add_argument("--words", help="Semicolon-separated words: Hanzi|Pinyin|Meaning;...")
    args = parser.parse_args()

    if args.format_unit and args.words:
        print(format_js_unit(args.unit_number, args.stage, args.format_unit, args.words))
        return 0

    if args.query:
        data = run_agent_reach(args.channel, args.action, args.query, args.limit)
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return 0 if data.get("ok") else 1

    parser.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
