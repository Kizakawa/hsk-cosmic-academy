/**
 * Core Space Typing Shooter Game Engine
 * Supports:
 * - 5 Game Modes: "auto" (Theo Màn), "pinyin" (Hanzi -> Pinyin), "meaning" (Hanzi+Pinyin -> Meaning),
 *                 "listening" (🎧 Nghe Âm Bắn Chữ), "mixed" (Kết hợp)
 * - Special Combat Entities & Power-ups:
 *     • 🛡️ Tàu Giáp Kép (2-Layer Armored Ship: Phase 1 Pinyin -> Phase 2 Meaning)
 *     • ❄️ Đạn Đóng Băng (Freeze Orb: slows falling words by 65% for 6s)
 *     • ⚡ Siêu Bão Từ EMP (EMP Orb: chain lightning destroys up to 2 other active words)
 *     • 💚 Tinh Thể Hồi Khiên (Shield Orb: +1 shield)
 *     • 🛸 Boss Bài Khóa (End-of-Lesson Mothership carrying the lesson's core conversational sentence)
 * - Ship & Laser Skins from StorageService
 */
window.GameEngine = (function () {
    const { Star, ShootingStar, Shockwave, drawShipHull, FallingWord, Projectile, Particle, FloatingMeaning } = window.GameEntities;

    const DIFFICULTY_PROFILES = {
        chill: {
            id: "chill",
            label: "🌱 Thư giãn",
            speedFactor: 0.72,
            maxSimultaneous: 2,
            spawnInterval: 2.7,
            shields: 7,
            forgiveTypos: true,
            infiniteShields: false
        },
        normal: {
            id: "normal",
            label: "⚖️ Tiêu chuẩn",
            speedFactor: 0.92,
            maxSimultaneous: 2,
            spawnInterval: 2.25,
            shields: 6,
            forgiveTypos: false,
            infiniteShields: false
        },
        challenge: {
            id: "challenge",
            label: "🔥 Phản xạ nhanh",
            speedFactor: 1.18,
            maxSimultaneous: 3,
            spawnInterval: 1.8,
            shields: 5,
            forgiveTypos: false,
            infiniteShields: false
        },
        zen: {
            id: "zen",
            label: "🧘 Thiền (Bất tử)",
            speedFactor: 0.68,
            maxSimultaneous: 2,
            spawnInterval: 2.8,
            shields: 7,
            forgiveTypos: true,
            infiniteShields: true
        }
    };

    const POWERUP_ROTATION = ["powerup_freeze", "powerup_emp", "powerup_shield"];

    let canvas = null;
    let ctx = null;
    let animationFrameId = null;
    let lastTimestamp = 0;
    let isCanvasSleeping = false;

    // Game State
    let state = "IDLE"; // "PLAYING", "PAUSED", "UNIT_COMPLETE", "GAME_OVER"
    let currentDeck = null;
    let currentUnit = null;
    let currentUnitIndex = 0;
    let spawnCounter = 0;
    let powerupCursor = 0;
    let bossSpawnedForUnit = false;
    let bossDefeatedForUnit = false;

    // Entities & Tactical Effects
    let stars = [];
    let shootingStars = [];
    let activeWords = [];
    let projectiles = [];
    let particles = [];
    let shockwaves = [];
    let floatingMeanings = [];
    let empArcs = [];
    let lockedWord = null;
    let freezeTimer = 0;
    let screenShake = 0;

    // Spawning & Wave Queue
    let wordQueue = [];
    let totalUnitWords = 0;
    let destroyedCount = 0;
    let spawnTimer = 0;

    // Turret & Player Metrics
    let turretAngle = -Math.PI / 2;
    let targetTurretAngle = -Math.PI / 2;
    let turretRecoil = 0;
    let shieldFlash = 0;
    let maxShields = 7;
    let shields = 7;

    // Session Stats
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;
    let unitStartTime = 0;
    let learnedWordsLog = [];
    let missedWordsMap = new Map();

    // UI Callback hooks
    let callbacks = {
        onHudUpdate: null,
        onUnitComplete: null,
        onGameOver: null,
        onTargetUpdate: null,
        onSpecialEvent: null
    };

    function getActiveProfile() {
        const settings = window.StorageService.getSettings();
        return DIFFICULTY_PROFILES[settings.difficulty] || DIFFICULTY_PROFILES.chill;
    }

    function getEffectiveModeForNextWord() {
        const settings = window.StorageService.getSettings();
        const modeSetting = settings.gameMode || "auto";
        if (modeSetting === "pinyin") return "pinyin";
        if (modeSetting === "meaning") return "meaning";
        if (modeSetting === "listening") return "listening";
        if (modeSetting === "mixed") {
            return spawnCounter % 2 === 0 ? "pinyin" : "meaning";
        }
        return (currentUnit && currentUnit.targetMode) ? currentUnit.targetMode : "pinyin";
    }

    function init(canvasElement, uiCallbacks = {}) {
        canvas = canvasElement;
        ctx = canvas.getContext("2d");
        callbacks = Object.assign(callbacks, uiCallbacks);

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                if (state === "PLAYING") pauseGame();
                setCanvasSleeping(true);
            } else {
                const shooterActive = !document.body.classList.contains("academy-mode-active");
                if (shooterActive) setCanvasSleeping(false);
            }
        });
        canvas.addEventListener("pointerdown", handleCanvasPointerDown);

        stars = [];
        for (let i = 0; i < 85; i++) {
            stars.push(new Star(canvas.width, canvas.height));
        }
        shootingStars = [
            new ShootingStar(canvas.width, canvas.height),
            new ShootingStar(canvas.width, canvas.height)
        ];

        lastTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function shuffleArray(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = copy[i];
            copy[i] = copy[j];
            copy[j] = temp;
        }
        return copy;
    }

    /**
     * Start a specific Deck & Unit
     */
    function startUnit(deck, unitIndex, customUnitOverride = null) {
        currentDeck = deck;
        currentUnitIndex = unitIndex;
        currentUnit = customUnitOverride || (deck.units[unitIndex] || deck.units[0]);

        activeWords = [];
        projectiles = [];
        particles = [];
        shockwaves = [];
        floatingMeanings = [];
        empArcs = [];
        lockedWord = null;
        spawnCounter = 0;
        freezeTimer = 0;
        screenShake = 0;
        bossSpawnedForUnit = false;
        bossDefeatedForUnit = false;

        const sourceWords = currentUnit.words || [];
        if (deck.id === "hsk4_full" && currentUnit.unitNumber === 27 && sourceWords.length > 8) {
            const videoOpening = sourceWords.slice(0, 8);
            const rest = window.StorageService.prioritizeUnitWordsForSrs
                ? window.StorageService.prioritizeUnitWordsForSrs(sourceWords.slice(8))
                : shuffleArray(sourceWords.slice(8));
            wordQueue = [...videoOpening, ...rest];
        } else {
            wordQueue = window.StorageService.prioritizeUnitWordsForSrs
                ? window.StorageService.prioritizeUnitWordsForSrs(sourceWords)
                : shuffleArray(sourceWords);
        }

        const profile = getActiveProfile();
        totalUnitWords = wordQueue.length + 1; // +1 for the End-of-Lesson Boss Mothership!
        destroyedCount = 0;
        spawnTimer = 0.25;
        maxShields = profile.shields;
        shields = maxShields;
        score = 0;
        combo = 0;
        maxCombo = 0;
        totalKeystrokes = 0;
        correctKeystrokes = 0;
        unitStartTime = performance.now();
        learnedWordsLog = [];
        missedWordsMap.clear();

        turretAngle = -Math.PI / 2;
        targetTurretAngle = -Math.PI / 2;

        state = "PLAYING";
        window.SoundEngine.preloadUnitAudio(wordQueue);
        notifyHud();
        notifyTarget();
    }

    function pauseGame() {
        if (state === "PLAYING") {
            state = "PAUSED";
            notifyHud();
        }
    }

    function resumeGame() {
        if (state === "PAUSED") {
            state = "PLAYING";
            lastTimestamp = performance.now();
            notifyHud();
        }
    }

    function togglePause() {
        if (state === "PLAYING") pauseGame();
        else if (state === "PAUSED") resumeGame();
    }

    function getTurretPosition() {
        const touchKb = document.getElementById("touch-keyboard");
        const kbVisible = Boolean(touchKb && touchKb.classList && !touchKb.classList.contains("hidden"));
        const kbOffset = kbVisible ? (touchKb.offsetHeight || 168) : 0;
        return {
            x: canvas.width / 2,
            y: Math.max(220, canvas.height - 86 - kbOffset)
        };
    }

    function handleCanvasPointerDown(e) {
        if (state !== "PLAYING" || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        let closest = null;
        let bestDist = 82;
        activeWords.forEach(w => {
            if (w.pendingDestruction) return;
            const d = Math.hypot(w.x - px, w.y - py);
            if (d < bestDist) {
                bestDist = d;
                closest = w;
            }
        });

        if (closest) {
            if (lockedWord && lockedWord !== closest) {
                lockedWord.isLocked = false;
                lockedWord.typedProgress = "";
            }
            lockedWord = closest;
            lockedWord.isLocked = true;
            window.SoundEngine.ensureContext();
            window.SoundEngine.speakChinese(closest.hanzi);
            notifyTarget();
        }
    }

    function pickEntityTypeForSpawn() {
        if (spawnCounter > 0 && spawnCounter % 4 === 0) {
            const type = POWERUP_ROTATION[powerupCursor % POWERUP_ROTATION.length];
            powerupCursor++;
            return type;
        }
        if (spawnCounter > 0 && spawnCounter % 5 === 0) {
            return "armored";
        }
        return "normal";
    }

    function spawnNextWord(forcedEntityType = null) {
        if (wordQueue.length === 0) {
            if (!bossSpawnedForUnit && activeWords.length === 0) {
                spawnBossWord();
            }
            return;
        }

        const wordMode = getEffectiveModeForNextWord();

        // Anti-Collision: Prevent spawning a word whose target Pinyin/Meaning or initial char collides with active words on screen
        if (activeWords.length > 0 && wordQueue.length > 1) {
            const activeInitials = new Set(
                activeWords
                    .filter(w => !w.pendingDestruction && w.activeTargetPinyin)
                    .map(w => w.activeTargetPinyin.charAt(0))
            );
            const activeTargets = new Set(
                activeWords
                    .filter(w => !w.pendingDestruction && w.activeTargetPinyin)
                    .map(w => w.activeTargetPinyin)
            );

            const nonCollidingIdx = wordQueue.findIndex(candidate => {
                const variants =
                    wordMode === "meaning"
                        ? window.VocabDatabase.getValidMeaningVariants(candidate)
                        : window.VocabDatabase.getValidPinyinVariants(candidate);
                const primary = variants[0] || "";
                return !activeTargets.has(primary) && !activeInitials.has(primary.charAt(0));
            });

            if (nonCollidingIdx > 0) {
                const chosen = wordQueue.splice(nonCollidingIdx, 1)[0];
                wordQueue.unshift(chosen);
            }
        }

        const wordData = wordQueue.shift();
        spawnCounter++;
        const entityType = forcedEntityType || pickEntityTypeForSpawn();

        const margin = Math.max(150, canvas.width * 0.16);
        const usableWidth = Math.max(200, canvas.width - margin * 2);
        let bestX = margin + Math.random() * usableWidth;

        for (let attempt = 0; attempt < 8; attempt++) {
            const candidateX = margin + Math.random() * usableWidth;
            const tooClose = activeWords.some(w => w.y < 230 && Math.abs(w.x - candidateX) < 160);
            if (!tooClose) {
                bestX = candidateX;
                break;
            }
        }

        const settings = window.StorageService.getSettings();
        const profile = getActiveProfile();
        const speedMult = (settings.speedMultiplier || 0.85) * profile.speedFactor;

        const entity = new FallingWord(wordData, bestX, 72, 25, wordMode, entityType);
        const targetLen = (entity.activeTargetPinyin || "").length;
        let baseSpeed = Math.max(18, 33 - targetLen * 0.85) * speedMult;
        if (entityType === "armored") {
            baseSpeed *= 0.82;
        }
        entity.speed = baseSpeed;

        activeWords.push(entity);

        if (entity.targetMode === "listening") {
            window.SoundEngine.speakChinese(entity.hanzi);
        }

        if (wordQueue.length > 0) {
            window.SoundEngine.preloadUnitAudio(wordQueue.slice(0, 4));
        }
    }

    /**
     * Spawn the End-of-Lesson Boss Mothership carrying the lesson's core sentence
     */
    function spawnBossWord() {
        if (bossSpawnedForUnit) return null;
        bossSpawnedForUnit = true;

        const bossData = window.VocabDatabase.getUnitBossWord
            ? window.VocabDatabase.getUnitBossWord(currentUnit)
            : {
                  hanzi: "学习汉语",
                  pinyin: "xuéxí Hànyǔ",
                  pinyinClean: "xuexihanyu",
                  meaning: "Học tiếng Hán",
                  meaningShort: "Học tiếng Hán",
                  isBoss: true
              };

        const settings = window.StorageService.getSettings();
        const profile = getActiveProfile();
        const speedMult = (settings.speedMultiplier || 0.85) * profile.speedFactor;

        const bossEntity = new FallingWord(bossData, canvas.width / 2, 92, 12 * speedMult, "pinyin", "boss");
        const bossTargetLen = (bossEntity.activeTargetPinyin || "").length;
        bossEntity.speed = Math.max(9.5, 14.5 - Math.max(0, bossTargetLen - 14) * 0.2) * speedMult;
        activeWords.push(bossEntity);

        window.SoundEngine.playBossSpawn();
        window.SoundEngine.speakChinese(bossEntity.hanzi);

        if (callbacks.onSpecialEvent) {
            callbacks.onSpecialEvent(`🛸 BOSS BÀI KHÓA XUẤT HIỆN: "${bossEntity.hanzi}" (${bossEntity.meaning})!`);
        }
        notifyHud();
        notifyTarget();
        return bossEntity;
    }

    /**
     * Refresh mode & speed of currently falling words when user changes mode/difficulty mid-game
     */
    function applyLiveSettingsChange() {
        const settings = window.StorageService.getSettings();
        const profile = getActiveProfile();
        maxShields = profile.shields;
        if (shields > maxShields) shields = maxShields;
        if (profile.infiniteShields) shields = maxShields;

        activeWords.forEach((w, idx) => {
            if (!w.isLocked && !w.pendingDestruction && w.entityType !== "boss" && w.entityType !== "armored") {
                let newMode = w.targetMode;
                if (settings.gameMode === "pinyin") newMode = "pinyin";
                else if (settings.gameMode === "meaning") newMode = "meaning";
                else if (settings.gameMode === "listening") newMode = "listening";
                else if (settings.gameMode === "mixed") newMode = idx % 2 === 0 ? "pinyin" : "meaning";
                else if (currentUnit && currentUnit.targetMode) newMode = currentUnit.targetMode;
                else newMode = "pinyin";

                if (newMode !== w.targetMode) {
                    w.targetMode = newMode;
                }
                w.refreshVariantsForMode();
                w.typedProgress = "";
            } else if (!w.pendingDestruction) {
                w.refreshVariantsForMode();
            }
            const targetLen = (w.activeTargetPinyin || "").length;
            const speedMult = (settings.speedMultiplier || 0.85) * profile.speedFactor;
            if (w.entityType === "boss") {
                w.speed = Math.max(9.5, 14.5 - Math.max(0, targetLen - 14) * 0.2) * speedMult;
            } else {
                w.speed = Math.max(18, 33 - targetLen * 0.85) * speedMult;
            }
        });

        notifyHud();
        notifyTarget();
    }

    /**
     * Handle keyboard letter/digit input a-z & 1-5 (with smart Unikey/Telex, Spacebar listen, and Tab target cycle/hint)
     */
    function handleKeyInput(rawKey, meta = {}) {
        if (state !== "PLAYING") return;

        window.SoundEngine.ensureContext();
        window.SoundEngine.startBGM();

        if (rawKey === "Escape") {
            unlockCurrentTarget();
            return;
        }

        if (rawKey === "Tab") {
            cycleTargetOrRevealHint();
            return;
        }

        if (rawKey === " ") {
            speakUrgentWordOnly();
            return;
        }

        const char = (rawKey || "").toLowerCase();
        const isAlpha = char.length === 1 && char >= "a" && char <= "z";
        const isToneDigit = char.length === 1 && char >= "1" && char <= "5";
        if (!isAlpha && !isToneDigit) return;

        // Build ordered list of candidate chars (supports Unikey/Telex multi-candidate resolution)
        const candidateChars = [char];
        if (Array.isArray(meta.candidateChars)) {
            meta.candidateChars.forEach(c => {
                if (c && !candidateChars.includes(c)) candidateChars.push(c);
            });
        }
        if (meta.altChar && !candidateChars.includes(meta.altChar)) {
            candidateChars.push(meta.altChar);
        }

        const profile = getActiveProfile();

        // 1. If we already have a locked word, test against it
        if (lockedWord && !lockedWord.pendingDestruction) {
            let matchedChar = null;
            for (let i = 0; i < candidateChars.length; i++) {
                if (lockedWord.matchesNextChar(candidateChars[i])) {
                    matchedChar = candidateChars[i];
                    break;
                }
            }

            if (matchedChar) {
                totalKeystrokes++;
                lockedWord.advanceChar(matchedChar);
                correctKeystrokes++;
                combo++;
                if (combo > maxCombo) maxCombo = combo;
                score += 10 + Math.min(30, combo * 2);

                const completedLayer = lockedWord.isCompleted();
                if (completedLayer && lockedWord.entityType === "armored" && lockedWord.armorPhase === 1) {
                    // Break Phase 1 Armor -> Transition immediately to Phase 2 (Meaning)!
                    aimAndFireAt(lockedWord, false);
                    lockedWord.breakArmorLayer();
                    window.SoundEngine.playArmorBreak();
                    window.SoundEngine.speakChinese(lockedWord.hanzi);
                    shockwaves.push(new Shockwave(lockedWord.x, lockedWord.y, "#facc15", 72));
                    screenShake = 0.25;
                    for (let i = 0; i < 18; i++) {
                        particles.push(new Particle(lockedWord.x, lockedWord.y, "#facc15", 0.9));
                    }
                    if (callbacks.onSpecialEvent) {
                        callbacks.onSpecialEvent(`🛡️ Đã phá giáp Pinyin! Hãy gõ Nghĩa (${lockedWord.meaningHint}) để tiêu diệt!`);
                    }
                } else {
                    aimAndFireAt(lockedWord, completedLayer);
                    window.SoundEngine.playLaserShot(lockedWord.typedProgress.length);
                    if (completedLayer) {
                        lockedWord.pendingDestruction = true;
                        lockedWord = null;
                    }
                }
                notifyHud();
                notifyTarget();
                return;
            }

            if (meta.isUnikeyAccent) {
                return;
            }

            // Native Telex modifier tolerance in Vietnamese meaning mode (when user types aa/ee/oo/dd or s/f/r/x/j/w)
            if (lockedWord.targetMode === "meaning" && lockedWord.typedProgress.length > 0) {
                const prevChar = lockedWord.typedProgress.slice(-1);
                const rawHintLower = (lockedWord.meaningHint || "").toLowerCase().replace(/\s+/g, "");
                const hasDiacritics = rawHintLower !== lockedWord.activeTargetPinyin;
                if (hasDiacritics) {
                    const isTelexDouble = char === prevChar && "aeod".includes(prevChar);
                    const isTelexToneOrHorn = "aeiouy".includes(prevChar) && "sfrxjw".includes(char);
                    if (isTelexDouble || isTelexToneOrHorn) {
                        return;
                    }
                }
            }

            // If 0 characters have been typed in the current phase (e.g. just broke Phase 1 armor or Tab-locked),
            // allow switching cleanly to another active word on screen that matches the pressed key
            let switchedToOtherWord = false;
            if (lockedWord.typedProgress.length === 0) {
                for (let i = 0; i < candidateChars.length; i++) {
                    const c = candidateChars[i];
                    const otherMatch = activeWords.some(
                        w => w !== lockedWord && !w.pendingDestruction && w.matchesNextChar(c)
                    );
                    if (otherMatch) {
                        lockedWord.isLocked = false;
                        lockedWord = null;
                        switchedToOtherWord = true;
                        break;
                    }
                }
            }

            if (!switchedToOtherWord) {
                totalKeystrokes++;
                if (profile.forgiveTypos) {
                    combo = Math.max(0, combo - 1);
                } else {
                    combo = 0;
                    recordWordStruggle(lockedWord);
                }
                lockedWord.triggerError();
                window.SoundEngine.playTypoError();
                notifyHud();
                return;
            }
        }

        // 2. No locked word -> find lowest active word whose target starts with any candidate char
        let candidates = [];
        let chosenChar = char;

        for (let i = 0; i < candidateChars.length; i++) {
            const c = candidateChars[i];
            const found = activeWords.filter(w => !w.pendingDestruction && w.matchesNextChar(c));
            if (found.length > 0) {
                candidates = found;
                chosenChar = c;
                break;
            }
        }

        if (candidates.length > 0) {
            totalKeystrokes++;
            candidates.sort((a, b) => b.y - a.y);
            const target = candidates[0];
            lockedWord = target;
            lockedWord.isLocked = true;
            if (lockedWord.targetMode === "listening") {
                window.SoundEngine.speakChinese(lockedWord.hanzi);
            }
            lockedWord.advanceChar(chosenChar);

            correctKeystrokes++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            score += 10 + Math.min(30, combo * 2);

            const completedLayer = lockedWord.isCompleted();
            if (completedLayer && lockedWord.entityType === "armored" && lockedWord.armorPhase === 1) {
                aimAndFireAt(lockedWord, false);
                lockedWord.breakArmorLayer();
                window.SoundEngine.playArmorBreak();
            } else {
                aimAndFireAt(lockedWord, completedLayer);
                window.SoundEngine.playLaserShot(1);
                if (completedLayer) {
                    lockedWord.pendingDestruction = true;
                    lockedWord = null;
                }
            }
            notifyHud();
            notifyTarget();
        } else {
            if (meta.isUnikeyAccent) return;
            totalKeystrokes++;
            if (!profile.forgiveTypos) {
                combo = 0;
            }
            window.SoundEngine.playTypoError();
            notifyHud();
        }
    }

    function unlockCurrentTarget() {
        if (lockedWord) {
            lockedWord.isLocked = false;
            lockedWord.typedProgress = "";
            lockedWord = null;
            notifyTarget();
        }
    }

    /**
     * Speak the locked or lowest active word WITHOUT penalizing SRS or adding to Weak Words (Spacebar)
     */
    function speakUrgentWordOnly() {
        let target = lockedWord;
        if (!target) {
            const available = activeWords.filter(w => !w.pendingDestruction);
            if (available.length === 0) return;
            available.sort((a, b) => b.y - a.y);
            target = available[0];
        }
        window.SoundEngine.speakChinese(target.hanzi);
    }

    /**
     * Reveal hint on current target or cycle target if multiple words are active (Tab / Peek button)
     */
    function cycleTargetOrRevealHint() {
        const available = activeWords.filter(w => !w.pendingDestruction);
        if (available.length === 0) return;
        available.sort((a, b) => b.y - a.y);

        if (lockedWord && available.length > 1 && lockedWord.revealHint) {
            // If current locked word already has hint revealed, Tab switches lock to the next word!
            const curIdx = available.indexOf(lockedWord);
            const nextWord = available[(curIdx + 1) % available.length];
            lockedWord.isLocked = false;
            lockedWord.typedProgress = "";
            lockedWord = nextWord;
            lockedWord.isLocked = true;
            lockedWord.revealHint = true;
            window.SoundEngine.speakChinese(lockedWord.hanzi);
            notifyTarget();
            return;
        }

        revealHintForUrgentWord();
    }

    function revealHintForUrgentWord() {
        let target = lockedWord;
        if (!target) {
            const available = activeWords.filter(w => !w.pendingDestruction);
            if (available.length === 0) return;
            available.sort((a, b) => b.y - a.y);
            target = available[0];
        }
        target.revealHint = true;
        window.SoundEngine.speakChinese(target.hanzi);
        notifyTarget();
    }

    function recordWordStruggle(wordEntity) {
        const item = {
            hanzi: wordEntity.hanzi,
            pinyin: wordEntity.pinyin,
            pinyinClean: window.VocabDatabase.normalizePinyin(wordEntity.pinyin),
            meaning: wordEntity.meaning,
            meaningShort: wordEntity.meaningHint
        };
        missedWordsMap.set(wordEntity.hanzi, item);
        window.StorageService.addWeakWord(item);
        if (window.StorageService.recordWordMastery) {
            window.StorageService.recordWordMastery(item, false);
        }
    }

    function aimAndFireAt(targetWord, isFinalShot) {
        const turret = getTurretPosition();
        const dx = targetWord.x - turret.x;
        const dy = targetWord.y - turret.y;
        targetTurretAngle = Math.atan2(dy, dx);
        turretRecoil = 1.0;

        const nozzleDist = 22;
        const startX = turret.x + Math.cos(targetTurretAngle) * nozzleDist;
        const startY = turret.y + Math.sin(targetTurretAngle) * nozzleDist;

        const skin = window.StorageService.getSelectedSkin ? window.StorageService.getSelectedSkin() : null;
        projectiles.push(new Projectile(startX, startY, targetWord, isFinalShot, skin));

        const burstColor = (skin && skin.laserColor) || "#6ee7b7";
        for (let i = 0; i < 4; i++) {
            particles.push(new Particle(startX, startY, burstColor, 0.45));
        }
    }

    function activatePowerupEffect(wordEntity) {
        const type = wordEntity.entityType;
        if (type === "powerup_freeze") {
            freezeTimer = 6.0;
            window.SoundEngine.playPowerupActivate("freeze");
            if (callbacks.onSpecialEvent) {
                callbacks.onSpecialEvent("❄️ ĐẠN ĐÓNG BĂNG KÍCH HOẠT: Toàn bộ từ rơi chậm lại 65% trong 6 giây!");
            }
        } else if (type === "powerup_shield") {
            shields = Math.min(maxShields, shields + 1);
            window.SoundEngine.playPowerupActivate("shield");
            if (callbacks.onSpecialEvent) {
                callbacks.onSpecialEvent("💚 TINH THỂ HỒI KHIÊN: Phục hồi +1 Lá chắn phòng thủ!");
            }
        } else if (type === "powerup_emp") {
            window.SoundEngine.playPowerupActivate("emp");
            triggerEmpChainLightning(wordEntity.x, wordEntity.y, 2);
        }
    }

    function triggerEmpChainLightning(originX, originY, maxTargets = 2) {
        const otherWords = activeWords.filter(
            w => !w.pendingDestruction && w.entityType !== "boss" && (w.x !== originX || w.y !== originY)
        );
        const victims = otherWords.slice(0, maxTargets);
        victims.forEach(victim => {
            empArcs.push({
                x1: originX,
                y1: originY,
                x2: victim.x,
                y2: victim.y,
                life: 0.45
            });
            destroyWord(victim, true);
        });
        if (callbacks.onSpecialEvent) {
            callbacks.onSpecialEvent(`⚡ SIÊU BÃO TỪ EMP: Phóng sét liên hoàn tiêu diệt ${victims.length} mục tiêu!`);
        }
    }

    function destroyWord(wordEntity, fromEmp = false) {
        const idx = activeWords.indexOf(wordEntity);
        if (idx !== -1) {
            activeWords.splice(idx, 1);
        }
        if (lockedWord === wordEntity) {
            lockedWord = null;
        }

        destroyedCount++;
        const isBoss = wordEntity.entityType === "boss";
        score += isBoss ? 250 : wordEntity.entityType === "armored" ? 110 : 50;
        if (isBoss) {
            bossDefeatedForUnit = true;
        }

        // Trigger Power-up Orb Effect if applicable
        if (!fromEmp && wordEntity.entityType && wordEntity.entityType.startsWith("powerup_")) {
            activatePowerupEffect(wordEntity);
        }

        // Record SRS Mastery & learned log
        const hadMistake = missedWordsMap.has(wordEntity.hanzi);
        if (window.StorageService.recordWordMastery) {
            window.StorageService.recordWordMastery(wordEntity, !hadMistake);
        }

        if (!learnedWordsLog.some(w => w.hanzi === wordEntity.hanzi)) {
            learnedWordsLog.push({
                hanzi: wordEntity.hanzi,
                pinyin: wordEntity.pinyin,
                meaning: wordEntity.meaning,
                hadMistake
            });
        }

        const palette = isBoss
            ? ["#facc15", "#f59e0b", "#ef4444", "#38bdf8", "#4ade80"]
            : ["#4ade80", "#34d399", "#6ee7b7", "#facc15", "#38bdf8"];
        const count = isBoss ? 68 : 34;
        for (let i = 0; i < count; i++) {
            const color = palette[i % palette.length];
            particles.push(new Particle(wordEntity.x, wordEntity.y, color, isBoss ? 1.65 : 1.15));
        }
        shockwaves.push(
            new Shockwave(
                wordEntity.x,
                wordEntity.y,
                isBoss ? "#f59e0b" : "#34d399",
                isBoss ? 135 : 64
            )
        );
        if (isBoss) {
            screenShake = 0.45;
        }

        floatingMeanings.push(
            new FloatingMeaning(
                wordEntity.x,
                wordEntity.y,
                wordEntity.meaning,
                wordEntity.pinyin,
                wordEntity.hanzi
            )
        );

        window.SoundEngine.playWordExplosion();
        window.SoundEngine.speakChinese(wordEntity.hanzi);

        if (activeWords.length === 0 && wordQueue.length > 0) {
            spawnTimer = Math.min(spawnTimer, 0.35);
        }

        notifyHud();
        notifyTarget();

        // Check if wave is ready for Boss Mothership or Unit Complete
        if (activeWords.length === 0 && wordQueue.length === 0) {
            if (!bossSpawnedForUnit) {
                setTimeout(() => {
                    if (state === "PLAYING" && activeWords.length === 0 && wordQueue.length === 0 && !bossSpawnedForUnit) {
                        spawnBossWord();
                    }
                }, 480);
            } else {
                setTimeout(() => {
                    if (state === "PLAYING" && activeWords.length === 0 && wordQueue.length === 0) {
                        completeCurrentUnit();
                    }
                }, 1050);
            }
        }
    }

    function completeCurrentUnit() {
        state = "UNIT_COMPLETE";
        const elapsedMin = Math.max(0.1, (performance.now() - unitStartTime) / 60000);
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
        const cpm = Math.round(correctKeystrokes / elapsedMin);
        const stars = accuracy >= 92 ? 3 : accuracy >= 78 ? 2 : 1;

        const stats = {
            deckName: currentDeck ? currentDeck.name : "Custom",
            unitTitle: currentUnit ? currentUnit.title : "",
            stageLabel: currentUnit ? currentUnit.stageLabel : "",
            score,
            accuracy,
            stars,
            bossDefeated: bossDefeatedForUnit,
            maxCombo,
            cpm,
            wordsDestroyed: destroyedCount,
            learnedWords: learnedWordsLog,
            missedWords: Array.from(missedWordsMap.values())
        };

        if (currentDeck && currentUnit) {
            window.StorageService.recordUnitCompletion(currentDeck.id, currentUnit.unitNumber, stats);
        }

        if (callbacks.onUnitComplete) {
            callbacks.onUnitComplete(stats);
        }
    }

    function setCanvasSleeping(shouldSleep) {
        isCanvasSleeping = Boolean(shouldSleep);
        if (isCanvasSleeping) {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else if (!animationFrameId) {
            lastTimestamp = performance.now();
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function gameLoop(timestamp) {
        if (isCanvasSleeping) {
            animationFrameId = null;
            return;
        }
        const rawDt = (timestamp - lastTimestamp) / 1000;
        const dt = Math.max(0, Math.min(0.1, Number.isFinite(rawDt) ? rawDt : 0));
        lastTimestamp = Math.max(lastTimestamp, timestamp);

        update(dt);
        render();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function update(rawDt) {
        const dt = Math.max(0, Number(rawDt) || 0);
        stars.forEach(s => s.update(dt, canvas.width, canvas.height));
        shootingStars.forEach(ss => ss.update(dt, canvas.width, canvas.height));

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update(dt);
            if (particles[i].life <= 0) particles.splice(i, 1);
        }

        for (let i = shockwaves.length - 1; i >= 0; i--) {
            shockwaves[i].update(dt);
            if (shockwaves[i].life <= 0) shockwaves.splice(i, 1);
        }

        for (let i = floatingMeanings.length - 1; i >= 0; i--) {
            floatingMeanings[i].update(dt);
            if (floatingMeanings[i].life <= 0) floatingMeanings.splice(i, 1);
        }

        for (let i = empArcs.length - 1; i >= 0; i--) {
            empArcs[i].life -= dt;
            if (empArcs[i].life <= 0) empArcs.splice(i, 1);
        }

        if (turretRecoil > 0) {
            turretRecoil = Math.max(0, turretRecoil - dt * 6);
        }
        if (shieldFlash > 0) {
            shieldFlash = Math.max(0, shieldFlash - dt * 2.5);
        }
        if (screenShake > 0) {
            screenShake = Math.max(0, screenShake - dt * 2.2);
        }
        if (freezeTimer > 0 && state === "PLAYING") {
            freezeTimer = Math.max(0, freezeTimer - dt);
        }

        const angleDiff = targetTurretAngle - turretAngle;
        turretAngle += angleDiff * Math.min(1, dt * 18);

        if (state !== "PLAYING") return;

        const profile = getActiveProfile();
        spawnTimer -= dt;
        if (wordQueue.length > 0 && (spawnTimer <= 0 || activeWords.length === 0)) {
            if (activeWords.length < profile.maxSimultaneous) {
                spawnNextWord();
                spawnTimer = profile.spawnInterval;
            }
        } else if (wordQueue.length === 0 && activeWords.length === 0 && !bossSpawnedForUnit) {
            spawnBossWord();
        }

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update(dt);
            if (p.completed) {
                for (let k = 0; k < 4; k++) {
                    particles.push(new Particle(p.x, p.y, p.laserColor || "#4ade80", 0.4));
                }
                if (p.isFinalShot && p.targetWord) {
                    destroyWord(p.targetWord);
                }
                projectiles.splice(i, 1);
            }
        }

        const turret = getTurretPosition();
        const defenseLineY = turret.y - 12;
        const speedScale = freezeTimer > 0 ? 0.35 : 1.0;

        for (let i = activeWords.length - 1; i >= 0; i--) {
            const word = activeWords[i];
            if (word.pendingDestruction) {
                word.y += word.speed * 0.15 * dt;
                continue;
            }

            word.update(dt, speedScale);

            if (word === lockedWord) {
                targetTurretAngle = Math.atan2(word.y - turret.y, word.x - turret.x);
            }

            if (word.y >= defenseLineY) {
                handleDefenseBreach(word, i);
            }
        }
    }

    function handleDefenseBreach(word, index) {
        if (lockedWord === word) {
            lockedWord = null;
        }
        activeWords.splice(index, 1);

        const profile = getActiveProfile();
        if (!profile.infiniteShields) {
            shields = Math.max(0, shields - 1);
            shieldFlash = 1.0;
            window.SoundEngine.playShieldDamage();
        }
        combo = 0;
        window.SoundEngine.speakChinese(word.hanzi);

        const hintLabel = word.targetMode === "meaning"
            ? `💡 ${word.meaningHint} (${word.activeTargetPinyin})`
            : `💡 ${word.meaning}`;

        floatingMeanings.push(
            new FloatingMeaning(
                word.x,
                word.y - 30,
                hintLabel,
                word.pinyin,
                word.hanzi
            )
        );

        recordWordStruggle(word);
        if (word.entityType === "boss") {
            bossSpawnedForUnit = false; // Respawn Boss so learner can conquer it
        } else {
            wordQueue.push({
                hanzi: word.hanzi,
                pinyin: word.pinyin,
                pinyinClean: window.VocabDatabase.normalizePinyin(word.pinyin),
                meaning: word.meaning,
                meaningShort: word.meaningHint
            });
        }

        for (let i = 0; i < 16; i++) {
            particles.push(new Particle(word.x, word.y, profile.infiniteShields ? "#38bdf8" : "#f87171", 0.8));
        }

        notifyHud();
        notifyTarget();

        if (!profile.infiniteShields && shields <= 0) {
            state = "GAME_OVER";
            if (callbacks.onGameOver) {
                callbacks.onGameOver({
                    deckName: currentDeck ? currentDeck.name : "",
                    unitTitle: currentUnit ? currentUnit.title : "",
                    score,
                    wordsDestroyed: destroyedCount,
                    totalUnitWords,
                    missedWords: Array.from(missedWordsMap.values())
                });
            }
        }
    }

    function render() {
        if (!ctx || !canvas) return;

        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, "#050716");
        bgGrad.addColorStop(0.55, "#0a0e29");
        bgGrad.addColorStop(0.88, "#131b4c");
        bgGrad.addColorStop(1, "#090d24");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (shieldFlash > 0) {
            ctx.fillStyle = `rgba(239, 68, 68, ${shieldFlash * 0.16})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (freezeTimer > 0) {
            ctx.save();
            ctx.fillStyle = "rgba(56, 189, 248, 0.07)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(125, 211, 252, 0.42)";
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
            ctx.restore();
        }

        stars.forEach(s => s.draw(ctx));
        shootingStars.forEach(ss => ss.draw(ctx));

        ctx.save();
        if (screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * 9 * screenShake;
            const shakeY = (Math.random() - 0.5) * 9 * screenShake;
            ctx.translate(shakeX, shakeY);
        }

        const turret = getTurretPosition();
        const skin = window.StorageService.getSelectedSkin ? window.StorageService.getSelectedSkin() : null;
        const horizonGlow = ctx.createRadialGradient(
            turret.x,
            turret.y + 10,
            10,
            turret.x,
            turret.y + 10,
            Math.max(20, Math.min(520, canvas.width * 0.55))
        );
        horizonGlow.addColorStop(0, "rgba(56, 189, 248, 0.25)");
        horizonGlow.addColorStop(0.45, "rgba(59, 130, 246, 0.10)");
        horizonGlow.addColorStop(1, "rgba(15, 23, 42, 0)");
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, turret.y - 180, canvas.width, 260);

        const lineGrad = ctx.createLinearGradient(0, turret.y, canvas.width, turret.y);
        lineGrad.addColorStop(0, "rgba(59, 130, 246, 0)");
        lineGrad.addColorStop(0.25, "rgba(96, 165, 250, 0.35)");
        lineGrad.addColorStop(0.5, "rgba(147, 197, 253, 0.75)");
        lineGrad.addColorStop(0.75, "rgba(96, 165, 250, 0.35)");
        lineGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, turret.y);
        ctx.lineTo(canvas.width, turret.y);
        ctx.stroke();

        // Render EMP Chain Lightning Arcs
        empArcs.forEach(arc => {
            ctx.save();
            ctx.strokeStyle = `rgba(192, 132, 252, ${Math.min(1, arc.life * 2.2)})`;
            ctx.shadowColor = "#c084fc";
            ctx.shadowBlur = 16;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(arc.x1, arc.y1);
            const midX = (arc.x1 + arc.x2) / 2 + (Math.random() - 0.5) * 28;
            const midY = (arc.y1 + arc.y2) / 2 + (Math.random() - 0.5) * 28;
            ctx.lineTo(midX, midY);
            ctx.lineTo(arc.x2, arc.y2);
            ctx.stroke();
            ctx.restore();
        });

        if (lockedWord && state === "PLAYING") {
            ctx.save();
            ctx.strokeStyle = (skin && skin.laserColor) || "rgba(74, 222, 128, 0.25)";
            ctx.globalAlpha = 0.26;
            ctx.setLineDash([5, 6]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(turret.x, turret.y);
            ctx.lineTo(lockedWord.x, lockedWord.y + 10);
            ctx.stroke();
            ctx.restore();
        }

        drawTurret(turret.x, turret.y, skin);
        projectiles.forEach(p => p.draw(ctx));

        const settings = window.StorageService.getSettings();
        activeWords.forEach(w =>
            w.draw(ctx, settings.hintMode, settings.difficulty || "chill", canvas.height, freezeTimer > 0)
        );

        shockwaves.forEach(sw => sw.draw(ctx));
        particles.forEach(p => p.draw(ctx));
        floatingMeanings.forEach(fm => fm.draw(ctx, canvas.width));
        ctx.restore();
    }

    function drawTurret(x, y, skin = null) {
        const skinId = (skin && skin.id) || "cyan_nebula";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(turretAngle + Math.PI / 2);
        if (drawShipHull) {
            drawShipHull(ctx, skinId, {
                time: performance.now() * 0.001,
                recoil: turretRecoil,
                scale: 1.08,
                comboHot: combo >= 10
            });
        }
        ctx.restore();
    }

    function notifyHud() {
        if (!callbacks.onHudUpdate) return;
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
        const profile = getActiveProfile();
        const effectiveMode = getEffectiveModeForNextWord();
        callbacks.onHudUpdate({
            state,
            deckName: currentDeck ? currentDeck.name : "HSK Vocabulary",
            stageLabel: currentUnit ? currentUnit.stageLabel : "Màn 1 • Bài 1",
            unitTitle: currentUnit ? currentUnit.title : "",
            unitTargetMode: currentUnit ? (currentUnit.targetMode || "pinyin") : "pinyin",
            effectiveMode,
            destroyedCount,
            totalUnitWords,
            remainingCount: wordQueue.length + activeWords.length,
            score,
            combo,
            accuracy,
            shields,
            maxShields,
            infiniteShields: profile.infiniteShields,
            freezeTimer: Number(freezeTimer.toFixed(1)),
            bossActive: activeWords.some(w => w.entityType === "boss")
        });
    }

    function notifyTarget() {
        if (!callbacks.onTargetUpdate) return;
        if (lockedWord) {
            callbacks.onTargetUpdate({
                hanzi: lockedWord.hanzi,
                pinyin: lockedWord.pinyin,
                targetMode: lockedWord.targetMode,
                entityType: lockedWord.entityType,
                armorPhase: lockedWord.armorPhase,
                typedProgress: lockedWord.typedProgress,
                targetPinyin: lockedWord.activeTargetPinyin,
                meaning: lockedWord.meaning,
                meaningHint: lockedWord.meaningHint,
                revealHint: lockedWord.revealHint
            });
        } else {
            callbacks.onTargetUpdate(null);
        }
    }

    function restoreShieldsAndContinue() {
        if (state === "GAME_OVER") {
            shields = maxShields;
            state = "PLAYING";
            lastTimestamp = performance.now();
            notifyHud();
        }
    }

    function getState() {
        return state;
    }

    function getCurrentUnitData() {
        return {
            deck: currentDeck,
            unit: currentUnit,
            unitIndex: currentUnitIndex
        };
    }

    function getDebugState() {
        const skin = window.StorageService.getSelectedSkin ? window.StorageService.getSelectedSkin() : null;
        return {
            state,
            deckId: currentDeck ? currentDeck.id : null,
            unitNumber: currentUnit ? currentUnit.unitNumber : null,
            effectiveMode: getEffectiveModeForNextWord(),
            difficulty: getActiveProfile().id,
            activeSkinId: skin ? skin.id : "cyan_nebula",
            freezeTimer: Number(freezeTimer.toFixed(2)),
            bossSpawnedForUnit,
            bossDefeatedForUnit,
            score,
            combo,
            maxCombo,
            accuracy: totalKeystrokes === 0 ? 100 : Math.round((correctKeystrokes / totalKeystrokes) * 100),
            shields,
            maxShields,
            destroyedCount,
            totalUnitWords,
            queueRemaining: wordQueue.length,
            activeWords: activeWords.map(w => ({
                hanzi: w.hanzi,
                pinyin: w.pinyin,
                meaning: w.meaning,
                entityType: w.entityType,
                armorPhase: w.armorPhase,
                targetMode: w.targetMode,
                activeTargetPinyin: w.activeTargetPinyin,
                typedProgress: w.typedProgress,
                nextChar: w.activeTargetPinyin.slice(w.typedProgress.length, w.typedProgress.length + 1),
                x: Math.round(w.x),
                y: Math.round(w.y),
                isLocked: w.isLocked,
                pendingDestruction: Boolean(w.pendingDestruction)
            })),
            lockedWord: lockedWord
                ? {
                      hanzi: lockedWord.hanzi,
                      entityType: lockedWord.entityType,
                      armorPhase: lockedWord.armorPhase,
                      targetMode: lockedWord.targetMode,
                      activeTargetPinyin: lockedWord.activeTargetPinyin,
                      typedProgress: lockedWord.typedProgress,
                      nextChar: lockedWord.activeTargetPinyin.slice(
                          lockedWord.typedProgress.length,
                          lockedWord.typedProgress.length + 1
                      )
                  }
                : null
        };
    }

    function forceSpawnIfEmpty() {
        if (state === "PLAYING" && activeWords.length === 0) {
            if (wordQueue.length > 0) {
                spawnNextWord();
                spawnTimer = getActiveProfile().spawnInterval;
            } else if (!bossSpawnedForUnit) {
                spawnBossWord();
            }
        }
    }

    /**
     * Fast-forward physics & spawning loop synchronously (Time-Warp for instant MCP QA testing)
     */
    function stepSimulation(frames = 30, dt = 0.05) {
        for (let i = 0; i < frames; i++) {
            update(dt);
        }
        render();
        return getDebugState();
    }

    /**
     * Synchronously spawn, type Pinyin, fire projectiles, and destroy N words (including multi-phase Boss) in <15ms
     */
    function turboShootWords(count = 5) {
        if (state !== "PLAYING") return getDebugState();
        let shot = 0;
        while (shot < count && state === "PLAYING") {
            if (activeWords.length === 0) {
                forceSpawnIfEmpty();
            }
            const candidates = activeWords.filter(w => !w.pendingDestruction);
            if (candidates.length === 0) break;
            candidates.sort((a, b) => b.y - a.y);
            const target = lockedWord || candidates[0];

            // Handle multi-phase boss or normal word
            let safety = 0;
            while (activeWords.includes(target) && !target.pendingDestruction && safety < 6) {
                const remaining = target.activeTargetPinyin.slice(target.typedProgress.length);
                for (let c = 0; c < remaining.length; c++) {
                    handleKeyInput(remaining[c]);
                }
                for (let step = 0; step < 30 && projectiles.length > 0; step++) {
                    update(0.04);
                }
                safety++;
            }
            shot++;
        }
        render();
        if (state === "PLAYING" && activeWords.length === 0 && wordQueue.length === 0 && bossDefeatedForUnit) {
            completeCurrentUnit();
        }
        return getDebugState();
    }

    return {
        DIFFICULTY_PROFILES,
        init,
        startUnit,
        pauseGame,
        resumeGame,
        togglePause,
        handleKeyInput,
        speakUrgentWordOnly,
        cycleTargetOrRevealHint,
        revealHintForUrgentWord,
        restoreShieldsAndContinue,
        applyLiveSettingsChange,
        getState,
        getCurrentUnitData,
        getDebugState,
        forceSpawnIfEmpty,
        spawnBossWord,
        spawnNextWord,
        stepSimulation,
        turboShootWords,
        setCanvasSleeping
    };
})();
