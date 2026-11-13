# -*- coding: utf-8 -*-
"""
Offline Game Syntax, DOM Binding & Vocabulary Integrity Auditor
Validates all JS modules, HTML IDs, and HSK vocabulary Pinyin normalization in <1s.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

WORKSPACE_ROOT = Path(r"d:\app học tiếng trung")

JS_FILES = [
    WORKSPACE_ROOT / "js" / "data" / "vocabDatabase.js",
    WORKSPACE_ROOT / "js" / "data" / "curriculumMeta.js",
    WORKSPACE_ROOT / "js" / "services" / "storageService.js",
    WORKSPACE_ROOT / "js" / "services" / "apiClient.js",
    WORKSPACE_ROOT / "js" / "audio" / "soundEngine.js",
    WORKSPACE_ROOT / "js" / "engine" / "entities.js",
    WORKSPACE_ROOT / "js" / "engine" / "gameEngine.js",
    WORKSPACE_ROOT / "js" / "learning" / "academyHub.js",
    WORKSPACE_ROOT / "js" / "learning" / "lessonStudio.js",
    WORKSPACE_ROOT / "js" / "learning" / "practiceArena.js",
    WORKSPACE_ROOT / "js" / "learning" / "dictionaryView.js",
    WORKSPACE_ROOT / "js" / "learning" / "communityModal.js",
    WORKSPACE_ROOT / "js" / "ui" / "uiController.js",
    WORKSPACE_ROOT / "js" / "qa" / "gameQaSuite.js",
]

REQUIRED_HTML_IDS = [
    "game-canvas",
    "hud-stage-label",
    "hud-word-progress",
    "hud-score",
    "hud-combo",
    "hud-accuracy",
    "hud-shields",
    "hud-streak-level",
    "locked-target-hud",
    "btn-open-units",
    "btn-study-deck",
    "btn-open-hangar",
    "btn-mode-cycle",
    "btn-difficulty-cycle",
    "btn-tone-mode",
    "btn-toggle-keyboard",
    "btn-peek-word",
    "btn-hint-mode",
    "btn-speed-cycle",
    "btn-toggle-audio",
    "btn-weak-words",
    "btn-open-custom",
    "btn-pause",
    "touch-keyboard",
    "modal-units",
    "modal-study-deck",
    "modal-hangar",
    "modal-custom-vocab",
    "modal-unit-complete",
    "modal-game-over",
]


def check_js_syntax() -> list[str]:
    errors = []
    for js_file in JS_FILES:
        if not js_file.exists():
            errors.append(f"Missing JS file: {js_file}")
            continue
        res = subprocess.run(
            ["node", "--check", str(js_file)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if res.returncode != 0:
            errors.append(f"Syntax error in {js_file.name}: {res.stderr.strip()}")
    return errors


def check_html_ids() -> list[str]:
    html_path = WORKSPACE_ROOT / "index.html"
    if not html_path.exists():
        return ["Missing index.html"]
    content = html_path.read_text(encoding="utf-8")
    missing = []
    for dom_id in REQUIRED_HTML_IDS:
        if f'id="{dom_id}"' not in content:
            missing.append(dom_id)
    return [f"Missing HTML ID: #{m}" for m in missing]


def check_vocab_database_via_node() -> dict:
    vocab_path = WORKSPACE_ROOT / "js" / "data" / "vocabDatabase.js"
    node_script = f"""
    global.window = {{}};
    require({json.dumps(str(vocab_path))});
    const db = global.window.VocabDatabase;
    let units = 0, words = 0;
    const issues = [];
    for (const deck of db.DECKS) {{
        for (const u of deck.units) {{
            units++;
            const boss = db.getUnitBossWord(u);
            const cleanBossHanzi = (boss.hanzi || "").replace(/[，。？！?,\\s]/g, "");
            if (cleanBossHanzi.length < 5) {{
                issues.push(`Boss for ${{deck.id}} u${{u.unitNumber}} is too short (must be a sentence >=5 chars): '${{boss.hanzi}}'`);
            }}
            if (db.normalizePinyin(boss.pinyin) !== boss.pinyinClean) {{
                issues.push(`Boss pinyinClean mismatch in ${{deck.id}} u${{u.unitNumber}}: '${{db.normalizePinyin(boss.pinyin)}}' vs '${{boss.pinyinClean}}'`);
            }}
            const seenMeanings = new Map();
            for (const w of u.words) {{
                words++;
                const variants = db.getValidPinyinVariants(w);
                if (!w.hanzi || !w.pinyin || !w.meaning) {{
                    issues.push(`Incomplete word in ${{deck.id}} u${{u.unitNumber}}: ${{JSON.stringify(w)}}`);
                }}
                if (!variants.length || !/^[a-z]+$/.test(variants[0])) {{
                    issues.push(`Invalid ASCII pinyin variant for ${{w.hanzi}}: ${{JSON.stringify(variants)}}`);
                }}
                const mNorm = db.normalizeVietnamese(w.meaningShort || w.meaning);
                if (seenMeanings.has(mNorm) && seenMeanings.get(mNorm) !== w.hanzi) {{
                    issues.push(`Intra-unit meaningShort collision in ${{deck.id}} u${{u.unitNumber}}: ${{seenMeanings.get(mNorm)}} vs ${{w.hanzi}} ('${{mNorm}}')`);
                }}
                seenMeanings.set(mNorm, w.hanzi);
            }}
        }}
    }}
    const toneSample = db.normalizePinyinWithTones("nǐ hǎo");
    if (toneSample !== "ni3hao3") {{
        issues.push(`Expected ni3hao3 for nǐ hǎo, got ${{toneSample}}`);
    }}
    const meaningVariants = db.getValidMeaningVariants({{ hanzi: "好", pinyin: "hǎo", meaning: "Tốt, đẹp, khỏe", meaningShort: "Tốt" }});
    if (meaningVariants.length !== 1 || meaningVariants[0] !== "tot") {{
        issues.push(`Expected strict 1-to-1 meaningShort ['tot'] for 好, got ${{JSON.stringify(meaningVariants)}}`);
    }}
    const laoshiVariants = db.getValidMeaningVariants({{ hanzi: "老师", pinyin: "lǎoshī", meaning: "Giáo viên / Thầy cô", meaningShort: "Giáo viên" }});
    if (laoshiVariants.length !== 1 || laoshiVariants[0] !== "giaovien") {{
        issues.push(`Expected strict 1-to-1 meaningShort ['giaovien'] for 老师, got ${{JSON.stringify(laoshiVariants)}}`);
    }}
    console.log(JSON.stringify({{
        ok: issues.length === 0,
        decks: db.DECKS.length,
        units,
        words,
        issues
    }}));
    """
    res = subprocess.run(
        ["node", "-e", node_script],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if res.returncode != 0:
        return {"ok": False, "error": res.stderr.strip()}
    return json.loads(res.stdout.strip())


def main() -> int:
    js_errors = check_js_syntax()
    html_errors = check_html_ids()
    vocab_report = check_vocab_database_via_node()

    all_ok = (len(js_errors) == 0) and (len(html_errors) == 0) and vocab_report.get("ok", False)
    report = {
        "ok": all_ok,
        "js_files_checked": len(JS_FILES),
        "js_syntax_errors": js_errors,
        "html_id_errors": html_errors,
        "vocab_audit": vocab_report,
    }
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
