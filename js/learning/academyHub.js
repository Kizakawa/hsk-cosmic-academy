/**
 * Academy Hub & Onboarding Module (🏠 Trang Chủ Học Viện & Kiểm Tra Đầu Vào)
 * Provides a structured learning dashboard, 7-day analytics chart, HSK 0-5 roadmap,
 * and an interactive 8-question Placement Test for beginners & returning learners.
 */
window.AcademyHub = (function () {
    let placementAnswers = [];
    let placementStep = 0;

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function render(containerEl, navCallbacks = {}) {
        if (!containerEl) return;
        const settings = window.StorageService.getSettings();
        const progress = window.StorageService.getProgress();
        const mastery = window.StorageService.getMasterySummary();
        const dueWords = window.StorageService.getDueSrsWords(30);
        const history7 = window.StorageService.getStudyHistory7Days();
        const authSession = window.StorageService.getAuthSession();

        const decks = window.VocabDatabase.DECKS || [];
        const activeDeckIdx = Math.max(0, decks.findIndex(d => d.id === settings.selectedDeckId));
        const activeDeck = decks[activeDeckIdx] || decks[0];
        const activeUnitIdx = Math.min(settings.selectedUnitIndex || 0, activeDeck.units.length - 1);
        const activeUnit = activeDeck.units[activeUnitIdx] || activeDeck.units[0];

        const dailyGoal = progress.dailyWordsGoal || 25;
        const todayCount = progress.todayWordsCount || 0;
        const dailyPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

        const maxChartVal = Math.max(25, ...history7.map(d => d.words));
        const userGreeting =
            authSession && authSession.user
                ? `${authSession.user.avatar || "🧑‍🚀"} Xin chào, ${escapeHtml(authSession.user.displayName)}!`
                : "👋 Chào mừng bạn đến với HSK Cosmic Academy!";

        containerEl.innerHTML = `
            <div class="academy-page">
                <!-- Hero Banner & Placement CTA -->
                <section class="hub-hero-card">
                    <div class="hub-hero-main">
                        <div class="hub-pill-row">
                            <span class="hub-tag-cyan">✨ Nền Tảng Học Tiếng Trung Toàn Diện 4-Trong-1</span>
                            ${settings.placementBadge ? `<span class="hub-tag-gold">🎯 Trình độ: ${escapeHtml(settings.placementBadge)}</span>` : ""}
                        </div>
                        <h1 class="hub-hero-title">${userGreeting}</h1>
                        <p class="hub-hero-desc">
                            Học tiếng Trung bài bản từ con số 0 đến HSK 5 theo chu trình khoa học:
                            <strong>1. Bài giảng Chiết tự & Ngữ pháp</strong> ➔
                            <strong>2. Luyện Viết, Đọc & Phát âm Mic</strong> ➔
                            <strong>3. Phản xạ Bắn Từ Vũ Trụ</strong> ➔
                            <strong>4. Ôn tập ngắt quãng SM-2</strong>.
                        </p>
                        <div class="hub-hero-actions">
                            <button id="hub-btn-continue-lesson" class="btn-primary">
                                📖 Học tiếp: ${escapeHtml(activeUnit.title)}
                            </button>
                            <button id="hub-btn-play-shooter" class="btn-primary btn-emerald">
                                🛸 Vào Game Bắn Từ Bài Này
                            </button>
                            <button id="hub-btn-placement" class="btn-ghost">
                                🧭 Kiểm Tra Trình Độ Đầu Vào (2 phút)
                            </button>
                        </div>
                    </div>

                    <!-- Daily Goal & Quick Stats Box -->
                    <div class="hub-daily-box">
                        <div class="hub-daily-top">
                            <div>
                                <span class="muted-note">Mục tiêu hôm nay</span>
                                <h3 class="hub-daily-num">${todayCount} / ${dailyGoal} <small>từ</small></h3>
                            </div>
                            <div class="hub-streak-chip">🔥 ${progress.streakDays || 1} ngày</div>
                        </div>
                        <div class="quest-bar-track" style="height:10px;">
                            <div class="quest-bar-fill" style="width:${dailyPct}%;"></div>
                        </div>
                        <div class="hub-mini-metrics">
                            <div><strong>Lv.${progress.pilotLevel || 1}</strong><span>${progress.totalXp || 0} XP</span></div>
                            <div><strong style="color:#4ade80;">${mastery.mastered}</strong><span>Đã thuộc lòng</span></div>
                            <div><strong style="color:#facc15;">${dueWords.length}</strong><span>Cần ôn SM-2</span></div>
                        </div>
                    </div>
                </section>

                <!-- Inline Placement Test Container (Hidden until triggered) -->
                <section id="hub-placement-box" class="hub-placement-panel hidden"></section>

                <!-- 4-Step Active Lesson Study Loop -->
                <section class="hub-section">
                    <div class="hub-section-header">
                        <h2>🎯 Lộ Trình Bài Đang Học: <span style="color:#38bdf8;">${escapeHtml(activeDeck.badge)} • ${escapeHtml(activeUnit.title)}</span></h2>
                        <span class="muted-note">${activeUnit.words.length} từ vựng trọng tâm</span>
                    </div>
                    <div class="hub-step-cards">
                        <div class="hub-step-card" data-hub-goto="lesson">
                            <span class="step-num">BƯỚC 1 • HIỂU SÂU</span>
                            <h3>📖 Bài Giảng, Bộ Thủ & Hội Thoại</h3>
                            <p>Giải nghĩa chiết tự từng chữ Hán, công thức ngữ pháp và nghe hội thoại A–B thực tế.</p>
                            <span class="step-cta">Mở Bài Giảng ➔</span>
                        </div>
                        <div class="hub-step-card" data-hub-goto="practice-write">
                            <span class="step-num">BƯỚC 2 • ĐA KỸ NĂNG</span>
                            <h3>✍️ Tập Viết Ô Chữ Điền & 5 Bài Tập</h3>
                            <p>Luyện viết nét chữ Hán, ghép thẻ, điền khuyết câu, sắp xếp câu và chấm điểm phát âm qua Mic.</p>
                            <span class="step-cta">Vào Phòng Luyện Tập ➔</span>
                        </div>
                        <div class="hub-step-card" data-hub-goto="shooter">
                            <span class="step-num">BƯỚC 3 • PHẢN XẠ SIÊU TỐC</span>
                            <h3>🛸 Game Bắn Từ Vựng Vũ Trụ</h3>
                            <p>Biến kiến thức thành phản xạ gõ Pinyin, Nghĩa & Nghe âm dưới 1 giây cùng Boss Bài Khóa.</p>
                            <span class="step-cta">Khởi Động Chiến Cơ ➔</span>
                        </div>
                        <div class="hub-step-card" data-hub-goto="practice-srs">
                            <span class="step-num">BƯỚC 4 • TRÍ NHỚ DÀI HẠN</span>
                            <h3>🧠 Ôn Thẻ Nhớ Thông Minh SM-2</h3>
                            <p>Thuật toán lặp lại ngắt quãng chuẩn Anki nhắc ôn đúng thời điểm sắp quên (${dueWords.length} từ đến hạn).</p>
                            <span class="step-cta">Ôn Tập Ngay (${dueWords.length}) ➔</span>
                        </div>
                    </div>
                </section>

                <!-- Analytics + Full HSK Curriculum Grid -->
                <div class="hub-two-col">
                    <section class="hub-card-panel">
                        <div class="hub-section-header">
                            <h3>📊 Biểu Đồ Chuyên Cần 7 Ngày Qua</h3>
                            <span class="muted-note"> Đã viết: ${progress.writingPracticed || 0} chữ</span>
                        </div>
                        <div class="hub-chart-bars">
                            ${history7
                                .map(day => {
                                    const hPct = Math.max(8, Math.round((day.words / maxChartVal) * 100));
                                    return `
                                    <div class="hub-bar-col" title="${day.date}: ${day.words} từ • ${day.xp} XP">
                                        <span class="bar-val">${day.words}</span>
                                        <div class="bar-track">
                                            <div class="bar-fill ${day.label === "Hôm nay" ? "today" : ""}" style="height:${hPct}%;"></div>
                                        </div>
                                        <span class="bar-label">${escapeHtml(day.label)}</span>
                                    </div>
                                `;
                                })
                                .join("")}
                        </div>
                        <div class="hub-srs-breakdown">
                            <div class="srs-pill"><span class="dot green"></span> Thành thạo: <strong>${mastery.mastered}</strong></div>
                            <div class="srs-pill"><span class="dot cyan"></span> Quen thuộc: <strong>${mastery.familiar}</strong></div>
                            <div class="srs-pill"><span class="dot gold"></span> Đang nhớ: <strong>${mastery.learning}</strong></div>
                        </div>
                    </section>

                    <section class="hub-card-panel">
                        <div class="hub-section-header">
                            <h3>🗺️ Hệ Thống Khóa Học Chuẩn HSK 0 – HSK 5</h3>
                            <span class="muted-note">930+ từ & mẫu câu</span>
                        </div>
                        <div class="hub-courses-list">
                            ${decks
                                .map((deck, dIdx) => {
                                    const totalU = deck.units.length;
                                    let doneU = 0;
                                    let wordSum = 0;
                                    deck.units.forEach(u => {
                                        wordSum += u.words.length;
                                        if (progress.completedUnits && progress.completedUnits[`${deck.id}_u${u.unitNumber}`]) {
                                            doneU++;
                                        }
                                    });
                                    const pct = Math.round((doneU / Math.max(1, totalU)) * 100);
                                    const isSelected = deck.id === activeDeck.id;
                                    return `
                                    <div class="hub-course-row ${isSelected ? "active" : ""}" data-select-deck="${dIdx}">
                                        <div class="course-row-info">
                                            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                                <span class="course-badge">${escapeHtml(deck.badge)}</span>
                                                <strong>${escapeHtml(deck.name)}</strong>
                                            </div>
                                            <span class="muted-note">${totalU} bài học • ${wordSum} từ vựng • Hoàn thành ${doneU}/${totalU} màn (${pct}%)</span>
                                        </div>
                                        <div class="course-row-actions">
                                            <button class="btn-ghost btn-sm" data-deck-study="${dIdx}">📖 Học</button>
                                            <button class="btn-primary btn-sm" data-deck-shoot="${dIdx}">🛸 Bắn</button>
                                        </div>
                                    </div>
                                `;
                                })
                                .join("")}
                        </div>
                    </section>
                </div>
            </div>
        `;

        // Bind Hub interactions
        const btnLesson = containerEl.querySelector("#hub-btn-continue-lesson");
        if (btnLesson) btnLesson.addEventListener("click", () => navCallbacks.onNavigate && navCallbacks.onNavigate("lesson"));

        const btnShooter = containerEl.querySelector("#hub-btn-play-shooter");
        if (btnShooter) btnShooter.addEventListener("click", () => navCallbacks.onNavigate && navCallbacks.onNavigate("shooter"));

        const btnPlace = containerEl.querySelector("#hub-btn-placement");
        if (btnPlace) {
            btnPlace.addEventListener("click", () => {
                startPlacementTest(containerEl, navCallbacks);
            });
        }

        containerEl.querySelectorAll("[data-hub-goto]").forEach(card => {
            card.addEventListener("click", () => {
                const target = card.getAttribute("data-hub-goto");
                if (target === "lesson") navCallbacks.onNavigate("lesson");
                else if (target === "shooter") navCallbacks.onNavigate("shooter");
                else if (target === "practice-write") navCallbacks.onNavigate("practice", { tab: "writing" });
                else if (target === "practice-srs") navCallbacks.onNavigate("practice", { tab: "flashcard", source: "srs" });
            });
        });

        containerEl.querySelectorAll("[data-deck-study]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const dIdx = Number(btn.getAttribute("data-deck-study"));
                if (navCallbacks.onSelectDeckUnit) navCallbacks.onSelectDeckUnit(dIdx, 0, "lesson");
            });
        });

        containerEl.querySelectorAll("[data-deck-shoot]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const dIdx = Number(btn.getAttribute("data-deck-shoot"));
                if (navCallbacks.onSelectDeckUnit) navCallbacks.onSelectDeckUnit(dIdx, 0, "shooter");
            });
        });

        containerEl.querySelectorAll("[data-select-deck]").forEach(row => {
            row.addEventListener("click", () => {
                const dIdx = Number(row.getAttribute("data-select-deck"));
                if (navCallbacks.onSelectDeckUnit) navCallbacks.onSelectDeckUnit(dIdx, 0, "lesson");
            });
        });
    }

    function startPlacementTest(containerEl, navCallbacks) {
        const panel = containerEl.querySelector("#hub-placement-box");
        if (!panel) return;
        placementAnswers = [];
        placementStep = 0;
        panel.classList.remove("hidden");
        renderPlacementQuestion(panel, containerEl, navCallbacks);
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function renderPlacementQuestion(panel, containerEl, navCallbacks) {
        const questions = window.CurriculumMeta.PLACEMENT_QUESTIONS;
        if (placementStep >= questions.length) {
            const result = window.CurriculumMeta.evaluatePlacement(placementAnswers);
            window.StorageService.saveSettings({
                selectedDeckId: result.deckId,
                selectedUnitIndex: result.unitIndex,
                onboardingCompleted: true,
                placementBadge: result.badge
            });
            window.StorageService.addXp(50, 0);

            panel.innerHTML = `
                <div class="placement-result-box">
                    <span class="hub-tag-gold">🎉 Kết Quả Kiểm Tra Đầu Vào: Đúng ${result.score}/${result.total} câu (+50 XP)</span>
                    <h3>Cấp độ đề xuất: ${escapeHtml(result.badge)}</h3>
                    <p class="muted-note" style="font-size:14px;max-width:680px;">${escapeHtml(result.advice)}</p>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                        <button id="btn-apply-placement-lesson" class="btn-primary">📖 Học Bài 1 Của Lộ Trình Này</button>
                        <button id="btn-apply-placement-shoot" class="btn-primary btn-emerald">🛸 Chơi Game Bắn Từ Cấp Độ Này</button>
                        <button id="btn-close-placement" class="btn-ghost">Đóng</button>
                    </div>
                </div>
            `;
            const deckIdx = Math.max(0, window.VocabDatabase.DECKS.findIndex(d => d.id === result.deckId));
            panel.querySelector("#btn-apply-placement-lesson").addEventListener("click", () => {
                if (navCallbacks.onSelectDeckUnit) navCallbacks.onSelectDeckUnit(deckIdx, 0, "lesson");
            });
            panel.querySelector("#btn-apply-placement-shoot").addEventListener("click", () => {
                if (navCallbacks.onSelectDeckUnit) navCallbacks.onSelectDeckUnit(deckIdx, 0, "shooter");
            });
            panel.querySelector("#btn-close-placement").addEventListener("click", () => {
                render(containerEl, navCallbacks);
            });
            return;
        }

        const q = questions[placementStep];
        panel.innerHTML = `
            <div class="placement-quiz-card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span class="hub-tag-cyan">🧭 Câu ${placementStep + 1}/${questions.length} • Cấp ${escapeHtml(q.tag)}</span>
                    <button id="btn-cancel-placement" class="btn-ghost btn-sm">✕ Đóng</button>
                </div>
                <h3 style="font-size:18px;margin:8px 0;">${escapeHtml(q.prompt)}</h3>
                <div class="placement-options-grid">
                    ${q.options
                        .map(
                            (opt, idx) => `
                        <button class="placement-opt-btn" data-opt-idx="${idx}">
                            <strong>${String.fromCharCode(65 + idx)}.</strong> ${escapeHtml(opt)}
                        </button>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;

        panel.querySelector("#btn-cancel-placement").addEventListener("click", () => {
            panel.classList.add("hidden");
        });

        panel.querySelectorAll("[data-opt-idx]").forEach(btn => {
            btn.addEventListener("click", () => {
                const chosen = Number(btn.getAttribute("data-opt-idx"));
                placementAnswers.push(chosen);
                if (chosen === q.correctIndex) {
                    window.SoundEngine.playWordExplosion();
                } else {
                    window.SoundEngine.playTypoError();
                }
                placementStep++;
                renderPlacementQuestion(panel, containerEl, navCallbacks);
            });
        });
    }

    return { render };
})();
