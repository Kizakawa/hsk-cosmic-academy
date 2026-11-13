/**
 * Structured Lesson Studio Module (📖 Bài Giảng, Chiết Tự Bộ Thủ, Ngữ Pháp & Hội Thoại)
 * Turns raw vocabulary lists into a complete textbook-grade interactive Chinese lesson.
 */
window.LessonStudio = (function () {
    let activeSubTab = "vocab"; // "vocab" | "grammar" | "dialogue"
    let showDialoguePinyin = true;
    let showDialogueVi = true;
    let dialogueTimer = null;

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function getMasteryPill(hanzi) {
        const m = window.StorageService.getWordMastery(hanzi);
        if (m.level >= 3) return { label: "🟢 Thuộc lòng", color: "#4ade80" };
        if (m.level === 2) return { label: "🔵 Quen mặt", color: "#38bdf8" };
        if (m.level === 1) return { label: "🟡 Đang nhớ", color: "#facc15" };
        return { label: "⚪ Từ mới", color: "#94a3b8" };
    }

    function render(containerEl, navCallbacks = {}) {
        if (!containerEl) return;
        clearTimeout(dialogueTimer);

        const settings = window.StorageService.getSettings();
        const decks = window.VocabDatabase.DECKS || [];
        const deckIdx = Math.max(0, decks.findIndex(d => d.id === settings.selectedDeckId));
        const deck = decks[deckIdx] || decks[0];
        const unitIdx = Math.min(settings.selectedUnitIndex || 0, deck.units.length - 1);
        const unit = deck.units[unitIdx] || deck.units[0];
        const guide = window.CurriculumMeta.getLessonGuide(deck.id, unit);

        containerEl.innerHTML = `
            <div class="academy-page">
                <!-- Lesson Top Selector Header -->
                <div class="lesson-header-card">
                    <div class="lesson-selector-row">
                        <div class="selector-field">
                            <label for="lesson-deck-select">📚 Cấp độ / Giáo trình:</label>
                            <select id="lesson-deck-select" class="form-input">
                                ${decks
                                    .map(
                                        (d, i) =>
                                            `<option value="${i}" ${i === deckIdx ? "selected" : ""}>${escapeHtml(d.badge)} — ${escapeHtml(d.name)}</option>`
                                    )
                                    .join("")}
                            </select>
                        </div>
                        <div class="selector-field">
                            <label for="lesson-unit-select">📖 Bài học:</label>
                            <select id="lesson-unit-select" class="form-input">
                                ${deck.units
                                    .map(
                                        (u, i) =>
                                            `<option value="${i}" ${i === unitIdx ? "selected" : ""}>${escapeHtml(u.title)} (${u.words.length} từ)</option>`
                                    )
                                    .join("")}
                            </select>
                        </div>
                    </div>

                    <div class="lesson-title-banner">
                        <div>
                            <span class="hub-tag-cyan">${escapeHtml(unit.stageLabel)}</span>
                            <h2 style="font-size:22px;margin:4px 0;">${escapeHtml(unit.title)}</h2>
                            <p class="muted-note">${escapeHtml(guide.overview)}</p>
                        </div>
                        <div class="lesson-quick-ctas">
                            <button id="lesson-btn-practice" class="btn-primary">✍️ Luyện 5 Kỹ Năng Bài Này</button>
                            <button id="lesson-btn-shoot" class="btn-primary btn-emerald">🛸 Bắn Phản Xạ Bài Này</button>
                        </div>
                    </div>

                    <!-- Lesson Sub-navigation Tabs -->
                    <div class="subtab-bar">
                        <button class="subtab-btn ${activeSubTab === "vocab" ? "active" : ""}" data-subtab="vocab">
                            🔤 1. Từ Mới & Chiết Tự Bộ Thủ (${unit.words.length})
                        </button>
                        <button class="subtab-btn ${activeSubTab === "grammar" ? "active" : ""}" data-subtab="grammar">
                            📐 2. Ngữ Pháp Trọng Tâm (${guide.grammarPoints.length})
                        </button>
                        <button class="subtab-btn ${activeSubTab === "dialogue" ? "active" : ""}" data-subtab="dialogue">
                            💬 3. Hội Thoại & Đọc Hiểu (${guide.dialogue.length} câu)
                        </button>
                    </div>
                </div>

                <!-- Dynamic Sub-tab Body -->
                <div id="lesson-subtab-body" class="lesson-body-wrap"></div>

                <!-- Lesson Footer Completion -->
                <div class="lesson-complete-bar">
                    <div>
                        <strong>🎯 Đã xem xong lý thuyết bài này?</strong>
                        <span class="muted-note" style="display:block;">Nhận +40 XP chuyên cần và bước sang Phòng Luyện Tập Đa Kỹ Năng để nhớ sâu gấp 3 lần!</span>
                    </div>
                    <button id="btn-finish-lesson-theory" class="btn-primary">✅ Hoàn Thành Lý Thuyết (+40 XP) ➔ Luyện Tập</button>
                </div>
            </div>
        `;

        const bodyEl = containerEl.querySelector("#lesson-subtab-body");
        if (activeSubTab === "vocab") {
            renderVocabSubtab(bodyEl, unit, navCallbacks);
        } else if (activeSubTab === "grammar") {
            renderGrammarSubtab(bodyEl, guide);
        } else {
            renderDialogueSubtab(bodyEl, guide);
        }

        // Bind Selectors & Tabs
        containerEl.querySelector("#lesson-deck-select").addEventListener("change", e => {
            const nextDeckIdx = Number(e.target.value);
            if (navCallbacks.onSelectDeckUnit) navCallbacks.onSelectDeckUnit(nextDeckIdx, 0, "lesson");
        });

        containerEl.querySelector("#lesson-unit-select").addEventListener("change", e => {
            const nextUnitIdx = Number(e.target.value);
            if (navCallbacks.onSelectDeckUnit) navCallbacks.onSelectDeckUnit(deckIdx, nextUnitIdx, "lesson");
        });

        containerEl.querySelectorAll("[data-subtab]").forEach(btn => {
            btn.addEventListener("click", () => {
                activeSubTab = btn.getAttribute("data-subtab");
                render(containerEl, navCallbacks);
            });
        });

        containerEl.querySelector("#lesson-btn-practice").addEventListener("click", () => {
            navCallbacks.onNavigate && navCallbacks.onNavigate("practice", { tab: "flashcard" });
        });

        containerEl.querySelector("#lesson-btn-shoot").addEventListener("click", () => {
            navCallbacks.onNavigate && navCallbacks.onNavigate("shooter");
        });

        containerEl.querySelector("#btn-finish-lesson-theory").addEventListener("click", () => {
            window.StorageService.markLessonStudied(deck.id, unit.unitNumber);
            window.SoundEngine.playWordExplosion();
            if (navCallbacks.onToast) navCallbacks.onToast("🎉 Đã hoàn thành lý thuyết (+40 XP)! Chuyển sang Luyện Tập Đa Kỹ Năng.");
            if (navCallbacks.onNavigate) navCallbacks.onNavigate("practice", { tab: "writing" });
        });
    }

    function renderVocabSubtab(bodyEl, unit, navCallbacks) {
        const words = unit.words || [];
        bodyEl.innerHTML = `
            <div class="vocab-detail-grid">
                ${words
                    .map((w, idx) => {
                        const meta = window.CurriculumMeta.analyzeHanzi(w);
                        const mPill = getMasteryPill(w.hanzi);
                        return `
                        <article class="vocab-teach-card">
                            <div class="vtc-top">
                                <span class="vtc-idx">#${idx + 1}</span>
                                <span class="vtc-mastery" style="color:${mPill.color};">${mPill.label}</span>
                            </div>
                            <div class="vtc-main">
                                <div class="vtc-hanzi">${escapeHtml(w.hanzi)}</div>
                                <div class="vtc-phonetic">
                                    <div class="vtc-pinyin">${escapeHtml(w.pinyin)}</div>
                                    <div class="vtc-meaning">${escapeHtml(w.meaning)}</div>
                                </div>
                            </div>
                            <div class="vtc-radical-box">
                                <div><strong>🧩 Bộ thủ:</strong> <span>${escapeHtml(meta.radical)}</span></div>
                                <p class="vtc-mnemonic">💡 ${escapeHtml(meta.mnemonic)}</p>
                            </div>
                            <div class="vtc-actions">
                                <button class="btn-ghost btn-sm" data-speak-normal="${escapeHtml(w.hanzi)}" title="Nghe giọng đọc chuẩn">🔊 Chuẩn</button>
                                <button class="btn-ghost btn-sm" data-speak-slow="${escapeHtml(w.hanzi)}" title="Nghe chậm 0.68x để bắt âm">🐢 Chậm</button>
                                <button class="btn-ghost btn-sm" data-mic-check="${escapeHtml(w.hanzi)}" title="Đọc vào Mic để AI chấm phát âm">🎙️ Đọc thử</button>
                                <button class="btn-ghost btn-sm" data-write-word="${idx}" title="Tập viết nét chữ Hán vào ô chữ Điền">✍️ Tập viết</button>
                            </div>
                            <div id="mic-status-${idx}" class="vtc-mic-feedback hidden"></div>
                        </article>
                    `;
                    })
                    .join("")}
            </div>
        `;

        bodyEl.querySelectorAll("[data-speak-normal]").forEach(btn => {
            btn.addEventListener("click", () => {
                window.SoundEngine.speakChinese(btn.getAttribute("data-speak-normal"), 0.96);
            });
        });

        bodyEl.querySelectorAll("[data-speak-slow]").forEach(btn => {
            btn.addEventListener("click", () => {
                window.SoundEngine.speakChinese(btn.getAttribute("data-speak-slow"), 0.65);
            });
        });

        bodyEl.querySelectorAll("[data-write-word]").forEach(btn => {
            btn.addEventListener("click", () => {
                const wordIdx = Number(btn.getAttribute("data-write-word"));
                if (navCallbacks.onNavigate) {
                    navCallbacks.onNavigate("practice", { tab: "writing", wordIndex: wordIdx });
                }
            });
        });

        bodyEl.querySelectorAll("[data-mic-check]").forEach((btn, idx) => {
            btn.addEventListener("click", async () => {
                const hanzi = btn.getAttribute("data-mic-check");
                const fbEl = bodyEl.querySelector(`#mic-status-${idx}`);
                if (fbEl) {
                    fbEl.classList.remove("hidden");
                    fbEl.style.color = "#38bdf8";
                    fbEl.textContent = `🎙️ Đang lắng nghe... Hãy đọc to "${hanzi}"!`;
                }
                const res = await window.SoundEngine.assessSpeechPronunciation(hanzi);
                if (res.ok) {
                    const wObj = words[idx];
                    if (wObj) window.StorageService.recordSm2Review(wObj, 2, "pronunciation");
                }
                if (fbEl) {
                    fbEl.style.color = res.ok ? "#4ade80" : "#facc15";
                    fbEl.textContent = res.feedback;
                }
            });
        });
    }

    function renderGrammarSubtab(bodyEl, guide) {
        bodyEl.innerHTML = `
            <div class="grammar-cards-stack">
                ${guide.grammarPoints
                    .map(
                        (gp, idx) => `
                    <article class="grammar-card">
                        <div class="grammar-badge">📐 ĐIỂM NGỮ PHÁP #${idx + 1}: ${escapeHtml(gp.title)}</div>
                        <div class="grammar-formula">${escapeHtml(gp.pattern)}</div>
                        <p class="grammar-explain">${escapeHtml(gp.explanation)}</p>
                        <div class="grammar-example-box">
                            <div>
                                <div class="ge-hanzi">${escapeHtml(gp.exampleHanzi)}</div>
                                <div class="ge-pinyin">${escapeHtml(gp.examplePinyin)}</div>
                                <div class="ge-vi">🇻🇳 ${escapeHtml(gp.exampleVi)}</div>
                            </div>
                            <button class="btn-primary btn-sm" data-speak-ex="${escapeHtml(gp.exampleHanzi)}">🔊 Nghe mẫu câu</button>
                        </div>
                    </article>
                `
                    )
                    .join("")}
            </div>
        `;

        bodyEl.querySelectorAll("[data-speak-ex]").forEach(btn => {
            btn.addEventListener("click", () => {
                window.SoundEngine.speakChinese(btn.getAttribute("data-speak-ex"), 0.9);
            });
        });
    }

    function renderDialogueSubtab(bodyEl, guide) {
        bodyEl.innerHTML = `
            <div class="dialogue-container">
                <div class="dialogue-toolbar">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button id="btn-toggle-dlg-pinyin" class="btn-ghost btn-sm ${showDialoguePinyin ? "active-pill" : ""}">
                            ${showDialoguePinyin ? "👁️ Đang hiện Pinyin" : "🙈 Đã ẩn Pinyin (Luyện đọc chữ Hán)"}
                        </button>
                        <button id="btn-toggle-dlg-vi" class="btn-ghost btn-sm ${showDialogueVi ? "active-pill" : ""}">
                            ${showDialogueVi ? "👁️ Đang hiện Dịch Việt" : "🙈 Đã ẩn Dịch Việt (Luyện dịch)"}
                        </button>
                    </div>
                    <button id="btn-play-all-dialogue" class="btn-primary btn-sm">▶ Nghe Toàn Bộ Hội Thoại</button>
                </div>

                <div class="dialogue-bubbles">
                    ${guide.dialogue
                        .map(
                            (turn, idx) => `
                        <div class="dialogue-turn ${idx % 2 === 1 ? "turn-right" : ""}">
                            <div class="dlg-avatar">${turn.avatar}</div>
                            <div class="dlg-bubble">
                                <div class="dlg-speaker-row">
                                    <strong>${escapeHtml(turn.speaker)}</strong>
                                    <button class="btn-speak-word" data-dlg-speak="${escapeHtml(turn.hanzi)}" title="Nghe câu này">🔊</button>
                                </div>
                                <div class="dlg-hanzi">${escapeHtml(turn.hanzi)}</div>
                                ${showDialoguePinyin ? `<div class="dlg-pinyin">${escapeHtml(turn.pinyin)}</div>` : ""}
                                ${showDialogueVi ? `<div class="dlg-vi">${escapeHtml(turn.vi)}</div>` : ""}
                            </div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;

        bodyEl.querySelector("#btn-toggle-dlg-pinyin").addEventListener("click", () => {
            showDialoguePinyin = !showDialoguePinyin;
            renderDialogueSubtab(bodyEl, guide);
        });

        bodyEl.querySelector("#btn-toggle-dlg-vi").addEventListener("click", () => {
            showDialogueVi = !showDialogueVi;
            renderDialogueSubtab(bodyEl, guide);
        });

        bodyEl.querySelectorAll("[data-dlg-speak]").forEach(btn => {
            btn.addEventListener("click", () => {
                window.SoundEngine.speakChinese(btn.getAttribute("data-dlg-speak"), 0.92);
            });
        });

        bodyEl.querySelector("#btn-play-all-dialogue").addEventListener("click", () => {
            clearTimeout(dialogueTimer);
            let i = 0;
            const playNext = () => {
                if (i >= guide.dialogue.length) return;
                window.SoundEngine.speakChinese(guide.dialogue[i].hanzi, 0.92);
                i++;
                dialogueTimer = setTimeout(playNext, 3400);
            };
            playNext();
        });
    }

    return { render };
})();
