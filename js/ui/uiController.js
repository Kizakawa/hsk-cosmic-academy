/**
 * UI Controller Module
 * Connects DOM controls, modals, keyboard input, and HUD updates with GameEngine & StorageService.
 * Supports:
 * - 5 Game Modes: Auto (Theo Màn), Pinyin, Meaning, Listening (🎧 Nghe Âm), Mixed
 * - Pre-Game Study Deck & Flashcard Carousel Modal (#modal-study-deck)
 * - Hangar Ship Skins & SRS Mastery Dashboard Modal (#modal-hangar)
 * - 3-Star Unit Rating & Boss Sentence Preview
 */
window.UIController = (function () {
    let activeDeckIndex = 0;
    let activeUnitIndex = 0;
    let isCustomMode = false;
    let isWeakReviewMode = false;
    let currentView = "hub"; // "hub" | "lesson" | "practice" | "dictionary" | "shooter"

    // Study Modal Flashcard state
    let studyUnitRef = null;
    let studyFlashcardIndex = 0;

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Vietnamese Telex / Unikey multi-candidate map:
    // Maps composed Vietnamese characters to ordered candidate ASCII keys so both Pinyin (e.g. zuo/shuo/wo)
    // and Vietnamese Meaning typing work seamlessly even when Unikey is left on.
    const TELEX_IME_CANDIDATES = {
        "á": ["s", "a"], "ấ": ["s", "a"], "ắ": ["s", "a"],
        "é": ["s", "e"], "ế": ["s", "e"],
        "í": ["s", "i"],
        "ó": ["s", "o"], "ố": ["s", "o"], "ớ": ["s", "o", "w"],
        "ú": ["s", "u"], "ứ": ["s", "u", "w"],
        "ý": ["s", "y"],
        "à": ["f", "a"], "ầ": ["f", "a"], "ằ": ["f", "a"],
        "è": ["f", "e"], "ề": ["f", "e"],
        "ì": ["f", "i"],
        "ò": ["f", "o"], "ồ": ["f", "o"], "ờ": ["f", "o", "w"],
        "ù": ["f", "u"], "ừ": ["f", "u", "w"],
        "ỳ": ["f", "y"],
        "ả": ["r", "a"], "ẩ": ["r", "a"], "ẳ": ["r", "a"],
        "ẻ": ["r", "e"], "ể": ["r", "e"],
        "ỉ": ["r", "i"],
        "ỏ": ["r", "o"], "ổ": ["r", "o"], "ở": ["r", "o", "w"],
        "ủ": ["r", "u"], "ử": ["r", "u", "w"],
        "ỷ": ["r", "y"],
        "ã": ["x", "a"], "ẫ": ["x", "a"], "ẵ": ["x", "a"],
        "ẽ": ["x", "e"], "ễ": ["x", "e"],
        "ĩ": ["x", "i"],
        "õ": ["x", "o"], "ỗ": ["x", "o"], "ỡ": ["x", "o", "w"],
        "ũ": ["x", "u"], "ữ": ["x", "u", "w"],
        "ỹ": ["x", "y"],
        "ạ": ["j", "a"], "ậ": ["j", "a"], "ặ": ["j", "a"],
        "ẹ": ["j", "e"], "ệ": ["j", "e"],
        "ị": ["j", "i"],
        "ọ": ["j", "o"], "ộ": ["j", "o"], "ợ": ["j", "o", "w"],
        "ụ": ["j", "u"], "ự": ["j", "u", "w"],
        "ỵ": ["j", "y"],
        "ă": ["a", "w"],
        "ơ": ["o", "w"],
        "ư": ["u", "w"],
        "â": ["a"],
        "ê": ["e"],
        "ô": ["o"],
        "đ": ["d"]
    };

    const MODE_META = {
        auto: { icon: "🎯", label: "Theo Màn", desc: "Tự động theo chế độ của từng màn chơi" },
        pinyin: { icon: "🔤", label: "Gõ Pinyin", desc: "Nhìn Hán tự đang rơi ➔ Gõ Pinyin để bắn" },
        meaning: { icon: "🇻🇳", label: "Gõ Nghĩa", desc: "Nhìn Hán tự + Pinyin ➔ Gõ Nghĩa tiếng Việt để bắn" },
        listening: { icon: "🎧", label: "Nghe Âm", desc: "Nghe phát âm tiếng Trung ➔ Gõ Pinyin để bắn hạ mục tiêu ẩn" },
        mixed: { icon: "🔄", label: "Kết Hợp", desc: "Xen kẽ 1 từ gõ Pinyin, 1 từ gõ Nghĩa tiếng Việt" }
    };

    const DIFFICULTY_ORDER = ["chill", "normal", "challenge", "zen"];

    function isCoarseOrCompactScreen() {
        const hasCoarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
        return hasCoarse || window.innerWidth <= 900;
    }

    function syncTouchKeyboardVisibility() {
        const settings = window.StorageService.getSettings();
        const kbEl = document.getElementById("touch-keyboard");
        if (!kbEl) return;

        let shouldShow = false;
        if (settings.touchKeyboard === "on") {
            shouldShow = true;
        } else if (settings.touchKeyboard === "off") {
            shouldShow = false;
        } else {
            shouldShow = isCoarseOrCompactScreen();
        }

        kbEl.classList.toggle("hidden", !shouldShow);
        document.body.classList.toggle("touch-kb-open", shouldShow);
    }

    function init() {
        const canvas = document.getElementById("game-canvas");
        window.GameEngine.init(canvas, {
            onHudUpdate: updateHud,
            onTargetUpdate: updateTargetIndicator,
            onUnitComplete: showUnitCompleteModal,
            onGameOver: showGameOverModal,
            onSpecialEvent: msg => showToast(msg)
        });

        const settings = window.StorageService.getSettings();
        const foundDeckIdx = window.VocabDatabase.DECKS.findIndex(d => d.id === settings.selectedDeckId);
        activeDeckIndex = foundDeckIdx >= 0 ? foundDeckIdx : 0;
        const deck = window.VocabDatabase.DECKS[activeDeckIndex];
        activeUnitIndex = Math.min(settings.selectedUnitIndex || 0, deck.units.length - 1);

        bindEvents();
        bindPlatformNavigation();
        syncTouchKeyboardVisibility();
        syncSettingsButtons();
        startSelectedUnit(null, false);

        const searchParams = new URLSearchParams((window.location && window.location.search) || "");
        const initialView = searchParams.get("view") === "shooter" ? "shooter" : "hub";
        navigateView(initialView, { skipRestart: true });

        if (window.ApiClient && window.ApiClient.restoreSessionOnBoot) {
            window.ApiClient.restoreSessionOnBoot().then(() => {
                syncAccountBadge();
                if (currentView === "hub") renderActiveAcademyView();
            });
        }
        registerPwaServiceWorker();
    }

    function registerPwaServiceWorker() {
        const proto = (window.location && window.location.protocol) || "";
        if ("serviceWorker" in navigator && (proto === "http:" || proto === "https:")) {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        }
    }

    function syncAccountBadge() {
        const accBtn = document.getElementById("btn-open-account");
        if (!accBtn) return;
        const session = window.StorageService.getAuthSession ? window.StorageService.getAuthSession() : null;
        if (session && session.user) {
            accBtn.innerHTML = `<span>${escapeHtml(session.user.avatar || "🧑‍🚀")}</span> <span>${escapeHtml(session.user.displayName)}</span>`;
            accBtn.classList.add("active-pill");
        } else {
            accBtn.innerHTML = `<span>👤</span> <span>Tài Khoản</span>`;
            accBtn.classList.remove("active-pill");
        }
    }

    function selectDeckAndUnit(deckIdx, unitIdx, targetView = "lesson") {
        const decks = window.VocabDatabase.DECKS || [];
        activeDeckIndex = Math.max(0, Math.min(deckIdx, decks.length - 1));
        const deck = decks[activeDeckIndex];
        activeUnitIndex = Math.max(0, Math.min(unitIdx, deck.units.length - 1));
        window.StorageService.saveSettings({
            selectedDeckId: deck.id,
            selectedUnitIndex: activeUnitIndex
        });
        startSelectedUnit(null, false);
        navigateView(targetView, { skipRestart: true });
    }

    function navigateView(viewName, opts = {}) {
        currentView = viewName || "hub";
        const shellEl = document.getElementById("academy-main-shell");
        const popover = document.getElementById("shooter-settings-popover");
        if (popover) popover.classList.add("hidden");

        document.querySelectorAll("[data-nav-view]").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-nav-view") === currentView);
        });

        if (currentView === "shooter") {
            document.body.classList.remove("academy-mode-active");
            if (shellEl) shellEl.classList.add("hidden");
            syncTouchKeyboardVisibility();
            if (!opts.skipRestart) {
                startSelectedUnit(null, false);
            }
            if (window.GameEngine.setCanvasSleeping) {
                window.GameEngine.setCanvasSleeping(false);
            }
            if (window.GameEngine.getState() === "PAUSED") {
                window.GameEngine.resumeGame();
            }
        } else {
            document.body.classList.add("academy-mode-active");
            if (shellEl) shellEl.classList.remove("hidden");
            const kbEl = document.getElementById("touch-keyboard");
            if (kbEl) kbEl.classList.add("hidden");
            document.body.classList.remove("touch-kb-open");
            window.SoundEngine.stopBGM();
            if (window.GameEngine.setCanvasSleeping) {
                window.GameEngine.setCanvasSleeping(true);
            }
            renderActiveAcademyView(opts);
        }
        syncSettingsButtons();
    }

    function renderActiveAcademyView(opts = {}) {
        const shellEl = document.getElementById("academy-main-shell");
        if (!shellEl) return;
        const navCallbacks = {
            onNavigate: (v, o) => navigateView(v, o),
            onSelectDeckUnit: (dIdx, uIdx, targetV) => selectDeckAndUnit(dIdx, uIdx, targetV),
            onToast: msg => showToast(msg)
        };
        if (currentView === "lesson" && window.LessonStudio) {
            window.LessonStudio.render(shellEl, navCallbacks, opts);
        } else if (currentView === "practice" && window.PracticeArena) {
            window.PracticeArena.render(shellEl, navCallbacks, opts);
        } else if (currentView === "dictionary" && window.DictionaryView) {
            window.DictionaryView.render(shellEl, navCallbacks, opts);
        } else if (window.AcademyHub) {
            window.AcademyHub.render(shellEl, navCallbacks, opts);
        }
    }

    function bindPlatformNavigation() {
        document.querySelectorAll("[data-nav-view]").forEach(btn => {
            btn.addEventListener("click", () => {
                closeAllModals();
                navigateView(btn.getAttribute("data-nav-view"));
            });
        });

        const settingsDrawerBtn = document.getElementById("btn-shooter-settings-drawer");
        const settingsPopover = document.getElementById("shooter-settings-popover");
        if (settingsDrawerBtn && settingsPopover) {
            settingsDrawerBtn.addEventListener("click", e => {
                e.stopPropagation();
                settingsPopover.classList.toggle("hidden");
            });
            document.addEventListener("click", e => {
                if (!settingsPopover.classList.contains("hidden")) {
                    if (!settingsPopover.contains(e.target) && e.target !== settingsDrawerBtn) {
                        settingsPopover.classList.add("hidden");
                    }
                }
            });
        }

        const accBtn = document.getElementById("btn-open-account");
        if (accBtn) {
            accBtn.addEventListener("click", () => {
                if (currentView === "shooter") window.GameEngine.pauseGame();
                const bodyEl = document.getElementById("community-modal-body");
                if (window.CommunityModal && bodyEl) {
                    window.CommunityModal.render(bodyEl, {
                        onToast: msg => showToast(msg),
                        onAuthChanged: () => {
                            syncAccountBadge();
                            syncSettingsButtons();
                            if (currentView !== "shooter") renderActiveAcademyView();
                        },
                        onInstalledCustomDeck: () => {
                            closeAllModals();
                            const customUnits = window.StorageService.getCustomUnits();
                            if (customUnits.length > 0) {
                                startCustomUnitByIndex(customUnits.length - 1);
                            }
                        }
                    });
                }
                openModal("modal-community");
            });
        }
        syncAccountBadge();
    }

    function startSelectedUnit(forcedModeOverride = null, switchToShooter = true) {
        closeAllModals();
        isCustomMode = false;
        isWeakReviewMode = false;

        const deck = window.VocabDatabase.DECKS[activeDeckIndex];
        const unitIdx = Math.min(activeUnitIndex, deck.units.length - 1);
        const partialSettings = {
            selectedDeckId: deck.id,
            selectedUnitIndex: unitIdx
        };
        if (forcedModeOverride) {
            partialSettings.gameMode = forcedModeOverride;
        }
        window.StorageService.saveSettings(partialSettings);
        syncSettingsButtons();
        window.GameEngine.startUnit(deck, unitIdx);
        if (switchToShooter && currentView !== "shooter") {
            navigateView("shooter", { skipRestart: true });
        }
    }

    function startWeakWordsReview() {
        const weakWords = window.StorageService.getWeakWords();
        if (weakWords.length === 0) {
            showToast("🎉 Bạn chưa có từ nào bị sai hoặc bỏ lỡ trong Sổ Tay!");
            return;
        }
        closeAllModals();
        isWeakReviewMode = true;
        const customDeck = {
            id: "weak_review",
            name: "Sổ Tay Từ Hay Sai (Ôn Tập)",
            units: []
        };
        const customUnit = {
            unitNumber: 1,
            stageLabel: `Ôn tập • ${weakWords.length} từ cần nhớ`,
            title: "Ôn tập các từ từng gõ nhầm hoặc lọt lưới",
            targetMode: "pinyin",
            words: weakWords
        };
        window.GameEngine.startUnit(customDeck, 0, customUnit);
        if (currentView !== "shooter") navigateView("shooter", { skipRestart: true });
    }

    function startCustomUnitByIndex(index) {
        const customUnits = window.StorageService.getCustomUnits();
        const unit = customUnits[index];
        if (!unit) return;
        closeAllModals();
        isCustomMode = true;
        const customDeck = {
            id: "custom_deck",
            name: `Bộ Từ Cá Nhân • ${unit.title}`,
            units: customUnits
        };
        window.GameEngine.startUnit(customDeck, index, unit);
        if (currentView !== "shooter") navigateView("shooter", { skipRestart: true });
    }

    function bindEvents() {
        window.addEventListener("keydown", e => {
            const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : "";
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
                return;
            }

            if (isAnyModalOpen()) {
                if (e.key === "Escape") {
                    closeAllModals();
                    if (currentView === "shooter") window.GameEngine.resumeGame();
                }
                return;
            }

            if (currentView !== "shooter") {
                return;
            }

            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === "Tab" || e.key === " ") {
                e.preventDefault();
                window.GameEngine.handleKeyInput(e.key);
                return;
            }

            if (e.key === "Escape") {
                e.preventDefault();
                window.GameEngine.handleKeyInput("Escape");
                return;
            }

            const lower = (e.key || "").toLowerCase();
            if (lower.length === 1 && ((lower >= "a" && lower <= "z") || (lower >= "1" && lower <= "5"))) {
                e.preventDefault();
                window.GameEngine.handleKeyInput(lower);
                return;
            }

            if (TELEX_IME_CANDIDATES[lower]) {
                e.preventDefault();
                const candidates = TELEX_IME_CANDIDATES[lower].slice();
                const baseChar = window.VocabDatabase.normalizeVietnamese(lower);
                if (baseChar && !candidates.includes(baseChar)) {
                    candidates.push(baseChar);
                }

                const dbg = window.GameEngine.getDebugState ? window.GameEngine.getDebugState() : {};
                const activeTargetMode = (dbg.lockedWord && dbg.lockedWord.targetMode) || dbg.effectiveMode || "pinyin";

                // In Vietnamese meaning mode, prioritize the normalized base vowel first
                if (activeTargetMode === "meaning" && baseChar) {
                    const ordered = [baseChar, ...candidates.filter(c => c !== baseChar)];
                    window.GameEngine.handleKeyInput(ordered[0], {
                        candidateChars: ordered,
                        altChar: ordered[1] || ordered[0],
                        isUnikeyAccent: true
                    });
                } else {
                    window.GameEngine.handleKeyInput(candidates[0], {
                        candidateChars: candidates,
                        altChar: candidates[1] || baseChar,
                        isUnikeyAccent: true
                    });
                }
            }
        });

        window.addEventListener("resize", () => {
            syncTouchKeyboardVisibility();
        });

        // Top Bar Buttons
        document.getElementById("btn-open-units").addEventListener("click", () => {
            window.GameEngine.pauseGame();
            renderUnitSelectorModal();
            openModal("modal-units");
        });

        document.getElementById("stage-pill-btn").addEventListener("click", () => {
            window.GameEngine.pauseGame();
            renderUnitSelectorModal();
            openModal("modal-units");
        });

        const studyBtn = document.getElementById("btn-study-deck");
        if (studyBtn) {
            studyBtn.addEventListener("click", () => {
                window.GameEngine.pauseGame();
                const currentData = window.GameEngine.getCurrentUnitData ? window.GameEngine.getCurrentUnitData() : null;
                const deck = (currentData && currentData.deck) || window.VocabDatabase.DECKS[activeDeckIndex];
                const unit = (currentData && currentData.unit) || deck.units[activeUnitIndex] || deck.units[0];
                renderStudyDeckModal(deck, unit);
                openModal("modal-study-deck");
            });
        }

        const hangarBtn = document.getElementById("btn-open-hangar");
        if (hangarBtn) {
            hangarBtn.addEventListener("click", () => {
                window.GameEngine.pauseGame();
                renderHangarModal();
                openModal("modal-hangar");
            });
        }

        const modeBtn = document.getElementById("btn-mode-cycle");
        if (modeBtn) {
            modeBtn.addEventListener("click", () => {
                const current = window.StorageService.getSettings();
                const modes = ["auto", "pinyin", "meaning", "listening", "mixed"];
                const idx = modes.indexOf(current.gameMode || "auto");
                const nextMode = modes[(idx + 1) % modes.length];
                window.StorageService.saveSettings({ gameMode: nextMode });
                window.GameEngine.applyLiveSettingsChange();
                syncSettingsButtons();
                const meta = MODE_META[nextMode];
                showToast(`${meta.icon} Chế độ: ${meta.label} — ${meta.desc}`);
            });
        }

        const diffBtn = document.getElementById("btn-difficulty-cycle");
        if (diffBtn) {
            diffBtn.addEventListener("click", () => {
                const current = window.StorageService.getSettings();
                const idx = DIFFICULTY_ORDER.indexOf(current.difficulty || "chill");
                const nextDiff = DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length];
                window.StorageService.saveSettings({ difficulty: nextDiff });
                window.GameEngine.applyLiveSettingsChange();
                syncSettingsButtons();
                const profile = window.GameEngine.DIFFICULTY_PROFILES[nextDiff];
                showToast(`${profile.label}: Đã áp dụng cấp độ mới!`);
            });
        }

        const toneBtn = document.getElementById("btn-tone-mode");
        if (toneBtn) {
            toneBtn.addEventListener("click", () => {
                const current = window.StorageService.getSettings();
                const nextTone = !current.toneMode;
                window.StorageService.saveSettings({ toneMode: nextTone });
                window.GameEngine.applyLiveSettingsChange();
                syncSettingsButtons();
                showToast(
                    nextTone
                        ? "🎵 Đã bật: Bắt buộc gõ số thanh điệu 1–4 sau mỗi âm tiết (VD: ni3hao3)"
                        : "🎵 Đã bật: Thanh điệu Tự do (Có thể gõ nihao hoặc ni3hao3 đều đúng)"
                );
            });
        }

        const kbToggleBtn = document.getElementById("btn-toggle-keyboard");
        if (kbToggleBtn) {
            kbToggleBtn.addEventListener("click", () => {
                const kbEl = document.getElementById("touch-keyboard");
                const isCurrentlyVisible = kbEl && !kbEl.classList.contains("hidden");
                const nextMode = isCurrentlyVisible ? "off" : "on";
                window.StorageService.saveSettings({ touchKeyboard: nextMode });
                syncTouchKeyboardVisibility();
                syncSettingsButtons();
                showToast(
                    nextMode === "on"
                        ? "⌨️ Đã bật bàn phím ảo cảm ứng trên màn hình"
                        : "⌨️ Đã ẩn bàn phím ảo cảm ứng"
                );
            });
        }

        const touchKeyboardEl = document.getElementById("touch-keyboard");
        if (touchKeyboardEl) {
            touchKeyboardEl.querySelectorAll("[data-tk-key]").forEach(keyBtn => {
                keyBtn.addEventListener("pointerdown", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const keyVal = keyBtn.getAttribute("data-tk-key");
                    if (keyVal) {
                        window.GameEngine.handleKeyInput(keyVal);
                    }
                });
            });
        }

        document.getElementById("btn-hint-mode").addEventListener("click", () => {
            const current = window.StorageService.getSettings();
            const nextMode = current.hintMode === "video" ? "assist" : "video";
            window.StorageService.saveSettings({ hintMode: nextMode });
            syncSettingsButtons();
            showToast(
                nextMode === "assist"
                    ? "💡 Đã bật: Luôn hiện gợi ý chữ cần gõ dưới từ đang rơi"
                    : "🎯 Đã bật: Chế độ Chuẩn (Tự ẩn gợi ý khi ở đỉnh màn hình)"
            );
        });

        document.getElementById("btn-peek-word").addEventListener("click", () => {
            window.GameEngine.revealHintForUrgentWord();
        });

        document.getElementById("btn-toggle-audio").addEventListener("click", () => {
            const current = window.StorageService.getSettings();
            const nextState = !current.sfxEnabled;
            window.StorageService.saveSettings({
                sfxEnabled: nextState,
                bgmEnabled: nextState
            });
            if (!nextState) {
                window.SoundEngine.stopBGM();
            } else {
                window.SoundEngine.startBGM();
            }
            syncSettingsButtons();
        });

        document.getElementById("btn-speed-cycle").addEventListener("click", () => {
            const current = window.StorageService.getSettings();
            const speeds = [0.6, 0.85, 1.0, 1.25];
            const idx = speeds.indexOf(current.speedMultiplier);
            const nextSpeed = speeds[(idx + 1) % speeds.length];
            window.StorageService.saveSettings({ speedMultiplier: nextSpeed });
            window.GameEngine.applyLiveSettingsChange();
            syncSettingsButtons();
            showToast(`⚡ Tốc độ rơi: ${nextSpeed}x`);
        });

        document.getElementById("btn-open-custom").addEventListener("click", () => {
            window.GameEngine.pauseGame();
            openModal("modal-custom-vocab");
        });

        document.getElementById("btn-weak-words").addEventListener("click", () => {
            startWeakWordsReview();
        });

        document.getElementById("btn-pause").addEventListener("click", () => {
            window.GameEngine.togglePause();
        });

        document.querySelectorAll("[data-close-modal]").forEach(btn => {
            btn.addEventListener("click", () => {
                closeAllModals();
                if (currentView === "shooter" && window.GameEngine.getState() === "PAUSED") {
                    window.GameEngine.resumeGame();
                }
            });
        });

        // Study Modal Controls
        const fcPrev = document.getElementById("btn-fc-prev");
        const fcNext = document.getElementById("btn-fc-next");
        const fcSpeak = document.getElementById("btn-fc-speak");
        const fcBox = document.getElementById("study-flashcard");
        const bossSpeak = document.getElementById("btn-speak-boss");

        if (fcPrev) {
            fcPrev.addEventListener("click", e => {
                e.stopPropagation();
                if (!studyUnitRef || !studyUnitRef.words.length) return;
                studyFlashcardIndex = (studyFlashcardIndex - 1 + studyUnitRef.words.length) % studyUnitRef.words.length;
                updateFlashcardDisplay(true);
            });
        }
        if (fcNext) {
            fcNext.addEventListener("click", e => {
                e.stopPropagation();
                if (!studyUnitRef || !studyUnitRef.words.length) return;
                studyFlashcardIndex = (studyFlashcardIndex + 1) % studyUnitRef.words.length;
                updateFlashcardDisplay(true);
            });
        }
        if (fcSpeak) {
            fcSpeak.addEventListener("click", e => {
                e.stopPropagation();
                if (!studyUnitRef || !studyUnitRef.words.length) return;
                const w = studyUnitRef.words[studyFlashcardIndex];
                if (w) window.SoundEngine.speakChinese(w.hanzi);
            });
        }
        if (fcBox) {
            fcBox.addEventListener("click", () => {
                if (!studyUnitRef || !studyUnitRef.words.length) return;
                const w = studyUnitRef.words[studyFlashcardIndex];
                if (w) window.SoundEngine.speakChinese(w.hanzi);
            });
        }
        if (bossSpeak) {
            bossSpeak.addEventListener("click", () => {
                if (!studyUnitRef) return;
                const boss = window.VocabDatabase.getUnitBossWord(studyUnitRef);
                if (boss) window.SoundEngine.speakChinese(boss.hanzi);
            });
        }

        document.getElementById("btn-study-launch-pinyin").addEventListener("click", () => {
            startSelectedUnit("pinyin");
        });
        document.getElementById("btn-study-launch-meaning").addEventListener("click", () => {
            startSelectedUnit("meaning");
        });
        document.getElementById("btn-study-launch-listening").addEventListener("click", () => {
            startSelectedUnit("listening");
        });

        document.getElementById("btn-save-custom-unit").addEventListener("click", handleSaveCustomVocab);

        document.getElementById("btn-next-unit").addEventListener("click", () => {
            const deck = window.VocabDatabase.DECKS[activeDeckIndex];
            if (!isCustomMode && !isWeakReviewMode) {
                if (activeUnitIndex + 1 < deck.units.length) {
                    activeUnitIndex++;
                    startSelectedUnit();
                    return;
                }
                // Completed the last unit of the current deck!
                if (activeDeckIndex + 1 < window.VocabDatabase.DECKS.length) {
                    const finishedDeckName = deck.name;
                    activeDeckIndex++;
                    activeUnitIndex = 0;
                    const nextDeck = window.VocabDatabase.DECKS[activeDeckIndex];
                    startSelectedUnit();
                    showToast(`🏆 Chúc mừng hoàn thành ${finishedDeckName}! Chuyển sang ${nextDeck.name}`);
                    return;
                }
                closeAllModals();
                renderUnitSelectorModal();
                openModal("modal-units");
                showToast(`🏆 Xuất sắc! Bạn đã hoàn thành toàn bộ màn chơi của ${deck.name}!`);
                return;
            }
            startSelectedUnit();
        });

        document.getElementById("btn-replay-unit").addEventListener("click", () => {
            if (isWeakReviewMode) {
                startWeakWordsReview();
            } else {
                startSelectedUnit();
            }
        });

        document.getElementById("btn-continue-shields").addEventListener("click", () => {
            closeAllModals();
            window.GameEngine.restoreShieldsAndContinue();
        });

        document.getElementById("btn-retry-gameover").addEventListener("click", () => {
            startSelectedUnit();
        });
    }

    function getMasteryLabel(level) {
        if (level >= 3) return { text: "🟢 Thành thạo (3★)", color: "#4ade80" };
        if (level === 2) return { text: "🔵 Quen thuộc (2★)", color: "#38bdf8" };
        if (level === 1) return { text: "🟡 Đang nhớ (1★)", color: "#facc15" };
        return { text: "⚪ Mới gặp", color: "#94a3b8" };
    }

    function renderStudyDeckModal(deck, unit) {
        studyUnitRef = unit;
        studyFlashcardIndex = 0;

        const titleEl = document.getElementById("study-modal-title");
        if (titleEl) {
            titleEl.textContent = `📖 Học Từ & Flashcard: ${unit.title} (${unit.words.length} từ)`;
        }

        const boss = window.VocabDatabase.getUnitBossWord(unit);
        document.getElementById("study-boss-hanzi").textContent = boss.hanzi;
        document.getElementById("study-boss-pinyin").textContent = boss.pinyin;
        document.getElementById("study-boss-meaning").textContent = boss.meaning;

        updateFlashcardDisplay(false);

        const gridEl = document.getElementById("study-words-grid");
        gridEl.innerHTML = "";
        (unit.words || []).forEach((w, idx) => {
            const mastery = window.StorageService.getWordMastery
                ? window.StorageService.getWordMastery(w.hanzi)
                : { level: 0 };
            const mInfo = getMasteryLabel(mastery.level || 0);

            const card = document.createElement("div");
            card.className = "review-word-card";
            card.style.cursor = "pointer";
            card.innerHTML = `
                <div class="rw-main">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span class="rw-hanzi">${escapeHtml(w.hanzi)}</span>
                        <span style="font-size:10.5px;color:${mInfo.color};font-weight:700;">${escapeHtml(mInfo.text)}</span>
                    </div>
                    <span class="rw-pinyin">${escapeHtml(w.pinyin)}</span>
                    <span class="rw-meaning">${escapeHtml(w.meaning)}</span>
                </div>
                <button class="btn-speak-word" title="Nghe phát âm" data-study-idx="${idx}">🔊</button>
            `;
            card.addEventListener("click", () => {
                studyFlashcardIndex = idx;
                updateFlashcardDisplay(true);
            });
            gridEl.appendChild(card);
        });
    }

    function updateFlashcardDisplay(speakNow = false) {
        if (!studyUnitRef || !studyUnitRef.words || studyUnitRef.words.length === 0) return;
        const w = studyUnitRef.words[studyFlashcardIndex] || studyUnitRef.words[0];
        const mastery = window.StorageService.getWordMastery
            ? window.StorageService.getWordMastery(w.hanzi)
            : { level: 0 };
        const mInfo = getMasteryLabel(mastery.level || 0);

        document.getElementById("fc-counter").textContent = `Từ ${studyFlashcardIndex + 1}/${studyUnitRef.words.length}`;
        const badgeEl = document.getElementById("fc-mastery-badge");
        badgeEl.textContent = mInfo.text;
        badgeEl.style.color = mInfo.color;

        document.getElementById("fc-hanzi").textContent = w.hanzi;
        document.getElementById("fc-pinyin").textContent = w.pinyin;
        document.getElementById("fc-meaning").textContent = w.meaning;

        if (speakNow) {
            window.SoundEngine.speakChinese(w.hanzi);
        }
    }

    function renderHangarModal() {
        const progress = window.StorageService.getProgress();
        const masterySummary = window.StorageService.getMasterySummary
            ? window.StorageService.getMasterySummary()
            : { mastered: 0, familiar: 0, learning: 0, dueToday: 0, totalTracked: 0 };
        const settings = window.StorageService.getSettings();

        document.getElementById("hangar-streak").textContent = `🔥 ${progress.streakDays || 1} ngày`;
        document.getElementById("hangar-level").textContent = `Lv.${progress.pilotLevel || 1} (${progress.totalXp || 0} XP)`;
        const dueNote = masterySummary.dueToday ? ` • Cần ôn: ${masterySummary.dueToday}` : "";
        document.getElementById("hangar-mastered").textContent = `${masterySummary.mastered} từ (Đang học: ${masterySummary.totalTracked}${dueNote})`;
        document.getElementById("hangar-bosses").textContent = `🛸 ${progress.bossesDefeated || 0} Boss`;

        const goal = progress.dailyWordsGoal || 25;
        const done = progress.todayWordsCount || 0;
        const pct = Math.min(100, Math.round((done / goal) * 100));
        document.getElementById("hangar-quest-text").textContent = `${done} / ${goal} từ (${pct}%)`;
        document.getElementById("hangar-quest-fill").style.width = `${pct}%`;

        const skinsGrid = document.getElementById("hangar-skins-grid");
        skinsGrid.innerHTML = "";
        (window.StorageService.SHIP_SKINS || []).forEach(skin => {
            const isSelected = (settings.selectedSkinId || "cyan_nebula") === skin.id;
            const card = document.createElement("div");
            card.className = `skin-card ${isSelected ? "active" : ""}`;
            card.innerHTML = `
                <div class="skin-swatch-row">
                    <span style="font-size:11px;font-weight:700;color:${skin.shipColor};">🛸 MẪU CHIẾN CƠ</span>
                    <span class="unit-done-badge">${isSelected ? "✓ Đang trang bị" : escapeHtml(skin.badge)}</span>
                </div>
                <div class="ship-preview-wrap">
                    <canvas class="ship-preview-canvas" width="150" height="96"></canvas>
                </div>
                <strong style="font-size:14px;color:#f8fafc;">${escapeHtml(skin.name)}</strong>
                <span class="muted-note" style="font-size:11.5px;">${escapeHtml(skin.desc)}</span>
            `;
            const previewCanvas = card.querySelector(".ship-preview-canvas");
            if (previewCanvas && window.GameEntities && window.GameEntities.drawShipHull) {
                const pCtx = previewCanvas.getContext("2d");
                pCtx.translate(75, 48);
                window.GameEntities.drawShipHull(pCtx, skin.id, {
                    time: 1.25,
                    recoil: 0,
                    scale: 0.96,
                    comboHot: true
                });
            }
            card.addEventListener("click", () => {
                window.StorageService.saveSettings({ selectedSkinId: skin.id });
                renderHangarModal();
                showToast(`🛸 Đã trang bị chiến cơ: ${skin.name}!`);
            });
            skinsGrid.appendChild(card);
        });
    }

    function syncSettingsButtons() {
        const settings = window.StorageService.getSettings();
        const progress = window.StorageService.getProgress();

        const streakEl = document.getElementById("hud-streak-level");
        if (streakEl) {
            streakEl.textContent = `🔥 ${progress.streakDays || 1} Ngày • Lv.${progress.pilotLevel || 1}`;
        }

        const modeBtn = document.getElementById("btn-mode-cycle");
        if (modeBtn) {
            const meta = MODE_META[settings.gameMode || "auto"] || MODE_META.auto;
            modeBtn.innerHTML = `<span class="icon">${meta.icon}</span> <span>${meta.label}</span>`;
            modeBtn.classList.toggle(
                "active-pill",
                settings.gameMode === "meaning" || settings.gameMode === "listening" || settings.gameMode === "mixed"
            );
        }

        const diffBtn = document.getElementById("btn-difficulty-cycle");
        if (diffBtn && window.GameEngine.DIFFICULTY_PROFILES) {
            const profile = window.GameEngine.DIFFICULTY_PROFILES[settings.difficulty || "chill"]
                || window.GameEngine.DIFFICULTY_PROFILES.chill;
            diffBtn.innerHTML = `<span>${profile.label}</span>`;
        }

        const toneBtn = document.getElementById("btn-tone-mode");
        if (toneBtn) {
            toneBtn.innerHTML = settings.toneMode
                ? `<span class="icon">🎵</span> <span>Dấu: 1–4</span>`
                : `<span class="icon">🎵</span> <span>Dấu: Tự do</span>`;
            toneBtn.classList.toggle("active-pill", Boolean(settings.toneMode));
        }

        const kbToggleBtn = document.getElementById("btn-toggle-keyboard");
        if (kbToggleBtn) {
            const kbEl = document.getElementById("touch-keyboard");
            const isVisible = kbEl && !kbEl.classList.contains("hidden");
            kbToggleBtn.classList.toggle("active-pill", Boolean(isVisible));
        }

        const hintBtn = document.getElementById("btn-hint-mode");
        if (hintBtn) {
            hintBtn.innerHTML = settings.hintMode === "assist"
                ? `<span class="icon">💡</span> Gợi ý: BẬT`
                : `<span class="icon">🎯</span> Gợi ý`;
            hintBtn.classList.toggle("active-pill", settings.hintMode === "assist");
        }

        const audioBtn = document.getElementById("btn-toggle-audio");
        if (audioBtn) {
            audioBtn.innerHTML = settings.sfxEnabled
                ? `<span class="icon">🔊</span>`
                : `<span class="icon">🔇</span>`;
        }

        const speedBtn = document.getElementById("btn-speed-cycle");
        if (speedBtn) {
            speedBtn.innerHTML = `<span class="icon">⚡</span> ${settings.speedMultiplier || 0.85}x`;
        }

        const weakCount = window.StorageService.getWeakWords().length;
        const weakBadge = document.getElementById("weak-words-count");
        if (weakBadge) {
            weakBadge.textContent = weakCount;
        }
    }

    function updateHud(data) {
        const settings = window.StorageService.getSettings();
        const stageLabelEl = document.getElementById("hud-stage-label");
        if (stageLabelEl) stageLabelEl.textContent = data.stageLabel;

        const subtitleEl = document.getElementById("hud-subtitle-text");
        if (subtitleEl) {
            const toneSuffix = settings.toneMode ? " (kèm số dấu 1–4)" : "";
            if (data.bossActive) {
                subtitleEl.textContent = "🛸 BOSS BÀI KHÓA ĐANG XUẤT HIỆN! Gõ câu giao tiếp trọng tâm để hoàn thành bài học";
            } else if (data.effectiveMode === "meaning") {
                subtitleEl.textContent = "🇻🇳 Nhìn Hán tự + Pinyin đang rơi ➔ Gõ Nghĩa tiếng Việt không dấu để bắn";
            } else if (data.effectiveMode === "listening") {
                subtitleEl.textContent = `🎧 Lắng nghe giọng đọc tiếng Trung ➔ Gõ Pinyin${toneSuffix} để bắn hạ mục tiêu ẩn`;
            } else {
                subtitleEl.textContent = `🔤 Nhìn Hán tự đang rơi ➔ Gõ Pinyin${toneSuffix} để bắn hạ chúng`;
            }
        }

        const deckNameEl = document.getElementById("hud-deck-name");
        if (deckNameEl) deckNameEl.textContent = data.deckName;

        const progressEl = document.getElementById("hud-word-progress");
        if (progressEl) {
            progressEl.textContent = `${data.destroyedCount}/${data.totalUnitWords} từ`;
        }

        const scoreEl = document.getElementById("hud-score");
        if (scoreEl) scoreEl.textContent = data.score.toLocaleString();

        const comboEl = document.getElementById("hud-combo");
        if (comboEl) {
            comboEl.textContent = `x${data.combo}`;
            comboEl.parentElement.classList.toggle("combo-hot", data.combo >= 10);
        }

        const accEl = document.getElementById("hud-accuracy");
        if (accEl) accEl.textContent = `${data.accuracy}%`;

        const shieldsContainer = document.getElementById("hud-shields");
        if (shieldsContainer) {
            if (data.infiniteShields) {
                shieldsContainer.innerHTML = `<span class="zen-shield-badge">🧘 Khiên Bất Tử (∞)</span>`;
            } else {
                let html = "";
                for (let i = 0; i < data.maxShields; i++) {
                    const active = i < data.shields ? "shield-pip active" : "shield-pip lost";
                    html += `<span class="${active}"></span>`;
                }
                shieldsContainer.innerHTML = html;
            }
        }

        const pauseBtn = document.getElementById("btn-pause");
        if (pauseBtn) {
            pauseBtn.innerHTML = data.state === "PAUSED" ? "▶️" : "⏸️";
        }

        syncSettingsButtons();
    }

    function updateTargetIndicator(target) {
        const box = document.getElementById("locked-target-hud");
        if (!box) return;
        if (!target) {
            box.classList.add("hidden");
            return;
        }
        box.classList.remove("hidden");
        const settings = window.StorageService.getSettings();
        const showAssist =
            target.entityType === "boss"
                ? Boolean(target.revealHint)
                : settings.hintMode === "assist" || Boolean(target.revealHint);
        const untyped = target.targetPinyin.slice(target.typedProgress.length);

        let modeTag = `<span class="locked-mode-badge">Pinyin (${escapeHtml(target.meaningHint)}):</span>`;
        if (target.entityType === "boss") {
            modeTag = `<span class="locked-mode-badge" style="color:#fbbf24;">🛸 Boss Bài Khóa:</span>`;
        } else if (target.targetMode === "meaning") {
            modeTag = `<span class="locked-mode-badge" style="color:#fde047;">🇻🇳 Gõ nghĩa (${escapeHtml(target.meaningHint)}):</span>`;
        } else if (target.targetMode === "listening") {
            modeTag = `<span class="locked-mode-badge" style="color:#38bdf8;">🎧 Nghe Âm (${escapeHtml(target.meaningHint)}):</span>`;
        }

        const displayHanzi = target.targetMode === "listening" && !showAssist
            ? "🎧 ???"
            : escapeHtml(target.hanzi);

        box.innerHTML = `
            <span class="locked-hanzi">${displayHanzi} ${target.targetMode === "meaning" ? `<small style="color:#38bdf8;font-weight:500;">(${escapeHtml(target.pinyin)})</small>` : ""}</span>
            ${modeTag}
            <span class="locked-pinyin">
                <strong class="typed-green">${escapeHtml(target.typedProgress)}</strong><span class="untyped-dim">${showAssist ? escapeHtml(untyped) : "•".repeat(untyped.length)}</span>
            </span>
        `;
    }

    function renderUnitSelectorModal() {
        const deckTabsEl = document.getElementById("deck-tabs-container");
        const unitGridEl = document.getElementById("unit-cards-grid");
        const progress = window.StorageService.getProgress();
        const settings = window.StorageService.getSettings();

        const modalQuickBar = document.getElementById("modal-mode-diff-bar");
        if (modalQuickBar) {
            modalQuickBar.innerHTML = `
                <div class="quick-bar-group">
                    <span class="qb-label">Chế độ bắn:</span>
                    ${Object.keys(MODE_META).map(mKey => `
                        <button class="qb-pill ${(settings.gameMode || "auto") === mKey ? "active" : ""}" data-set-mode="${mKey}">
                            ${MODE_META[mKey].icon} ${MODE_META[mKey].label}
                        </button>
                    `).join("")}
                </div>
                <div class="quick-bar-group">
                    <span class="qb-label">Cấp độ & Dấu:</span>
                    ${DIFFICULTY_ORDER.map(dKey => {
                        const prof = window.GameEngine.DIFFICULTY_PROFILES[dKey];
                        return `
                            <button class="qb-pill ${(settings.difficulty || "chill") === dKey ? "active" : ""}" data-set-diff="${dKey}">
                                ${prof.label}
                            </button>
                        `;
                    }).join("")}
                    <button class="qb-pill ${settings.toneMode ? "active" : ""}" data-toggle-tone="1" title="Bật/tắt gõ số thanh điệu 1-4">
                        🎵 ${settings.toneMode ? "Dấu: 1–4" : "Dấu: Tự do"}
                    </button>
                </div>
            `;

            modalQuickBar.querySelectorAll("[data-set-mode]").forEach(b => {
                b.addEventListener("click", () => {
                    window.StorageService.saveSettings({ gameMode: b.dataset.setMode });
                    window.GameEngine.applyLiveSettingsChange();
                    syncSettingsButtons();
                    renderUnitSelectorModal();
                });
            });

            modalQuickBar.querySelectorAll("[data-set-diff]").forEach(b => {
                b.addEventListener("click", () => {
                    window.StorageService.saveSettings({ difficulty: b.dataset.setDiff });
                    window.GameEngine.applyLiveSettingsChange();
                    syncSettingsButtons();
                    renderUnitSelectorModal();
                });
            });

            const toneQuickBtn = modalQuickBar.querySelector("[data-toggle-tone]");
            if (toneQuickBtn) {
                toneQuickBtn.addEventListener("click", () => {
                    window.StorageService.saveSettings({ toneMode: !settings.toneMode });
                    window.GameEngine.applyLiveSettingsChange();
                    syncSettingsButtons();
                    renderUnitSelectorModal();
                });
            }
        }

        // Render HSK Deck Tabs
        deckTabsEl.innerHTML = "";
        window.VocabDatabase.DECKS.forEach((deck, dIdx) => {
            const btn = document.createElement("button");
            btn.className = `deck-tab-btn ${dIdx === activeDeckIndex ? "active" : ""}`;
            btn.innerHTML = `<span class="badge">${escapeHtml(deck.badge)}</span> <span>${escapeHtml(deck.name)}</span>`;
            btn.addEventListener("click", () => {
                activeDeckIndex = dIdx;
                activeUnitIndex = 0;
                renderUnitSelectorModal();
            });
            deckTabsEl.appendChild(btn);
        });

        // Render Units inside selected Deck
        const selectedDeck = window.VocabDatabase.DECKS[activeDeckIndex];
        unitGridEl.innerHTML = "";

        selectedDeck.units.forEach((unit, uIdx) => {
            const key = `${selectedDeck.id}_u${unit.unitNumber}`;
            const record = progress.completedUnits && progress.completedUnits[key];
            const starsCount = window.StorageService.getUnitStars
                ? window.StorageService.getUnitStars(selectedDeck.id, unit.unitNumber)
                : 0;
            const starsStr = starsCount > 0 ? "⭐".repeat(starsCount) : "";
            const isCurrent = !isCustomMode && uIdx === activeUnitIndex;
            const isMeaningUnit = unit.targetMode === "meaning";

            const previewHanzi = unit.words.slice(0, 6).map(w => escapeHtml(w.hanzi)).join(" • ");

            const card = document.createElement("div");
            card.className = `unit-card ${isCurrent ? "selected" : ""} ${record ? "completed" : ""} ${isMeaningUnit ? "meaning-unit-card" : ""}`;
            card.innerHTML = `
                <div class="unit-card-header">
                    <span class="unit-stage-tag">${escapeHtml(unit.stageLabel)}</span>
                    ${record ? `<span class="unit-done-badge">${starsStr} ${record.accuracy}%</span>` : `<span class="unit-count-badge">${unit.words.length} từ</span>`}
                </div>
                <h4 class="unit-card-title">${escapeHtml(unit.title)}</h4>
                <p class="unit-card-preview">${previewHanzi}...</p>
                <div class="unit-card-actions">
                    <button class="unit-mode-btn" data-study-unit="${uIdx}" title="Xem Flashcard & Học từ bài này trước">📖 Học</button>
                    <button class="unit-mode-btn" data-launch-mode="pinyin" title="Nhìn Hán tự ➔ Gõ Pinyin">🔤 Pinyin</button>
                    <button class="unit-mode-btn meaning-btn" data-launch-mode="meaning" title="Nhìn Hán tự + Pinyin ➔ Gõ Nghĩa">🇻🇳 Nghĩa</button>
                    <button class="unit-mode-btn" data-launch-mode="listening" title="Nghe phát âm ➔ Gõ Pinyin">🎧 Nghe</button>
                </div>
            `;

            card.addEventListener("click", e => {
                const studyBtnEl = e.target.closest("[data-study-unit]");
                const modeBtnEl = e.target.closest("[data-launch-mode]");
                activeUnitIndex = uIdx;
                if (studyBtnEl) {
                    e.stopPropagation();
                    closeAllModals();
                    renderStudyDeckModal(selectedDeck, unit);
                    openModal("modal-study-deck");
                } else if (modeBtnEl) {
                    e.stopPropagation();
                    startSelectedUnit(modeBtnEl.dataset.launchMode);
                } else {
                    startSelectedUnit("auto");
                }
            });
            unitGridEl.appendChild(card);
        });

        // Render Custom Units
        const customUnits = window.StorageService.getCustomUnits();
        const customSection = document.getElementById("custom-units-list");
        if (customSection) {
            if (customUnits.length === 0) {
                customSection.innerHTML = `<p class="muted-note">Chưa có bộ từ tự tạo. Nhấn <strong>"➕ Thêm từ"</strong> ở góc phải để dán từ vựng của riêng bạn.</p>`;
            } else {
                customSection.innerHTML = "";
                customUnits.forEach((cu, cIdx) => {
                    const item = document.createElement("div");
                    item.className = "custom-unit-row";
                    item.innerHTML = `
                        <div>
                            <strong>${escapeHtml(cu.title)}</strong>
                            <span class="muted-note">(${cu.words.length} từ: ${cu.words.slice(0, 5).map(w => escapeHtml(w.hanzi)).join(", ")})</span>
                        </div>
                        <div class="row-actions">
                            <button class="btn-primary btn-sm" data-play-custom="${cIdx}" data-custom-mode="pinyin">🔤 Gõ Pinyin</button>
                            <button class="btn-primary btn-sm" data-play-custom="${cIdx}" data-custom-mode="meaning" style="background:linear-gradient(135deg,#059669,#10b981);">🇻🇳 Gõ Nghĩa</button>
                            <button class="btn-ghost btn-sm" data-del-custom="${cIdx}">Xóa</button>
                        </div>
                    `;
                    customSection.appendChild(item);
                });

                customSection.querySelectorAll("[data-play-custom]").forEach(b => {
                    b.addEventListener("click", () => {
                        window.StorageService.saveSettings({ gameMode: b.dataset.customMode || "pinyin" });
                        startCustomUnitByIndex(Number(b.dataset.playCustom));
                    });
                });
                customSection.querySelectorAll("[data-del-custom]").forEach(b => {
                    b.addEventListener("click", () => {
                        window.StorageService.deleteCustomUnit(Number(b.dataset.delCustom));
                        renderUnitSelectorModal();
                    });
                });
            }
        }
    }

    function handleSaveCustomVocab() {
        const titleInput = document.getElementById("custom-unit-title");
        const rawTextarea = document.getElementById("custom-unit-words");
        const modeSelect = document.getElementById("custom-unit-mode");
        const rawLines = (rawTextarea.value || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        const parsedWords = [];
        rawLines.forEach(line => {
            const parts = line.split(/\s*[-|,;\t]\s*/).filter(Boolean);
            if (parts.length >= 3) {
                parsedWords.push({
                    hanzi: parts[0],
                    pinyin: parts[1],
                    meaning: parts.slice(2).join(" - ")
                });
            } else if (parts.length === 2) {
                parsedWords.push({
                    hanzi: parts[0],
                    pinyin: parts[1],
                    meaning: parts[0]
                });
            }
        });

        if (parsedWords.length === 0) {
            showToast("⚠️ Vui lòng nhập ít nhất 1 từ theo định dạng: Chữ Hán - Pinyin - Nghĩa");
            return;
        }

        const chosenMode = modeSelect ? modeSelect.value : "pinyin";
        const customUnits = window.StorageService.getCustomUnits();
        window.StorageService.addCustomUnit(
            titleInput.value.trim() || `Bài học cá nhân #${customUnits.length + 1}`,
            parsedWords,
            chosenMode
        );
        window.StorageService.saveSettings({ gameMode: chosenMode });

        titleInput.value = "";
        rawTextarea.value = "";
        showToast(`✅ Đã tạo màn chơi mới với ${parsedWords.length} từ vựng!`);
        startCustomUnitByIndex(customUnits.length);
    }

    function showUnitCompleteModal(stats) {
        document.getElementById("summary-unit-title").textContent = `${stats.stageLabel} • ${stats.unitTitle}`;
        document.getElementById("summary-score").textContent = stats.score.toLocaleString();
        document.getElementById("summary-accuracy").textContent = `${stats.accuracy}%`;
        document.getElementById("summary-cpm").textContent = `${stats.cpm} phím/phút`;
        document.getElementById("summary-combo").textContent = `x${stats.maxCombo}`;
        const starsEl = document.getElementById("summary-stars-badge");
        if (starsEl) {
            starsEl.textContent = "⭐".repeat(stats.stars || 3);
        }

        const listEl = document.getElementById("summary-words-list");
        listEl.innerHTML = "";
        (stats.learnedWords || []).forEach(w => {
            const row = document.createElement("div");
            row.className = `review-word-card ${w.hadMistake ? "needs-attention" : ""}`;
            row.innerHTML = `
                <div class="rw-main">
                    <span class="rw-hanzi">${escapeHtml(w.hanzi)}</span>
                    <span class="rw-pinyin">${escapeHtml(w.pinyin)}</span>
                    <span class="rw-meaning">${escapeHtml(w.meaning)}</span>
                </div>
                <button class="btn-speak-word" title="Nghe phát âm"></button>
            `;
            const speakBtn = row.querySelector(".btn-speak-word");
            if (speakBtn) {
                speakBtn.textContent = "🔊";
                speakBtn.addEventListener("click", () => {
                    window.SoundEngine.speakChinese(w.hanzi);
                });
            }
            listEl.appendChild(row);
        });

        syncSettingsButtons();
        openModal("modal-unit-complete");
    }

    function showGameOverModal(stats) {
        document.getElementById("gameover-progress").textContent = `${stats.wordsDestroyed}/${stats.totalUnitWords} từ`;
        const missedList = document.getElementById("gameover-missed-list");
        missedList.innerHTML = "";
        (stats.missedWords || []).forEach(w => {
            const div = document.createElement("div");
            div.className = "review-word-card needs-attention";
            div.innerHTML = `
                <div class="rw-main">
                    <span class="rw-hanzi">${escapeHtml(w.hanzi)}</span>
                    <span class="rw-pinyin">${escapeHtml(w.pinyin)}</span>
                    <span class="rw-meaning">${escapeHtml(w.meaning)}</span>
                </div>
                <button class="btn-speak-word" title="Nghe phát âm"></button>
            `;
            const speakBtn = div.querySelector(".btn-speak-word");
            if (speakBtn) {
                speakBtn.textContent = "🔊";
                speakBtn.addEventListener("click", () => {
                    window.SoundEngine.speakChinese(w.hanzi);
                });
            }
            missedList.appendChild(div);
        });
        openModal("modal-game-over");
    }

    function openModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove("hidden");
    }

    function closeAllModals() {
        document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.add("hidden"));
    }

    function isAnyModalOpen() {
        return Array.from(document.querySelectorAll(".modal-backdrop")).some(m => !m.classList.contains("hidden"));
    }

    function showToast(message) {
        const toast = document.getElementById("game-toast");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove("hidden");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.add("hidden");
        }, 2900);
    }

    return {
        init,
        navigateView,
        selectDeckAndUnit,
        openModal,
        closeAllModals,
        renderStudyDeckModal,
        renderHangarModal,
        renderUnitSelectorModal
    };
})();

window.addEventListener("DOMContentLoaded", () => {
    window.UIController.init();
});
