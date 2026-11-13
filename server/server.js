/**
 * HSK Cosmic Academy — Full-Stack Web Server & REST API
 * Zero external npm dependencies (uses Node.js built-in http, sqlite, crypto, zlib, fetch).
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const { createDatabase } = require("./db");

const ROOT_DIR = path.resolve(__dirname, "..");

// Load optional .env without external packages
const envPath = path.join(ROOT_DIR, ".env");
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf8")
        .split(/\r?\n/)
        .forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx > 0) {
                const k = trimmed.slice(0, eqIdx).trim();
                const v = trimmed.slice(eqIdx + 1).trim();
                if (!process.env[k]) process.env[k] = v;
            }
        });
}

const PORT = Number(process.env.PORT || 8088);
const HOST = process.env.HOST || "0.0.0.0";
const DB_PATH = path.resolve(ROOT_DIR, process.env.DB_PATH || "./storage/academy.db");
const TTS_CACHE_DIR = path.resolve(ROOT_DIR, process.env.TTS_CACHE_DIR || "./storage/tts_cache");

fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
const store = createDatabase(DB_PATH);

// Load structured curriculum JSON for fast dictionary & API queries
const curriculumPath = path.join(ROOT_DIR, "data", "curriculum_decks.json");
let curriculumData = { decks: [], totalDecks: 0, totalUnits: 0, totalWords: 0 };
let flatVocabIndex = [];

function reloadCurriculumIndex() {
    if (!fs.existsSync(curriculumPath)) return;
    curriculumData = JSON.parse(fs.readFileSync(curriculumPath, "utf8"));
    flatVocabIndex = [];
    (curriculumData.decks || []).forEach(deck => {
        (deck.units || []).forEach(unit => {
            (unit.words || []).forEach(w => {
                flatVocabIndex.push({
                    hanzi: w.hanzi,
                    pinyin: w.pinyin,
                    pinyinClean: w.pinyinClean,
                    pinyinTones: w.pinyinTones,
                    meaning: w.meaning,
                    meaningShort: w.meaningShort,
                    meaningNorm: w.meaningNorm,
                    deckId: deck.id,
                    deckBadge: deck.badge,
                    unitNumber: unit.unitNumber,
                    unitTitle: unit.title
                });
            });
        });
    });
}
reloadCurriculumIndex();

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".mp3": "audio/mpeg",
    ".txt": "text/plain; charset=utf-8"
};

const COMPRESSIBLE_EXTS = new Set([".html", ".css", ".js", ".json", ".webmanifest", ".svg", ".txt"]);

function sendJson(req, res, statusCode, data) {
    const raw = Buffer.from(JSON.stringify(data), "utf8");
    const acceptEnc = String(req.headers["accept-encoding"] || "");
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
    };
    if (acceptEnc.includes("gzip") && raw.length > 512) {
        const gz = zlib.gzipSync(raw);
        headers["Content-Encoding"] = "gzip";
        headers["Content-Length"] = gz.length;
        res.writeHead(statusCode, headers);
        res.end(gz);
        return;
    }
    headers["Content-Length"] = raw.length;
    res.writeHead(statusCode, headers);
    res.end(raw);
}

function readJsonBody(req, maxBytes = 1024 * 1024) {
    return new Promise((resolve, reject) => {
        let total = 0;
        const chunks = [];
        req.on("data", chunk => {
            total += chunk.length;
            if (total > maxBytes) {
                reject(new Error("Payload vượt quá giới hạn 1MB."));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on("end", () => {
            if (chunks.length === 0) return resolve({});
            try {
                const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
                resolve(parsed);
            } catch {
                reject(new Error("Dữ liệu JSON không hợp lệ."));
            }
        });
        req.on("error", reject);
    });
}

function extractBearerToken(req) {
    const auth = String(req.headers["authorization"] || "");
    if (auth.toLowerCase().startsWith("bearer ")) {
        return auth.slice(7).trim();
    }
    return "";
}

async function handleTtsProxy(req, res, urlObj) {
    const text = String(urlObj.searchParams.get("text") || "").trim().slice(0, 80);
    if (!text) {
        return sendJson(req, res, 400, { ok: false, error: "Missing text parameter" });
    }

    const hash = crypto.createHash("sha1").update(text).digest("hex");
    const cacheFile = path.join(TTS_CACHE_DIR, `${hash}.mp3`);

    if (fs.existsSync(cacheFile)) {
        const buf = fs.readFileSync(cacheFile);
        if (buf.length > 200) {
            res.writeHead(200, {
                "Content-Type": "audio/mpeg",
                "Content-Length": buf.length,
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-TTS-Cache": "HIT"
            });
            res.end(buf);
            return;
        }
    }

    const encoded = encodeURIComponent(text);
    const upstreams = [
        `https://dict.youdao.com/dictvoice?audio=${encoded}&le=zh`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encoded}`
    ];

    for (const upstream of upstreams) {
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 4500);
            const resp = await fetch(upstream, {
                signal: ctrl.signal,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
            clearTimeout(timer);
            if (resp.ok) {
                const arrBuf = await resp.arrayBuffer();
                const buf = Buffer.from(arrBuf);
                if (buf.length > 200) {
                    try {
                        fs.writeFileSync(cacheFile, buf);
                    } catch {
                        // Ignore disk cache write errors
                    }
                    res.writeHead(200, {
                        "Content-Type": "audio/mpeg",
                        "Content-Length": buf.length,
                        "Cache-Control": "public, max-age=31536000, immutable",
                        "X-TTS-Cache": "MISS"
                    });
                    res.end(buf);
                    return;
                }
            }
        } catch {
            // Try next upstream
        }
    }

    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "TTS upstream unavailable; use client WebSpeech fallback." }));
}

async function handleApi(req, res, urlObj) {
    const pathname = urlObj.pathname;
    const method = req.method || "GET";

    try {
        if (pathname === "/api/health" && method === "GET") {
            const stats = store.getStats();
            return sendJson(req, res, 200, {
                ok: true,
                service: "HSK Cosmic Academy Server",
                version: "2.0.0",
                decks: curriculumData.totalDecks,
                units: curriculumData.totalUnits,
                words: curriculumData.totalWords,
                users: stats.users,
                communityDecks: stats.communityDecks
            });
        }

        if (pathname === "/api/tts" && method === "GET") {
            return await handleTtsProxy(req, res, urlObj);
        }

        if (pathname === "/api/curriculum" && method === "GET") {
            return sendJson(req, res, 200, { ok: true, curriculum: curriculumData });
        }

        if (pathname === "/api/vocab/search" && method === "GET") {
            const rawQ = String(urlObj.searchParams.get("q") || "").trim().toLowerCase();
            const deckFilter = String(urlObj.searchParams.get("deck") || "").trim();
            const limit = Math.min(80, Math.max(5, Number(urlObj.searchParams.get("limit")) || 40));

            const normQ = rawQ
                .replace(/đ/g, "d")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "");

            const results = [];
            const seen = new Set();
            for (const item of flatVocabIndex) {
                if (deckFilter && item.deckId !== deckFilter) continue;
                const key = `${item.hanzi}_${item.deckId}`;
                if (seen.has(key)) continue;

                const matched =
                    !rawQ ||
                    item.hanzi.includes(rawQ) ||
                    item.pinyin.toLowerCase().includes(rawQ) ||
                    item.pinyinClean.includes(normQ) ||
                    item.meaning.toLowerCase().includes(rawQ) ||
                    (normQ && item.meaningNorm.includes(normQ));

                if (matched) {
                    seen.add(key);
                    results.push(item);
                    if (results.length >= limit) break;
                }
            }
            return sendJson(req, res, 200, { ok: true, count: results.length, results });
        }

        if (pathname === "/api/leaderboard" && method === "GET") {
            return sendJson(req, res, 200, { ok: true, leaderboard: store.getLeaderboard(25) });
        }

        if (pathname === "/api/community-decks" && method === "GET") {
            return sendJson(req, res, 200, { ok: true, decks: store.getCommunityDecks(30) });
        }

        if (pathname === "/api/community-decks" && method === "POST") {
            const token = extractBearerToken(req);
            const user = store.authenticateToken(token);
            const body = await readJsonBody(req);
            const created = store.publishCommunityDeck({
                authorId: user ? user.id : null,
                authorName: user ? user.displayName : (body.authorName || "Giáo viên Cộng đồng"),
                title: body.title,
                hskTag: body.hskTag,
                targetMode: body.targetMode,
                words: body.words
            });
            return sendJson(req, res, 201, { ok: true, deck: created });
        }

        if (pathname === "/api/auth/register" && method === "POST") {
            const body = await readJsonBody(req);
            const result = store.registerUser(body);
            if (body.initialState) {
                store.saveUserState(result.user.id, body.initialState);
            }
            return sendJson(req, res, 201, {
                ok: true,
                token: result.token,
                user: result.user,
                state: store.getUserState(result.user.id)
            });
        }

        if (pathname === "/api/auth/login" && method === "POST") {
            const body = await readJsonBody(req);
            const result = store.loginUser(body);
            return sendJson(req, res, 200, {
                ok: true,
                token: result.token,
                user: result.user,
                state: result.state
            });
        }

        if (pathname === "/api/auth/me" && method === "GET") {
            const token = extractBearerToken(req);
            const user = store.authenticateToken(token);
            if (!user) return sendJson(req, res, 401, { ok: false, error: "Phiên đăng nhập hết hạn." });
            return sendJson(req, res, 200, {
                ok: true,
                user,
                state: store.getUserState(user.id)
            });
        }

        if (pathname === "/api/auth/logout" && method === "POST") {
            const token = extractBearerToken(req);
            store.revokeSession(token);
            return sendJson(req, res, 200, { ok: true });
        }

        if (pathname === "/api/sync") {
            const token = extractBearerToken(req);
            const user = store.authenticateToken(token);
            if (!user) return sendJson(req, res, 401, { ok: false, error: "Cần đăng nhập để đồng bộ đám mây." });

            if (method === "GET") {
                return sendJson(req, res, 200, { ok: true, state: store.getUserState(user.id) });
            }
            if (method === "POST") {
                const body = await readJsonBody(req);
                const saved = store.saveUserState(user.id, body);
                return sendJson(req, res, 200, { ok: true, updatedAt: saved.updatedAt });
            }
        }

        return sendJson(req, res, 404, { ok: false, error: `API endpoint not found: ${method} ${pathname}` });
    } catch (err) {
        return sendJson(req, res, 400, { ok: false, error: err.message || "Lỗi xử lý yêu cầu." });
    }
}

function serveStaticFile(req, res, pathname) {
    let relPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
    // Block access to hidden, server, or storage directories
    if (
        relPath.startsWith("/.") ||
        relPath.startsWith("/server") ||
        relPath.startsWith("/storage") ||
        relPath.startsWith("/scripts")
    ) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("403 Forbidden");
        return;
    }

    const absPath = path.resolve(ROOT_DIR, "." + relPath);
    if (!absPath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("403 Forbidden");
        return;
    }

    if (!fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Not Found");
        return;
    }

    const ext = path.extname(absPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const raw = fs.readFileSync(absPath);
    const acceptEnc = String(req.headers["accept-encoding"] || "");

    const headers = {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": ext === ".html" || relPath === "/sw.js" ? "no-cache" : "public, max-age=3600"
    };

    if (COMPRESSIBLE_EXTS.has(ext) && acceptEnc.includes("gzip") && raw.length > 512) {
        const gz = zlib.gzipSync(raw);
        headers["Content-Encoding"] = "gzip";
        headers["Content-Length"] = gz.length;
        res.writeHead(200, headers);
        res.end(gz);
        return;
    }

    headers["Content-Length"] = raw.length;
    res.writeHead(200, headers);
    res.end(raw);
}

function startServer(port = PORT, host = HOST) {
    const server = http.createServer((req, res) => {
        const urlObj = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        if (urlObj.pathname.startsWith("/api/")) {
            handleApi(req, res, urlObj);
            return;
        }
        serveStaticFile(req, res, urlObj.pathname);
    });

    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => {
            console.log(`🚀 HSK Cosmic Academy Server running at http://localhost:${port}`);
            resolve(server);
        });
    });
}

if (require.main === module) {
    startServer().catch(err => {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    });
}

module.exports = { startServer, store };
