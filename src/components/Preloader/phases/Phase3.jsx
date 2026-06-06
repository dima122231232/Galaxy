"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";


export default function PreloaderFaza2() {
    const canvasRef = useRef(null);
    useEffect(() => {
        
    }, []);
    return (
        <div className="a2" ref={canvasRef} />
    );
}