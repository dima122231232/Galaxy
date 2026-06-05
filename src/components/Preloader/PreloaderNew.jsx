"use client";

import "./Preloader.css";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Preloader() {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // =========================
        // 🎛️ CONFIG (ВСЁ УПРАВЛЕНИЕ ЗДЕСЬ)
        // =========================

        const FONT_SIZE = 10;

        const REVEAL_DURATION = 7.5;

        const PARTICLE_CHAR = ".";
        const PARTICLE_SPAWN_RATE = 150; // ms

        const CENTER_PULL = 0.2;        // притяжение
        const SPIRAL_STRENGTH = .05;    // сила спирали
        const PARTICLE_SPEED = .01;      // общая скорость

        const PARTICLE_SIZE_START = 14;
        const PARTICLE_SIZE_END = 2;

        const ASCII_CHARS = "........,,,:::=+xX#0369@@";

        // =========================

        let state = {
            angle: 0,
            reveal: 0,
        };

        const particles = [];

        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        const measureCtx = document.createElement("canvas").getContext("2d");
        measureCtx.font = `${FONT_SIZE}px monospace`;

        const charWidth = Math.ceil(measureCtx.measureText("M").width);
        const charHeight = FONT_SIZE;

        const ASCII_COLUMNS = Math.floor(window.innerWidth / charWidth);
        const ASCII_ROWS = Math.floor(window.innerHeight / charHeight);

        const offscreen = document.createElement("canvas");
        const offCtx = offscreen.getContext("2d");

        // =========================
        // 🌌 ASCII (не трогаем)
        // =========================

        function imageToAsciiGrid() {
            offscreen.width = ASCII_COLUMNS;
            offscreen.height = ASCII_ROWS;

            offCtx.drawImage(img, 0, 0, ASCII_COLUMNS, ASCII_ROWS);

            const { data } = offCtx.getImageData(
                0,
                0,
                ASCII_COLUMNS,
                ASCII_ROWS
            );

            const asciiGrid = [];
            const t = performance.now() * 0.001;

            for (let y = 0; y < ASCII_ROWS; y++) {
                const row = [];

                for (let x = 0; x < ASCII_COLUMNS; x++) {
                    const i = (y * ASCII_COLUMNS + x) * 4;

                    let brightness =
                        (data[i] * 0.299 +
                            data[i + 1] * 0.587 +
                            data[i + 2] * 0.114) / 255;

                    brightness += Math.sin(t + x * 0.05 + y * 0.03) * 0.06;

                    brightness = Math.max(0, Math.min(1, brightness));

                    const charIndex = Math.floor(
                        brightness * (ASCII_CHARS.length - 1)
                    );

                    const char = ASCII_CHARS[charIndex];

                    row.push(char === "." ? null : char);
                }

                asciiGrid.push(row);
            }

            return { asciiGrid };
        }

        // =========================
        // 🧲 SPIRAL PARTICLES
        // =========================

        function spawnParticle() {
            const side = Math.floor(Math.random() * 4);
            const margin = 100;

            let x, y;

            if (side === 0) {
                x = -margin;
                y = Math.random() * window.innerHeight;
            } else if (side === 1) {
                x = window.innerWidth + margin;
                y = Math.random() * window.innerHeight;
            } else if (side === 2) {
                x = Math.random() * window.innerWidth;
                y = -margin;
            } else {
                x = Math.random() * window.innerWidth;
                y = window.innerHeight + margin;
            }

            particles.push({
                x,
                y,
                angle: 0,
                dist: 0,
                size: PARTICLE_SIZE_START,
            });
        }

        function updateParticles(ctx) {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                const dx = cx - p.x;
                const dy = cy - p.y;

                const dist = Math.sqrt(dx * dx + dy * dy);

                // =========================
                // 🌪 СПИРАЛЬНАЯ ФИЗИКА
                // =========================

                const angleToCenter = Math.atan2(dy, dx);

                p.angle += SPIRAL_STRENGTH;

                const spiralX =
                    Math.cos(angleToCenter + p.angle) * dist;
                const spiralY =
                    Math.sin(angleToCenter + p.angle) * dist;

                p.x += (dx + spiralX * 0.3) * CENTER_PULL * PARTICLE_SPEED;
                p.y += (dy + spiralY * 0.3) * CENTER_PULL * PARTICLE_SPEED;

                // =========================
                // 📉 размер уменьшается
                // =========================

                const scale = Math.max(0, dist / 800);

                p.size =
                    PARTICLE_SIZE_END +
                    (PARTICLE_SIZE_START - PARTICLE_SIZE_END) * scale;

                ctx.font = `${p.size}px monospace`;
                ctx.fillStyle = `rgba(180, 200, 255, ${scale})`;

                ctx.fillText(PARTICLE_CHAR, p.x, p.y);

                // удаление в центре
                if (dist < 15) {
                    particles.splice(i, 1);
                }
            }
        }

        // =========================
        // 🎨 ASCII DRAW
        // =========================

        function drawASCII(asciiGrid, ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = asciiGrid[0].length * charWidth;
            const height = asciiGrid.length * charHeight;

            const cx = width / 2;
            const cy = height / 2;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((state.angle * Math.PI) / 180);
            ctx.translate(-cx, -cy);

            ctx.font = `${FONT_SIZE}px monospace`;
            ctx.textBaseline = "top";

            for (let y = 0; y < asciiGrid.length; y++) {
                for (let x = 0; x < asciiGrid[y].length; x++) {
                    const char = asciiGrid[y][x];
                    if (!char) continue;

                    ctx.fillStyle = "rgba(245,245,240,1)";
                    ctx.fillText(char, x * charWidth, y * charHeight);
                }
            }

            ctx.restore();
        }

        // =========================
        // 🖥 CANVAS SETUP
        // =========================

        function prepareCanvas() {
            const dpr = window.devicePixelRatio || 1;

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            const ctx = canvas.getContext("2d");
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            return ctx;
        }

        const ctx = prepareCanvas();

        // =========================
        // 🔁 LOOP
        // =========================

        function loop() {
            const { asciiGrid } = imageToAsciiGrid();

            drawASCII(asciiGrid, ctx);
            updateParticles(ctx);

            requestAnimationFrame(loop);
        }

        loop();

        setInterval(spawnParticle, PARTICLE_SPAWN_RATE);

        // =========================
        // 🌱 GSAP
        // =========================

        gsap.to(state, {
            reveal: 1,
            duration: REVEAL_DURATION,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(state, {
                    angle: 3,
                    duration: 15,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            },
        });

        if (img.complete && img.naturalWidth) {
            // ok
        }
    }, []);

    return (
        <div className="preloader__content">
            <div className="preloader__container-img">
                <img
                    ref={imgRef}
                    className="galaxy"
                    src="/intro/gal.jpg"
                    alt="galaxy"
                />
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}