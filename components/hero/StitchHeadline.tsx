"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createStitchReveal } from "@/lib/stitchReveal";
import SewingMachineSvg, {
  FABRIC_CENTER_Y,
  MACHINE_VIEWBOX_HEIGHT,
  NEEDLE_TIP,
} from "./SewingMachineSvg";
import styles from "./stitch.module.css";

export interface StitchSegment {
  text: string;
  gold?: boolean;
}

interface StitchHeadlineProps {
  segments: StitchSegment[];
  /** Needle speed in px/s on desktop (mobile < 768px uses 500). */
  speed?: number;
  /** Fires once the headline is fully shown. `animated` is false for reduced motion / repeat visits. */
  onDone?: (animated: boolean) => void;
  className?: string;
  /** Classes for gold words. */
  goldClassName?: string;
  /** Dev only: ignore the once-per-session flag. */
  ignoreSession?: boolean;
}

const SESSION_KEY = "kfa-stitched";
const PRELOADER_KEY = "kfa_preloader_seen";
const PRELOADER_WAIT_MS = 1300;
const MOBILE_SPEED = 500;
const FONT_WAIT_MS = 2000;

function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function StitchHeadline({
  segments,
  speed = 650,
  onDone,
  className = "",
  goldClassName = "italic font-normal text-gold-light",
  ignoreSession = false,
}: StitchHeadlineProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const machineRef = useRef<HTMLDivElement>(null);
  const stitchRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  const [machineMounted, setMachineMounted] = useState(true);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const segmentsKey = JSON.stringify(segments);
  const segmentsParsed = useMemo(
    () => JSON.parse(segmentsKey) as StitchSegment[],
    [segmentsKey]
  );

  useEffect(() => {
    const root = rootRef.current;
    const stitchLayer = stitchRef.current;
    if (!root || !stitchLayer) return;

    const wordEls = Array.from(root.querySelectorAll<HTMLElement>("[data-sh-word]"));
    // JS is in control now: turn off the CSS failsafe (it would override inline opacity).
    for (const el of wordEls) el.style.animation = "none";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = !ignoreSession && readSession(SESSION_KEY) === "1";
    const preloaderPending = !reducedMotion && readSession(PRELOADER_KEY) === null;
    const isMobile = window.innerWidth < 768;

    let cancelled = false;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let stopAnimation: (() => void) | undefined;
    let lastWidth = window.innerWidth;

    const ctrl = createStitchReveal({
      root,
      words: wordEls,
      stitchLayer,
      machine: machineRef.current,
      speed: isMobile ? MOBILE_SPEED : speed,
      needleTipX: NEEDLE_TIP.x,
      fabricCenterY: FABRIC_CENTER_Y,
      viewBoxHeight: MACHINE_VIEWBOX_HEIGHT,
      classes: {
        sewing: styles.isSewing,
        stitchLine: styles.stitchLine,
        stitchDot: styles.stitchDot,
      },
      onDone: (animated) => {
        if (cancelled) return;
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* storage unavailable */
        }
        setMachineMounted(false);
        onDoneRef.current?.(animated);
      },
    });

    // Never let a stuck font request hold the headline back.
    const fontsReady = Promise.race([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS)),
    ]);

    fontsReady
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        if (reducedMotion || seen) {
          ctrl.finish(false);
          return;
        }
        startTimer = setTimeout(
          () => {
            if (!cancelled) stopAnimation = ctrl.start();
          },
          preloaderPending ? PRELOADER_WAIT_MS : 0
        );
      });

    const onResize = () => {
      // Ignore height-only changes (mobile URL bar show/hide).
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      if (ctrl.isRunning()) {
        ctrl.finish(true);
        return;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ctrl.relayout(), 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      stopAnimation?.();
      ctrl.destroy();
    };
  }, [segmentsKey, speed, ignoreSession]);

  return (
    <h1 ref={rootRef} className={`${styles.headline} ${className}`}>
      {segmentsParsed.map((seg, sIdx) => {
        const segWords = seg.text.split(/\s+/).filter(Boolean);
        const isGold = !!seg.gold;
        return (
          <span
            key={sIdx}
            className={
              isGold
                ? "inline-block md:whitespace-nowrap mt-1 sm:mt-2"
                : "block"
            }
          >
            {segWords.map((word, wIdx) => (
              <Fragment key={wIdx}>
                {wIdx > 0 ? " " : null}
                <span
                  data-sh-word=""
                  data-sh-gold={isGold ? "true" : undefined}
                  className={`${styles.word} ${isGold ? goldClassName : ""}`}
                >
                  {word}
                </span>
              </Fragment>
            ))}
          </span>
        );
      })}
      <span ref={stitchRef} className={styles.overlay} aria-hidden="true" />
      {machineMounted && (
        <span ref={machineRef} className={styles.machine} aria-hidden="true">
          <SewingMachineSvg />
        </span>
      )}
    </h1>
  );
}
