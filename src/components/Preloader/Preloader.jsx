"use client";

import "./Preloader.css";
import { useEffect, useRef } from "react";

export default function Preloader() {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const ASCII_CHARS = "........,,,:::=+xX#0369@@";
        const FONT_SIZE = 10;

        const img = imgRef.current;
        const canvas = canvasRef.current;

        if (!img || !canvas) return;

        const measureCtx = document.createElement("canvas").getContext("2d");

        measureCtx.font = `400 ${FONT_SIZE}px monospace `;

        const charWidth = Math.ceil(measureCtx.measureText("M").width);
        const charHeight = FONT_SIZE;

        const ASCII_COLUMNS = Math.floor(window.innerWidth / charWidth);
        const ASCII_ROWS = Math.floor(window.innerHeight / charHeight);

        function renderASCII() {
            const { asciiGrid } = imageToAsciiGrid();
            prepareCanvas();
            drawASCII(asciiGrid);
        }

        function imageToAsciiGrid() {
            const samplingCanvas = document.createElement("canvas");
            const ctx = samplingCanvas.getContext("2d");

            samplingCanvas.width = ASCII_COLUMNS;
            samplingCanvas.height = ASCII_ROWS;

            ctx.drawImage(img, 0, 0, ASCII_COLUMNS, ASCII_ROWS);

            const { data } = ctx.getImageData(0, 0, ASCII_COLUMNS, ASCII_ROWS);

            const asciiGrid = [];

            for (let y = 0; y < ASCII_ROWS; y++) {
                const row = [];

                for (let x = 0; x < ASCII_COLUMNS; x++) {
                    const i = (y * ASCII_COLUMNS + x) * 4;

                    const brightness =
                        (data[i] * 0.299 +
                         data[i + 1] * 0.587 +
                         data[i + 2] * 0.114) / 255;

                    const charIndex = Math.floor(brightness * (ASCII_CHARS.length - 1));
                    const char = ASCII_CHARS[charIndex];

                    row.push(char === "." ? null : char);
                }

                asciiGrid.push(row);
            }

            return { asciiGrid };
        }

        function prepareCanvas() {
            const dpr = window.devicePixelRatio || 1;

            canvas.width = ASCII_COLUMNS * charWidth * dpr;
            canvas.height = ASCII_ROWS * charHeight * dpr;

            const ctx = canvas.getContext("2d");
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            ctx.font = `400 ${FONT_SIZE}px monospace`;
            ctx.textBaseline = "top";
            ctx.imageSmoothingEnabled = false;
        }

        function getAlpha(char) {
            if (char === ".") return 0;

            if (char === ",") return 0.15;
            if (char === ":") return 0.5;
            if (char === "#" || char === "@") return 1;

            return 1;
        }
        function drawASCII(asciiGrid) {
            const ctx = canvas.getContext("2d");

            ctx.font = `400 ${FONT_SIZE}px monospace`;
            ctx.textBaseline = "top";

            for (let y = 0; y < asciiGrid.length; y++) {
                for (let x = 0; x < asciiGrid[y].length; x++) {
                    const char = asciiGrid[y][x];
                    if (!char) continue;

                    const alpha = getAlpha(char);

                    ctx.fillStyle = `rgba(245, 245, 240, ${alpha})`;
                    ctx.fillText(char, x * charWidth, y * charHeight);
                }
            }
        }

        if (img.complete && img.naturalWidth) {
            renderASCII();
        } else {
            img.addEventListener("load", renderASCII);
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