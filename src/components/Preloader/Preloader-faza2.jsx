"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";


export default function PreloaderFaza2() {
    const canvas2Ref = useRef(null);
    useEffect(() => {
        console.log(12);
        
    }, []);
    return (
        <canvas ref={canvas2Ref} />
    );
}