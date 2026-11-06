"use client";

import { useState } from "react";
import SewingMachineSvg from "@/components/hero/SewingMachineSvg";
import StitchHeadline from "@/components/hero/StitchHeadline";
import styles from "@/components/hero/stitch.module.css";

const SEGMENTS = [
  { text: "Master the Art of" },
  { text: "Bespoke Tailoring", gold: true },
  { text: "& Haute Couture" },
];

export default function StitchDevClient() {
  const [run, setRun] = useState(0);
  const [status, setStatus] = useState("running…");

  return (
    <div className="min-h-screen w-full bg-charcoal-darkest text-off-white px-4 py-10 overflow-x-clip">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xs uppercase tracking-[0.25em] text-gold-light mb-6">
          /dev/stitch — sewing machine preview
        </h2>

        <section className="grid gap-6 sm:grid-cols-2 mb-14">
          <figure className="border border-gold/30 rounded p-6 bg-charcoal-darker">
            <div className="w-full max-w-[320px] mx-auto aspect-[200/150]">
              <SewingMachineSvg />
            </div>
            <figcaption className="mt-3 text-xs text-off-white/60 text-center">Static</figcaption>
          </figure>
          <figure className="border border-gold/30 rounded p-6 bg-charcoal-darker">
            <div className={`w-full max-w-[320px] mx-auto aspect-[200/150] ${styles.demoSewing}`}>
              <SewingMachineSvg />
            </div>
            <figcaption className="mt-3 text-xs text-off-white/60 text-center">
              Needle + wheel running
            </figcaption>
          </figure>
        </section>

        <div className="flex items-center gap-4 mb-10">
          <button
            type="button"
            onClick={() => {
              setStatus("running…");
              setRun((r) => r + 1);
            }}
            className="border border-gold/60 text-gold-light hover:bg-gold hover:text-charcoal-darkest px-5 py-2 text-xs uppercase tracking-[0.2em] rounded-sm"
          >
            Replay
          </button>
          <span data-testid="stitch-status" className="text-xs text-off-white/60">
            {status}
          </span>
        </div>

        <div className="text-center flex flex-col items-center pt-16">
          <StitchHeadline
            key={run}
            ignoreSession
            segments={SEGMENTS}
            onDone={(animated) => setStatus(animated ? "done (animated)" : "done (instant)")}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-off-white tracking-tight leading-[1.1] max-w-4xl"
          />
        </div>
      </div>
    </div>
  );
}
