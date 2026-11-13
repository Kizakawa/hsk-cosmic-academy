/**
 * Storage & SM-2 Spaced Repetition Service
 * Manages persistent state in localStorage with Cloud Sync & JSON Backup hooks:
 * - Selected Deck, Unit, Active View ("hub" | "lesson" | "practice" | "dictionary" | "shooter"), Game Mode, Difficulty & Skin
 * - Anki-grade SM-2 Spaced Repetition (easeFactor, intervalHours, repetitions, nextReviewAt, 0-3+ Stars)
 * - 7-Day Study Activity Analytics, Daily Quests, XP, Streak & Pilot Level
 * - Full Cloud State Hydration & Portable JSON Export / Import
 */
window.StorageService = (function () {
    const KEYS = {
        SETTINGS: "hsk_shooter_settings_v2",
        PROGRESS: "hsk_shooter_progress_v1",
        CUSTOM_UNITS: "hsk_shooter_custom_units_v1",
        WEAK_WORDS: "hsk_shooter_weak_words_v1",
        WORD_MASTERY: "hsk_shooter_word_mastery_v1",
        AUTH_SESSION: "hsk_academy_auth_v1"
    };

    const SHIP_SKINS = [
        {
            id: "cyan_nebula",
            name: "Phi Thuyền Tinh Vân",
            badge: "Mặc định",
            desc: "Tia Plasma Lục Bảo & Vỏ Titan Xanh Vũ Trụ",
            shipColor: "#38bdf8",
            coreColor: "#e0f2fe",
            laserColor: "#34d399",
            trailRgba: "110, 231, 183"
        },
        {
            id: "gold_phoenix",
            name: "Chiến Cơ Hoàng Kim",
            badge: "Hoàng Gia",
            desc: "Tia Laser Vàng Rực & Giáp Phượng Hoàng Lửa",
            shipColor: "#facc15",
            coreColor: "#fef9c3",
            laserColor: "#fbbf24",
            trailRgba: "251, 191, 36"
        },
        {
            id: "emerald_jade",
            name: "Phi Đội Ngọc Bích",
            badge: "Thượng Thượng",
            desc: "Năng Lượng Ngọc Bích Phương Đông Thanh Khiết",
            shipColor: "#10b981",
            coreColor: "#d1fae5",
            laserColor: "#4ade80",
            trailRgba: "74, 222, 128"
        },
        {
            id: "crimson_nova",
            name: "Tàu Siêu Tân Tinh",
            badge: "Huyền Thoại",
            desc: "Tia Tử Quang Tím & Lõi Năng Lượng Siêu Tân Tinh",
            shipColor: "#f43f5e",
            coreColor: "#ffe4e6",
            laserColor: "#c084fc",
            trailRgba: "192, 132, 252"
        }
    ];

    const DEFAULT_SETTINGS = {
        sfxEnabled: true,
        bgmEnabled: true,
        ttsEnabled: true,
        ttsRate: 0.95,
        toneMode: false,
        touchKeyboard: "auto",
        hintMode: "video",
        difficulty: "chill",
        gameMode: "auto",
        speedMultiplier: 0.85,
        selectedDeckId: "hsk1_full",
        selectedUnitIndex: 0,
        selectedSkinId: "cyan_nebula",
        onboardingCompleted: false,
        placementBadge: ""
    };

    let syncSubscriber = null;
    let syncDebounceTimer = null;

    function setSyncSubscriber(fn) {
        syncSubscriber = typeof fn === "function" ? fn : null;
    }

    function scheduleCloudSync() {
        if (!syncSubscriber) return;
        clearTimeout(syncDebounceTimer);
        syncDebounceTimer = setTimeout(() => {
            try {
                syncSubscriber(exportFullState());
            } catch {
                // Ignore background sync failures
            }
        }, 1200);
    }

    function safeGet(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function safeSet(key, value, triggerSync = true) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            if (triggerSync) scheduleCloudSync();
        } catch {
            // Ignore quota errors
        }
    }

    function getTodayDateString(offsetDays = 0) {
        const now = new Date(Date.now() + offsetDays * 86400000);
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function getSettings() {
        const saved = safeGet(KEYS.SETTINGS, {});
        return Object.assign({}, DEFAULT_SETTINGS, saved);
    }

    function saveSettings(partial) {
        const current = getSettings();
        const updated = Object.assign({}, current, partial);
        safeSet(KEYS.SETTINGS, updated);
        return updated;
    }

    function getSelectedSkin() {
        const settings = getSettings();
        return SHIP_SKINS.find(s => s.id === settings.selectedSkinId) || SHIP_SKINS[0];
    }

    function getProgress() {
        const raw = safeGet(KEYS.PROGRESS, {});
        const today = getTodayDateString();
        const base = Object.assign(
            {
                totalWordsDestroyed: 0,
                completedUnits: {},
                completedLessons: {},
                bestAccuracy: 0,
                totalXp: 0,
                pilotLevel: 1,
                streakDays: 1,
                lastStudyDate: today,
                todayWordsCount: 0,
                dailyWordsGoal: 25,
                bossesDefeated: 0,
                writingPracticed: 0,
                pronunciationChecked: 0,
                dailyHistory: {}
            },
            raw
        );

        if (!base.dailyHistory || typeof base.dailyHistory !== "object") {
            base.dailyHistory = {};
        }

        if (base.lastStudyDate !== today) {
            const prevDate = new Date(base.lastStudyDate + "T00:00:00");
            const curDate = new Date(today + "T00:00:00");
            const diffDays = Math.round((curDate - prevDate) / 86400000);
            if (diffDays === 1) {
                base.streakDays = (base.streakDays || 1) + 1;
            } else if (diffDays > 1) {
                base.streakDays = 1;
            }
            base.lastStudyDate = today;
            base.todayWordsCount = 0;
            safeSet(KEYS.PROGRESS, base, false);
        }

        base.pilotLevel = Math.max(1, Math.floor((base.totalXp || 0) / 250) + 1);
        return base;
    }

    function recordDailyActivity(progress, xpGain = 0, wordsGain = 0, reviewsGain = 0) {
        const today = getTodayDateString();
        if (!progress.dailyHistory) progress.dailyHistory = {};
        const entry = progress.dailyHistory[today] || { xp: 0, words: 0, reviews: 0 };
        entry.xp = (entry.xp || 0) + Math.max(0, xpGain);
        entry.words = (entry.words || 0) + Math.max(0, wordsGain);
        entry.reviews = (entry.reviews || 0) + Math.max(0, reviewsGain);
        progress.dailyHistory[today] = entry;

        // Prune entries older than 30 days to prevent localStorage bloat
        const keys = Object.keys(progress.dailyHistory).sort();
        if (keys.length > 32) {
            keys.slice(0, keys.length - 32).forEach(k => delete progress.dailyHistory[k]);
        }
    }

    function getStudyHistory7Days() {
        const progress = getProgress();
        const history = progress.dailyHistory || {};
        const days = [];
        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        for (let offset = -6; offset <= 0; offset++) {
            const dateStr = getTodayDateString(offset);
            const dt = new Date(dateStr + "T00:00:00");
            const rec = history[dateStr] || { xp: 0, words: 0, reviews: 0 };
            days.push({
                date: dateStr,
                label: offset === 0 ? "Hôm nay" : dayNames[dt.getDay()],
                xp: rec.xp || 0,
                words: rec.words || 0,
                reviews: rec.reviews || 0
            });
        }
        return days;
    }

    function addXp(amount, wordsIncrement = 0, meta = {}) {
        const progress = getProgress();
        const xpGain = Math.max(0, Number(amount) || 0);
        const wGain = Math.max(0, Number(wordsIncrement) || 0);
        progress.totalXp = (progress.totalXp || 0) + xpGain;
        progress.pilotLevel = Math.max(1, Math.floor(progress.totalXp / 250) + 1);
        if (wGain > 0) {
            progress.todayWordsCount = (progress.todayWordsCount || 0) + wGain;
            progress.totalWordsDestroyed = (progress.totalWordsDestroyed || 0) + wGain;
        }
        if (meta.writing) progress.writingPracticed = (progress.writingPracticed || 0) + 1;
        if (meta.pronunciation) progress.pronunciationChecked = (progress.pronunciationChecked || 0) + 1;
        recordDailyActivity(progress, xpGain, wGain, meta.review ? 1 : 0);
        safeSet(KEYS.PROGRESS, progress);
        return progress;
    }

    function markLessonStudied(deckId, unitNumber) {
        const progress = getProgress();
        if (!progress.completedLessons) progress.completedLessons = {};
        const key = `${deckId}_u${unitNumber}`;
        if (!progress.completedLessons[key]) {
            progress.completedLessons[key] = Date.now();
            progress.totalXp = (progress.totalXp || 0) + 40;
            progress.pilotLevel = Math.max(1, Math.floor(progress.totalXp / 250) + 1);
            recordDailyActivity(progress, 40, 0, 1);
            safeSet(KEYS.PROGRESS, progress);
        }
        return progress;
    }

    function calculateStars(accuracy) {
        if (accuracy >= 92) return 3;
        if (accuracy >= 78) return 2;
        return 1;
    }

    function recordUnitCompletion(deckId, unitNumber, stats) {
        const progress = getProgress();
        const key = `${deckId}_u${unitNumber}`;
        const stars = calculateStars(stats.accuracy || 0);

        if ((stats.accuracy || 0) > (progress.bestAccuracy || 0)) {
            progress.bestAccuracy = stats.accuracy;
        }
        if (stats.bossDefeated) {
            progress.bossesDefeated = (progress.bossesDefeated || 0) + 1;
        }
        const xpBonus = 80 + stars * 25;
        progress.totalXp = (progress.totalXp || 0) + xpBonus;
        progress.pilotLevel = Math.max(1, Math.floor(progress.totalXp / 250) + 1);
        recordDailyActivity(progress, xpBonus, 0, 1);

        const prev = progress.completedUnits[key];
        const bestStars = prev && prev.stars ? Math.max(prev.stars, stars) : stars;
        const bestScore = prev && prev.score ? Math.max(prev.score, stats.score || 0) : stats.score || 0;
        const bestAcc = prev && prev.accuracy ? Math.max(prev.accuracy, stats.accuracy || 0) : stats.accuracy || 0;

        progress.completedUnits[key] = {
            score: bestScore,
            accuracy: bestAcc,
            stars: bestStars,
            timestamp: Date.now()
        };

        safeSet(KEYS.PROGRESS, progress);
        return progress;
    }

    function getUnitStars(deckId, unitNumber) {
        const progress = getProgress();
        const key = `${deckId}_u${unitNumber}`;
        const rec = progress.completedUnits && progress.completedUnits[key];
        if (!rec) return 0;
        return rec.stars || calculateStars(rec.accuracy || 80);
    }

    /**
     * Spaced Repetition System (SM-2 Enhanced + Backward-Compatible Ebbinghaus Levels 0..3)
     */
    const SRS_INTERVALS_MS = {
        0: 0,
        1: 4 * 3600 * 1000,
        2: 24 * 3600 * 1000,
        3: 72 * 3600 * 1000
    };

    function getWordMasteryMap() {
        return safeGet(KEYS.WORD_MASTERY, {});
    }

    function getWordMastery(hanzi) {
        if (!hanzi) return { level: 0, hits: 0, misses: 0, cleanStreak: 0, easeFactor: 2.5, intervalHours: 0, nextReviewAt: 0 };
        const map = getWordMasteryMap();
        return (
            map[hanzi] || {
                level: 0,
                hits: 0,
                misses: 0,
                cleanStreak: 0,
                easeFactor: 2.5,
                intervalHours: 0,
                nextReviewAt: 0
            }
        );
    }

    /**
     * Explicit SM-2 Grading for Flashcards & Practice Arena
     * quality: 0 = Quên (10m), 1 = Khó (4h), 2 = Tốt (1d * EF), 3 = Dễ (3d * EF)
     */
    function recordSm2Review(wordObj, quality = 2, skillType = "flashcard") {
        if (!wordObj || !wordObj.hanzi) return null;
        const now = Date.now();
        const map = getWordMasteryMap();
        const cur = map[wordObj.hanzi] || {
            hanzi: wordObj.hanzi,
            pinyin: wordObj.pinyin || "",
            meaning: wordObj.meaning || "",
            level: 0,
            hits: 0,
            misses: 0,
            cleanStreak: 0,
            easeFactor: 2.5,
            intervalHours: 0,
            repetitions: 0,
            skills: {},
            lastSeen: 0,
            lastLevelUpAt: 0,
            nextReviewAt: 0
        };

        let ef = Number(cur.easeFactor) || 2.5;
        let reps = Number(cur.repetitions) || 0;
        let intervalHours = Number(cur.intervalHours) || 0;

        if (quality === 0) {
            reps = 0;
            intervalHours = 0.17; // ~10 minutes
            cur.misses = (cur.misses || 0) + 1;
            cur.cleanStreak = 0;
            cur.level = Math.max(0, (cur.level || 0) - 1);
            ef = Math.max(1.3, ef - 0.2);
            addWeakWord(wordObj);
        } else {
            cur.hits = (cur.hits || 0) + 1;
            cur.cleanStreak = (cur.cleanStreak || 0) + 1;
            reps += 1;

            const qMapped = quality === 1 ? 3 : quality === 2 ? 4 : 5;
            ef = Math.max(1.3, Math.min(2.8, ef + (0.1 - (5 - qMapped) * (0.08 + (5 - qMapped) * 0.02))));

            if (quality === 1) {
                intervalHours = Math.max(4, intervalHours ? intervalHours * 1.2 : 4);
                cur.level = Math.max(1, cur.level || 0);
            } else if (quality === 2) {
                intervalHours = reps === 1 ? 12 : reps === 2 ? 28 : Math.round(intervalHours * ef);
                cur.level = Math.min(3, Math.max(cur.level || 0, reps >= 2 ? 2 : 1));
                if (reps >= 3) cur.level = 3;
            } else {
                intervalHours = reps === 1 ? 48 : Math.round(Math.max(48, intervalHours * ef * 1.3));
                cur.level = Math.min(3, (cur.level || 0) + 1 + (reps >= 2 ? 1 : 0));
            }

            if (cur.cleanStreak >= 2 && cur.level >= 2) {
                removeWeakWord(wordObj.hanzi);
            }
            addXp(quality === 3 ? 20 : 14, 1, {
                review: true,
                writing: skillType === "writing",
                pronunciation: skillType === "pronunciation"
            });
        }

        if (!cur.skills) cur.skills = {};
        cur.skills[skillType] = (cur.skills[skillType] || 0) + (quality > 0 ? 1 : 0);
        cur.easeFactor = Number(ef.toFixed(2));
        cur.repetitions = reps;
        cur.intervalHours = Number(intervalHours.toFixed(2));
        cur.lastSeen = now;
        cur.lastLevelUpAt = now;
        cur.nextReviewAt = now + intervalHours * 3600 * 1000;

        map[wordObj.hanzi] = cur;
        safeSet(KEYS.WORD_MASTERY, map);
        return cur;
    }

    function recordWordMastery(wordObj, wasCleanHit = true) {
        if (!wordObj || !wordObj.hanzi) return;
        const now = Date.now();
        const map = getWordMasteryMap();
        const cur = map[wordObj.hanzi] || {
            hanzi: wordObj.hanzi,
            pinyin: wordObj.pinyin || "",
            meaning: wordObj.meaning || "",
            level: 0,
            hits: 0,
            misses: 0,
            cleanStreak: 0,
            easeFactor: 2.5,
            intervalHours: 4,
            repetitions: 0,
            lastSeen: 0,
            lastLevelUpAt: 0,
            nextReviewAt: 0
        };

        if (wasCleanHit) {
            cur.hits = (cur.hits || 0) + 1;
            cur.cleanStreak = (cur.cleanStreak || 0) + 1;
            cur.repetitions = (cur.repetitions || 0) + 1;
            const elapsedSinceLevelUp = now - (cur.lastLevelUpAt || 0);
            const isSpacedReview = elapsedSinceLevelUp >= 10 * 60 * 1000 || now >= (cur.nextReviewAt || 0);

            if (cur.level === 0) {
                cur.level = 1;
                cur.lastLevelUpAt = now;
            } else if (cur.level === 1 && (isSpacedReview || cur.cleanStreak >= 2)) {
                cur.level = 2;
                cur.lastLevelUpAt = now;
            } else if (cur.level === 2 && (isSpacedReview || cur.cleanStreak >= 4) && cur.cleanStreak >= 3) {
                cur.level = 3;
                cur.lastLevelUpAt = now;
            }

            const baseMs = SRS_INTERVALS_MS[cur.level] || SRS_INTERVALS_MS[1];
            cur.intervalHours = Math.round(baseMs / 3600000);
            cur.nextReviewAt = now + baseMs;

            if (cur.cleanStreak >= 2 && cur.level >= 2) {
                removeWeakWord(wordObj.hanzi);
            }
            addXp(15, 1, { review: true });
        } else {
            cur.misses = (cur.misses || 0) + 1;
            cur.cleanStreak = 0;
            cur.repetitions = 0;
            cur.level = Math.max(0, (cur.level || 0) - 1);
            cur.intervalHours = 0.25;
            cur.nextReviewAt = now + 15 * 60 * 1000;
        }
        cur.lastSeen = now;
        map[wordObj.hanzi] = cur;
        safeSet(KEYS.WORD_MASTERY, map);
        return cur;
    }

    function getMasterySummary() {
        const map = getWordMasteryMap();
        const entries = Object.values(map);
        const now = Date.now();
        let mastered = 0;
        let familiar = 0;
        let learning = 0;
        let dueToday = 0;
        entries.forEach(item => {
            if (item.level >= 3) mastered++;
            else if (item.level === 2) familiar++;
            else if (item.level === 1) learning++;
            if (item.level < 2 || (item.nextReviewAt && item.nextReviewAt <= now)) {
                dueToday++;
            }
        });
        return {
            totalTracked: entries.length,
            mastered,
            familiar,
            learning,
            dueToday
        };
    }

    function getDueSrsWords(limit = 25) {
        const map = getWordMasteryMap();
        const now = Date.now();
        const weak = getWeakWords();
        const dueMap = new Map();

        weak.forEach(w => {
            if (w && w.hanzi) dueMap.set(w.hanzi, w);
        });

        Object.values(map)
            .filter(item => item && item.hanzi && (item.level < 2 || (item.nextReviewAt && item.nextReviewAt <= now)))
            .sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0))
            .forEach(item => {
                if (!dueMap.has(item.hanzi)) {
                    dueMap.set(item.hanzi, {
                        hanzi: item.hanzi,
                        pinyin: item.pinyin,
                        meaning: item.meaning,
                        meaningShort: window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(item) : item.meaning
                    });
                }
            });

        return Array.from(dueMap.values()).slice(0, limit);
    }

    function prioritizeUnitWordsForSrs(wordsArray) {
        if (!Array.isArray(wordsArray)) return [];
        const map = getWordMasteryMap();
        const weakSet = new Set(getWeakWords().map(w => w.hanzi));
        const now = Date.now();

        return wordsArray
            .map(w => {
                const rec = map[w.hanzi];
                let priorityScore = Math.random() * 1.5;
                if (weakSet.has(w.hanzi)) {
                    priorityScore += 5;
                } else if (!rec || rec.level === 0) {
                    priorityScore += 3;
                } else if (rec.nextReviewAt && rec.nextReviewAt <= now) {
                    priorityScore += 2.5;
                } else if (rec.level === 1) {
                    priorityScore += 1.5;
                }
                return { word: w, priorityScore };
            })
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .map(item => item.word);
    }

    function getWeakWords() {
        return safeGet(KEYS.WEAK_WORDS, []);
    }

    function addWeakWord(wordObj) {
        if (!wordObj || !wordObj.hanzi) return;
        const list = getWeakWords();
        const existing = list.find(w => w.hanzi === wordObj.hanzi);
        if (existing) {
            existing.missCount = (existing.missCount || 1) + 1;
            existing.lastMissed = Date.now();
        } else {
            list.push({
                hanzi: wordObj.hanzi,
                pinyin: wordObj.pinyin,
                pinyinClean: wordObj.pinyinClean || (window.VocabDatabase ? window.VocabDatabase.normalizePinyin(wordObj.pinyin) : ""),
                meaning: wordObj.meaning,
                meaningShort: wordObj.meaningShort || (window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(wordObj) : wordObj.meaning),
                missCount: 1,
                lastMissed: Date.now()
            });
        }
        safeSet(KEYS.WEAK_WORDS, list);
    }

    function removeWeakWord(hanzi) {
        const list = getWeakWords().filter(w => w.hanzi !== hanzi);
        safeSet(KEYS.WEAK_WORDS, list);
        return list;
    }

    function getCustomUnits() {
        return safeGet(KEYS.CUSTOM_UNITS, []);
    }

    function addCustomUnit(title, wordsArray, targetMode = "pinyin") {
        const units = getCustomUnits();
        const newUnit = {
            unitNumber: units.length + 1,
            stageLabel: `Màn ${units.length + 1}/${units.length + 1} • Tùy chỉnh`,
            title: title || `Unit Tùy chỉnh #${units.length + 1}`,
            targetMode: targetMode || "pinyin",
            words: wordsArray.map(w => ({
                hanzi: String(w.hanzi || "").trim(),
                pinyin: String(w.pinyin || "").trim(),
                pinyinClean: window.VocabDatabase ? window.VocabDatabase.normalizePinyin(w.pinyin) : "",
                meaning: String(w.meaning || "").trim(),
                meaningShort: window.VocabDatabase ? window.VocabDatabase.getDisplayMeaningHint(w) : String(w.meaning || "").trim()
            }))
        };
        units.push(newUnit);
        safeSet(KEYS.CUSTOM_UNITS, units);
        return newUnit;
    }

    function deleteCustomUnit(index) {
        const units = getCustomUnits();
        units.splice(index, 1);
        safeSet(KEYS.CUSTOM_UNITS, units);
        return units;
    }

    function exportFullState() {
        return {
            exportedAt: new Date().toISOString(),
            version: "2.0.0",
            settings: getSettings(),
            progress: getProgress(),
            wordMastery: getWordMasteryMap(),
            weakWords: getWeakWords(),
            customUnits: getCustomUnits()
        };
    }

    function importFullState(incoming = {}, merge = true) {
        if (!incoming || typeof incoming !== "object") return false;
        if (incoming.settings && Object.keys(incoming.settings).length > 0) {
            const cur = merge ? getSettings() : DEFAULT_SETTINGS;
            safeSet(KEYS.SETTINGS, Object.assign({}, cur, incoming.settings), false);
        }
        if (incoming.progress && Object.keys(incoming.progress).length > 0) {
            const curP = merge ? getProgress() : {};
            const mergedP = Object.assign({}, curP, incoming.progress);
            if (merge && curP.totalXp > (incoming.progress.totalXp || 0)) {
                mergedP.totalXp = curP.totalXp;
                mergedP.pilotLevel = curP.pilotLevel;
            }
            mergedP.completedUnits = Object.assign({}, curP.completedUnits || {}, incoming.progress.completedUnits || {});
            mergedP.completedLessons = Object.assign({}, curP.completedLessons || {}, incoming.progress.completedLessons || {});
            mergedP.dailyHistory = Object.assign({}, curP.dailyHistory || {}, incoming.progress.dailyHistory || {});
            safeSet(KEYS.PROGRESS, mergedP, false);
        }
        if (incoming.wordMastery && typeof incoming.wordMastery === "object") {
            const curM = merge ? getWordMasteryMap() : {};
            const nextM = Object.assign({}, curM);
            Object.entries(incoming.wordMastery).forEach(([hz, rec]) => {
                if (!nextM[hz] || (rec.level || 0) >= (nextM[hz].level || 0) || (rec.lastSeen || 0) > (nextM[hz].lastSeen || 0)) {
                    nextM[hz] = rec;
                }
            });
            safeSet(KEYS.WORD_MASTERY, nextM, false);
        }
        if (Array.isArray(incoming.weakWords) && incoming.weakWords.length > 0) {
            safeSet(KEYS.WEAK_WORDS, incoming.weakWords, false);
        }
        if (Array.isArray(incoming.customUnits) && incoming.customUnits.length > 0) {
            safeSet(KEYS.CUSTOM_UNITS, incoming.customUnits, false);
        }
        return true;
    }

    function getAuthSession() {
        return safeGet(KEYS.AUTH_SESSION, null);
    }

    function saveAuthSession(sessionObj) {
        if (!sessionObj) {
            try {
                localStorage.removeItem(KEYS.AUTH_SESSION);
            } catch {
                // ignore
            }
            return;
        }
        safeSet(KEYS.AUTH_SESSION, sessionObj, false);
    }

    return {
        SHIP_SKINS,
        getSettings,
        saveSettings,
        getSelectedSkin,
        getProgress,
        getStudyHistory7Days,
        addXp,
        markLessonStudied,
        recordUnitCompletion,
        getUnitStars,
        getWordMasteryMap,
        getWordMastery,
        recordWordMastery,
        recordSm2Review,
        getMasterySummary,
        getDueSrsWords,
        prioritizeUnitWordsForSrs,
        getWeakWords,
        addWeakWord,
        removeWeakWord,
        getCustomUnits,
        addCustomUnit,
        deleteCustomUnit,
        exportFullState,
        importFullState,
        getAuthSession,
        saveAuthSession,
        setSyncSubscriber
    };
})();
