"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";


export default function Phase2() {
    const canvasRef = useRef(null);
    useEffect(() => {
        
    }, []);
    return (
        <canvas ref={canvasRef} />
    );
}