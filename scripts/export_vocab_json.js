/**
 * Exports structured JSON curriculum decks & flat searchable index from VocabDatabase
 * Output: data/curriculum_decks.json
 */
const fs = require("node:fs");
const path = require("node:path");

global.window = {};
require(path.join(__dirname, "..", "js", "data", "vocabDatabase.js"));

const db = global.window.VocabDatabase;
const outDir = path.join(__dirname, "..", "data");
fs.mkdirSync(outDir, { recursive: true });

const payload = {
    version: "2.0.0",
    generatedAt: new Date().toISOString(),
    totalDecks: db.DECKS.length,
    totalUnits: db.DECKS.reduce((acc, d) => acc + d.units.length, 0),
    totalWords: db.DECKS.reduce((acc, d) => acc + d.units.reduce((uAcc, u) => uAcc + u.words.length, 0), 0),
    decks: db.DECKS.map(deck => ({
        id: deck.id,
        name: deck.name,
        badge: deck.badge,
        description: deck.description,
        units: deck.units.map(unit => ({
            unitNumber: unit.unitNumber,
            stageLabel: unit.stageLabel,
            title: unit.title,
            targetMode: unit.targetMode || "pinyin",
            bossWord: db.getUnitBossWord(unit),
            words: unit.words.map(w => ({
                hanzi: w.hanzi,
                pinyin: w.pinyin,
                pinyinClean: w.pinyinClean || db.normalizePinyin(w.pinyin),
                pinyinTones: db.normalizePinyinWithTones(w.pinyin),
                meaning: w.meaning,
                meaningShort: db.getDisplayMeaningHint(w),
                meaningNorm: db.normalizeVietnamese(w.meaning)
            }))
        }))
    }))
};

const outFile = path.join(outDir, "curriculum_decks.json");
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");
console.log(`Exported ${payload.totalDecks} decks, ${payload.totalUnits} units, ${payload.totalWords} words -> ${outFile}`);
