/**
 * Smart HSK Dictionary & 28 Core Radicals Explorer (📖 Từ Điển Hán Ngữ & Bộ Thủ)
 * Instant client-side + server-ready search across 930+ words by Hanzi, Pinyin, or Vietnamese.
 */
window.DictionaryView = (function () {
    let searchQuery = "";
    let deckFilter = "";
    let cachedIndex = null;

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function ensureIndex() {
        if (cachedIndex) return cachedIndex;
        cachedIndex = [];
        const db = window.VocabDatabase;
        (db.DECKS || []).forEach((deck, dIdx) => {
            (deck.units || []).forEach((unit, uIdx) => {
                (unit.words || []).forEach((w, wIdx) => {
                    cachedIndex.push({
                        word: w,
                        hanzi: w.hanzi,
                        pinyin: w.pinyin,
                        pinyinClean: w.pinyinClean || db.normalizePinyin(w.pinyin),
                        meaning: w.meaning,
                        meaningNorm: db.normalizeVietnamese(w.meaning),
                        deckId: deck.id,
                        deckBadge: deck.badge,
                        deckIdx: dIdx,
                        unitIdx: uIdx,
                        wordIdx: wIdx,
                        unitTitle: unit.title
                    });
                });
            });
        });
        return cachedIndex;
    }

    function render(containerEl, navCallbacks = {}) {
        if (!containerEl) return;
        const index = ensureIndex();
        const decks = window.VocabDatabase.DECKS || [];
        const radicals = window.CurriculumMeta.CORE_RADICALS || [];

        containerEl.innerHTML = `
            <div class="academy-page">
                <div class="lesson-header-card">
                    <span class="hub-tag-cyan">🔎 TỪ ĐIỂN HÁN NGỮ THÔNG MINH & BẢNG BỘ THỦ</span>
                    <h2 style="font-size:21px;margin:4px 0;">Tra cứu nhanh ${index.length}+ từ vựng HSK 0–5 (Chữ Hán, Pinyin không dấu hoặc Nghĩa tiếng Việt)</h2>

                    <div class="dict-search-bar">
                        <input id="dict-search-input" type="text" class="form-input" style="flex:1;"
                            aria-label="Tìm kiếm từ vựng tiếng Trung"
                            value="${escapeHtml(searchQuery)}"
                            placeholder="🔍 Nhập chữ Hán (你好), Pinyin (nihao / qianzheng) hoặc tiếng Việt (ngân hàng, thị thực)..." />
                        <select id="dict-deck-filter" class="form-input" style="min-width:210px;" aria-label="Lọc theo cấp độ HSK">
                            <option value="">Tất cả cấp độ HSK</option>
                            ${decks.map(d => `<option value="${d.id}" ${deckFilter === d.id ? "selected" : ""}>${escapeHtml(d.badge)}</option>`).join("")}
                        </select>
                    </div>

                    <div class="radicals-strip">
                        <span class="muted-note" style="font-weight:700;">🧩 Tra theo Bộ thủ:</span>
                        ${radicals
                            .slice(0, 16)
                            .map(
                                r => `
                            <button class="radical-chip" data-rad-examples="${escapeHtml(r.examples.split(",")[0].trim())}"
                                title="Bộ ${escapeHtml(r.hv)} (${escapeHtml(r.pinyin)}): ${escapeHtml(r.meaning)}">
                                <strong>${r.radical}</strong> <small>${escapeHtml(r.hv)}</small>
                            </button>
                        `
                            )
                            .join("")}
                    </div>
                </div>

                <div id="dict-results-container" class="vocab-detail-grid"></div>

                <!-- Full 28 Core Radicals Reference Table -->
                <section class="hub-card-panel" style="margin-top:16px;">
                    <h3 style="margin-bottom:10px;">📐 Bảng 28 Bộ Thủ Tiếng Trung Cốt Lõi Giúp Nhớ Chữ Nhanh Gấp 5 Lần</h3>
                    <div class="radicals-table-grid">
                        ${radicals
                            .map(
                                r => `
                            <div class="radical-ref-card">
                                <div class="rad-char">${r.radical}${r.alt ? `<small>/${r.alt}</small>` : ""}</div>
                                <div>
                                    <strong>Bộ ${escapeHtml(r.hv)} (${escapeHtml(r.pinyin)})</strong>
                                    <p class="muted-note" style="font-size:12px;">${escapeHtml(r.meaning)}</p>
                                    <span style="font-size:12px;color:#38bdf8;">VD: ${escapeHtml(r.examples)}</span>
                                </div>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                </section>
            </div>
        `;

        const resultsEl = containerEl.querySelector("#dict-results-container");
        const inputEl = containerEl.querySelector("#dict-search-input");
        const filterEl = containerEl.querySelector("#dict-deck-filter");

        const updateResults = () => {
            const qRaw = (inputEl.value || "").trim().toLowerCase();
            searchQuery = inputEl.value || "";
            deckFilter = filterEl.value || "";
            const qNorm = window.VocabDatabase.normalizeVietnamese(qRaw);

            const matches = [];
            const seen = new Set();
            for (const item of index) {
                if (deckFilter && item.deckId !== deckFilter) continue;
                const uniq = `${item.hanzi}_${item.deckId}`;
                if (seen.has(uniq)) continue;

                const ok =
                    !qRaw ||
                    item.hanzi.includes(qRaw) ||
                    item.pinyin.toLowerCase().includes(qRaw) ||
                    (qNorm && item.pinyinClean.includes(qNorm)) ||
                    item.meaning.toLowerCase().includes(qRaw) ||
                    (qNorm && item.meaningNorm.includes(qNorm));

                if (ok) {
                    seen.add(uniq);
                    matches.push(item);
                    if (matches.length >= 36) break;
                }
            }

            if (matches.length === 0) {
                resultsEl.innerHTML = `<div class="hub-card-panel">Không tìm thấy từ phù hợp với "${escapeHtml(searchQuery)}". Hãy thử gõ Pinyin không dấu hoặc từ khóa ngắn hơn!</div>`;
                return;
            }

            resultsEl.innerHTML = matches
                .map((item, idx) => {
                    const meta = window.CurriculumMeta.analyzeHanzi(item.word);
                    return `
                    <article class="vocab-teach-card">
                        <div class="vtc-top">
                            <span class="course-badge">${escapeHtml(item.deckBadge)}</span>
                            <span class="muted-note" style="font-size:11px;">${escapeHtml(item.unitTitle)}</span>
                        </div>
                        <div class="vtc-main">
                            <div class="vtc-hanzi">${escapeHtml(item.hanzi)}</div>
                            <div class="vtc-phonetic">
                                <div class="vtc-pinyin">${escapeHtml(item.pinyin)}</div>
                                <div class="vtc-meaning">${escapeHtml(item.meaning)}</div>
                            </div>
                        </div>
                        <div class="vtc-radical-box">
                            <div><strong>🧩 ${escapeHtml(meta.radical)}</strong></div>
                            <p class="vtc-mnemonic">💡 ${escapeHtml(meta.mnemonic)}</p>
                        </div>
                        <div class="vtc-actions">
                            <button class="btn-ghost btn-sm" data-dict-speak="${escapeHtml(item.hanzi)}">🔊 Nghe</button>
                            <button class="btn-ghost btn-sm" data-dict-pin="${idx}">📌 Lưu ôn tập</button>
                            <button class="btn-ghost btn-sm" data-dict-write="${idx}">✍️ Tập viết</button>
                        </div>
                    </article>
                `;
                })
                .join("");

            resultsEl.querySelectorAll("[data-dict-speak]").forEach(b => {
                b.addEventListener("click", () => window.SoundEngine.speakChinese(b.getAttribute("data-dict-speak")));
            });
            resultsEl.querySelectorAll("[data-dict-pin]").forEach(b => {
                b.addEventListener("click", () => {
                    const m = matches[Number(b.getAttribute("data-dict-pin"))];
                    if (m) {
                        window.StorageService.addWeakWord(m.word);
                        if (navCallbacks.onToast) navCallbacks.onToast(`📌 Đã lưu "${m.hanzi}" vào Sổ Tay Ôn Tập!`);
                    }
                });
            });
            resultsEl.querySelectorAll("[data-dict-write]").forEach(b => {
                b.addEventListener("click", () => {
                    const m = matches[Number(b.getAttribute("data-dict-write"))];
                    if (m && navCallbacks.onSelectDeckUnit) {
                        window.StorageService.saveSettings({ selectedDeckId: m.deckId, selectedUnitIndex: m.unitIdx });
                        navCallbacks.onNavigate("practice", { tab: "writing", wordIndex: m.wordIdx });
                    }
                });
            });
        };

        inputEl.addEventListener("input", updateResults);
        filterEl.addEventListener("change", updateResults);
        containerEl.querySelectorAll("[data-rad-examples]").forEach(chip => {
            chip.addEventListener("click", () => {
                inputEl.value = chip.getAttribute("data-rad-examples");
                updateResults();
            });
        });

        updateResults();
    }

    return { render };
})();
