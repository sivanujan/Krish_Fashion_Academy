"use client";

import { useEffect, useState } from "react";

interface MarqueeProps {
  items?: string[];
  speed?: number; // seconds
  className?: string;
}

const defaultItems = [
  "Saree Blouses",
  "3-Dart Blouse",
  "Measurements",
  "Paper Patterns",
  "Cutting",
  "Stitching",
  "Scarborough",
  "Online",
];

export default function Marquee({
  items = defaultItems,
  speed = 25,
  className = "",
}: MarqueeProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
    }
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden whitespace-nowrap border-y border-border-dark bg-bg-dark-2 py-3 sm:py-4 select-none ${className}`}
    >
      <div
        className={`flex w-max items-center ${
          reducedMotion ? "" : "animate-[marquee_linear_infinite]"
        }`}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {/* Repeated chunks for seamless infinite scroll */}
        {[0, 1, 2, 3].map((setIndex) => (
          <div key={setIndex} className="flex items-center space-x-6 sm:space-x-10 px-3 sm:px-5">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-6 sm:space-x-10">
                <span className="font-serif text-sm sm:text-base tracking-[0.25em] uppercase text-text-on-dark hover:text-gold-light transition-colors">
                  {item}
                </span>
                <span className="text-gold text-xs sm:text-sm">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
