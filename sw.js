/**
 * Progressive Web App Service Worker (Offline-First Asset & TTS Audio Cache)
 */
const CACHE_NAME = "hsk-cosmic-academy-v3";
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./css/style.css",
    "./css/academy.css",
    "./js/data/vocabDatabase.js",
    "./js/data/curriculumMeta.js",
    "./js/services/storageService.js",
    "./js/services/apiClient.js",
    "./js/audio/soundEngine.js",
    "./js/engine/entities.js",
    "./js/engine/gameEngine.js",
    "./js/learning/academyHub.js",
    "./js/learning/lessonStudio.js",
    "./js/learning/practiceArena.js",
    "./js/learning/dictionaryView.js",
    "./js/learning/communityModal.js",
    "./js/ui/uiController.js",
    "./js/qa/gameQaSuite.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches
            .keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);

    // Cache-First for /api/tts audio streams so offline pronunciation works seamlessly
    if (url.pathname === "/api/tts") {
        event.respondWith(
            caches.open(CACHE_NAME).then(async cache => {
                const cached = await cache.match(req);
                if (cached) return cached;
                const resp = await fetch(req);
                if (resp && resp.ok) cache.put(req, resp.clone());
                return resp;
            })
        );
        return;
    }

    // Network-only for dynamic API endpoints (auth, sync, leaderboard)
    if (url.pathname.startsWith("/api/")) {
        return;
    }

    // Network-First (with Offline Cache fallback) for HTML/CSS/JS app shell so updates apply immediately
    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            try {
                const resp = await fetch(req);
                if (resp && resp.ok && url.origin === self.location.origin) {
                    cache.put(req, resp.clone());
                }
                return resp;
            } catch {
                const cached = await cache.match(req);
                return cached || caches.match("./index.html");
            }
        })
    );
});
