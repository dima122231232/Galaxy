"use client";
import { useEffect, useRef } from "react";

export default function PreloaderPhase3({ onComplete }) {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        let CELL_SIZE = 15;

        const CHAR_COLOR = "#111";
        const ASCII_CHARS = "@AVISUALANIMAL";

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: true });
        const img = imgRef.current;

        if (!canvas || !ctx || !img) return;

        const dpr = window.devicePixelRatio || 1;

        let cols = 0;
        let rows = 0;
        let grid = [];
        let symbolIndex = 0;
        let fall = false;
        let revealRow = 0;
        let revealDone = false;
        let destroyed = false;
        let completed = false;
        let rafId = 0;
        let revealInterval = 0;
        let symbolInterval = 0;
        let fallTimer = 0;
        let maxLifetimeTimer = 0;
        let resizeHandler = null;

        function setupCanvas() {
            CELL_SIZE = window.innerWidth < 768 ? 3 : CELL_SIZE;

            cols = Math.floor(window.innerWidth / CELL_SIZE);
            rows = Math.floor(window.innerHeight / CELL_SIZE);

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }

        function sampleLogoIntoGrid() {
            const rect = img.getBoundingClientRect();

            const logoCols = Math.ceil(rect.width / CELL_SIZE);
            const logoRows = Math.ceil(rect.height / CELL_SIZE);

            const startCol = Math.floor(rect.left / CELL_SIZE);
            const startRow = Math.floor(rect.top / CELL_SIZE);

            const sampleCanvas = document.createElement("canvas");
            sampleCanvas.width = Math.max(1, logoCols);
            sampleCanvas.height = Math.max(1, logoRows);

            const sampleCtx = sampleCanvas.getContext("2d");
            if (!sampleCtx) return;

            sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
            sampleCtx.drawImage(img, 0, 0, logoCols, logoRows);

            const { data } = sampleCtx.getImageData(0, 0, logoCols, logoRows);

            grid = Array.from({ length: cols }, () => []);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const inLogo =
                        col >= startCol &&
                        col < startCol + logoCols &&
                        row >= startRow &&
                        row < startRow + logoRows;

                    let isLit = false;

                    if (inLogo) {
                        const idx =
                            ((row - startRow) * logoCols + (col - startCol)) * 4;
                        isLit = data[idx + 3] > 10;
                    }

                    if (isLit) {
                        grid[col].push({
                            col,
                            row,
                            y: row * CELL_SIZE,
                            vy: 0,
                            char: ASCII_CHARS[0],
                        });
                    }
                }
            }
        }

        function updatePhysics() {
            const gravity = 0.25;

            for (let col = 0; col < cols; col++) {
                const stack = grid[col];

                for (let i = 0; i < stack.length; i++) {
                    const cell = stack[i];

                    if (!fall) continue;

                    cell.vy += gravity + i * 0.02;
                    cell.y += cell.vy;

                    const ground = (rows + 1) * CELL_SIZE;

                    if (cell.y > ground) {
                        cell.y = ground;
                        cell.vy *= 0.03;
                    }
                }

                stack.sort((a, b) => a.y - b.y);
            }
        }

        function maybeComplete() {
            if (completed || destroyed || !fall || !revealDone) return;
            if (!grid.length) return;

            const ground = (rows + 1) * CELL_SIZE;

            let settledCells = 0;
            let totalCells = 0;

            for (const stack of grid) {
                for (const cell of stack) {
                    totalCells += 1;
                    const atGround = cell.y >= ground - 0.5;
                    const stopped = Math.abs(cell.vy) < 0.08;
                    if (atGround && stopped) settledCells += 1;
                }
            }

            if (totalCells > 0 && settledCells === totalCells) {
                completed = true;

                window.setTimeout(() => {
                    if (!destroyed) onComplete?.();
                }, 250);
            }
        }

        function render() {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            ctx.font = `${CELL_SIZE + 2}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = CHAR_COLOR;

            const char = ASCII_CHARS[symbolIndex % ASCII_CHARS.length];

            for (let col = 0; col < cols; col++) {
                const stack = grid[col];

                for (const c of stack) {
                    if (!fall && !revealDone && c.row > revealRow) continue;

                    if (!fall) {
                        c.char = char;
                    }

                    ctx.fillText(c.char, c.col * CELL_SIZE + CELL_SIZE / 2, c.y);
                }
            }
        }

        function loop() {
            if (destroyed) return;

            updatePhysics();
            render();
            maybeComplete();

            rafId = window.requestAnimationFrame(loop);
        }

        function init() {
            setupCanvas();
            sampleLogoIntoGrid();
        }

        resizeHandler = () => {
            if (destroyed) return;
            init();
        };

        window.addEventListener("resize", resizeHandler);

        if (img.complete && img.naturalWidth > 0) {
            init();
            loop();
        } else {
            img.addEventListener("load", () => {
                if (destroyed) return;
                init();
                loop();
            }, { once: true });
        }

        revealInterval = window.setInterval(() => {
            if (revealRow < rows) {
                revealRow += 1;
            } else {
                revealDone = true;
                window.clearInterval(revealInterval);
            }
        }, 15);

        symbolInterval = window.setInterval(() => {
            if (!fall && !destroyed) symbolIndex += 1;
        }, 200);

        fallTimer = window.setTimeout(() => {
            fall = true;
        }, 2500);

        maxLifetimeTimer = window.setTimeout(() => {
            if (!destroyed && !completed) {
                completed = true;
                onComplete?.();
            }
        }, 12000);

        return () => {
            destroyed = true;

            if (rafId) window.cancelAnimationFrame(rafId);
            window.clearInterval(revealInterval);
            window.clearInterval(symbolInterval);
            window.clearTimeout(fallTimer);
            window.clearTimeout(maxLifetimeTimer);
            window.removeEventListener("resize", resizeHandler);

            completed = true;
        };
    }, [onComplete]);

    return (
        <section className="preloaderEnd">
            <canvas ref={canvasRef} className="preloaderEnd__canvas" />

            <div className="preloaderEnd__logo">
                <img
                    ref={imgRef}
                    src="/logo.png"
                    alt="logo"
                    className="preloaderEnd__image"
                />
            </div>
        </section>
    );
}
