/**
 * Sound, Mandarin TTS (4-Tier Server Cache + Fallbacks) & Speech Pronunciation Assessor
 * - Procedural Web Audio API synthesizer for sci-fi laser shots, explosions, armor break, power-ups, boss alerts & piano BGM.
 * - 4-Tier Mandarin Pronunciation:
 *     Tier 0: Local Server Cached Proxy (/api/tts?text=...) — immune to CORS & works offline after first play
 *     Tier 1: Youdao Dictionary Voice
 *     Tier 2: Google Translate zh-CN TTS
 *     Tier 3: Browser Web Speech API (zh-CN)
 * - Speech Recognition Pronunciation Grader (zh-CN) for speaking practice.
 */
window.SoundEngine = (function () {
    let audioCtx = null;
    let bgmTimer = null;
    let isBgmPlaying = false;
    let zhVoice = null;
    const audioCache = new Map();

    function ensureContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    function initVoices() {
        if (!("speechSynthesis" in window)) return;
        const pickVoice = () => {
            const voices = window.speechSynthesis.getVoices() || [];
            zhVoice =
                voices.find(v => v.lang === "zh-CN" && v.name.includes("Natural")) ||
                voices.find(v => v.lang === "zh-CN") ||
                voices.find(v => v.lang && v.lang.toLowerCase().startsWith("zh")) ||
                null;
        };
        pickVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = pickVoice;
        }
    }

    initVoices();

    function playLaserShot(comboIndex = 0) {
        const settings = window.StorageService.getSettings();
        if (!settings.sfxEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const baseFreq = Math.min(920, 520 + comboIndex * 35);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.085);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    function playWordExplosion() {
        const settings = window.StorageService.getSettings();
        if (!settings.sfxEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            const start = now + idx * 0.025;
            osc.frequency.setValueAtTime(f, start);
            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.29);
        });
    }

    function playArmorBreak() {
        const settings = window.StorageService.getSettings();
        if (!settings.sfxEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const freqs = [880, 1174.66, 1396.91];
        freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            const start = now + idx * 0.03;
            osc.frequency.setValueAtTime(f, start);
            osc.frequency.exponentialRampToValueAtTime(f * 0.55, start + 0.16);
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.17);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.18);
        });
    }

    function playPowerupActivate(type = "freeze") {
        const settings = window.StorageService.getSettings();
        if (!settings.sfxEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes =
            type === "emp"
                ? [330, 659.25, 987.77, 1318.5]
                : type === "shield"
                ? [440, 554.37, 659.25, 880]
                : [587.33, 880, 1174.66, 1567.98];

        notes.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type === "emp" ? "sawtooth" : "sine";
            const start = now + idx * 0.04;
            osc.frequency.setValueAtTime(f, start);
            gain.gain.setValueAtTime(0.09, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.34);
        });
    }

    function playBossSpawn() {
        const settings = window.StorageService.getSettings();
        if (!settings.sfxEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const freqs = [196.0, 293.66, 392.0, 587.33];
        freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            const start = now + idx * 0.08;
            osc.frequency.setValueAtTime(f, start);
            gain.gain.setValueAtTime(0.11, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.56);
        });
    }

    function playTypoError() {
        const settings = window.StorageService.getSettings();
        if (!settings.sfxEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(95, now + 0.11);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    function playShieldDamage() {
        const settings = window.StorageService.getSettings();
        if (!settings.sfxEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.28);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.31);
    }

    function createTtsAudioElement(url, rate = 1.0) {
        const audio = new Audio();
        audio.referrerPolicy = "no-referrer";
        audio.preload = "auto";
        audio.volume = 0.95;
        audio.playbackRate = rate;
        audio.src = url;
        return audio;
    }

    function canUseLocalTtsProxy() {
        if (window.ApiClient && window.ApiClient.isServerAvailable && window.ApiClient.isServerAvailable()) {
            return true;
        }
        const proto = (window.location && window.location.protocol) || "";
        const host = (window.location && window.location.hostname) || "";
        return (proto === "http:" || proto === "https:") && (host === "localhost" || host === "127.0.0.1");
    }

    function speakChinese(hanzi, customRate = null) {
        const settings = window.StorageService.getSettings();
        if (!settings.ttsEnabled || !hanzi) return;

        const rate = customRate || settings.ttsRate || 0.95;
        const encoded = encodeURIComponent(hanzi);
        const urls = [];
        if (canUseLocalTtsProxy()) {
            urls.push(`/api/tts?text=${encoded}`);
        }
        urls.push(`https://dict.youdao.com/dictvoice?audio=${encoded}&le=zh`);
        urls.push(`https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encoded}`);

        tryPlayUrlChain(hanzi, urls, 0, rate);
    }

    function tryPlayUrlChain(hanzi, urls, idx, rate) {
        if (idx >= urls.length) {
            speakWithWebSpeech(hanzi, rate);
            return;
        }
        try {
            const cacheKey = `${hanzi}_${idx === 0 ? "primary" : idx}`;
            let audio = audioCache.get(cacheKey);
            if (!audio) {
                audio = createTtsAudioElement(urls[idx], rate);
                if (audioCache.size > 160) {
                    const firstKey = audioCache.keys().next().value;
                    audioCache.delete(firstKey);
                }
                audioCache.set(cacheKey, audio);
            } else {
                audio.currentTime = 0;
                audio.playbackRate = rate;
            }
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    audioCache.delete(cacheKey);
                    tryPlayUrlChain(hanzi, urls, idx + 1, rate);
                });
            }
        } catch {
            tryPlayUrlChain(hanzi, urls, idx + 1, rate);
        }
    }

    function speakWithWebSpeech(hanzi, rate = 0.95) {
        if (!("speechSynthesis" in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(hanzi);
            utter.lang = "zh-CN";
            utter.rate = rate;
            if (zhVoice) utter.voice = zhVoice;
            window.speechSynthesis.speak(utter);
        } catch {
            // Ignore speech synthesis errors
        }
    }

    function preloadUnitAudio(words) {
        if (!Array.isArray(words)) return;
        const useProxy = canUseLocalTtsProxy();
        words.slice(0, 10).forEach(w => {
            if (w && w.hanzi) {
                const cacheKey = `${w.hanzi}_primary`;
                if (!audioCache.has(cacheKey)) {
                    const encoded = encodeURIComponent(w.hanzi);
                    const url = useProxy
                        ? `/api/tts?text=${encoded}`
                        : `https://dict.youdao.com/dictvoice?audio=${encoded}&le=zh`;
                    audioCache.set(cacheKey, createTtsAudioElement(url, 0.95));
                }
            }
        });
    }

    /**
     * Speech Recognition Pronunciation Grader (zh-CN)
     */
    function isSpeechRecognitionSupported() {
        return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    function assessSpeechPronunciation(expectedHanzi, timeoutMs = 5500) {
        return new Promise(resolve => {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRec) {
                resolve({
                    supported: false,
                    ok: false,
                    score: 0,
                    transcript: "",
                    feedback: "Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói (Khuyên dùng Chrome/Edge)."
                });
                return;
            }

            let settled = false;
            const rec = new SpeechRec();
            rec.lang = "zh-CN";
            rec.interimResults = false;
            rec.maxAlternatives = 3;

            const timer = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    try {
                        rec.stop();
                    } catch {
                        // ignore
                    }
                    resolve({
                        supported: true,
                        ok: false,
                        score: 0,
                        transcript: "",
                        feedback: "Chưa nghe rõ giọng đọc. Bạn hãy nhấn Mic và đọc to, rõ hơn nhé!"
                    });
                }
            }, timeoutMs);

            rec.onresult = event => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);

                const cleanTarget = String(expectedHanzi || "").replace(/[，。？！?,\s“”"']/g, "");
                let bestScore = 0;
                let bestTranscript = "";

                const resultList = event.results && event.results[0] ? Array.from(event.results[0]) : [];
                resultList.forEach(alt => {
                    const spoken = String(alt.transcript || "").replace(/[，。？！?,\s“”"']/g, "");
                    const sim = computeCharOverlapScore(cleanTarget, spoken);
                    if (sim >= bestScore) {
                        bestScore = sim;
                        bestTranscript = alt.transcript || "";
                    }
                });

                const passed = bestScore >= 65;
                if (passed) {
                    playWordExplosion();
                } else {
                    playTypoError();
                }

                resolve({
                    supported: true,
                    ok: passed,
                    score: bestScore,
                    transcript: bestTranscript,
                    feedback:
                        bestScore >= 90
                            ? `🌟 Phát âm chuẩn bản xứ (${bestScore}%)! Bạn đọc: "${bestTranscript}"`
                            : bestScore >= 65
                            ? `👍 Khá tốt (${bestScore}%)! Hệ thống nghe được: "${bestTranscript}"`
                            : `🔄 Cần rõ thanh điệu hơn (${bestScore}%). Nghe được: "${bestTranscript || "..."}"`
                });
            };

            rec.onerror = err => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                resolve({
                    supported: true,
                    ok: false,
                    score: 0,
                    transcript: "",
                    feedback:
                        err && err.error === "not-allowed"
                            ? "Vui lòng cấp quyền Microphone trên trình duyệt để chấm điểm phát âm."
                            : "Không thu được âm thanh. Hãy thử đọc lại!"
                });
            };

            try {
                rec.start();
            } catch {
                clearTimeout(timer);
                resolve({
                    supported: true,
                    ok: false,
                    score: 0,
                    transcript: "",
                    feedback: "Microphone đang bận. Vui lòng thử lại sau 1 giây."
                });
            }
        });
    }

    function computeCharOverlapScore(expected, spoken) {
        if (!expected || !spoken) return 0;
        if (expected === spoken || spoken.includes(expected)) return 100;
        const expChars = Array.from(expected);
        let hits = 0;
        expChars.forEach(ch => {
            if (spoken.includes(ch)) hits++;
        });
        return Math.round((hits / Math.max(expChars.length, spoken.length)) * 100);
    }

    const PIANO_SEQUENCE = [
        261.63, 329.63, 392.0, 493.88,
        220.0, 261.63, 329.63, 392.0,
        174.61, 220.0, 261.63, 349.23,
        196.0, 246.94, 293.66, 392.0
    ];
    let noteCursor = 0;

    function playPianoNote(freq) {
        const settings = window.StorageService.getSettings();
        if (!settings.bgmEnabled) return;
        const ctx = ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        sub.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        sub.frequency.setValueAtTime(freq * 0.5, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.028, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.4);

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 1.45);
        sub.stop(now + 1.45);
    }

    function startBGM() {
        const settings = window.StorageService.getSettings();
        if (!settings.bgmEnabled || isBgmPlaying) return;
        ensureContext();
        isBgmPlaying = true;
        bgmTimer = setInterval(() => {
            const currentSettings = window.StorageService.getSettings();
            if (!currentSettings.bgmEnabled) {
                stopBGM();
                return;
            }
            const freq = PIANO_SEQUENCE[noteCursor % PIANO_SEQUENCE.length];
            noteCursor++;
            playPianoNote(freq);
        }, 550);
    }

    function stopBGM() {
        isBgmPlaying = false;
        if (bgmTimer) {
            clearInterval(bgmTimer);
            bgmTimer = null;
        }
    }

    return {
        ensureContext,
        playLaserShot,
        playWordExplosion,
        playArmorBreak,
        playPowerupActivate,
        playBossSpawn,
        playTypoError,
        playShieldDamage,
        speakChinese,
        preloadUnitAudio,
        isSpeechRecognitionSupported,
        assessSpeechPronunciation,
        startBGM,
        stopBGM
    };
})();
