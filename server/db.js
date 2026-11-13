/**
 * SQLite Persistent Database Service (Built-in node:sqlite)
 * Handles Users, Auth Sessions, Cloud Learning Sync, Leaderboard & Shared Teacher Decks.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto.pbkdf2Sync(String(password), salt, 100000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, originalHex] = storedHash.split(":");
    const candidateHex = crypto.pbkdf2Sync(String(password), salt, 100000, 64, "sha512").toString("hex");
    try {
        return crypto.timingSafeEqual(Buffer.from(originalHex, "hex"), Buffer.from(candidateHex, "hex"));
    } catch {
        return false;
    }
}

function createDatabase(dbFilePath) {
    const resolvedPath = path.resolve(dbFilePath);
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

    const db = new DatabaseSync(resolvedPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            email TEXT DEFAULT '',
            password_hash TEXT NOT NULL,
            avatar TEXT DEFAULT '🧑‍🚀',
            hsk_goal TEXT DEFAULT 'hsk1_full',
            role TEXT DEFAULT 'student',
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_state (
            user_id INTEGER PRIMARY KEY,
            settings_json TEXT DEFAULT '{}',
            progress_json TEXT DEFAULT '{}',
            mastery_json TEXT DEFAULT '{}',
            weak_words_json TEXT DEFAULT '[]',
            custom_units_json TEXT DEFAULT '[]',
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS leaderboard (
            user_id INTEGER PRIMARY KEY,
            display_name TEXT NOT NULL,
            avatar TEXT DEFAULT '🧑‍🚀',
            xp INTEGER DEFAULT 0,
            pilot_level INTEGER DEFAULT 1,
            streak_days INTEGER DEFAULT 1,
            mastered_words INTEGER DEFAULT 0,
            bosses_defeated INTEGER DEFAULT 0,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS community_decks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_id INTEGER,
            author_name TEXT NOT NULL,
            title TEXT NOT NULL,
            hsk_tag TEXT DEFAULT 'Tùy chọn',
            target_mode TEXT DEFAULT 'pinyin',
            words_json TEXT NOT NULL,
            downloads INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
        );
    `);

    seedInitialCommunityData(db);

    function registerUser({ username, displayName, email = "", password, avatar = "🧑‍🚀", hskGoal = "hsk1_full", role = "student" }) {
        const cleanUser = String(username || "").trim().toLowerCase();
        if (!/^[a-z0-9_.-]{3,30}$/.test(cleanUser)) {
            throw new Error("Tên đăng nhập cần từ 3–30 ký tự (chữ thường, số, dấu gạch dưới).");
        }
        if (!password || String(password).length < 6) {
            throw new Error("Mật khẩu cần ít nhất 6 ký tự.");
        }
        const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(cleanUser);
        if (existing) {
            throw new Error("Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác.");
        }

        const now = Date.now();
        const pwHash = hashPassword(password);
        const safeName = String(displayName || cleanUser).trim().slice(0, 40) || cleanUser;

        const info = db
            .prepare(
                `INSERT INTO users (username, display_name, email, password_hash, avatar, hsk_goal, role, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .run(cleanUser, safeName, String(email || "").trim(), pwHash, avatar, hskGoal, role, now);

        const userId = Number(info.lastInsertRowid);
        db.prepare(
            `INSERT INTO user_state (user_id, updated_at) VALUES (?, ?)`
        ).run(userId, now);

        db.prepare(
            `INSERT INTO leaderboard (user_id, display_name, avatar, xp, pilot_level, streak_days, mastered_words, bosses_defeated, updated_at)
             VALUES (?, ?, ?, 0, 1, 1, 0, 0, ?)`
        ).run(userId, safeName, avatar, now);

        const session = createSession(userId);
        return {
            token: session.token,
            user: getUserPublicProfile(userId)
        };
    }

    function loginUser({ username, password }) {
        const cleanUser = String(username || "").trim().toLowerCase();
        const row = db.prepare("SELECT * FROM users WHERE username = ?").get(cleanUser);
        if (!row || !verifyPassword(password, row.password_hash)) {
            throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }
        const session = createSession(row.id);
        return {
            token: session.token,
            user: getUserPublicProfile(row.id),
            state: getUserState(row.id)
        };
    }

    function createSession(userId, ttlDays = 30) {
        const token = crypto.randomBytes(32).toString("hex");
        const now = Date.now();
        const expiresAt = now + ttlDays * 86400 * 1000;
        db.prepare("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
            token,
            userId,
            expiresAt,
            now
        );
        return { token, expiresAt };
    }

    function authenticateToken(token) {
        if (!token) return null;
        const row = db
            .prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?")
            .get(String(token).trim());
        if (!row) return null;
        if (row.expires_at < Date.now()) {
            db.prepare("DELETE FROM sessions WHERE token = ?").run(String(token).trim());
            return null;
        }
        return getUserPublicProfile(row.user_id);
    }

    function revokeSession(token) {
        if (!token) return;
        db.prepare("DELETE FROM sessions WHERE token = ?").run(String(token).trim());
    }

    function getUserPublicProfile(userId) {
        const row = db
            .prepare("SELECT id, username, display_name, email, avatar, hsk_goal, role, created_at FROM users WHERE id = ?")
            .get(userId);
        if (!row) return null;
        return {
            id: row.id,
            username: row.username,
            displayName: row.display_name,
            email: row.email,
            avatar: row.avatar,
            hskGoal: row.hsk_goal,
            role: row.role,
            createdAt: row.created_at
        };
    }

    function safeParse(str, fallback) {
        try {
            return str ? JSON.parse(str) : fallback;
        } catch {
            return fallback;
        }
    }

    function getUserState(userId) {
        const row = db.prepare("SELECT * FROM user_state WHERE user_id = ?").get(userId);
        if (!row) {
            return {
                settings: {},
                progress: {},
                wordMastery: {},
                weakWords: [],
                customUnits: [],
                updatedAt: 0
            };
        }
        return {
            settings: safeParse(row.settings_json, {}),
            progress: safeParse(row.progress_json, {}),
            wordMastery: safeParse(row.mastery_json, {}),
            weakWords: safeParse(row.weak_words_json, []),
            customUnits: safeParse(row.custom_units_json, []),
            updatedAt: row.updated_at
        };
    }

    function saveUserState(userId, payload = {}) {
        const current = getUserState(userId);
        const settings = payload.settings !== undefined ? payload.settings : current.settings;
        const progress = payload.progress !== undefined ? payload.progress : current.progress;
        const wordMastery = payload.wordMastery !== undefined ? payload.wordMastery : current.wordMastery;
        const weakWords = payload.weakWords !== undefined ? payload.weakWords : current.weakWords;
        const customUnits = payload.customUnits !== undefined ? payload.customUnits : current.customUnits;
        const now = Date.now();

        db.prepare(
            `INSERT INTO user_state (user_id, settings_json, progress_json, mastery_json, weak_words_json, custom_units_json, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET
                settings_json = excluded.settings_json,
                progress_json = excluded.progress_json,
                mastery_json = excluded.mastery_json,
                weak_words_json = excluded.weak_words_json,
                custom_units_json = excluded.custom_units_json,
                updated_at = excluded.updated_at`
        ).run(
            userId,
            JSON.stringify(settings || {}),
            JSON.stringify(progress || {}),
            JSON.stringify(wordMastery || {}),
            JSON.stringify(weakWords || []),
            JSON.stringify(customUnits || []),
            now
        );

        const user = getUserPublicProfile(userId);
        if (user) {
            const masteredCount = Object.values(wordMastery || {}).filter(m => m && m.level >= 3).length;
            const xp = Number((progress && progress.totalXp) || 0);
            const pilotLevel = Math.max(1, Math.floor(xp / 250) + 1);
            const streakDays = Number((progress && progress.streakDays) || 1);
            const bosses = Number((progress && progress.bossesDefeated) || 0);

            db.prepare(
                `INSERT INTO leaderboard (user_id, display_name, avatar, xp, pilot_level, streak_days, mastered_words, bosses_defeated, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(user_id) DO UPDATE SET
                    display_name = excluded.display_name,
                    avatar = excluded.avatar,
                    xp = MAX(leaderboard.xp, excluded.xp),
                    pilot_level = MAX(leaderboard.pilot_level, excluded.pilot_level),
                    streak_days = MAX(leaderboard.streak_days, excluded.streak_days),
                    mastered_words = MAX(leaderboard.mastered_words, excluded.mastered_words),
                    bosses_defeated = MAX(leaderboard.bosses_defeated, excluded.bosses_defeated),
                    updated_at = excluded.updated_at`
            ).run(userId, user.displayName, user.avatar, xp, pilotLevel, streakDays, masteredCount, bosses, now);
        }

        return { updatedAt: now };
    }

    function getLeaderboard(limit = 25) {
        const rows = db
            .prepare(
                `SELECT user_id, display_name, avatar, xp, pilot_level, streak_days, mastered_words, bosses_defeated, updated_at
                 FROM leaderboard
                 ORDER BY xp DESC, mastered_words DESC
                 LIMIT ?`
            )
            .all(Math.min(50, Math.max(5, Number(limit) || 25)));
        return rows.map((r, idx) => ({
            rank: idx + 1,
            userId: r.user_id,
            displayName: r.display_name,
            avatar: r.avatar,
            xp: r.xp,
            pilotLevel: r.pilot_level,
            streakDays: r.streak_days,
            masteredWords: r.mastered_words,
            bossesDefeated: r.bosses_defeated,
            updatedAt: r.updated_at
        }));
    }

    function getCommunityDecks(limit = 30) {
        const rows = db
            .prepare("SELECT * FROM community_decks ORDER BY downloads DESC, created_at DESC LIMIT ?")
            .all(limit);
        return rows.map(r => ({
            id: r.id,
            authorName: r.author_name,
            title: r.title,
            hskTag: r.hsk_tag,
            targetMode: r.target_mode,
            words: safeParse(r.words_json, []),
            downloads: r.downloads,
            createdAt: r.created_at
        }));
    }

    function publishCommunityDeck({ authorId = null, authorName = "Giáo viên Cộng đồng", title, hskTag = "Chuyên ngành", targetMode = "pinyin", words = [] }) {
        if (!title || !Array.isArray(words) || words.length === 0) {
            throw new Error("Bộ từ chia sẻ cần có tiêu đề và ít nhất 1 từ vựng.");
        }
        const cleanWords = words.slice(0, 150).map(w => ({
            hanzi: String(w.hanzi || "").trim(),
            pinyin: String(w.pinyin || "").trim(),
            meaning: String(w.meaning || "").trim(),
            meaningShort: String(w.meaningShort || w.meaning || "").trim()
        })).filter(w => w.hanzi && w.pinyin && w.meaning);

        if (cleanWords.length === 0) {
            throw new Error("Không có từ vựng hợp lệ để đăng tải.");
        }

        const now = Date.now();
        const info = db
            .prepare(
                `INSERT INTO community_decks (author_id, author_name, title, hsk_tag, target_mode, words_json, downloads, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
            )
            .run(authorId, String(authorName).slice(0, 40), String(title).slice(0, 80), String(hskTag).slice(0, 24), targetMode, JSON.stringify(cleanWords), now);

        return { id: Number(info.lastInsertRowid), wordCount: cleanWords.length };
    }

    function getStats() {
        const u = db.prepare("SELECT COUNT(*) as c FROM users").get();
        const d = db.prepare("SELECT COUNT(*) as c FROM community_decks").get();
        return { users: u.c, communityDecks: d.c };
    }

    return {
        db,
        registerUser,
        loginUser,
        authenticateToken,
        revokeSession,
        getUserPublicProfile,
        getUserState,
        saveUserState,
        getLeaderboard,
        getCommunityDecks,
        publishCommunityDeck,
        getStats
    };
}

function seedInitialCommunityData(db) {
    const countRow = db.prepare("SELECT COUNT(*) as c FROM users").get();
    if (countRow && countRow.c > 0) return;

    const now = Date.now();
    const demoLearners = [
        { u: "minhanh_hsk4", name: "Minh Anh • HSK4", avatar: "👩‍🎓", xp: 6450, lvl: 26, streak: 21, mastered: 312, bosses: 29 },
        { u: "hoangnam_cn", name: "Hoàng Nam", avatar: "🧑‍🚀", xp: 4820, lvl: 20, streak: 14, mastered: 224, bosses: 19 },
        { u: "linhchi_bku", name: "Linh Chi", avatar: "🦊", xp: 3590, lvl: 15, streak: 11, mastered: 168, bosses: 15 },
        { u: "thay_vuong", name: "Thầy Vương Hán Ngữ", avatar: "👨‍🏫", xp: 2950, lvl: 12, streak: 9, mastered: 140, bosses: 12 },
        { u: "khanhvy_starter", name: "Khánh Vy", avatar: "🐼", xp: 1420, lvl: 6, streak: 5, mastered: 62, bosses: 6 }
    ];

    const insertUser = db.prepare(
        `INSERT INTO users (username, display_name, email, password_hash, avatar, hsk_goal, role, created_at)
         VALUES (?, ?, '', ?, ?, 'hsk3_full', 'student', ?)`
    );
    const insertLb = db.prepare(
        `INSERT INTO leaderboard (user_id, display_name, avatar, xp, pilot_level, streak_days, mastered_words, bosses_defeated, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    demoLearners.forEach(d => {
        const pw = hashPassword(crypto.randomBytes(16).toString("hex"));
        const res = insertUser.run(d.u, d.name, pw, d.avatar, now);
        insertLb.run(Number(res.lastInsertRowid), d.name, d.avatar, d.xp, d.lvl, d.streak, d.mastered, d.bosses, now);
    });

    const sampleDecks = [
        {
            author: "Thầy Vương Hán Ngữ",
            title: "Tiếng Trung Thương Mại & Đặt Hàng Taobao/1688",
            tag: "Thương Mại",
            words: [
                { hanzi: "包邮", pinyin: "bāoyóu", meaning: "Miễn phí vận chuyển (Freeship)", meaningShort: "Miễn phí ship" },
                { hanzi: "打折", pinyin: "dǎzhé", meaning: "Giảm giá, chiết khấu", meaningShort: "Giảm giá" },
                { hanzi: "现货", pinyin: "xiànhuò", meaning: "Hàng có sẵn", meaningShort: "Hàng sẵn" },
                { hanzi: "发货", pinyin: "fāhuò", meaning: "Giao hàng, xuất hàng", meaningShort: "Giao hàng" },
                { hanzi: "客服", pinyin: "kèfú", meaning: "Chăm sóc khách hàng", meaningShort: "Chăm sóc khách" },
                { hanzi: "退款", pinyin: "tuìkuǎn", meaning: "Hoàn tiền", meaningShort: "Hoàn tiền" },
                { hanzi: "订单", pinyin: "dìngdān", meaning: "Đơn đặt hàng", meaningShort: "Đơn hàng" },
                { hanzi: "质量", pinyin: "zhìliàng", meaning: "Chất lượng", meaningShort: "Chất lượng" }
            ]
        },
        {
            author: "Cô Mai Bắc Kinh",
            title: "Tiếng Trung Du Lịch & Sân Bay Cấp Tốc",
            tag: "Du Lịch",
            words: [
                { hanzi: "护照", pinyin: "hùzhào", meaning: "Hộ chiếu (Passport)", meaningShort: "Hộ chiếu" },
                { hanzi: "登机牌", pinyin: "dēngjīpái", meaning: "Thẻ lên máy bay", meaningShort: "Thẻ lên tàu" },
                { hanzi: "地铁", pinyin: "dìtiě", meaning: "Tàu điện ngầm", meaningShort: "Tàu điện ngầm" },
                { hanzi: "酒店", pinyin: "jiǔdiàn", meaning: "Khách sạn", meaningShort: "Khách sạn" },
                { hanzi: "菜单", pinyin: "càidān", meaning: "Thực đơn (Menu)", meaningShort: "Thực đơn" },
                { hanzi: "买单", pinyin: "mǎidān", meaning: "Thanh toán hóa đơn", meaningShort: "Thanh toán" },
                { hanzi: "洗手间", pinyin: "xǐshǒujiān", meaning: "Nhà vệ sinh", meaningShort: "Nhà vệ sinh" },
                { hanzi: "地图", pinyin: "dìtú", meaning: "Bản đồ", meaningShort: "Bản đồ" }
            ]
        }
    ];

    const insertDeck = db.prepare(
        `INSERT INTO community_decks (author_id, author_name, title, hsk_tag, target_mode, words_json, downloads, created_at)
         VALUES (NULL, ?, ?, ?, 'pinyin', ?, ?, ?)`
    );
    sampleDecks.forEach((sd, i) => {
        insertDeck.run(sd.author, sd.title, sd.tag, JSON.stringify(sd.words), 48 - i * 12, now);
    });
}

module.exports = { createDatabase };
