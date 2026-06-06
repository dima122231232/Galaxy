"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function PreloaderFaza2() {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        let CELL_SIZE = 15;

        const CHAR_COLOR = "#111";
        const ASCII_CHARS = "@AVISUALANIMAL";

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: true });
        const dpr = window.devicePixelRatio || 1;
        const img = imgRef.current;

        let cols, rows;
        let grid = [];
        let symbolIndex = 0;

        let fall = false;

        let revealRow = 0;
        let revealDone = false;

        function setupCanvas() {
            CELL_SIZE = window.innerWidth < 768 ? 3 : 15;

            cols = Math.floor(window.innerWidth / CELL_SIZE);
            rows = Math.floor(window.innerHeight / CELL_SIZE);

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function sampleLogoIntoGrid() {
            const rect = img.getBoundingClientRect();

            const logoCols = Math.ceil(rect.width / CELL_SIZE);
            const logoRows = Math.ceil(rect.height / CELL_SIZE);

            const startCol = Math.floor(rect.left / CELL_SIZE);
            const startRow = Math.floor(rect.top / CELL_SIZE);

            const sampleCanvas = document.createElement("canvas");
            sampleCanvas.width = logoCols;
            sampleCanvas.height = logoRows;

            const sampleCtx = sampleCanvas.getContext("2d");
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
                            ((row - startRow) * logoCols +
                                (col - startCol)) * 4;

                        isLit = data[idx + 3] > 10;
                    }

                    if (isLit) {
                        grid[col].push({
                            col,
                            row,
                            y: row * CELL_SIZE,
                            vy: 0,
                            char: ASCII_CHARS[0]
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

                    const x = c.col * CELL_SIZE;
                    const y = c.y;

                    ctx.fillText(
                        c.char,
                        x + CELL_SIZE / 2,
                        y
                    );
                }
            }
        }

        function loop() {
            updatePhysics();
            render();
            requestAnimationFrame(loop);
        }

        function init() {
            setupCanvas();
            sampleLogoIntoGrid();
            loop();
        }

        window.addEventListener("resize", init);

        if (img.complete) init();
        else img.addEventListener("load", init);

        const revealInterval = setInterval(() => {
            if (revealRow < rows) {
                revealRow += 1;
            } else {
                revealDone = true;
                clearInterval(revealInterval);
            }
        }, 15);

        const interval = setInterval(() => {
            if (!fall) symbolIndex++;
        }, 200);

        const fallTimer = setTimeout(() => {
            fall = true;
        }, 2500);

        gsap.to(document.body,{
            backgroundColor: "rgb(245,245,240)",
            duration: 2,
            ease: "power2.out",
        });


        return () => {
            clearInterval(revealInterval);
            clearInterval(interval);
            clearTimeout(fallTimer);
            window.removeEventListener("resize", init);
        };
    }, []);

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