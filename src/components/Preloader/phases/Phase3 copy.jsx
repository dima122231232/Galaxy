"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function PreloaderFaza2() {
    const canvasRef = useRef(null);

    useEffect(() => {
        let CELL_SIZE = 15;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: true });
        const dpr = window.devicePixelRatio || 1;

        let cols, rows;

        const PHASES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "@"];
        let phaseIndex = 0;

        let grid = [];

        const state = {
            progress: 0,
        };

        function getOpacity(char) {
            if (char === "@") return 1;

            const num = parseInt(char, 10);
            if (!isNaN(num)) return num / 10;

            return 1;
        }

        function getColor() {
            return "#111";
        }

        function setupCanvas() {
            CELL_SIZE = window.innerWidth < 768 ? CELL_SIZE / 2.5 : CELL_SIZE;

            cols = Math.floor(window.innerWidth / CELL_SIZE );
            rows = Math.floor(window.innerHeight / CELL_SIZE);

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            grid = Array.from({ length: rows }, () =>
                Array.from({ length: cols }, () => "")
            );
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.font = `400 ${CELL_SIZE}px monospace`;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const char = grid[row][col];
                    if (!char) continue;

                    ctx.fillStyle = `rgba(17,17,17,${getOpacity(char)})`;

                    ctx.fillText(
                        char,
                        col * CELL_SIZE + CELL_SIZE / 2,
                        row * CELL_SIZE + CELL_SIZE / 2
                    );
                }
            }
        }

        function animate() {
            draw();
            requestAnimationFrame(animate);
        }

        function playPhase() {
            state.progress = 0;

            const char = PHASES[phaseIndex];

            gsap.to(state, {
                progress: 1,
                duration: Math.max(0.25, 1 - phaseIndex * 0.5),
                ease: "power2.in",

                onUpdate: () => {
                    const visibleRows = Math.floor(state.progress * rows);

                    for (let r = 0; r < visibleRows; r++) {
                        const row = rows - 1 - r;

                        for (let col = 0; col < cols; col++) {
                            grid[row][col] = char;
                        }
                    }
                },

                onComplete: () => {
                    phaseIndex++;

                    if (phaseIndex < PHASES.length) {
                        playPhase();
                    }
                },
            });
        }

        setupCanvas();
        animate();
        playPhase();

        window.addEventListener("resize", setupCanvas);

        return () => {
            window.removeEventListener("resize", setupCanvas);
        };
    }, []);

    return <canvas className="canvasASCII" ref={canvasRef} />;
}