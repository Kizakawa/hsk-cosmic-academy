/**
 * Cloud Account, Backup/Restore, Leaderboard & Shared Community Decks Modal
 * Connects learners to persistent cloud accounts, JSON data portability, and teacher-shared decks.
 */
window.CommunityModal = (function () {
    let activeTab = "account"; // "account" | "leaderboard" | "shared"

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    async function render(modalBodyEl, callbacks = {}) {
        if (!modalBodyEl) return;
        const serverUp = await window.ApiClient.checkServerHealth();
        const authSession = window.StorageService.getAuthSession();

        modalBodyEl.innerHTML = `
            <div class="subtab-bar" style="margin-bottom:14px;">
                <button class="subtab-btn ${activeTab === "account" ? "active" : ""}" data-ctab="account">
                    👤 Tài Khoản & Sao Lưu (${serverUp ? "🟢 Cloud Online" : "🟡 Offline Local"})
                </button>
                <button class="subtab-btn ${activeTab === "leaderboard" ? "active" : ""}" data-ctab="leaderboard">
                    🏆 Bảng Xếp Hạng
                </button>
                <button class="subtab-btn ${activeTab === "shared" ? "active" : ""}" data-ctab="shared">
                    📚 Kho Học Liệu Cộng Đồng
                </button>
            </div>
            <div id="community-tab-content"></div>
        `;

        modalBodyEl.querySelectorAll("[data-ctab]").forEach(btn => {
            btn.addEventListener("click", () => {
                activeTab = btn.getAttribute("data-ctab");
                render(modalBodyEl, callbacks);
            });
        });

        const contentEl = modalBodyEl.querySelector("#community-tab-content");
        if (activeTab === "account") {
            renderAccountTab(contentEl, authSession, serverUp, modalBodyEl, callbacks);
        } else if (activeTab === "leaderboard") {
            await renderLeaderboardTab(contentEl);
        } else {
            await renderSharedDecksTab(contentEl, callbacks);
        }
    }

    function renderAccountTab(contentEl, authSession, serverUp, modalBodyEl, callbacks) {
        const progress = window.StorageService.getProgress();
        const mastery = window.StorageService.getMasterySummary();

        if (authSession && authSession.user) {
            const u = authSession.user;
            contentEl.innerHTML = `
                <div class="account-profile-box">
                    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
                        <div class="avatar-circle">${escapeHtml(u.avatar || "🧑‍🚀")}</div>
                        <div style="flex:1;">
                            <h3 style="font-size:18px;">${escapeHtml(u.displayName)} <small style="color:#38bdf8;">(@${escapeHtml(u.username)})</small></h3>
                            <p class="muted-note">
                                Trạng thái: <strong>${authSession.mode === "cloud" && serverUp ? "☁️ Đã đồng bộ SQLite Server" : "💾 Hồ sơ thiết bị cục bộ"}</strong>
                                • Lv.${progress.pilotLevel} (${progress.totalXp} XP) • Thuộc ${mastery.mastered} từ
                            </p>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button id="btn-sync-now" class="btn-primary btn-sm">☁️ Đồng bộ ngay</button>
                            <button id="btn-logout-acc" class="btn-ghost btn-sm">Đăng xuất</button>
                        </div>
                    </div>
                </div>
                ${renderBackupSectionHtml()}
            `;

            contentEl.querySelector("#btn-sync-now").addEventListener("click", async () => {
                const ok = await window.ApiClient.pushCloudSync();
                if (callbacks.onToast) {
                    callbacks.onToast(ok ? "☁️ Đã đồng bộ toàn bộ tiến trình học lên máy chủ!" : "💾 Đã lưu an toàn trên thiết bị (Bật server để đồng bộ đám mây).");
                }
            });

            contentEl.querySelector("#btn-logout-acc").addEventListener("click", async () => {
                await window.ApiClient.logoutAccount();
                if (callbacks.onAuthChanged) callbacks.onAuthChanged();
                render(modalBodyEl, callbacks);
            });
        } else {
            contentEl.innerHTML = `
                <div class="auth-forms-grid">
                    <div class="hub-card-panel">
                        <h3>✨ Đăng Ký Tài Khoản Học Viên</h3>
                        <p class="muted-note" style="margin-bottom:10px;">Lưu tiến trình SM-2, chuỗi ngày học 🔥 và đồng bộ trên mọi trình duyệt.</p>
                        <div class="form-group">
                            <label for="reg-display">Tên hiển thị</label>
                            <input id="reg-display" class="form-input" placeholder="VD: Minh Anh HSK" />
                        </div>
                        <div class="form-group" style="margin-top:8px;">
                            <label for="reg-username">Tên đăng nhập (viết liền)</label>
                            <input id="reg-username" class="form-input" placeholder="VD: minhanh99" />
                        </div>
                        <div class="form-group" style="margin-top:8px;">
                            <label for="reg-password">Mật khẩu (tối thiểu 6 ký tự)</label>
                            <input id="reg-password" type="password" class="form-input" placeholder="••••••" />
                        </div>
                        <button id="btn-do-register" class="btn-primary" style="margin-top:12px;width:100%;">🚀 Tạo Tài Khoản & Lưu Tiến Trình</button>
                    </div>

                    <div class="hub-card-panel">
                        <h3>🔐 Đăng Nhập Tài Khoản Đã Có</h3>
                        <p class="muted-note" style="margin-bottom:10px;">Khôi phục toàn bộ từ vựng đã học và bảng xếp hạng của bạn.</p>
                        <div class="form-group">
                            <label for="login-username">Tên đăng nhập</label>
                            <input id="login-username" class="form-input" placeholder="Nhập username..." />
                        </div>
                        <div class="form-group" style="margin-top:8px;">
                            <label for="login-password">Mật khẩu</label>
                            <input id="login-password" type="password" class="form-input" placeholder="••••••" />
                        </div>
                        <button id="btn-do-login" class="btn-primary btn-emerald" style="margin-top:12px;width:100%;">🔓 Đăng Nhập & Đồng Bộ Về Máy</button>
                        <div id="auth-error-msg" style="margin-top:10px;font-size:12.5px;color:#f87171;"></div>
                    </div>
                </div>
                ${renderBackupSectionHtml()}
            `;

            const errEl = contentEl.querySelector("#auth-error-msg");
            contentEl.querySelector("#btn-do-register").addEventListener("click", async () => {
                try {
                    const displayName = contentEl.querySelector("#reg-display").value.trim();
                    const username = contentEl.querySelector("#reg-username").value.trim();
                    const password = contentEl.querySelector("#reg-password").value;
                    const res = await window.ApiClient.registerAccount({ username, displayName, password });
                    if (callbacks.onToast) callbacks.onToast(`🎉 Chào mừng ${res.user.displayName}! Tiến trình đã được bảo vệ.`);
                    if (callbacks.onAuthChanged) callbacks.onAuthChanged();
                    render(modalBodyEl, callbacks);
                } catch (err) {
                    errEl.textContent = `⚠️ ${err.message}`;
                }
            });

            contentEl.querySelector("#btn-do-login").addEventListener("click", async () => {
                try {
                    const username = contentEl.querySelector("#login-username").value.trim();
                    const password = contentEl.querySelector("#login-password").value;
                    const res = await window.ApiClient.loginAccount({ username, password });
                    if (callbacks.onToast) callbacks.onToast(`✅ Đã đăng nhập & đồng bộ tài khoản ${res.user.displayName}!`);
                    if (callbacks.onAuthChanged) callbacks.onAuthChanged();
                    render(modalBodyEl, callbacks);
                } catch (err) {
                    errEl.textContent = `⚠️ ${err.message}`;
                }
            });
        }

        bindBackupEvents(contentEl, callbacks);
    }

    function renderBackupSectionHtml() {
        return `
            <div class="hub-card-panel" style="margin-top:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <div>
                        <h4>🛡️ Sao Lưu & Khôi Phục File Hồ Sơ Học Tập (.JSON)</h4>
                        <p class="muted-note">Không bao giờ lo mất tiến trình khi xóa cache hoặc chuyển đổi giữa Máy tính & Điện thoại.</p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button id="btn-export-json" class="btn-ghost btn-sm">📥 Tải File Sao Lưu (.json)</button>
                        <label for="input-import-json" class="btn-ghost btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;">
                            📤 Nhập File Khôi Phục
                            <input id="input-import-json" type="file" accept=".json,application/json" style="display:none;" />
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    function bindBackupEvents(contentEl, callbacks) {
        const expBtn = contentEl.querySelector("#btn-export-json");
        if (expBtn) {
            expBtn.addEventListener("click", () => {
                const payload = JSON.stringify(window.StorageService.exportFullState(), null, 2);
                const blob = new Blob([payload], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `hsk_academy_backup_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                if (callbacks.onToast) callbacks.onToast("📥 Đã tải xuống file sao lưu tiến trình học tập!");
            });
        }

        const impInput = contentEl.querySelector("#input-import-json");
        if (impInput) {
            impInput.addEventListener("change", e => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const parsed = JSON.parse(String(reader.result || "{}"));
                        window.StorageService.importFullState(parsed, true);
                        if (callbacks.onAuthChanged) callbacks.onAuthChanged();
                        if (callbacks.onToast) callbacks.onToast("✅ Đã khôi phục thành công dữ liệu học tập!");
                    } catch {
                        if (callbacks.onToast) callbacks.onToast("⚠️ File sao lưu không hợp lệ.");
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    async function renderLeaderboardTab(contentEl) {
        contentEl.innerHTML = `<p class="muted-note">⏳ Đang tải bảng xếp hạng học viên...</p>`;
        const list = await window.ApiClient.fetchLeaderboard();
        contentEl.innerHTML = `
            <div class="leaderboard-list">
                ${list
                    .map(
                        item => `
                    <div class="lb-row ${item.rank <= 3 ? "lb-top" : ""}">
                        <span class="lb-rank">${item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}</span>
                        <span class="lb-avatar">${escapeHtml(item.avatar || "🧑‍🚀")}</span>
                        <div style="flex:1;">
                            <strong>${escapeHtml(item.displayName)}</strong>
                            <span class="muted-note" style="display:block;font-size:11.5px;">
                                🔥 Chuỗi ${item.streakDays} ngày • 🟢 Đã thuộc ${item.masteredWords} từ
                            </span>
                        </div>
                        <div style="text-align:right;">
                            <strong style="color:#facc15;">${(item.xp || 0).toLocaleString()} XP</strong>
                            <span class="muted-note" style="display:block;font-size:11px;">Lv.${item.pilotLevel}</span>
                        </div>
                    </div>
                `
                    )
                    .join("")}
            </div>
        `;
    }

    async function renderSharedDecksTab(contentEl, callbacks) {
        const sharedDecks = await window.ApiClient.fetchCommunityDecks();
        const customUnits = window.StorageService.getCustomUnits();

        contentEl.innerHTML = `
            <div class="hub-card-panel">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                    <div>
                        <h3>📚 Bộ Từ Vựng Chuyên Ngành Từ Giáo Viên & Cộng Đồng</h3>
                        <p class="muted-note">Tải về máy chỉ với 1 cú nhấp để học Flashcard, Tập viết hoặc Bắn từ phản xạ.</p>
                    </div>
                </div>
                ${
                    sharedDecks.length === 0
                        ? `<p class="muted-note">Hãy khởi động máy chủ (\`npm start\` hoặc \`start_game.bat\`) để kết nối Kho Học Liệu Cộng Đồng!</p>`
                        : sharedDecks
                              .map(
                                  (sd, idx) => `
                            <div class="custom-unit-row">
                                <div>
                                    <span class="course-badge">${escapeHtml(sd.hskTag)}</span>
                                    <strong style="margin-left:6px;">${escapeHtml(sd.title)}</strong>
                                    <span class="muted-note" style="display:block;margin-top:3px;">
                                        Tác giả: ${escapeHtml(sd.authorName)} • ${sd.words.length} từ (${sd.words.slice(0, 5).map(w => escapeHtml(w.hanzi)).join(", ")}...)
                                    </span>
                                </div>
                                <button class="btn-primary btn-sm" data-install-shared="${idx}">📥 Tải về & Học ngay</button>
                            </div>
                        `
                              )
                              .join("")
                }

                ${
                    customUnits.length > 0
                        ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.16);">
                            <div style="font-size:13px;font-weight:700;">📤 Chia sẻ Bộ từ cá nhân của bạn lên Cộng đồng:</div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                                ${customUnits.map((cu, cIdx) => `<button class="btn-ghost btn-sm" data-share-custom="${cIdx}">🌐 Đăng bộ "${escapeHtml(cu.title)}"</button>`).join("")}
                            </div>
                           </div>`
                        : ""
                }
            </div>
        `;

        contentEl.querySelectorAll("[data-install-shared]").forEach(btn => {
            btn.addEventListener("click", () => {
                const sd = sharedDecks[Number(btn.getAttribute("data-install-shared"))];
                if (!sd) return;
                window.StorageService.addCustomUnit(sd.title, sd.words, sd.targetMode || "pinyin");
                if (callbacks.onToast) callbacks.onToast(`📥 Đã thêm "${sd.title}" (${sd.words.length} từ) vào Bộ Từ Cá Nhân của bạn!`);
                if (callbacks.onInstalledCustomDeck) callbacks.onInstalledCustomDeck();
            });
        });

        contentEl.querySelectorAll("[data-share-custom]").forEach(btn => {
            btn.addEventListener("click", async () => {
                const cu = customUnits[Number(btn.getAttribute("data-share-custom"))];
                if (!cu) return;
                try {
                    await window.ApiClient.publishCommunityDeck({
                        title: cu.title,
                        hskTag: "Cộng đồng",
                        targetMode: cu.targetMode,
                        words: cu.words
                    });
                    if (callbacks.onToast) callbacks.onToast(`🌐 Đã đăng tải "${cu.title}" lên Kho Học Liệu Cộng Đồng!`);
                    renderSharedDecksTab(contentEl, callbacks);
                } catch (err) {
                    if (callbacks.onToast) callbacks.onToast(`⚠️ ${err.message}`);
                }
            });
        });
    }

    return { render };
})();
