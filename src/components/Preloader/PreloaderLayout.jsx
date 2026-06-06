"use client";
import "./Preloader.css";
import { useState, useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

import Phase1 from "./phases/Phase1";
import Phase2 from "./phases/Phase2";
import Phase3 from "./phases/Phase3";

const phases = [Phase1, Phase2, Phase3];

export default function PreloaderLayout({ onComplete }) {
    const progressRef = useRef(null);
    const progressContainerRef = useRef(null); // 👈 добавили
    const progressValue = useRef(0);
    const fakeLoader = useRef(null);

    const [phaseIndex, setPhaseIndex] = useState(0);

    const nextPhase = useCallback(() => {
        setPhaseIndex((prev) => prev + 1);
    }, []);

    const CurrentPhase = phases[phaseIndex];

    useEffect(() => {
        if (!progressRef.current) return;

        gsap.set(progressRef.current, {
            scaleX: 0,
            transformOrigin: "0% 0%"
        });

        progressValue.current = 0;

        startFakeLoading();
    }, []);

    function startFakeLoading() {
        function tick() {
            const max = getMaxByPhase();

            const step = Math.random() * 0.05;
            let next = progressValue.current + step;

            if (next > max) next = max;

            progressValue.current = next;

            gsap.to(progressRef.current, {
                scaleX: progressValue.current,
                duration: 0.2,
                ease: "power1.out"
            });

            // 👉 если дошли до 100% — скрываем progress
            if (progressValue.current === 1 && progressContainerRef.current) {
                gsap.to(progressContainerRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    pointerEvents: "none"
                });
            }

            if (progressValue.current < max) {
                const delay = Math.random() * 0.3 + 0.1;
                fakeLoader.current = setTimeout(tick, delay * 1000);
            }
        }

        tick();
    }

    function getMaxByPhase() {
        if (phaseIndex === 0) return 0.1;
        if (phaseIndex === 1) return 0.7;
        if (phaseIndex === 2) return 1;
        return 1;
    }

    useEffect(() => {
        if (!progressRef.current) return;
        startFakeLoading();
    }, [phaseIndex]);

    useEffect(() => {
        if (phaseIndex === 3 && progressRef.current) {
            clearTimeout(fakeLoader.current);

            gsap.to(progressRef.current, {
                scaleX: 1,
                duration: 0.4,
                ease: "power2.out"
            });

            progressValue.current = 1;

            if (progressContainerRef.current) {
                gsap.to(progressContainerRef.current, {
                    opacity: 0,
                    delay:.2,
                    duration: 0.2,
                    ease: "power2.out",
                    pointerEvents: "none"
                });
            }
        }
    }, [phaseIndex]);

    if (!CurrentPhase) {
        onComplete?.();
        return null;
    }

    return (
        <div className="preloader">
            <CurrentPhase
                key={phaseIndex}
                nextPhase={nextPhase}
                onComplete={onComplete}
            />

            <div className="progress" ref={progressContainerRef}>
                <p className="progress__label">
                    Universe / <span className="label-reboot">REBOOT</span>
                </p>

                <div className="progress__bar">
                    <div className="progress__fill"></div>

                    <div
                        className="progress__track"
                        ref={progressRef}
                    ></div>
                </div>
            </div>
        </div>
    );
}