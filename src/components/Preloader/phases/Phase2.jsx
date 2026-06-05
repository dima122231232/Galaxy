"use client";
import { useEffect, useRef } from "react";

export default function Phase2() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const FONT = 12;
        const CHAR = "@";

        let w, h;
        let particles = [];

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            init();
        }

        function init() {
            particles = [];

            const count = 10;

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;

                particles.push({
                    x: w / 2,
                    y: h / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1
                });
            }
        }

        resize();
        window.addEventListener("resize", resize);

        ctx.font = `${FONT}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        function draw() {
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, w, h);

            for (let p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.life *= .98;

                ctx.fillStyle = `rgba(255,255,255,${p.life})`;
                ctx.fillText(CHAR, p.x, p.y);
            }

            requestAnimationFrame(draw);
        }

        setTimeout(() => {
       draw();
}, 1000);
     

        return () => window.removeEventListener("resize", resize);
    }, []);

    return <canvas className="canvas__phase2" ref={canvasRef} />;
}