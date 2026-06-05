"use client";

import "./Preloader.css";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Preloader() {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const ASCII_CHARS = "..........,,,:::=+xX#0369@@";
        const FONT_SIZE = 12;

        const ASPECT_WIDTH = 1.8;
        const ASPECT_HEIGHT = 1;

        const REVEAL_DURATION = 5;

        let state = {
            angle: 0,
            reveal: 0,
        };

        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        const measureCtx = document.createElement("canvas").getContext("2d");
        measureCtx.font = `${FONT_SIZE}px monospace`;

        const charWidth = Math.ceil(measureCtx.measureText("M").width);
        const charHeight = FONT_SIZE;

        const ASCII_COLUMNS = Math.floor(window.innerWidth / charWidth);
        const ASCII_ROWS = Math.floor(
            ASCII_COLUMNS * (ASPECT_HEIGHT / ASPECT_WIDTH)
        );

        const offscreen = document.createElement("canvas");
        const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

        const ctx = canvas.getContext("2d");

        const noiseSeed = Math.random();

        function getAlpha(char) {
            if (char === ",") return 0.1;
            if (char === ":") return 0.5;
            if (char === "6") return 0.8;
            return 1;
        }

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

                    brightness += Math.sin(t + x * 0.05 + y * 0.03) * 0.05;
                    brightness = Math.max(0, Math.min(1, brightness));

                    const charIndex = Math.floor(
                        brightness * (ASCII_CHARS.length - 1)
                    );

                    const char = ASCII_CHARS[charIndex];

                    const base = charIndex / ASCII_CHARS.length;

                    const appear =
                        state.reveal *
                        (base + noiseSeed * 0.3);

                    row.push(appear > 0.25 ? (char === "." ? null : char) : null);
                }

                asciiGrid.push(row);
            }

            return { asciiGrid };
        }

        function prepareCanvas() {
            const dpr = window.devicePixelRatio || 1;

            canvas.width = ASCII_COLUMNS * charWidth * dpr;
            canvas.height = ASCII_ROWS * charHeight * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = `${FONT_SIZE}px monospace`;
            ctx.textBaseline = "top";
        }

        function drawASCII(asciiGrid) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = asciiGrid[0].length * charWidth;
            const height = asciiGrid.length * charHeight;

            const cx = width / 2;
            const cy = height / 2;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((state.angle * Math.PI) / 180);
            ctx.translate(-cx, -cy);

            for (let y = 0; y < asciiGrid.length; y++) {
                for (let x = 0; x < asciiGrid[y].length; x++) {
                    const char = asciiGrid[y][x];
                    if (!char) continue;

                    ctx.fillStyle = `rgba(245,245,240,${getAlpha(char)})`;
                    ctx.fillText(char, x * charWidth, y * charHeight);
                }
            }

            ctx.restore();
        }

        function render() {
            const { asciiGrid } = imageToAsciiGrid();
            prepareCanvas();
            drawASCII(asciiGrid);
        }

        function loop() {
            render();
            requestAnimationFrame(loop);
        }

        loop();

        gsap.to(state, {
            reveal: 1,
            duration: REVEAL_DURATION,
            ease: "power2.out",
            onComplete: startRotation,
        });

        function startRotation() {
            gsap.to(state, {
                angle: 5,
                duration: 12,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        }

        if (img.complete && img.naturalWidth) {
            render();
        } else {
            img.addEventListener("load", render);
        }
    }, []);

    return (
        <div className="preloader__content">
            <div className="preloader__container-img">
                <img ref={imgRef} className="galaxy" src="/intro/gal.jpg" alt="galaxy" />
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}