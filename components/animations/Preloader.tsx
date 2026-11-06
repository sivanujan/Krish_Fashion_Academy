"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Preloader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if user has already seen the preloader this session or prefers reduced motion
    const hasSeen = sessionStorage.getItem("kfa_preloader_seen");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (hasSeen || prefersReducedMotion) {
      return;
    }

    setVisible(true);

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1100);

    const endTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("kfa_preloader_seen", "true");
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-charcoal-darker transition-opacity duration-500 ease-in-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Gold radiant ring */}
        <div className="absolute -inset-6 rounded-full bg-gold/10 blur-xl animate-pulse" />
        
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <Image
            src="/brand/KFA_icon_transparent.png"
            alt="Krish Fashion Academy"
            width={112}
            height={112}
            priority
            className="w-auto h-full object-contain filter drop-shadow-[0_0_12px_rgba(201,162,74,0.4)]"
          />
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <span className="font-serif text-gold-light tracking-[0.25em] text-sm uppercase">
            Krish Fashion Academy
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold/60 mt-1">
            Bespoke Haute Couture & Design
          </span>
        </div>

        {/* Thin gold loader bar */}
        <div className="mt-6 w-32 h-[1px] bg-charcoal-light overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-gold w-full animate-[shimmer_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
