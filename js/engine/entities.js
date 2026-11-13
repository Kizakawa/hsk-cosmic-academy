/**
 * Game Entities & High-Detail Mecha/Sci-Fi Ship Renderer Module
 * Defines visual and physical objects rendered on the space canvas:
 * - Star & ShootingStar: Multi-layer background stars & streaking comets
 * - drawShipHull: Procedural multi-layer vector renderer for 4 distinct Spaceship models:
 *     1. cyan_nebula   : Tiêm Kích Tinh Vân (Swept-wing twin-jet interceptor)
 *     2. gold_phoenix  : Chiến Cơ Phượng Hoàng (3-tier feathered golden gunship)
 *     3. emerald_jade  : Phi Đội Ngọc Bích (Forward-swept stealth blade + rotating energy matrix)
 *     4. crimson_nova  : Chiến Hạm Siêu Tân Tinh (Heavy dreadnought + 2 floating Fin-Funnel Drones)
 * - FallingWord: Enemy Chinese word with Hexagonal Armor Shield, Sonar Radar, and Boss Command Ship
 * - Projectile: Oriented glowing plasma laser bolt with comet trail
 * - Shockwave & Particle: Expanding energy rings & firework burst particles
 * - FloatingMeaning: Vietnamese translation + Pinyin revealed when a word is destroyed
 */
