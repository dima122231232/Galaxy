"use client";
import "./Preloader.css";
import { useState } from "react";

import Phase12 from "./phases/Phase12";
import Phase2 from "./phases/Phase2";

export default function PreloaderLayout() {
    const [phase, setPhase] = useState(0);

    const nextPhase = () => {
        setPhase(prev => prev + 1);
    };

    return (
        <div className="preloader">

            {/* {phase === 0 && (
                <Phase1 nextPhase={nextPhase} />
            )}

            {phase === 1 && (
                <Phase2 nextPhase={nextPhase} />
            )} */}

<Phase12 nextPhase={nextPhase} />
        </div>
    );
}