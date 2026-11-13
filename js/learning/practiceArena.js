/**
 * Multi-Skill Practice Arena Module (🎯 Phòng Luyện Tập 5 Kỹ Năng)
 * 1. Flashcard SM-2 (Anki-style 4-button grading)
 * 2. Tianzige (田字格) Chinese Character Handwriting Canvas with Pixel-Mask Grader
 * 3. Speed Matching Pairs (Hanzi <-> Meaning/Pinyin)
 * 4. Contextual Cloze & Listening Multiple-Choice Quiz
 * 5. Chinese Sentence Builder & Speech Mic Check
 */
window.PracticeArena = (function () {
    let activeTab = "flashcard"; // "flashcard" | "writing" | "matching" | "quiz" | "sentence"
    let wordSource = "unit"; // "unit" | "srs" | "weak"
    let currentIdx = 0;
    let isCardFlipped = false;

    // Handwriting state
    let charIndexInWord = 0;
    let showGhostGuide = true;
    let strokes = [];
    let currentStroke = null;

    // Matching state
    let matchTiles = [];
    let firstSelectedTile = null;
    let matchedCount = 0;

    // Quiz & Sentence state
    let quizIndex = 0;
    let sentenceIndex = 0;
    let pickedTokens = [];

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function shuffle(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    function resolveActiveWords() {
        const settings = window.StorageService.getSettings();
        const decks = window.VocabDatabase.DECKS || [];
        const deckIdx = Math.max(0, decks.findIndex(d => d.id === settings.selectedDeckId));
        const deck = decks[deckIdx] || decks[0];
        const unitIdx = Math.min(settings.selectedUnitIndex || 0, deck.units.length - 1);
        const unit = deck.units[unitIdx] || deck.units[0];

        if (wordSource === "srs") {
            const due = window.StorageService.getDueSrsWords(30);
            if (due.length > 0) return { label: `Hàng đợi Ôn tập SM-2 (${due.length} từ)`, words: due, deck, unit };
        } else if (wordSource === "weak") {
            const weak = window.StorageService.getWeakWords();
            if (weak.length > 0) return { label: `Sổ tay từ hay sai (${weak.length} từ)`, words: weak, deck, unit };
        }
        return { label: `${deck.badge} • ${unit.title}`, words: unit.words || [], deck, unit };
    }

    function render(containerEl, navCallbacks = {}, opts = {}) {
        if (!containerEl) return;
        if (opts.tab) activeTab = opts.tab;
        if (opts.source) wordSource = opts.source;
        if (typeof opts.wordIndex === "number") {
            currentIdx = opts.wordIndex;
            charIndexInWord = 0;
            strokes = [];
        }

        const ctxData = resolveActiveWords();
        const words = ctxData.words;
        if (currentIdx >= words.length) currentIdx = 0;

        const dueCount = window.StorageService.getDueSrsWords(50).length;
        const weakCount = window.StorageService.getWeakWords().length;

        containerEl.innerHTML = `
            <div class="academy-page">
                <div class="lesson-header-card">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                        <div>
                            <span class="hub-tag-cyan">🎯 PHÒNG LUYỆN TẬP ĐA KỸ NĂNG</span>
                            <h2 style="font-size:20px;margin-top:4px;">Nguồn từ: ${escapeHtml(ctxData.label)}</h2>
                        </div>
                        <div class="source-pills">
                            <button class="qb-pill ${wordSource === "unit" ? "active" : ""}" data-src="unit">📖 Bài đang học</button>
                            <button class="qb-pill ${wordSource === "srs" ? "active" : ""}" data-src="srs">🧠 Đến hạn SM-2 (${dueCount})</button>
                            <button class="qb-pill ${wordSource === "weak" ? "active" : ""}" data-src="weak">📓 Từ hay sai (${weakCount})</button>
                            <button id="arena-goto-shooter" class="btn-primary btn-emerald btn-sm">🛸 Bắn Phản Xạ</button>
                        </div>
                    </div>

                    <div class="subtab-bar" style="margin-top:12px;">
                        <button class="subtab-btn ${activeTab === "flashcard" ? "active" : ""}" data-ptab="flashcard">🃏 1. Thẻ Nhớ SM-2</button>
                        <button class="subtab-btn ${activeTab === "writing" ? "active" : ""}" data-ptab="writing">✍️ 2. Tập Viết Ô Điền</button>
                        <button class="subtab-btn ${activeTab === "matching" ? "active" : ""}" data-ptab="matching">🧩 3. Ghép Cặp Từ</button>
                        <button class="subtab-btn ${activeTab === "quiz" ? "active" : ""}" data-ptab="quiz">📝 4. Điền Khuyết Câu</button>
                        <button class="subtab-btn ${activeTab === "sentence" ? "active" : ""}" data-ptab="sentence">🔀 5. Xếp Câu & Nói</button>
                    </div>
                </div>

                <div id="arena-stage-body" class="lesson-body-wrap"></div>
            </div>
        `;

        containerEl.querySelectorAll("[data-src]").forEach(btn => {
            btn.addEventListener("click", () => {
                wordSource = btn.getAttribute("data-src");
                currentIdx = 0;
                matchTiles = [];
                render(containerEl, navCallbacks);
            });
        });

        containerEl.querySelectorAll("[data-ptab]").forEach(btn => {
            btn.addEventListener("click", () => {
                activeTab = btn.getAttribute("data-ptab");
                isCardFlipped = false;
                strokes = [];
                matchTiles = [];
                pickedTokens = [];
                render(containerEl, navCallbacks);
            });
        });

        containerEl.querySelector("#arena-goto-shooter").addEventListener("click", () => {
            navCallbacks.onNavigate && navCallbacks.onNavigate("shooter");
        });

        const stageEl = containerEl.querySelector("#arena-stage-body");
        if (activeTab === "flashcard") renderSm2Flashcard(stageEl, words, containerEl, navCallbacks);
        else if (activeTab === "writing") renderHandwritingStage(stageEl, words, containerEl, navCallbacks);
        else if (activeTab === "matching") renderMatchingStage(stageEl, words, containerEl, navCallbacks);
        else if (activeTab === "quiz") renderQuizStage(stageEl, ctxData, containerEl, navCallbacks);
        else renderSentenceBuilderStage(stageEl, ctxData, containerEl, navCallbacks);
    }

    /**
     * MODE 1: Anki-Grade SM-2 Spaced Repetition Flashcard
     */
    function renderSm2Flashcard(stageEl, words, containerEl, navCallbacks) {
        if (!words.length) {
            stageEl.innerHTML = `<div class="hub-card-panel">Chưa có từ nào trong danh sách này!</div>`;
            return;
        }
        const w = words[currentIdx % words.length];
        const meta = window.CurriculumMeta.analyzeHanzi(w);
        const mRec = window.StorageService.getWordMastery(w.hanzi);

        stageEl.innerHTML = `
            <div class="sm2-stage-wrap">
                <div class="sm2-card ${isCardFlipped ? "flipped" : ""}" id="sm2-flip-box">
                    <div class="fc-top-row">
                        <span class="fc-counter-badge">Thẻ ${currentIdx + 1} / ${words.length}</span>
                        <span class="fc-mastery-pill">SM-2 EF: ${mRec.easeFactor || 2.5} • Chu kỳ: ${mRec.intervalHours || 0}h</span>
                    </div>
                    <div class="sm2-hanzi">${escapeHtml(w.hanzi)}</div>
                    <button id="sm2-btn-audio" class="btn-ghost btn-sm" type="button">🔊 Nghe phát âm chuẩn</button>

                    ${
                        isCardFlipped
                            ? `
                        <div class="sm2-answer-zone">
                            <div class="fc-pinyin" style="font-size:22px;">${escapeHtml(w.pinyin)}</div>
                            <div class="fc-meaning" style="font-size:18px;">🇻🇳 ${escapeHtml(w.meaning)}</div>
                            <div class="vtc-radical-box" style="max-width:520px;margin:8px auto;">
                                <strong>🧩 Bộ thủ: ${escapeHtml(meta.radical)}</strong>
                                <p class="vtc-mnemonic">💡 ${escapeHtml(meta.mnemonic)}</p>
                            </div>
                        </div>
                    `
                            : `<p class="muted-note" style="margin-top:18px;">👆 Nhấn vào thẻ để lật xem Pinyin, Nghĩa & Chiết tự</p>`
                    }
                </div>

                <div class="sm2-grade-bar">
                    ${
                        !isCardFlipped
                            ? `<button id="sm2-btn-reveal" class="btn-primary" style="min-width:240px;">👁️ Hiện Đáp Án</button>`
                            : `
                        <button class="sm2-btn again" data-sm2-q="0">🔁 Quên<small>Ôn lại sau 10p</small></button>
                        <button class="sm2-btn hard" data-sm2-q="1">😓 Hơi khó<small>Ôn sau 4 giờ</small></button>
                        <button class="sm2-btn good" data-sm2-q="2">👍 Nhớ tốt<small>Ôn sau 1 ngày</small></button>
                        <button class="sm2-btn easy" data-sm2-q="3">⚡ Rất dễ<small>Ôn sau 3+ ngày</small></button>
                    `
                    }
                </div>
            </div>
        `;

        stageEl.querySelector("#sm2-btn-audio").addEventListener("click", e => {
            e.stopPropagation();
            window.SoundEngine.speakChinese(w.hanzi);
        });

        const flipCard = () => {
            if (!isCardFlipped) {
                isCardFlipped = true;
                window.SoundEngine.speakChinese(w.hanzi);
                renderSm2Flashcard(stageEl, words, containerEl, navCallbacks);
            }
        };

        stageEl.querySelector("#sm2-flip-box").addEventListener("click", flipCard);
        const revBtn = stageEl.querySelector("#sm2-btn-reveal");
        if (revBtn) revBtn.addEventListener("click", flipCard);

        stageEl.querySelectorAll("[data-sm2-q]").forEach(btn => {
            btn.addEventListener("click", () => {
                const q = Number(btn.getAttribute("data-sm2-q"));
                window.StorageService.recordSm2Review(w, q, "flashcard");
                if (q >= 2) window.SoundEngine.playWordExplosion();
                else window.SoundEngine.playLaserShot(1);
                isCardFlipped = false;
                currentIdx = (currentIdx + 1) % words.length;
                renderSm2Flashcard(stageEl, words, containerEl, navCallbacks);
            });
        });
    }

    /**
     * MODE 2: Tianzige (田字格) Chinese Character Handwriting Canvas
     */
    function renderHandwritingStage(stageEl, words, containerEl, navCallbacks) {
        const w = words[currentIdx % words.length];
        const chars = Array.from(w.hanzi).filter(c => /[\u4e00-\u9fff]/.test(c));
        const targetChar = chars[charIndexInWord % Math.max(1, chars.length)] || w.hanzi.charAt(0);
        const meta = window.CurriculumMeta.analyzeHanzi({ hanzi: targetChar, pinyin: w.pinyin, meaning: w.meaning });

        stageEl.innerHTML = `
            <div class="writing-layout">
                <div class="writing-canvas-card">
                    <div class="char-tabs-row">
                        ${chars
                            .map(
                                (ch, idx) =>
                                    `<button class="qb-pill ${idx === charIndexInWord ? "active" : ""}" data-char-tab="${idx}">Chữ 「${ch}」</button>`
                            )
                            .join("")}
                    </div>

                    <div class="tianzige-wrap">
                        <canvas id="tianzige-canvas" width="280" height="280"></canvas>
                    </div>

                    <div class="writing-controls">
                        <button id="btn-write-ghost" class="btn-ghost btn-sm">${showGhostGuide ? "🙈 Ẩn nét mẫu" : "👁️ Hiện nét mẫu"}</button>
                        <button id="btn-write-undo" class="btn-ghost btn-sm">↩️ Hoàn tác nét</button>
                        <button id="btn-write-clear" class="btn-ghost btn-sm">🗑️ Xóa viết lại</button>
                        <button id="btn-write-grade" class="btn-primary btn-sm">✅ Chấm Nét Chữ</button>
                    </div>
                    <div id="write-grade-feedback" class="muted-note" style="min-height:22px;font-weight:600;">
                        ✍️ Dùng chuột hoặc ngón tay viết chữ 「${targetChar}」 theo thứ tự: Ngang trước sổ sau, trên trước dưới sau, trái trước phải sau.
                    </div>
                </div>

                <div class="writing-info-card">
                    <span class="hub-tag-cyan">Từ ${currentIdx + 1}/${words.length}</span>
                    <h2 style="font-size:36px;font-family:'Noto Sans SC',sans-serif;margin:4px 0;">${escapeHtml(w.hanzi)}</h2>
                    <div class="fc-pinyin">${escapeHtml(w.pinyin)}</div>
                    <div class="fc-meaning">🇻🇳 ${escapeHtml(w.meaning)}</div>
                    <div class="vtc-radical-box" style="margin:12px 0;">
                        <strong>🧩 Bộ thủ chữ 「${targetChar}」: ${escapeHtml(meta.radical)}</strong>
                        <p class="vtc-mnemonic">💡 ${escapeHtml(meta.mnemonic)}</p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;">
                        <button id="btn-write-prev-word" class="btn-ghost btn-sm">⏮️ Từ trước</button>
                        <button id="btn-write-speak" class="btn-ghost btn-sm">🔊 Nghe âm</button>
                        <button id="btn-write-next-word" class="btn-primary btn-sm">Từ tiếp theo ⏭️</button>
                    </div>
                </div>
            </div>
        `;

        const cvs = stageEl.querySelector("#tianzige-canvas");
        const ctx = cvs.getContext("2d");

        function redrawTianzige() {
            ctx.clearRect(0, 0, 280, 280);
            ctx.fillStyle = "#0b1126";
            ctx.fillRect(0, 0, 280, 280);

            // Outer border & Tianzige red dashed crosshairs
            ctx.strokeStyle = "rgba(248, 113, 113, 0.42)";
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 4, 272, 272);

            ctx.save();
            ctx.setLineDash([6, 6]);
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "rgba(248, 113, 113, 0.28)";
            ctx.beginPath();
            ctx.moveTo(140, 4); ctx.lineTo(140, 276);
            ctx.moveTo(4, 140); ctx.lineTo(276, 140);
            ctx.moveTo(4, 4); ctx.lineTo(276, 276);
            ctx.moveTo(276, 4); ctx.lineTo(4, 276);
            ctx.stroke();
            ctx.restore();

            if (showGhostGuide) {
                ctx.save();
                ctx.font = "700 188px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(148, 163, 184, 0.17)";
                ctx.fillText(targetChar, 140, 146);
                ctx.restore();
            }

            // Draw user calligraphy strokes
            ctx.save();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 13;
            ctx.strokeStyle = "#38bdf8";
            ctx.shadowColor = "rgba(56, 189, 248, 0.45)";
            ctx.shadowBlur = 6;
            const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
            allStrokes.forEach(pts => {
                if (pts.length === 0) return;
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x, pts[i].y);
                }
                if (pts.length === 1) ctx.lineTo(pts[0].x + 0.5, pts[0].y + 0.5);
                ctx.stroke();
            });
            ctx.restore();
        }

        redrawTianzige();

        const getPoint = e => {
            const rect = cvs.getBoundingClientRect();
            return {
                x: ((e.clientX - rect.left) / rect.width) * 280,
                y: ((e.clientY - rect.top) / rect.height) * 280
            };
        };

        cvs.addEventListener("pointerdown", e => {
            e.preventDefault();
            cvs.setPointerCapture(e.pointerId);
            currentStroke = [getPoint(e)];
            redrawTianzige();
        });
        cvs.addEventListener("pointermove", e => {
            if (!currentStroke) return;
            currentStroke.push(getPoint(e));
            redrawTianzige();
        });
        const finishStroke = () => {
            if (currentStroke && currentStroke.length > 0) {
                strokes.push(currentStroke);
                currentStroke = null;
                redrawTianzige();
            }
        };
        cvs.addEventListener("pointerup", finishStroke);
        cvs.addEventListener("pointercancel", finishStroke);

        stageEl.querySelectorAll("[data-char-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                charIndexInWord = Number(btn.getAttribute("data-char-tab"));
                strokes = [];
                renderHandwritingStage(stageEl, words, containerEl, navCallbacks);
            });
        });

        stageEl.querySelector("#btn-write-ghost").addEventListener("click", () => {
            showGhostGuide = !showGhostGuide;
            renderHandwritingStage(stageEl, words, containerEl, navCallbacks);
        });
        stageEl.querySelector("#btn-write-undo").addEventListener("click", () => {
            strokes.pop();
            redrawTianzige();
        });
        stageEl.querySelector("#btn-write-clear").addEventListener("click", () => {
            strokes = [];
            redrawTianzige();
        });
        stageEl.querySelector("#btn-write-speak").addEventListener("click", () => {
            window.SoundEngine.speakChinese(w.hanzi);
        });
        stageEl.querySelector("#btn-write-prev-word").addEventListener("click", () => {
            currentIdx = (currentIdx - 1 + words.length) % words.length;
            charIndexInWord = 0;
            strokes = [];
            renderHandwritingStage(stageEl, words, containerEl, navCallbacks);
        });
        stageEl.querySelector("#btn-write-next-word").addEventListener("click", () => {
            currentIdx = (currentIdx + 1) % words.length;
            charIndexInWord = 0;
            strokes = [];
            renderHandwritingStage(stageEl, words, containerEl, navCallbacks);
        });

        stageEl.querySelector("#btn-write-grade").addEventListener("click", () => {
            const fb = stageEl.querySelector("#write-grade-feedback");
            if (strokes.length === 0) {
                fb.style.color = "#facc15";
                fb.textContent = "⚠️ Bạn hãy viết các nét chữ lên bảng trước khi bấm Chấm điểm nhé!";
                return;
            }
            const score = evaluateHandwritingCoverage(targetChar, strokes);
            if (score >= 48) {
                window.SoundEngine.playWordExplosion();
                window.SoundEngine.speakChinese(w.hanzi);
                window.StorageService.recordSm2Review(w, score >= 75 ? 3 : 2, "writing");
                fb.style.color = "#4ade80";
                fb.textContent = `🌟 Tuyệt vời! Độ khớp nét chữ 「${targetChar}」 đạt ${score}% (${strokes.length} nét) — +20 XP!`;
            } else {
                window.SoundEngine.playTypoError();
                fb.style.color = "#f87171";
                fb.textContent = `🔄 Độ khớp đạt ${score}%. Hãy bật Nét mẫu và viết cân đối vào giữa ô chữ Điền nhé!`;
            }
        });
    }

    function evaluateHandwritingCoverage(targetChar, strokeList) {
        const refCvs = document.createElement("canvas");
        refCvs.width = 280;
        refCvs.height = 280;
        const rCtx = refCvs.getContext("2d");
        rCtx.font = "700 188px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
        rCtx.textAlign = "center";
        rCtx.textBaseline = "middle";
        rCtx.fillStyle = "#ffffff";
        rCtx.fillText(targetChar, 140, 146);

        const usrCvs = document.createElement("canvas");
        usrCvs.width = 280;
        usrCvs.height = 280;
        const uCtx = usrCvs.getContext("2d");
        uCtx.lineCap = "round";
        uCtx.lineJoin = "round";
        uCtx.lineWidth = 22;
        uCtx.strokeStyle = "#ffffff";
        strokeList.forEach(pts => {
            if (!pts.length) return;
            uCtx.beginPath();
            uCtx.moveTo(pts[0].x, pts[0].y);
            pts.forEach(p => uCtx.lineTo(p.x, p.y));
            uCtx.stroke();
        });

        const refData = rCtx.getImageData(0, 0, 280, 280).data;
        const usrData = uCtx.getImageData(0, 0, 280, 280).data;
        let refPixels = 0;
        let overlapPixels = 0;
        let outsidePixels = 0;

        for (let i = 3; i < refData.length; i += 16) {
            const inRef = refData[i] > 60;
            const inUsr = usrData[i] > 60;
            if (inRef) refPixels++;
            if (inRef && inUsr) overlapPixels++;
            else if (!inRef && inUsr) outsidePixels++;
        }

        if (refPixels === 0) return 75;
        const recall = overlapPixels / refPixels;
        const penalty = Math.max(0, (outsidePixels - refPixels * 0.45) / refPixels) * 0.6;
        return Math.max(10, Math.min(99, Math.round((recall * 1.15 - penalty) * 100)));
    }

    /**
     * MODE 3: Speed Matching Pairs
     */
    function renderMatchingStage(stageEl, words, containerEl, navCallbacks) {
        if (matchTiles.length === 0) {
            const sample = shuffle(words).slice(0, Math.min(6, words.length));
            const rawTiles = [];
            sample.forEach((w, idx) => {
                rawTiles.push({ id: `h_${idx}`, pairKey: w.hanzi, type: "hanzi", label: w.hanzi, sub: w.pinyin, word: w, matched: false });
                rawTiles.push({
                    id: `m_${idx}`,
                    pairKey: w.hanzi,
                    type: "meaning",
                    label: window.VocabDatabase.getDisplayMeaningHint(w),
                    sub: "Nghĩa tiếng Việt",
                    word: w,
                    matched: false
                });
            });
            matchTiles = shuffle(rawTiles);
            firstSelectedTile = null;
            matchedCount = 0;
        }

        const allCleared = matchTiles.every(t => t.matched);
        stageEl.innerHTML = `
            <div class="hub-card-panel">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3>🧩 Ghép Cặp Chữ Hán & Nghĩa Tiếng Việt (${matchedCount}/${matchTiles.length / 2} cặp)</h3>
                    <button id="btn-reset-match" class="btn-ghost btn-sm">🔄 Đổi bộ thẻ mới</button>
                </div>
                ${
                    allCleared
                        ? `<div class="placement-result-box" style="text-align:center;">
                            <h3>🎉 Xuất sắc! Bạn đã ghép đúng toàn bộ các cặp từ (+30 XP)!</h3>
                            <button id="btn-match-again" class="btn-primary">⚡ Ghép ván tiếp theo</button>
                           </div>`
                        : `<div class="match-grid">
                            ${matchTiles
                                .map(
                                    t => `
                                <button class="match-tile ${t.matched ? "matched" : ""} ${firstSelectedTile && firstSelectedTile.id === t.id ? "selected" : ""}"
                                    data-tile-id="${t.id}" ${t.matched ? "disabled" : ""}>
                                    <strong class="${t.type === "hanzi" ? "tile-hz" : "tile-vi"}">${escapeHtml(t.label)}</strong>
                                    <small>${escapeHtml(t.sub)}</small>
                                </button>
                            `
                                )
                                .join("")}
                           </div>`
                }
            </div>
        `;

        const resetMatch = () => {
            matchTiles = [];
            renderMatchingStage(stageEl, words, containerEl, navCallbacks);
        };
        stageEl.querySelector("#btn-reset-match").addEventListener("click", resetMatch);
        const againBtn = stageEl.querySelector("#btn-match-again");
        if (againBtn) againBtn.addEventListener("click", resetMatch);

        stageEl.querySelectorAll("[data-tile-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                const tile = matchTiles.find(t => t.id === btn.getAttribute("data-tile-id"));
                if (!tile || tile.matched) return;
                if (tile.type === "hanzi") window.SoundEngine.speakChinese(tile.word.hanzi);

                if (!firstSelectedTile) {
                    firstSelectedTile = tile;
                    renderMatchingStage(stageEl, words, containerEl, navCallbacks);
                    return;
                }
                if (firstSelectedTile.id === tile.id) {
                    firstSelectedTile = null;
                    renderMatchingStage(stageEl, words, containerEl, navCallbacks);
                    return;
                }
                if (firstSelectedTile.pairKey === tile.pairKey && firstSelectedTile.type !== tile.type) {
                    firstSelectedTile.matched = true;
                    tile.matched = true;
                    matchedCount++;
                    window.SoundEngine.playWordExplosion();
                    window.SoundEngine.speakChinese(tile.word.hanzi);
                    window.StorageService.recordSm2Review(tile.word, 2, "matching");
                    firstSelectedTile = null;
                    renderMatchingStage(stageEl, words, containerEl, navCallbacks);
                } else {
                    window.SoundEngine.playTypoError();
                    firstSelectedTile = null;
                    renderMatchingStage(stageEl, words, containerEl, navCallbacks);
                }
            });
        });
    }

    /**
     * MODE 4: Contextual Cloze Sentence Quiz
     */
    function renderQuizStage(stageEl, ctxData, containerEl, navCallbacks) {
        const guide = window.CurriculumMeta.getLessonGuide(ctxData.deck.id, { title: ctxData.label, words: ctxData.words });
        const items = guide.contextualSentences;
        if (!items.length) return;
        const item = items[quizIndex % items.length];
        const distractors = shuffle(ctxData.words.filter(w => w.hanzi !== item.targetWord.hanzi)).slice(0, 3);
        const options = shuffle([item.targetWord, ...distractors]);

        stageEl.innerHTML = `
            <div class="hub-card-panel" style="max-width:740px;margin:0 auto;">
                <span class="hub-tag-cyan">📝 Câu ${ (quizIndex % items.length) + 1 }/${items.length} • Điền Từ Vào Ngữ Cảnh</span>
                <div style="font-size:26px;font-weight:800;font-family:'Noto Sans SC',sans-serif;margin:14px 0;">
                    ${escapeHtml(item.cloze)}
                </div>
                <p class="muted-note" style="font-size:15px;margin-bottom:16px;">🇻🇳 Dịch nghĩa: ${escapeHtml(item.vi)}</p>
                <div class="placement-options-grid">
                    ${options
                        .map(
                            opt => `
                        <button class="placement-opt-btn" data-quiz-hz="${escapeHtml(opt.hanzi)}">
                            <strong style="font-size:19px;">${escapeHtml(opt.hanzi)}</strong>
                            <span style="color:#38bdf8;margin-left:6px;">(${escapeHtml(opt.pinyin)})</span>
                        </button>
                    `
                        )
                        .join("")}
                </div>
                <div id="quiz-feedback" style="margin-top:14px;font-weight:700;"></div>
            </div>
        `;

        stageEl.querySelectorAll("[data-quiz-hz]").forEach(btn => {
            btn.addEventListener("click", () => {
                const chosen = btn.getAttribute("data-quiz-hz");
                const fb = stageEl.querySelector("#quiz-feedback");
                if (chosen === item.targetWord.hanzi) {
                    window.SoundEngine.playWordExplosion();
                    window.SoundEngine.speakChinese(item.hanzi);
                    window.StorageService.recordSm2Review(item.targetWord, 2, "quiz");
                    fb.style.color = "#4ade80";
                    fb.textContent = `✅ Chính xác! ${item.hanzi} (${item.pinyin})`;
                    setTimeout(() => {
                        quizIndex++;
                        renderQuizStage(stageEl, ctxData, containerEl, navCallbacks);
                    }, 1100);
                } else {
                    window.SoundEngine.playTypoError();
                    fb.style.color = "#f87171";
                    fb.textContent = `❌ Chưa đúng! Hãy đọc kỹ nghĩa tiếng Việt và chọn lại nhé.`;
                }
            });
        });
    }

    /**
     * MODE 5: Chinese Sentence Builder & Speech Mic Check
     */
    function renderSentenceBuilderStage(stageEl, ctxData, containerEl, navCallbacks) {
        const guide = window.CurriculumMeta.getLessonGuide(ctxData.deck.id, { title: ctxData.label, words: ctxData.words });
        const list = guide.contextualSentences;
        if (!list.length) return;
        const item = list[sentenceIndex % list.length];
        const targetTokens = item.tokens;
        const pool = shuffle(targetTokens.map((t, idx) => ({ id: idx, text: t })));

        const renderInner = () => {
            const assembled = pickedTokens.map(t => t.text).join("");
            const expected = targetTokens.join("");
            const isComplete = pickedTokens.length === targetTokens.length;
            const isCorrect = isComplete && assembled === expected;

            stageEl.innerHTML = `
                <div class="hub-card-panel" style="max-width:760px;margin:0 auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span class="hub-tag-cyan">🔀 Sắp Xếp Câu Tiếng Trung & Luyện Nói (${(sentenceIndex % list.length) + 1}/${list.length})</span>
                        <button id="btn-sb-listen" class="btn-ghost btn-sm">🔊 Nghe câu mẫu</button>
                    </div>
                    <h3 style="margin:12px 0;">🇻🇳 Hãy xếp thành câu: "${escapeHtml(item.vi)}"</h3>

                    <div class="sentence-dropzone">
                        ${
                            pickedTokens.length === 0
                                ? `<span class="muted-note">Nhấn các mảnh chữ Hán bên dưới theo đúng thứ tự...</span>`
                                : pickedTokens
                                      .map((tok, pIdx) => `<button class="word-chip active" data-remove-idx="${pIdx}">${escapeHtml(tok.text)}</button>`)
                                      .join("")
                        }
                    </div>

                    <div class="sentence-pool">
                        ${pool
                            .map(tok => {
                                const used = pickedTokens.some(p => p.id === tok.id);
                                return `<button class="word-chip" data-pick-id="${tok.id}" ${used ? "disabled style='opacity:0.3'" : ""}>${escapeHtml(tok.text)}</button>`;
                            })
                            .join("")}
                    </div>

                    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px;">
                        <button id="btn-sb-reset" class="btn-ghost btn-sm">↩️ Xếp lại</button>
                        <button id="btn-sb-mic" class="btn-primary btn-purple btn-sm">🎙️ Đọc câu này qua Mic</button>
                        <button id="btn-sb-next" class="btn-primary btn-sm">Câu tiếp theo ⏭️</button>
                    </div>
                    <div id="sb-feedback" style="margin-top:10px;font-weight:700;color:${isCorrect ? "#4ade80" : "#facc15"};">
                        ${
                            isComplete
                                ? isCorrect
                                    ? `🌟 Tuyệt vời! Câu hoàn chỉnh: ${item.hanzi} (${item.pinyin})`
                                    : `⚠️ Thứ tự chưa chuẩn. Nhấn "Xếp lại" và thử lại nhé!`
                                : ""
                        }
                    </div>
                </div>
            `;

            if (isCorrect) {
                window.SoundEngine.playWordExplosion();
                window.SoundEngine.speakChinese(item.hanzi);
                window.StorageService.recordSm2Review(item.targetWord, 2, "sentence");
            }

            stageEl.querySelector("#btn-sb-listen").addEventListener("click", () => window.SoundEngine.speakChinese(item.hanzi, 0.9));
            stageEl.querySelector("#btn-sb-reset").addEventListener("click", () => {
                pickedTokens = [];
                renderInner();
            });
            stageEl.querySelector("#btn-sb-next").addEventListener("click", () => {
                pickedTokens = [];
                sentenceIndex++;
                renderSentenceBuilderStage(stageEl, ctxData, containerEl, navCallbacks);
            });
            stageEl.querySelector("#btn-sb-mic").addEventListener("click", async () => {
                const fb = stageEl.querySelector("#sb-feedback");
                fb.style.color = "#38bdf8";
                fb.textContent = `🎙️ Đang lắng nghe... Hãy đọc: "${item.hanzi}"`;
                const res = await window.SoundEngine.assessSpeechPronunciation(item.hanzi);
                fb.style.color = res.ok ? "#4ade80" : "#facc15";
                fb.textContent = res.feedback;
            });

            stageEl.querySelectorAll("[data-pick-id]").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = Number(btn.getAttribute("data-pick-id"));
                    const tok = pool.find(p => p.id === id);
                    if (tok) {
                        pickedTokens.push(tok);
                        window.SoundEngine.playLaserShot(pickedTokens.length);
                        renderInner();
                    }
                });
            });
            stageEl.querySelectorAll("[data-remove-idx]").forEach(btn => {
                btn.addEventListener("click", () => {
                    pickedTokens.splice(Number(btn.getAttribute("data-remove-idx")), 1);
                    renderInner();
                });
            });
        };

        renderInner();
    }

    return { render };
})();