window.GameEntities = (function () {
    class Star {
        constructor(canvasWidth, canvasHeight) {
            this.reset(canvasWidth, canvasHeight, true);
        }

        reset(canvasWidth, canvasHeight, randomY = false) {
            this.x = Math.random() * canvasWidth;
            this.y = randomY ? Math.random() * canvasHeight : -5;
            this.radius = Math.random() * 1.5 + 0.4;
            this.alpha = Math.random() * 0.65 + 0.15;
            this.speed = Math.random() * 12 + 3.5;
            this.twinkleSpeed = Math.random() * 2.2 + 1;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }

        update(dt, canvasWidth, canvasHeight) {
            this.y += this.speed * dt;
            this.twinklePhase += this.twinkleSpeed * dt;
            if (this.y > canvasHeight) {
                this.reset(canvasWidth, canvasHeight, false);
            }
        }

        draw(ctx) {
            const currentAlpha = this.alpha * (0.65 + 0.35 * Math.sin(this.twinklePhase));
            ctx.save();
            ctx.fillStyle = `rgba(190, 215, 255, ${currentAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.2, this.radius), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class ShootingStar {
        constructor(canvasWidth, canvasHeight) {
            this.reset(canvasWidth, canvasHeight);
            this.cooldown = Math.random() * 4 + 1;
            this.active = false;
        }

        reset(canvasWidth, canvasHeight) {
            this.x = Math.random() * canvasWidth * 0.8 + canvasWidth * 0.1;
            this.y = Math.random() * canvasHeight * 0.28 + 20;
            const angle = Math.PI * 0.22 + Math.random() * 0.18;
            const speed = 520 + Math.random() * 240;
            this.vx = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
            this.vy = Math.sin(angle) * speed;
            this.life = 1.0;
            this.active = true;
        }

        update(dt, canvasWidth, canvasHeight) {
            if (!this.active) {
                this.cooldown -= dt;
                if (this.cooldown <= 0) {
                    this.reset(canvasWidth, canvasHeight);
                }
                return;
            }
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.life -= dt * 1.45;
            if (this.life <= 0 || this.x < -100 || this.x > canvasWidth + 100 || this.y > canvasHeight) {
                this.active = false;
                this.cooldown = Math.random() * 6 + 3.5;
            }
        }

        draw(ctx) {
            if (!this.active || this.life <= 0) return;
            ctx.save();
            const tailX = this.x - this.vx * 0.09;
            const tailY = this.y - this.vy * 0.09;
            const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
            grad.addColorStop(0, `rgba(224, 242, 254, ${this.life.toFixed(2)})`);
            grad.addColorStop(1, "rgba(56, 189, 248, 0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
            ctx.restore();
        }
    }

    /**
     * Multi-layer procedural renderer for the 4 distinct Spaceship models.
     * Used both in live 60fps gameplay and in the Hangar Ship Preview cards.
     */
    function drawShipHull(ctx, skinId = "cyan_nebula", opts = {}) {
        const time = opts.time || performance.now() * 0.001;
        const recoil = opts.recoil || 0;
        const scale = opts.scale || 1;
        const comboHot = Boolean(opts.comboHot);

        ctx.save();
        ctx.scale(scale, scale);

        // Subtle outer energy shield ring
        const ringPulse = 0.32 + 0.14 * Math.sin(time * 4);
        ctx.save();
        ctx.strokeStyle =
            skinId === "gold_phoenix"
                ? `rgba(250, 204, 21, ${ringPulse})`
                : skinId === "emerald_jade"
                ? `rgba(52, 211, 153, ${ringPulse})`
                : skinId === "crimson_nova"
                ? `rgba(244, 63, 94, ${ringPulse})`
                : `rgba(56, 189, 248, ${ringPulse})`;
        ctx.lineWidth = comboHot ? 2.2 : 1.3;
        ctx.setLineDash([7, 5]);
        ctx.rotate(time * 0.65);
        ctx.beginPath();
        ctx.arc(0, 2, 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Apply barrel recoil translation
        ctx.translate(0, recoil * 5.5);

        // Muzzle flash when firing
        if (recoil > 0.35) {
            ctx.save();
            const flashAlpha = Math.min(1, recoil);
            ctx.fillStyle =
                skinId === "gold_phoenix"
                    ? `rgba(254, 240, 138, ${flashAlpha})`
                    : skinId === "crimson_nova"
                    ? `rgba(232, 121, 249, ${flashAlpha})`
                    : `rgba(110, 231, 183, ${flashAlpha})`;
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(0, -34, Math.max(0.5, 5.5 * recoil), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (skinId === "gold_phoenix") {
            drawPhoenixGunship(ctx, time);
        } else if (skinId === "emerald_jade") {
            drawJadeStealthFighter(ctx, time);
        } else if (skinId === "crimson_nova") {
            drawCrimsonDreadnought(ctx, time);
        } else {
            drawNebulaInterceptor(ctx, time);
        }

        ctx.restore();
    }

    function drawThrusterFlame(ctx, x, y, width, length, innerColor, outerColor, time) {
        const flicker = 0.84 + 0.26 * Math.sin(time * 28 + x);
        const flameLen = length * flicker;
        ctx.save();
        const grad = ctx.createLinearGradient(x, y, x, y + flameLen);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.35, innerColor);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.shadowColor = outerColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x - width, y);
        ctx.quadraticCurveTo(x, y + flameLen * 1.15, x + width, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /**
     * Skin 1: Phi Thuyền Tinh Vân (Swept-Wing Twin-Engine Space Interceptor)
     */
    function drawNebulaInterceptor(ctx, time) {
        // 1. Twin Plasma Afterburners
        drawThrusterFlame(ctx, -8, 17, 4.2, 20, "#38bdf8", "#0284c7", time);
        drawThrusterFlame(ctx, 8, 17, 4.2, 20, "#38bdf8", "#0284c7", time);

        // 2. Twin Wing Laser Cannons
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(-16, -18, 3, 18);
        ctx.fillRect(13, -18, 3, 18);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(-16, -21, 3, 4);
        ctx.fillRect(13, -21, 3, 4);

        // 3. Main Swept Delta Wings
        const wingGrad = ctx.createLinearGradient(0, -15, 0, 20);
        wingGrad.addColorStop(0, "#1e3a8a");
        wingGrad.addColorStop(0.6, "#0f172a");
        wingGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(56, 189, 248, 0.55)";
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(28, 12);
        ctx.lineTo(24, 19);
        ctx.lineTo(11, 14);
        ctx.lineTo(8, 20);
        ctx.lineTo(-8, 20);
        ctx.lineTo(-11, 14);
        ctx.lineTo(-24, 19);
        ctx.lineTo(-28, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 4. Inner Armor Fuselage
        ctx.shadowBlur = 0;
        const hullGrad = ctx.createLinearGradient(0, -30, 0, 18);
        hullGrad.addColorStop(0, "#e0f2fe");
        hullGrad.addColorStop(0.45, "#38bdf8");
        hullGrad.addColorStop(1, "#0369a1");
        ctx.fillStyle = hullGrad;
        ctx.beginPath();
        ctx.moveTo(0, -31);
        ctx.lineTo(10, 4);
        ctx.lineTo(6, 18);
        ctx.lineTo(-6, 18);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();

        // 5. Glowing Glass Cockpit Canopy
        const glassGrad = ctx.createLinearGradient(0, -14, 0, 6);
        glassGrad.addColorStop(0, "#ffffff");
        glassGrad.addColorStop(0.5, "#7dd3fc");
        glassGrad.addColorStop(1, "#0c4a6e");
        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.quadraticCurveTo(5.5, -3, 0, 7);
        ctx.quadraticCurveTo(-5.5, -3, 0, -15);
        ctx.fill();
    }

    /**
     * Skin 2: Chiến Cơ Hoàng Kim (3-Tier Feathered Golden Phoenix Gunship)
     */
    function drawPhoenixGunship(ctx, time) {
        // 1. Triple Solar Thrusters
        drawThrusterFlame(ctx, 0, 19, 5.2, 24, "#fde047", "#f97316", time);
        drawThrusterFlame(ctx, -11, 16, 3.5, 16, "#facc15", "#ea580c", time);
        drawThrusterFlame(ctx, 11, 16, 3.5, 16, "#facc15", "#ea580c", time);

        // 2. Outer Golden Phoenix Wings (Spread Feathers)
        const wingGrad = ctx.createLinearGradient(-32, -10, 32, 20);
        wingGrad.addColorStop(0, "#ca8a04");
        wingGrad.addColorStop(0.5, "#fef08a");
        wingGrad.addColorStop(1, "#a16207");

        ctx.save();
        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = "#fef9c3";
        ctx.lineWidth = 1.4;
        ctx.shadowColor = "rgba(250, 204, 21, 0.7)";
        ctx.shadowBlur = 16;

        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(16, -6);
        ctx.lineTo(32, -12); // Upper wing tip
        ctx.lineTo(27, 4);
        ctx.lineTo(34, 10);  // Mid feather tip
        ctx.lineTo(19, 14);
        ctx.lineTo(13, 21);
        ctx.lineTo(0, 16);
        ctx.lineTo(-13, 21);
        ctx.lineTo(-19, 14);
        ctx.lineTo(-34, 10);
        ctx.lineTo(-27, 4);
        ctx.lineTo(-32, -12);
        ctx.lineTo(-16, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 3. Crimson-Gold Inner Armor Body
        const bodyGrad = ctx.createLinearGradient(0, -33, 0, 18);
        bodyGrad.addColorStop(0, "#fef9c3");
        bodyGrad.addColorStop(0.45, "#f59e0b");
        bodyGrad.addColorStop(1, "#991b1b");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(0, -33);
        ctx.lineTo(9, -4);
        ctx.lineTo(6, 18);
        ctx.lineTo(0, 22);
        ctx.lineTo(-6, 18);
        ctx.lineTo(-9, -4);
        ctx.closePath();
        ctx.fill();

        // 4. Glowing Sun-Core Gem in Center
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(5, -3);
        ctx.lineTo(0, 6);
        ctx.lineTo(-5, -3);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Skin 3: Phi Đội Ngọc Bích (Forward-Swept Cyber-Stealth Blade + Jade Matrix)
     */
    function drawJadeStealthFighter(ctx, time) {
        // 1. Rotating Octagonal Jade Matrix Ring
        ctx.save();
        ctx.rotate(-time * 1.4);
        ctx.strokeStyle = "rgba(52, 211, 153, 0.5)";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-18, -18, 36, 36);
        ctx.restore();

        // 2. Twin Jade Plasma Plumes
        drawThrusterFlame(ctx, -7, 17, 4.0, 19, "#6ee7b7", "#059669", time);
        drawThrusterFlame(ctx, 7, 17, 4.0, 19, "#6ee7b7", "#059669", time);

        // 3. Forward-Swept Cyber Blades (Claw Wings)
        const bladeGrad = ctx.createLinearGradient(0, -28, 0, 20);
        bladeGrad.addColorStop(0, "#34d399");
        bladeGrad.addColorStop(0.5, "#065f46");
        bladeGrad.addColorStop(1, "#022c22");

        ctx.fillStyle = bladeGrad;
        ctx.strokeStyle = "#6ee7b7";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(16, 185, 129, 0.65)";
        ctx.shadowBlur = 15;

        ctx.beginPath();
        // Twin nose prongs
        ctx.moveTo(-4, -30);
        ctx.lineTo(0, -22);
        ctx.lineTo(4, -30);
        ctx.lineTo(11, -8);
        // Forward-swept outer claw
        ctx.lineTo(27, -18);
        ctx.lineTo(29, 6);
        ctx.lineTo(15, 19);
        ctx.lineTo(0, 14);
        ctx.lineTo(-15, 19);
        ctx.lineTo(-29, 6);
        ctx.lineTo(-27, -18);
        ctx.lineTo(-11, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 4. Glowing Jade Reactor Crystal
        ctx.fillStyle = "#ecfdf5";
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, -2, 5.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Skin 4: Tàu Siêu Tân Tinh (Crimson Nova Dreadnought + 2 Floating Fin-Funnel Drones)
     */
    function drawCrimsonDreadnought(ctx, time) {
        // 1. Triple Nova Afterburners
        drawThrusterFlame(ctx, 0, 19, 5.5, 23, "#e879f9", "#e11d48", time);
        drawThrusterFlame(ctx, -10, 17, 3.8, 17, "#f43f5e", "#9333ea", time);
        drawThrusterFlame(ctx, 10, 17, 3.8, 17, "#f43f5e", "#9333ea", time);

        // 2. Two Autonomous Floating Fin-Funnel Drones hovering on left & right
        const droneBob = Math.sin(time * 5) * 3.2;
        [-33, 33].forEach(dx => {
            ctx.save();
            ctx.translate(dx, -4 + droneBob);
            drawThrusterFlame(ctx, 0, 10, 2.2, 10, "#c084fc", "#f43f5e", time);
            ctx.fillStyle = "#881337";
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 1.3;
            ctx.shadowColor = "#e879f9";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.lineTo(5, 4);
            ctx.lineTo(0, 10);
            ctx.lineTo(-5, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // 3. Heavy Dreadnought Hull & Twin Railguns
        ctx.fillStyle = "#e879f9";
        ctx.fillRect(-11, -28, 3, 16);
        ctx.fillRect(8, -28, 3, 16);

        const hullGrad = ctx.createLinearGradient(0, -26, 0, 20);
        hullGrad.addColorStop(0, "#fb7185");
        hullGrad.addColorStop(0.5, "#9f1239");
        hullGrad.addColorStop(1, "#3b0764");

        ctx.fillStyle = hullGrad;
        ctx.strokeStyle = "#fda4af";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(244, 63, 94, 0.7)";
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(9, -12);
        ctx.lineTo(23, -2);
        ctx.lineTo(25, 14);
        ctx.lineTo(13, 19);
        ctx.lineTo(0, 15);
        ctx.lineTo(-13, 19);
        ctx.lineTo(-25, 14);
        ctx.lineTo(-23, -2);
        ctx.lineTo(-9, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 4. Singularity Violet-White Core
        ctx.fillStyle = "#fae8ff";
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(6, -1);
        ctx.lineTo(0, 9);
        ctx.lineTo(-6, -1);
        ctx.closePath();
        ctx.fill();
    }

    class Shockwave {
        constructor(x, y, color = "#38bdf8", maxRadius = 68) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = 8;
            this.maxRadius = maxRadius;
            this.life = 1.0;
        }

        update(dt) {
            const safeDt = Math.max(0, Number(dt) || 0);
            this.radius = Math.max(0.5, this.radius + (this.maxRadius - this.radius) * Math.min(1, safeDt * 8.5));
            this.life -= safeDt * 2.2;
        }

        draw(ctx) {
            if (this.life <= 0 || this.radius <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, this.life * 0.75));
            ctx.strokeStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 12;
            ctx.lineWidth = Math.max(0.5, 2.5 * this.life);
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    class FallingWord {
        constructor(wordData, x, y, speed, targetMode = "pinyin", entityType = "normal") {
            this.wordData = wordData;
            this.hanzi = wordData.hanzi;
            this.pinyin = wordData.pinyin;
            this.meaning = wordData.meaning;
            this.meaningHint = window.VocabDatabase.getDisplayMeaningHint(wordData);
            this.entityType = entityType || "normal";

            if (this.entityType === "armored") {
                this.armorPhase = 1;
                this.maxArmorPhases = 2;
                this.targetMode = "pinyin";
            } else {
                this.armorPhase = 1;
                this.maxArmorPhases = 1;
                this.targetMode = ["meaning", "listening"].includes(targetMode) ? targetMode : "pinyin";
            }

            this.refreshVariantsForMode();

            this.typedProgress = "";
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.isLocked = false;
            this.hitPulse = 0;
            this.errorShake = 0;
            this.revealHint = false;
            this.spawnAlpha = 0;
            this.pulseTime = Math.random() * Math.PI * 2;
        }

        refreshVariantsForMode() {
            const settings = window.StorageService ? window.StorageService.getSettings() : {};
            const requireTones = Boolean(settings && settings.toneMode) && this.targetMode !== "meaning";
            if (this.targetMode === "meaning") {
                this.variants = window.VocabDatabase.getValidMeaningVariants(this.wordData);
            } else {
                this.variants = window.VocabDatabase.getValidPinyinVariants(this.wordData, requireTones);
            }
            this.activeTargetPinyin = this.variants[0] || "";
        }

        breakArmorLayer() {
            if (this.entityType === "armored" && this.armorPhase === 1) {
                this.armorPhase = 2;
                this.targetMode = "meaning";
                this.refreshVariantsForMode();
                this.typedProgress = "";
                this.hitPulse = 1.4;
                this.y = Math.max(64, this.y - 36);
                return true;
            }
            return false;
        }

        get remainingLength() {
            return Math.max(0, this.activeTargetPinyin.length - this.typedProgress.length);
        }

        matchesNextChar(char) {
            const currentCandidate = this.typedProgress + char;
            for (let i = 0; i < this.variants.length; i++) {
                const variant = this.variants[i];
                if (variant.startsWith(currentCandidate)) {
                    this.activeTargetPinyin = variant;
                    return true;
                }
            }
            return false;
        }

        advanceChar(char) {
            if (this.matchesNextChar(char)) {
                this.typedProgress += char;
                this.hitPulse = 1.0;
                return true;
            }
            return false;
        }

        isCompleted() {
            return this.typedProgress.length > 0 && this.typedProgress === this.activeTargetPinyin;
        }

        triggerError() {
            this.errorShake = 1.0;
        }

        update(dt, speedScale = 1.0) {
            this.y += this.speed * speedScale * dt;
            this.pulseTime += dt * 3.2;
            if (this.spawnAlpha < 1) {
                this.spawnAlpha = Math.min(1, this.spawnAlpha + dt * 3.5);
            }
            if (this.hitPulse > 0) {
                this.hitPulse = Math.max(0, this.hitPulse - dt * 5);
            }
            if (this.errorShake > 0) {
                this.errorShake = Math.max(0, this.errorShake - dt * 6);
            }
        }

        draw(ctx, hintMode, difficulty = "chill", canvasHeight = 800, isFrozen = false) {
            ctx.save();
            const shakeOffset = this.errorShake > 0 ? Math.sin(this.errorShake * 35) * 5 * this.errorShake : 0;
            const scale = 1 + this.hitPulse * 0.14;

            ctx.translate(this.x + shakeOffset, this.y);
            ctx.scale(scale, scale);
            ctx.globalAlpha = this.spawnAlpha;

            const isGentleDifficulty = difficulty === "chill" || difficulty === "zen";
            const autoGentleHint =
                isGentleDifficulty &&
                this.y > canvasHeight * (this.targetMode === "listening" ? 0.68 : 0.48);
            const showFullAssist = hintMode === "assist" || this.revealHint || autoGentleHint;

            // Cyber Target Lock-On Reticle when locked!
            if (this.isLocked && this.entityType !== "boss") {
                this.drawLockOnReticle(ctx);
            }

            this.drawSpecialFrame(ctx, isFrozen);

            if (this.entityType === "boss") {
                // Boss never spoils Pinyin/keystrokes automatically; only reveals when player explicitly presses Tab / 🔍
                this.drawBossMode(ctx, Boolean(this.revealHint));
            } else if (this.targetMode === "meaning") {
                this.drawMeaningMode(ctx, showFullAssist, isGentleDifficulty);
            } else if (this.targetMode === "listening") {
                this.drawListeningMode(ctx, showFullAssist);
            } else {
                this.drawPinyinMode(ctx, showFullAssist, isGentleDifficulty);
            }

            ctx.restore();
        }

        drawLockOnReticle(ctx) {
            ctx.save();
            const isMeaningLayout = this.targetMode === "meaning";
            const padX = this.entityType === "armored" ? 76 : 64;
            const topY = -28;
            const bottomY = isMeaningLayout ? 64 : 52;
            const len = 10;
            ctx.strokeStyle = this.errorShake > 0 ? "#ef4444" : "#facc15";
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(250, 204, 21, 0.8)";
            ctx.shadowBlur = 8;

            // 4 corner cyber brackets adapting to vertical content height
            const corners = [
                [-padX, topY, 1, 1],
                [padX, topY, -1, 1],
                [-padX, bottomY, 1, -1],
                [padX, bottomY, -1, -1]
            ];
            corners.forEach(([cx, cy, dx, dy]) => {
                ctx.beginPath();
                ctx.moveTo(cx + dx * len, cy);
                ctx.lineTo(cx, cy);
                ctx.lineTo(cx, cy + dy * len);
                ctx.stroke();
            });
            ctx.restore();
        }

        drawMeaningPill(ctx, text, y, isHighlighted = false) {
            if (!text) return;
            ctx.save();
            ctx.font = "600 13.5px 'Segoe UI', 'Inter', system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowBlur = 0;

            const textWidth = ctx.measureText(text).width;
            const padX = 10;
            const pillW = Math.max(46, textWidth + padX * 2);
            const pillH = 22;

            ctx.fillStyle = isHighlighted
                ? "rgba(15, 23, 42, 0.92)"
                : "rgba(15, 23, 42, 0.84)";
            ctx.strokeStyle = isHighlighted
                ? "rgba(250, 204, 21, 0.65)"
                : "rgba(56, 189, 248, 0.38)";
            ctx.lineWidth = isHighlighted ? 1.4 : 1.1;

            ctx.beginPath();
            ctx.roundRect(-pillW / 2, y - pillH / 2, pillW, pillH, 11);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isHighlighted ? "#fef08a" : "#bae6fd";
            ctx.fillText(text, 0, y + 0.5);
            ctx.restore();
        }

        drawSpecialFrame(ctx, isFrozen) {
            if (this.entityType === "boss") {
                return;
            }
            if (this.entityType === "armored") {
                const isPhase1 = this.armorPhase === 1;
                ctx.save();
                ctx.strokeStyle = isPhase1 ? "rgba(250, 204, 21, 0.85)" : "rgba(52, 211, 153, 0.88)";
                ctx.fillStyle = isPhase1 ? "rgba(250, 204, 21, 0.09)" : "rgba(16, 185, 129, 0.11)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-86, -36, 172, 108, 14);
                ctx.fill();
                ctx.stroke();

                ctx.font = "700 11px 'Segoe UI', 'Inter', sans-serif";
                ctx.textAlign = "center";
                ctx.fillStyle = isPhase1 ? "#fde047" : "#6ee7b7";
                ctx.fillText(isPhase1 ? "🛡️ GIÁP 1/2: GÕ PINYIN" : "⚔️ GIÁP 2/2: GÕ NGHĨA", 0, -45);
                ctx.restore();
            } else if (this.entityType.startsWith("powerup_")) {
                let badgeText = "❄️ ĐÓNG BĂNG";
                let strokeCol = "rgba(56, 189, 248, 0.88)";
                let bgCol = "rgba(56, 189, 248, 0.14)";
                if (this.entityType === "powerup_emp") {
                    badgeText = "⚡ BÃO TỪ EMP";
                    strokeCol = "rgba(192, 132, 252, 0.88)";
                    bgCol = "rgba(192, 132, 252, 0.14)";
                } else if (this.entityType === "powerup_shield") {
                    badgeText = "💚 HỒI KHIÊN +1";
                    strokeCol = "rgba(74, 222, 128, 0.88)";
                    bgCol = "rgba(74, 222, 128, 0.14)";
                }
                ctx.save();
                ctx.strokeStyle = strokeCol;
                ctx.fillStyle = bgCol;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.roundRect(-78, -34, 156, 94, 24);
                ctx.fill();
                ctx.stroke();

                ctx.font = "700 11px 'Segoe UI', 'Inter', sans-serif";
                ctx.textAlign = "center";
                ctx.fillStyle = "#f8fafc";
                ctx.fillText(badgeText, 0, -43);
                ctx.restore();
            } else if (isFrozen) {
                ctx.save();
                ctx.strokeStyle = "rgba(125, 211, 252, 0.45)";
                ctx.lineWidth = 1.2;
                ctx.strokeRect(-54, -28, 108, 84);
                ctx.restore();
            }
        }

        /**
         * Boss Mothership Rendering (With UFO / Command Cruiser Hull Crown + HP Bar)
         */
        drawBossMode(ctx, showBossAssist = false) {
            const totalLen = Math.max(1, this.activeTargetPinyin.length);
            const hpRatio = Math.max(0, (totalLen - this.typedProgress.length) / totalLen);
            const revealAnswer = Boolean(showBossAssist || this.revealHint);

            ctx.save();

            // Measure content widths so full Boss sentences fit cleanly inside the Mothership hull
            ctx.font = "800 25px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
            const hanziW = ctx.measureText(this.hanzi).width;

            const meaningLabel = revealAnswer
                ? `${this.pinyin} — ${this.meaning}`
                : `🇻🇳 Nghĩa: ${this.meaning}`;
            ctx.font = "600 13.5px 'Segoe UI', 'Inter', sans-serif";
            const meaningW = ctx.measureText(meaningLabel).width + 28;

            const typed = this.typedProgress;
            const rawUntyped = this.activeTargetPinyin.slice(typed.length);
            const displayUntyped = revealAnswer ? rawUntyped : "•".repeat(rawUntyped.length);
            const fullDisplay = typed + displayUntyped;
            ctx.font = "700 15.5px 'JetBrains Mono', 'Consolas', 'Inter', monospace";
            const progressW = ctx.measureText(fullDisplay).width;

            const frameW = Math.max(360, Math.min(680, Math.max(hanziW, meaningW, progressW) + 56));
            const halfW = frameW / 2;

            // 1. Draw Command Mothership Saucer Crown above the frame
            ctx.fillStyle = "#1e293b";
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-78, -54);
            ctx.lineTo(-44, -72);
            ctx.lineTo(44, -72);
            ctx.lineTo(78, -54);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Pulsing Mothership Core Lights
            [-36, 0, 36].forEach((lx, idx) => {
                const blink = 0.5 + 0.5 * Math.sin(this.pulseTime * 3 + idx);
                ctx.fillStyle = `rgba(251, 191, 36, ${blink.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(lx, -63, 3.5, 0, Math.PI * 2);
                ctx.fill();
            });

            // 2. Glowing Mothership Hull Frame
            ctx.strokeStyle = this.errorShake > 0 ? "#ef4444" : "#f59e0b";
            ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
            ctx.shadowColor = "rgba(245, 158, 11, 0.58)";
            ctx.shadowBlur = 20;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.roundRect(-halfW, -54, frameW, 134, 16);
            ctx.fill();
            ctx.stroke();

            // 3. Boss Header + HP Bar
            ctx.shadowBlur = 0;
            ctx.font = "800 11.5px 'Segoe UI', 'Inter', sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#fbbf24";
            ctx.fillText("🛸 BOSS BÀI KHÓA • CÂU GIAO TIẾP TRỌNG TÂM", 0, -38);

            const barW = Math.min(frameW - 64, 340);
            const barH = 6.5;
            ctx.fillStyle = "rgba(51, 65, 85, 0.88)";
            ctx.fillRect(-barW / 2, -26, barW, barH);
            ctx.fillStyle = hpRatio > 0.4 ? "#f59e0b" : "#ef4444";
            ctx.fillRect(-barW / 2, -26, barW * hpRatio, barH);

            // 4. Boss Chinese Sentence
            ctx.font = "800 25px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(this.hanzi, 0, -1);

            // 5. Sub-line: Vietnamese Meaning Pill (Only reveals Pinyin when player presses Tab / 🔍)
            this.drawMeaningPill(ctx, meaningLabel, 24, true);

            // 6. Typed Progress Bar (Masked as •••• unless typed or player pressed Tab / 🔍)
            ctx.font = "700 15.5px 'JetBrains Mono', 'Consolas', 'Inter', monospace";
            const totalWidth = ctx.measureText(fullDisplay).width;
            const typedWidth = ctx.measureText(typed).width;
            const startX = -totalWidth / 2;

            ctx.textAlign = "left";
            ctx.fillStyle = "#4ade80";
            ctx.fillText(typed, startX, 49);
            ctx.fillStyle = revealAnswer ? "rgba(241, 245, 249, 0.88)" : "rgba(226, 232, 240, 0.72)";
            ctx.fillText(displayUntyped, startX + typedWidth, 49);

            // 7. Subtle helper caption when Pinyin is hidden
            ctx.textAlign = "center";
            ctx.font = "500 11px 'Segoe UI', 'Inter', sans-serif";
            ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
            ctx.fillText(
                revealAnswer
                    ? "💡 Đang hiện gợi ý Pinyin • Nhấn [Space] để nghe lại câu"
                    : "Nhấn [Tab] hoặc nút 🔍 nếu cần gợi ý Pinyin • [Space] nghe lại",
                0,
                67
            );

            ctx.restore();
        }

        drawListeningMode(ctx, showFullAssist) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Only reveal Hanzi & full answer if Assist mode is ON or user explicitly pressed Tab (revealHint), NOT merely because locked!
            const revealHanzi = showFullAssist || this.revealHint;

            if (revealHanzi) {
                ctx.font = "700 28px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
                ctx.shadowColor = "rgba(56, 189, 248, 0.85)";
                ctx.shadowBlur = 14;
                ctx.fillStyle = "#facc15";
                ctx.fillText(`🎧 ${this.hanzi}`, 0, -10);

                this.drawMeaningPill(ctx, `${this.pinyin} • ${this.meaningHint}`, 16, true);
            } else {
                const wave = (Math.sin(this.pulseTime) + 1) * 0.5;
                ctx.strokeStyle = this.isLocked
                    ? "#facc15"
                    : `rgba(56, 189, 248, ${0.35 + wave * 0.45})`;
                ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.roundRect(-80, -26, 160, 48, 999);
                ctx.fill();
                ctx.stroke();

                ctx.font = "700 13.5px 'Segoe UI', 'Inter', sans-serif";
                ctx.fillStyle = this.isLocked ? "#fde047" : "#38bdf8";
                ctx.fillText("🎧 Nghe & Gõ Pinyin", 0, -7);

                ctx.font = "600 12.5px 'Segoe UI', 'Inter', sans-serif";
                ctx.fillStyle = "#fef08a";
                ctx.fillText(`💡 Nghĩa: ${this.meaningHint}`, 0, 11);
            }

            ctx.font = "700 15.5px 'JetBrains Mono', 'Consolas', 'Inter', monospace";
            const typed = this.typedProgress;
            const rawUntyped = this.activeTargetPinyin.slice(typed.length);

            if (revealHanzi) {
                const totalWidth = ctx.measureText(this.activeTargetPinyin).width;
                const typedWidth = ctx.measureText(typed).width;
                const startX = -totalWidth / 2;

                ctx.textAlign = "left";
                ctx.fillStyle = "#4ade80";
                ctx.fillText(typed, startX, 38);
                ctx.fillStyle = "rgba(226, 232, 240, 0.82)";
                ctx.fillText(rawUntyped, startX + typedWidth, 38);
            } else if (typed.length > 0 || this.isLocked) {
                const maskedUntyped = "•".repeat(rawUntyped.length);
                const fullStr = typed + maskedUntyped;
                const totalWidth = ctx.measureText(fullStr).width;
                const typedWidth = ctx.measureText(typed).width;
                const startX = -totalWidth / 2;

                ctx.textAlign = "left";
                ctx.fillStyle = "#4ade80";
                ctx.fillText(typed, startX, 38);
                ctx.fillStyle = "rgba(226, 232, 240, 0.78)";
                ctx.fillText(maskedUntyped, startX + typedWidth, 38);
            } else {
                ctx.font = "500 12px 'Segoe UI', 'Inter', sans-serif";
                ctx.fillStyle = "rgba(148, 163, 184, 0.82)";
                ctx.fillText(`(${this.activeTargetPinyin.length} ký tự • Space nghe lại)`, 0, 36);
            }
        }

        drawPinyinMode(ctx, showFullAssist, isGentleDifficulty = true) {
            ctx.font = "700 31px 'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (this.hanzi.length === 1 && !this.isLocked && this.y < 140 && this.entityType === "normal") {
                ctx.strokeStyle = "rgba(96, 165, 250, 0.45)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-22, -30, 44, 42);
            }

            if (this.isLocked) {
                ctx.shadowColor = this.errorShake > 0 ? "rgba(239, 68, 68, 0.9)" : "rgba(250, 204, 21, 0.85)";
                ctx.shadowBlur = 16;
                ctx.fillStyle = this.errorShake > 0 ? "#f87171" : "#facc15";
            } else {
                ctx.shadowColor = "rgba(147, 197, 253, 0.45)";
                ctx.shadowBlur = 10;
                ctx.fillStyle = "#f1f5f9";
            }

            ctx.fillText(this.hanzi, 0, -10);

            // Crisp Vietnamese meaning pill beneath Hanzi so learners clearly see meaning while typing Pinyin
            if (this.entityType !== "armored" || this.armorPhase === 1) {
                this.drawMeaningPill(ctx, this.meaningHint, 18, this.isLocked);
            }

            if (this.isLocked || showFullAssist) {
                ctx.font = "700 16px 'JetBrains Mono', 'Consolas', 'Inter', monospace";
                ctx.shadowBlur = 8;

                if (showFullAssist) {
                    const typed = this.typedProgress;
                    const untyped = this.activeTargetPinyin.slice(typed.length);
                    const totalWidth = ctx.measureText(this.activeTargetPinyin).width;
                    const typedWidth = ctx.measureText(typed).width;
                    const startX = -totalWidth / 2;

                    ctx.textAlign = "left";
                    ctx.shadowColor = "rgba(74, 222, 128, 0.85)";
                    ctx.fillStyle = "#4ade80";
                    ctx.fillText(typed, startX, 42);

                    ctx.shadowBlur = 0;
                    ctx.fillStyle = this.isLocked ? "rgba(241, 245, 249, 0.88)" : "rgba(203, 213, 225, 0.82)";
                    ctx.fillText(untyped, startX + typedWidth, 42);
                } else if (this.typedProgress.length > 0) {
                    ctx.textAlign = "center";
                    ctx.shadowColor = "rgba(74, 222, 128, 0.85)";
                    ctx.fillStyle = "#4ade80";
                    ctx.fillText(this.typedProgress, 0, 42);
                }
            }
        }

        drawMeaningMode(ctx, showFullAssist, isGentleDifficulty) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.font = "700 30px 'Noto Sans SC', 'Microsoft YaHei', 'PingFang SC', sans-serif";
            if (this.isLocked) {
                ctx.shadowColor = this.errorShake > 0 ? "rgba(239, 68, 68, 0.9)" : "rgba(250, 204, 21, 0.85)";
                ctx.shadowBlur = 16;
                ctx.fillStyle = this.errorShake > 0 ? "#f87171" : "#facc15";
            } else {
                ctx.shadowColor = "rgba(147, 197, 253, 0.45)";
                ctx.shadowBlur = 10;
                ctx.fillStyle = "#f8fafc";
            }
            ctx.fillText(this.hanzi, 0, -13);

            ctx.font = "600 14.5px 'Segoe UI', 'Inter', sans-serif";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(56, 189, 248, 0.45)";
            ctx.fillStyle = this.isLocked ? "#fde047" : "#38bdf8";
            ctx.fillText(this.pinyin, 0, 10);

            const showMeaningBadge =
                showFullAssist || this.isLocked || this.entityType === "armored" || this.revealHint;

            if (showMeaningBadge) {
                this.drawMeaningPill(ctx, `🇻🇳 ${this.meaningHint}`, 33, true);
            } else if (isGentleDifficulty) {
                const firstLetter = this.activeTargetPinyin.charAt(0).toUpperCase();
                this.drawMeaningPill(
                    ctx,
                    `Gõ nghĩa [${firstLetter}...] (${this.activeTargetPinyin.length} chữ)`,
                    33,
                    false
                );
            }

            ctx.font = "700 16px 'JetBrains Mono', 'Consolas', 'Inter', monospace";
            const typed = this.typedProgress;
            const rawUntyped = this.activeTargetPinyin.slice(typed.length);

            if (showFullAssist || this.revealHint) {
                const totalWidth = ctx.measureText(this.activeTargetPinyin).width;
                const typedWidth = ctx.measureText(typed).width;
                const startX = -totalWidth / 2;

                ctx.textAlign = "left";
                ctx.shadowColor = "rgba(74, 222, 128, 0.85)";
                ctx.shadowBlur = 8;
                ctx.fillStyle = "#4ade80";
                ctx.fillText(typed, startX, 56);

                ctx.shadowBlur = 0;
                ctx.fillStyle = this.isLocked ? "rgba(241, 245, 249, 0.88)" : "rgba(203, 213, 225, 0.82)";
                ctx.fillText(rawUntyped, startX + typedWidth, 56);
            } else if (this.isLocked || typed.length > 0) {
                const maskedUntyped = "•".repeat(rawUntyped.length);
                const fullStr = typed + maskedUntyped;
                const totalWidth = ctx.measureText(fullStr).width;
                const typedWidth = ctx.measureText(typed).width;
                const startX = -totalWidth / 2;

                ctx.textAlign = "left";
                ctx.shadowColor = "rgba(74, 222, 128, 0.85)";
                ctx.shadowBlur = 8;
                ctx.fillStyle = "#4ade80";
                ctx.fillText(typed, startX, 56);

                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(226, 232, 240, 0.78)";
                ctx.fillText(maskedUntyped, startX + typedWidth, 56);
            }
        }
    }

    class Projectile {
        constructor(startX, startY, targetWord, isFinalShot, skin = null) {
            this.x = startX;
            this.y = startY;
            this.targetWord = targetWord;
            this.targetX = targetWord.x;
            this.targetY = targetWord.y + 10;
            this.speed = 1420;
            this.isFinalShot = isFinalShot;
            this.completed = false;
            this.trail = [];
            this.angle = Math.atan2(this.targetY - startY, this.targetX - startX);
            this.laserColor = (skin && skin.laserColor) || "#34d399";
            this.trailRgba = (skin && skin.trailRgba) || "110, 231, 183";
        }

        update(dt) {
            if (this.targetWord) {
                this.targetX = this.targetWord.x;
                this.targetY = this.targetWord.y + 8;
            }

            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 7) {
                this.trail.shift();
            }

            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);
            this.angle = Math.atan2(dy, dx);

            if (dist <= this.speed * dt + 14) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.completed = true;
            } else {
                this.x += (dx / dist) * this.speed * dt;
                this.y += (dy / dist) * this.speed * dt;
            }
        }

        draw(ctx) {
            ctx.save();
            // Glowing Ribbon Trail
            for (let i = 0; i < this.trail.length; i++) {
                const pt = this.trail[i];
                const ratio = (i + 1) / (this.trail.length + 1);
                ctx.fillStyle = `rgba(${this.trailRgba}, ${ratio * 0.52})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, Math.max(0.2, 2.6 * ratio), 0, Math.PI * 2);
                ctx.fill();
            }

            // Elongated Oriented Plasma Laser Bolt
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.shadowColor = this.laserColor;
            ctx.shadowBlur = 14;
            ctx.fillStyle = this.laserColor;
            ctx.beginPath();
            ctx.roundRect(-10, -2.6, 18, 5.2, 3);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(-5, -1.3, 11, 2.6, 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Particle {
        constructor(x, y, color, speedScale = 1) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 115 + 35) * speedScale;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1.0;
            this.decay = Math.random() * 0.9 + 0.75;
            this.size = Math.random() * 2.8 + 1.4;
            this.color = color;
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.life -= this.decay * dt;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, this.life));
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.2, this.size), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class FloatingMeaning {
        constructor(x, y, meaning, pinyin, hanzi) {
            this.x = x;
            this.y = y;
            this.meaning = meaning;
            this.pinyin = pinyin;
            this.hanzi = hanzi;
            this.life = 1.0;
            this.duration = 2.1;
        }

        update(dt) {
            this.y -= 13 * dt;
            this.life -= dt / this.duration;
        }

        draw(ctx, canvasWidth) {
            if (this.life <= 0) return;
            ctx.save();
            const alpha = this.life > 0.85 ? (1 - this.life) / 0.15 : Math.min(1, this.life * 1.4);
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            ctx.font = "700 21px 'Inter', 'Segoe UI', sans-serif";
            const textWidth = ctx.measureText(this.meaning).width;
            const clampedX = Math.max(textWidth / 2 + 20, Math.min(canvasWidth - textWidth / 2 - 20, this.x));

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.shadowColor = "rgba(15, 23, 42, 0.95)";
            ctx.shadowBlur = 12;
            ctx.fillStyle = "#ffffff";
            ctx.fillText(this.meaning, clampedX, this.y);

            ctx.font = "500 13.5px 'Inter', 'Segoe UI', sans-serif";
            ctx.fillStyle = "rgba(110, 231, 183, 0.95)";
            ctx.fillText(`${this.hanzi} • ${this.pinyin}`, clampedX, this.y + 22);

            ctx.restore();
        }
    }

    return {
        Star,
        ShootingStar,
        Shockwave,
        drawShipHull,
        FallingWord,
        Projectile,
        Particle,
        FloatingMeaning
    };
})();
