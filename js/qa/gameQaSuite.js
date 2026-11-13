/**
 * High-Speed Automated Game QA & Playtesting Suite (BrowserMCP & Chrome DevTools MCP Turbo Engine)
 * Eliminates multi-roundtrip MCP latency by executing batch actions & time-warped simulation in <20ms:
 * - Alt + B : Toggle AI Auto-Play Bot (smooth visual speed, 60ms/key)
 * - Alt + T : Turbo Clear (instantly shoots 5 words or completes the unit in <20ms)
 * - Alt + Q : Run instant 6-point Diagnostic Audit (Vocab DB, Pinyin variants, DOM HUD, Canvas, Storage, Engine)
 */
window.GameQA = (function () {
    let botTimer = null;
    let isBotActive = false;

    const REQUIRED_DOM_IDS = [
        "game-canvas",
        "hud-stage-label",
        "hud-word-progress",
        "hud-score",
        "hud-combo",
        "hud-accuracy",
        "hud-shields",
        "locked-target-hud",
        "btn-open-units",
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
        "modal-custom-vocab",
        "modal-unit-complete",
        "modal-game-over"
    ];

    /**
     * Audit all HSK Decks & Units in VocabDatabase
     */
    function auditVocabularyDatabase() {
        const decks = (window.VocabDatabase && window.VocabDatabase.DECKS) || [];
        let totalUnits = 0;
        let totalWords = 0;
        const issues = [];

        decks.forEach(deck => {
            if (!deck.id || !Array.isArray(deck.units)) {
                issues.push(`Invalid deck structure: ${JSON.stringify(deck.id)}`);
                return;
            }
            deck.units.forEach(unit => {
                totalUnits++;
                if (!Array.isArray(unit.words) || unit.words.length === 0) {
                    issues.push(`Empty unit in deck ${deck.id}: unit ${unit.unitNumber}`);
                    return;
                }
                const seenMeanings = new Map();
                unit.words.forEach((w, idx) => {
                    totalWords++;
                    const variants = window.VocabDatabase.getValidPinyinVariants(w);
                    const primary = variants[0] || "";
                    if (!w.hanzi || !w.pinyin || !w.meaning) {
                        issues.push(`Missing field in ${deck.id} u${unit.unitNumber} word #${idx}`);
                    }
                    if (!/^[a-z]+$/.test(primary)) {
                        issues.push(`Non-ASCII pinyin target '${primary}' for ${w.hanzi} (${deck.id} u${unit.unitNumber})`);
                    }
                    const mNorm = window.VocabDatabase.normalizeVietnamese(w.meaningShort || w.meaning);
                    const mVariants = window.VocabDatabase.getValidMeaningVariants(w);
                    if (mVariants.length !== 1 || mVariants[0] !== mNorm) {
                        issues.push(`Meaning variant mismatch for ${w.hanzi}: expected ['${mNorm}'], got ${JSON.stringify(mVariants)}`);
                    }
                    if (seenMeanings.has(mNorm) && seenMeanings.get(mNorm) !== w.hanzi) {
                        issues.push(`Duplicate meaningShort '${w.meaningShort || w.meaning}' in ${deck.id} u${unit.unitNumber}: ${seenMeanings.get(mNorm)} vs ${w.hanzi}`);
                    }
                    seenMeanings.set(mNorm, w.hanzi);
                });
            });
        });

        const umlautTest = window.VocabDatabase.getValidPinyinVariants({
            hanzi: "旅游",
            pinyin: "lǚyóu",
            pinyinClean: "lvyou"
        });
        const umlautOk = umlautTest.includes("lvyou") && umlautTest.includes("luyou");
        if (!umlautOk) {
            issues.push("Umlaut (ü -> v/u) variant generation failed for 旅游");
        }

        return {
            ok: issues.length === 0,
            deckCount: decks.length,
            unitCount: totalUnits,
            wordCount: totalWords,
            umlautVariantsOk: umlautOk,
            issues
        };
    }

    /**
     * Verify all required DOM & Canvas elements exist and have valid dimensions
     */
    function auditDomAndCanvas() {
        const missingIds = REQUIRED_DOM_IDS.filter(id => !document.getElementById(id));
        const canvas = document.getElementById("game-canvas");
        const canvasOk = Boolean(canvas && canvas.width > 200 && canvas.height > 200);
        return {
            ok: missingIds.length === 0 && canvasOk,
            canvasWidth: canvas ? canvas.width : 0,
            canvasHeight: canvas ? canvas.height : 0,
            missingIds
        };
    }

    /**
     * Run complete diagnostic audit (returns structured JSON in <5ms for BrowserMCP / Chrome DevTools MCP)
     */
    function runFullAudit() {
        const t0 = performance.now();
        const vocab = auditVocabularyDatabase();
        const dom = auditDomAndCanvas();
        const engine =
            window.GameEngine && window.GameEngine.getDebugState
                ? window.GameEngine.getDebugState()
                : { state: "UNKNOWN" };
        const settings = window.StorageService ? window.StorageService.getSettings() : null;

        const allOk = vocab.ok && dom.ok && Boolean(settings) && engine.state !== "UNKNOWN";
        const elapsedMs = Math.round((performance.now() - t0) * 100) / 100;
        const report = {
            ok: allOk,
            elapsedMs,
            vocab,
            dom,
            settings,
            engine
        };

        showQaBanner(
            allOk
                ? `✅ QA Audit PASS (${elapsedMs}ms): ${vocab.deckCount} bộ HSK (${vocab.wordCount} từ), Canvas ${dom.canvasWidth}x${dom.canvasHeight}`
                : `⚠️ QA Audit phát hiện lỗi: ${vocab.issues.concat(dom.missingIds).join(", ")}`
        );
        return report;
    }

    /**
     * Type the next required Pinyin character for the locked or lowest active word
     */
    function stepBotOnce() {
        if (!window.GameEngine || !window.GameEngine.getDebugState) {
            return { ok: false, reason: "GameEngine debug API unavailable" };
        }
        const dbg = window.GameEngine.getDebugState();
        if (dbg.state !== "PLAYING") {
            if (isBotActive) stopAutoBot();
            return { ok: false, reason: `Game state is ${dbg.state}` };
        }

        if (dbg.activeWords.length === 0 && dbg.queueRemaining > 0) {
            window.GameEngine.forceSpawnIfEmpty();
        }

        const fresh = window.GameEngine.getDebugState();
        let target = fresh.lockedWord;
        if (!target) {
            const candidates = fresh.activeWords.filter(w => !w.pendingDestruction && w.nextChar);
            if (candidates.length === 0) {
                return { ok: true, action: "waiting_for_spawn" };
            }
            candidates.sort((a, b) => b.y - a.y);
            target = candidates[0];
        }

        if (target && target.nextChar) {
            window.GameEngine.handleKeyInput(target.nextChar);
            return {
                ok: true,
                action: "typed_char",
                hanzi: target.hanzi,
                char: target.nextChar,
                progressAfter: target.typedProgress + target.nextChar,
                targetPinyin: target.activeTargetPinyin
            };
        }
        return { ok: true, action: "idle" };
    }

    /**
     * Turbo-shoot N words synchronously in <15ms (Zero waiting for timers/projectiles!)
     */
    function turboClearWords(count = 5) {
        const t0 = performance.now();
        if (!window.GameEngine || !window.GameEngine.turboShootWords) {
            return { ok: false, reason: "turboShootWords API unavailable" };
        }
        const stateAfter = window.GameEngine.turboShootWords(count);
        const elapsedMs = Math.round((performance.now() - t0) * 100) / 100;
        showQaBanner(`⚡ Turbo bắn hạ ${count} từ trong ${elapsedMs}ms! (${stateAfter.destroyedCount}/${stateAfter.totalUnitWords})`);
        return {
            ok: true,
            elapsedMs,
            stateAfter
        };
    }

    /**
     * Complete the entire remaining Unit in <25ms to immediately test Unit Complete summary modal
     */
    function turboCompleteUnit() {
        return turboClearWords(200);
    }

    /**
     * Execute a full sequence of QA commands in ONE single MCP roundtrip (<30ms total)
     * Example: window.GameQA.runMacro([{ cmd: "audit" }, { cmd: "turboShoot", count: 5 }, { cmd: "peek" }])
     */
    function runMacro(steps = []) {
        const t0 = performance.now();
        const results = [];
        for (const step of steps) {
            const cmd = typeof step === "string" ? step : step.cmd;
            if (cmd === "audit") {
                results.push({ cmd, res: runFullAudit() });
            } else if (cmd === "turboShoot") {
                results.push({ cmd, res: turboClearWords(step.count || 3) });
            } else if (cmd === "turboCompleteUnit") {
                results.push({ cmd, res: turboCompleteUnit() });
            } else if (cmd === "peek") {
                window.GameEngine.revealHintForUrgentWord();
                results.push({ cmd, res: window.GameEngine.getDebugState() });
            } else if (cmd === "stepSim") {
                results.push({ cmd, res: window.GameEngine.stepSimulation(step.frames || 30, step.dt || 0.05) });
            } else if (cmd === "click") {
                const el = document.querySelector(step.selector);
                if (el) el.click();
                results.push({ cmd, selector: step.selector, clicked: Boolean(el) });
            }
        }
        return {
            ok: true,
            totalElapsedMs: Math.round((performance.now() - t0) * 100) / 100,
            results,
            finalState: window.GameEngine.getDebugState()
        };
    }

    /**
     * Shoot and destroy one complete falling word with visual animation
     */
    function shootCurrentWord(stepDelayMs = 20) {
        if (stepDelayMs <= 0) {
            return Promise.resolve(turboClearWords(1));
        }
        return new Promise(resolve => {
            if (!window.GameEngine || !window.GameEngine.getDebugState) {
                resolve({ ok: false, reason: "GameEngine unavailable" });
                return;
            }
            window.GameEngine.forceSpawnIfEmpty();
            const initial = window.GameEngine.getDebugState();
            const candidates = initial.activeWords.filter(w => !w.pendingDestruction);
            if (candidates.length === 0) {
                resolve({ ok: false, reason: "No active words to shoot" });
                return;
            }
            candidates.sort((a, b) => b.y - a.y);
            const chosen = initial.lockedWord || candidates[0];
            const remainingChars = chosen.activeTargetPinyin.slice(chosen.typedProgress.length).split("");

            let idx = 0;
            const timer = setInterval(() => {
                if (idx >= remainingChars.length) {
                    clearInterval(timer);
                    resolve({
                        ok: true,
                        destroyedHanzi: chosen.hanzi,
                        typedPinyin: chosen.activeTargetPinyin,
                        stateAfter: window.GameEngine.getDebugState()
                    });
                    return;
                }
                window.GameEngine.handleKeyInput(remainingChars[idx]);
                idx++;
            }, stepDelayMs);
        });
    }

    function startAutoBot(intervalMs = 55) {
        if (isBotActive) return { ok: true, status: "already_running" };
        isBotActive = true;
        showQaBanner("🤖 Đã BẬT Auto-Play Bot tốc độ cao (Nhấn Alt+B để tắt, Alt+T để bắn tức thì)");
        botTimer = setInterval(() => {
            stepBotOnce();
        }, intervalMs);
        return { ok: true, status: "started", intervalMs };
    }

    function stopAutoBot() {
        isBotActive = false;
        if (botTimer) {
            clearInterval(botTimer);
            botTimer = null;
        }
        showQaBanner("⏹️ Đã TẮT Auto-Play Bot");
        return { ok: true, status: "stopped" };
    }

    function toggleAutoBot(intervalMs = 55) {
        return isBotActive ? stopAutoBot() : startAutoBot(intervalMs);
    }

    function showQaBanner(msg) {
        const toast = document.getElementById("game-toast");
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.remove("hidden");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.add("hidden");
        }, 3200);
    }

    function isQaHotkeysEnabled() {
        const host = (window.location && window.location.hostname) || "";
        const proto = (window.location && window.location.protocol) || "";
        const search = (window.location && window.location.search) || "";
        return (
            host === "localhost" ||
            host === "127.0.0.1" ||
            proto === "file:" ||
            search.includes("qa=1")
        );
    }

    // Bind developer & QA hotkeys: Alt+B (AutoBot), Alt+T (Turbo 5 words), Alt+Q (Audit Report)
    window.addEventListener("keydown", e => {
        if (!e.altKey || !isQaHotkeysEnabled()) return;
        const lower = (e.key || "").toLowerCase();
        if (lower === "b") {
            e.preventDefault();
            toggleAutoBot(55);
        } else if (lower === "t") {
            e.preventDefault();
            turboClearWords(5);
        } else if (lower === "q") {
            e.preventDefault();
            const res = runFullAudit();
            console.info("[GameQA Audit Report]", res);
        }
    });

    return {
        runFullAudit,
        auditVocabularyDatabase,
        auditDomAndCanvas,
        stepBotOnce,
        shootCurrentWord,
        turboClearWords,
        turboCompleteUnit,
        runMacro,
        startAutoBot,
        stopAutoBot,
        toggleAutoBot
    };
})();
