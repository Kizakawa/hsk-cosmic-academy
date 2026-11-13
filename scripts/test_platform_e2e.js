/**
 * End-to-End Full-Stack Verification Suite for HSK Cosmic Academy v2.0
 * Verifies:
 * 1. Syntax of all 17 JS files (Client, Learning Modules, QA, Service Worker, Server, DB)
 * 2. CurriculumMeta (Radicals, Chiết tự, Grammar, Dialogues, Placement Test)
 * 3. StorageService SM-2 Spaced Repetition & JSON Portability
 * 4. Full HTTP Server + SQLite Auth + Cloud Sync + Leaderboard + Dictionary API + Security Path Guards
 */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");

const ALL_JS_FILES = [
    "sw.js",
    "server/db.js",
    "server/server.js",
    "js/data/vocabDatabase.js",
    "js/data/curriculumMeta.js",
    "js/services/storageService.js",
    "js/services/apiClient.js",
    "js/audio/soundEngine.js",
    "js/engine/entities.js",
    "js/engine/gameEngine.js",
    "js/learning/academyHub.js",
    "js/learning/lessonStudio.js",
    "js/learning/practiceArena.js",
    "js/learning/dictionaryView.js",
    "js/learning/communityModal.js",
    "js/ui/uiController.js",
    "js/qa/gameQaSuite.js"
];

