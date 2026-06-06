"use client";
import "./Preloader.css";
import { useState, useCallback} from "react";

import Phase1 from "./phases/Phase1";
import Phase2 from "./phases/Phase2";
import Phase3 from "./phases/Phase3";

const phases = [Phase1, Phase2, Phase3];

export default function PreloaderLayout({ onComplete }) {

    const [phaseIndex, setPhaseIndex] = useState(0);

    const nextPhase = useCallback(() => {
        setPhaseIndex((prev) => prev + 1);
    }, []);

    const CurrentPhase = phases[phaseIndex];

    if (!CurrentPhase) return null;

    return (
        <div className="preloader">
            <CurrentPhase
                key={phaseIndex}
                nextPhase={nextPhase}
                onComplete={onComplete}
            />
        </div>
    );
}
