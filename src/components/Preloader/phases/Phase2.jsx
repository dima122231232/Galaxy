"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Phase2() {
    const containerRef = useRef(null);

useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const TOTAL_IMAGES = 12;
    const GAP = 1500;

    const groups = Math.ceil(TOTAL_IMAGES / 4);
    const layersCount = Math.max(groups, 6);

    const root = document.createElement("div");
    root.className = "tunnel";
    container.appendChild(root);

    const layers = [];

    const progress = { value: 0 };

    gsap.to(progress, {
        value: 10,
        delay: 1.5,
        duration: 10,
        ease: "power3.in",
    });

    gsap.set(container,{backgroundColor: "rgb(0,0,0)"});
    // gsap.set(document.body,{backgroundColor: "rgb(0,0,0)"});
    gsap.to(container, {
        backgroundColor: "rgb(245,245,240)",
        duration: 6.5,
        delay: 6,
        ease: "power2.out",
    });

    for (let i = 0; i < layersCount; i++) {
        const layer = document.createElement("div");
        layer.className = "layer";

        const start = (i % groups) * 4;

        for (let j = 0; j < 4; j++) {
            const imgIndex = start + j + 1;
            if (imgIndex > TOTAL_IMAGES) break;

            const angle = (j / 4) * Math.PI * 2 - Math.PI / 2;

            const item = document.createElement("div");
            item.className = "item";

            const radius = 280;

            item.style.left = `${Math.cos(angle) * radius - 90}px`;
            item.style.top = `${Math.sin(angle) * radius - 110}px`;

            item.style.clipPath = "circle(0% at 50% 50%)";

            const img = document.createElement("img");
            img.src = `/galaxy-photo/img${imgIndex}.jpg`;

            const overlay = document.createElement("div");
            overlay.className = "item-overlay";

            item.appendChild(img);
            item.appendChild(overlay);
            layer.appendChild(item);

            gsap.to(item, {
                clipPath: "circle(75% at 50% 50%)",
                duration: 1,
                delay: 1 + i * 0.1 + j * 0.05,
                ease: "power4.out",
            });

            gsap.to(item, {
                opacity: 0,
                duration: 6.5,
                delay: 6,
                ease: "power2.out",
            });
        }

        root.appendChild(layer);

        layers.push({
            el: layer,
            z: -i * GAP,
            rot: 0,
        });
    }

    const EXIT = 1500;
    const DEPTH = 4500;

    const update = () => {
        const scroll = progress.value * 10000;
        const wrapDistance = layersCount * GAP;

        layers.forEach((layer) => {
            let z = layer.z + scroll;

            z = ((z % wrapDistance) + wrapDistance) % wrapDistance;
            z = z - wrapDistance + EXIT;

            let overlay = 1;

            if (z > EXIT) {
                overlay = 1;
            } else if (z > 0) {
                overlay = z / EXIT;
            } else if (z > -DEPTH) {
                overlay = (Math.abs(z) / DEPTH) ** 2;
            }

            layer.rot += 0.25;

            gsap.set(layer.el, {
                z,
                rotationZ: layer.rot,
                "--overlay": Math.max(0, Math.min(1, overlay)),
                visibility: overlay >= 1 ? "hidden" : "visible",
            });
        });
    };

    gsap.ticker.add(update);

    return () => {
        gsap.ticker.remove(update);
        root.remove(); // ← главное исправление
    };
}, []);

    return <div ref={containerRef} className="spotlight" />;
}