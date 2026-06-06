"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Phase1({ nextPhase }) {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const hasRunRef = useRef(false);

    useEffect(() => {
        const ASCII_CHARS = "....N..V..V!!!!,,,::=+xX#0369@@";
        const FONT_SIZE = 12;

        const ASPECT_WIDTH = 2;
        const ASPECT_HEIGHT = 1;

        const REVEAL_DURATION = 2.2;

        let rafId = null;
        let isDestroyed = false;

        let rotationTween = null;

        let state = {
            angle: 0,
            reveal: 0,

            bangOpacity: 0,
            vOpacity: 0,
            nOpacity: 0,
            comOpacity: 0.1,
            dot2Opacity: 0.5,
            sixOpacity: 0.8
        };

        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        const measureCtx = document.createElement("canvas").getContext("2d");
        measureCtx.font = `${FONT_SIZE}px monospace`;

        const charWidth = Math.ceil(measureCtx.measureText("M").width);
        const charHeight = FONT_SIZE;

        let ASCII_COLUMNS = 300;

        const ASCII_ROWS = Math.floor(
            ASCII_COLUMNS * (ASPECT_HEIGHT / ASPECT_WIDTH)
        );

        const offscreen = document.createElement("canvas");
        const offCtx = offscreen.getContext("2d", {
            willReadFrequently: true,
        });

        const ctx = canvas.getContext("2d");

        function getAlpha(char) {
            if (char === "!") return state.bangOpacity;
            if (char === "V") return state.vOpacity;
            if (char === "N") return state.nOpacity;

            if (char === ",") return state.comOpacity;
            if (char === ":") return state.dot2Opacity;
            if (char === "6") return state.sixOpacity;

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

                    const threshold = 1 - (charIndex / ASCII_CHARS.length);

                    const visible = state.reveal > threshold;

                    row.push(visible ? (char === "." ? null : char) : null);
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
            if (isDestroyed) return;
            render();
            rafId = requestAnimationFrame(loop);
        }

        function startRotation(speed, time) {
            rotationTween?.kill();
            rotationTween = gsap.to(state, {
                angle: speed,
                duration: time,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        }

        function destroy() {
            isDestroyed = true;

            if (rafId) cancelAnimationFrame(rafId);

            rotationTween?.kill();

            gsap.killTweensOf(state);

            window.removeEventListener("click", onClick);

            const c = canvas?.getContext("2d");
            c?.clearRect(0, 0, canvas.width, canvas.height);
        }

        function showNV() {
            const tl = gsap.timeline({
                onComplete: () => {
                    destroy();
                    nextPhase();
                }
            });

            tl.to(state, {
                bangOpacity: .25,
                sixOpacity: 1,
                comOpacity: .5,
                delay: .5,
                dot2Opacity: .8,
                duration: 2,
                ease: "none"
            })
            .to(state, {
                bangOpacity: .4,
                vOpacity: .25,
                comOpacity: .8,
                dot2Opacity: 1,
                duration: 2,
                ease: "none",
            })
            .to(state, {
                bangOpacity: .7,
                vOpacity: .4,
                nOpacity: .15,
                comOpacity: 1,
                duration: 2,
                ease: "none"
            })
            .to(state, {
                reveal: 0,
                duration: .32,
                delay: 1,
                ease: "none",
                onComplete:startRotation(100, 16)
            })
            .to([".preloader__content", document.body], {
                backgroundColor: "#000",
                duration: 0.32,
                ease: "none",
            }, "<");
        }

        const onClick = () => {
            if (hasRunRef.current) return;
            hasRunRef.current = true;
            startRotation(15, 16);
            showNV();
        };

        window.addEventListener("click", onClick);

        loop();

        state.reveal = 0;

        gsap.to(state, {
            reveal: 1,
            duration: REVEAL_DURATION,
            ease: "power1.out",
            onComplete: startRotation(8, 12),
        });

        if (img.complete && img.naturalWidth) {
            render();
        } else {
            img.addEventListener("load", render);
        }

        return () => {
            destroy();
        };

    }, [nextPhase]);

    return (
        <section className="preloader__content">
            <div className="preloader__container-img">
                <img
                    ref={imgRef}
                    className="galaxy"
                    src="/intro/gal.jpg"
                    alt="galaxy"
                />
                <canvas ref={canvasRef} />
            </div>
        </section>
    );
}