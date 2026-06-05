"use client";

import { ReactLenis } from "lenis/react";
import { useRef } from "react";

const LENIS_OPTIONS = {
  duration: 1.2,
  smooth: true,
  smoothWheel: true,
  syncTouch: true,
  lerp: 0.1,
  direction: "vertical",
  gestureDirection: "vertical",
};

export default function ClientLayout({ children }) {
  const lenisRef = useRef(null);

  return (
    <ReactLenis root ref={lenisRef} options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}