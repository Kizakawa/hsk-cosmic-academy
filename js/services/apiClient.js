/**
 * Cloud API & Account Synchronization Client
 * Connects seamlessly to /api/* when running on the Node/SQLite web server,
 * and falls back gracefully to offline local mode when opened statically.
 */
window.ApiClient = (function () {
    let serverOnline = false;
    let lastCheckedAt = 0;

    function isHttpProtocol() {
        const proto = (window.location && window.location.protocol) || "";
        return proto === "http:" || proto === "https:";
    }

    async function checkServerHealth(force = false) {
        if (!isHttpProtocol()) {
            serverOnline = false;
            return false;
        }
        if (!force && Date.now() - lastCheckedAt < 15000) {
            return serverOnline;
        }
        lastCheckedAt = Date.now();
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 1800);
            const resp = await fetch("/api/health", { signal: ctrl.signal });
            clearTimeout(timer);
            if (resp.ok) {
                const json = await resp.json();
                serverOnline = Boolean(json && json.ok);
                return serverOnline;
            }
        } catch {
            serverOnline = false;
        }
        return false;
    }

    function isServerAvailable() {
        return serverOnline;
    }

    async function apiRequest(path, options = {}) {
        const session = window.StorageService.getAuthSession();
        const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
        if (session && session.token) {
            headers["Authorization"] = `Bearer ${session.token}`;
        }
        const resp = await fetch(path, Object.assign({}, options, { headers }));
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data.ok === false) {
            throw new Error(data.error || `HTTP ${resp.status}`);
        }
        return data;
    }

    async function registerAccount({ username, displayName, email, password, avatar = "🧑‍🚀", hskGoal = "hsk1_full" }) {
        const online = await checkServerHealth(true);
        const initialState = window.StorageService.exportFullState();
        if (online) {
            const res = await apiRequest("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ username, displayName, email, password, avatar, hskGoal, initialState })
            });
            window.StorageService.saveAuthSession({
                token: res.token,
                user: res.user,
                mode: "cloud"
            });
            return { ok: true, mode: "cloud", user: res.user };
        }
        // Offline local profile fallback
        const localUser = {
            id: Date.now(),
            username: String(username || "hocvien").trim().toLowerCase(),
            displayName: String(displayName || username || "Học Viên").trim(),
            avatar,
            hskGoal
        };
        window.StorageService.saveAuthSession({ token: "local_offline", user: localUser, mode: "local" });
        return { ok: true, mode: "local", user: localUser };
    }

    async function loginAccount({ username, password }) {
        const online = await checkServerHealth(true);
        if (!online) {
            throw new Error("Máy chủ chưa bật. Hãy chạy `npm start` hoặc `start_game.bat` để đăng nhập đám mây!");
        }
        const res = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        });
        window.StorageService.saveAuthSession({
            token: res.token,
            user: res.user,
            mode: "cloud"
        });
        if (res.state) {
            window.StorageService.importFullState(res.state, true);
        }
        // Push merged state back so nothing earned offline is lost
        await pushCloudSync(window.StorageService.exportFullState());
        return { ok: true, user: res.user };
    }

    async function logoutAccount() {
        const session = window.StorageService.getAuthSession();
        if (session && session.mode === "cloud" && serverOnline) {
            try {
                await apiRequest("/api/auth/logout", { method: "POST" });
            } catch {
                // Ignore
            }
        }
        window.StorageService.saveAuthSession(null);
    }

    async function pushCloudSync(statePayload) {
        const session = window.StorageService.getAuthSession();
        if (!session || session.mode !== "cloud" || !session.token) return false;
        const online = await checkServerHealth();
        if (!online) return false;
        try {
            await apiRequest("/api/sync", {
                method: "POST",
                body: JSON.stringify(statePayload || window.StorageService.exportFullState())
            });
            return true;
        } catch {
            return false;
        }
    }

    async function restoreSessionOnBoot() {
        const online = await checkServerHealth(true);
        window.StorageService.setSyncSubscriber(state => {
            pushCloudSync(state);
        });
        const session = window.StorageService.getAuthSession();
        if (online && session && session.mode === "cloud" && session.token) {
            try {
                const res = await apiRequest("/api/auth/me");
                window.StorageService.saveAuthSession({
                    token: session.token,
                    user: res.user,
                    mode: "cloud"
                });
                if (res.state) {
                    window.StorageService.importFullState(res.state, true);
                }
                return res.user;
            } catch {
                window.StorageService.saveAuthSession(null);
            }
        }
        return session ? session.user : null;
    }

    async function fetchLeaderboard() {
        const online = await checkServerHealth();
        if (online) {
            try {
                const res = await apiRequest("/api/leaderboard");
                return res.leaderboard || [];
            } catch {
                // Fallback below
            }
        }
        const p = window.StorageService.getProgress();
        const m = window.StorageService.getMasterySummary();
        const session = window.StorageService.getAuthSession();
        const meName = (session && session.user && session.user.displayName) || "Bạn (Thiết bị này)";
        return [
            { rank: 1, displayName: "Minh Anh • HSK4", avatar: "👩‍🎓", xp: 6450, pilotLevel: 26, streakDays: 21, masteredWords: 312 },
            { rank: 2, displayName: "Hoàng Nam", avatar: "🧑‍🚀", xp: 4820, pilotLevel: 20, streakDays: 14, masteredWords: 224 },
            { rank: 3, displayName: meName, avatar: "🌟", xp: p.totalXp || 0, pilotLevel: p.pilotLevel || 1, streakDays: p.streakDays || 1, masteredWords: m.mastered || 0 },
            { rank: 4, displayName: "Linh Chi", avatar: "🦊", xp: 3590, pilotLevel: 15, streakDays: 11, masteredWords: 168 }
        ].sort((a, b) => b.xp - a.xp).map((item, idx) => Object.assign({}, item, { rank: idx + 1 }));
    }

    async function fetchCommunityDecks() {
        const online = await checkServerHealth();
        if (!online) return [];
        try {
            const res = await apiRequest("/api/community-decks");
            return res.decks || [];
        } catch {
            return [];
        }
    }

    async function publishCommunityDeck(deckPayload) {
        const online = await checkServerHealth(true);
        if (!online) {
            throw new Error("Cần kết nối máy chủ (`npm start`) để chia sẻ bộ từ lên Cộng đồng.");
        }
        return await apiRequest("/api/community-decks", {
            method: "POST",
            body: JSON.stringify(deckPayload)
        });
    }

    return {
        checkServerHealth,
        isServerAvailable,
        registerAccount,
        loginAccount,
        logoutAccount,
        pushCloudSync,
        restoreSessionOnBoot,
        fetchLeaderboard,
        fetchCommunityDecks,
        publishCommunityDeck
    };
})();