async function main() {
    console.log("1️⃣ Checking JS syntax across all 17 modules...");
    for (const rel of ALL_JS_FILES) {
        const full = path.join(ROOT, rel);
        assert.ok(fs.existsSync(full), `Missing file: ${rel}`);
        execFileSync(process.execPath, ["--check", full], { stdio: "pipe" });
    }
    console.log("   ✅ All 17 JS files passed syntax check!");

    console.log("2️⃣ Testing CurriculumMeta & SM-2 Spaced Repetition logic...");
    const mockStorage = new Map();
    global.window = {};
    global.localStorage = {
        getItem: k => (mockStorage.has(k) ? mockStorage.get(k) : null),
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: k => mockStorage.delete(k)
    };
    require(path.join(ROOT, "js/data/vocabDatabase.js"));
    require(path.join(ROOT, "js/data/curriculumMeta.js"));
    require(path.join(ROOT, "js/services/storageService.js"));

    const hsk1 = global.window.VocabDatabase.DECKS.find(d => d.id === "hsk1_full");
    assert.ok(hsk1 && hsk1.units.length === 15, "HSK1 should have 15 units");

    const analysis = global.window.CurriculumMeta.analyzeHanzi({ hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào" });
    assert.ok(analysis.radical && analysis.mnemonic.length > 10, "Should analyze radical & mnemonic");

    const guide = global.window.CurriculumMeta.getLessonGuide("hsk1_full", hsk1.units[0]);
    assert.ok(guide.grammarPoints.length >= 2, "Should provide grammar points");
    assert.strictEqual(guide.dialogue.length, 4, "Should provide 4-turn dialogue");
    assert.ok(guide.contextualSentences.length >= 5, "Should provide contextual sentences");

    const placementBeginner = global.window.CurriculumMeta.evaluatePlacement([1, 1, 1, 1, 1, 1, 1, 1]);
    assert.strictEqual(placementBeginner.deckId, "starter_easy");
    const placementAdvanced = global.window.CurriculumMeta.evaluatePlacement([0, 0, 0, 0, 0, 0, 0, 0]);
    assert.strictEqual(placementAdvanced.deckId, "hsk4_full");

    // Test SM-2 intervals
    const wSample = { hanzi: "签证", pinyin: "qiānzhèng", meaning: "Thị thực" };
    const r1 = global.window.StorageService.recordSm2Review(wSample, 2, "flashcard");
    assert.strictEqual(r1.repetitions, 1);
    assert.ok(r1.intervalHours >= 12);
    const r2 = global.window.StorageService.recordSm2Review(wSample, 3, "writing");
    assert.strictEqual(r2.level, 3);
    assert.ok(r2.skills.writing === 1);

    const exported = global.window.StorageService.exportFullState();
    assert.ok(exported.wordMastery["签证"].level === 3, "Exported state should preserve SM-2 mastery");
    console.log("   ✅ CurriculumMeta & SM-2 Spaced Repetition verified!");

    console.log("3️⃣ Testing Backend Server, SQLite Auth, Cloud Sync, Search & Security Guards...");
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hsk-academy-test-"));
    process.env.DB_PATH = path.join(tmpDir, "test_academy.db");
    process.env.TTS_CACHE_DIR = path.join(tmpDir, "tts_cache");

    const { startServer, store } = require(path.join(ROOT, "server/server.js"));
    const srv = await startServer(0, "127.0.0.1");
    const port = srv.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
        // Health check
        const healthRes = await fetch(`${baseUrl}/api/health`).then(r => r.json());
        assert.strictEqual(healthRes.ok, true);
        assert.strictEqual(healthRes.words, 930);

        // Static HTML + SEO check
        const htmlResp = await fetch(`${baseUrl}/`);
        assert.strictEqual(htmlResp.status, 200);
        const htmlText = await htmlResp.text();
        assert.ok(htmlText.includes("manifest.webmanifest"), "HTML should link PWA manifest");
        assert.ok(htmlText.includes("application/ld+json"), "HTML should include JSON-LD structured data");

        // Security traversal guard check
        const forbiddenServer = await fetch(`${baseUrl}/server/db.js`);
        assert.strictEqual(forbiddenServer.status, 403, "/server/db.js must be blocked (403)");

        // Register new user
        const regRes = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: "tester_e2e",
                displayName: "Học Viên E2E",
                password: "password123",
                initialState: exported
            })
        }).then(r => r.json());
        assert.strictEqual(regRes.ok, true);
        assert.ok(regRes.token.length >= 32);

        // Login user
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "tester_e2e", password: "password123" })
        }).then(r => r.json());
        assert.strictEqual(loginRes.ok, true);
        assert.strictEqual(loginRes.state.wordMastery["签证"].level, 3);

        // Push Cloud Sync with high XP
        const syncRes = await fetch(`${baseUrl}/api/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${loginRes.token}`
            },
            body: JSON.stringify({
                progress: { totalXp: 9999, streakDays: 30, bossesDefeated: 12 },
                wordMastery: exported.wordMastery
            })
        }).then(r => r.json());
        assert.strictEqual(syncRes.ok, true);

        // Verify #1 rank on Leaderboard
        const lbRes = await fetch(`${baseUrl}/api/leaderboard`).then(r => r.json());
        assert.strictEqual(lbRes.ok, true);
        assert.strictEqual(lbRes.leaderboard[0].displayName, "Học Viên E2E");
        assert.strictEqual(lbRes.leaderboard[0].xp, 9999);

        // Dictionary Search API
        const searchRes = await fetch(`${baseUrl}/api/vocab/search?q=qianzheng`).then(r => r.json());
        assert.strictEqual(searchRes.ok, true);
        assert.ok(searchRes.results.some(item => item.hanzi === "签证"));

        // Community Shared Decks API
        const pubRes = await fetch(`${baseUrl}/api/community-decks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${loginRes.token}`
            },
            body: JSON.stringify({
                title: "Tiếng Trung Công Nghệ AI",
                hskTag: "CNTT",
                words: [{ hanzi: "人工智能", pinyin: "réngōng zhìnéng", meaning: "Trí tuệ nhân tạo" }]
            })
        }).then(r => r.json());
        assert.strictEqual(pubRes.ok, true);

        const commDecks = await fetch(`${baseUrl}/api/community-decks`).then(r => r.json());
        assert.ok(commDecks.decks.some(d => d.title === "Tiếng Trung Công Nghệ AI"));

        console.log("   ✅ Backend Server, SQLite DB, Cloud Sync, Search & Security passed 100%!");
    } finally {
        srv.close();
        try {
            store.db.close();
        } catch {
            // ignore
        }
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    console.log("\n🎉 ALL PLATFORM E2E VERIFICATION CHECKS PASSED!");
}

main().catch(err => {
    console.error("❌ E2E TEST FAILED:", err);
    process.exit(1);
});
