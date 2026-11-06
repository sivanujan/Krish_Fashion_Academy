/**
 * stitchReveal – framework-agnostic "sewing machine stitches the headline" animation.
 * Plain TypeScript + requestAnimationFrame. All positions are relative to the root element.
 */

export interface StitchWord {
  el: HTMLElement;
  left: number;
  right: number;
}

export interface StitchLine {
  top: number;
  bottom: number;
  height: number;
  left: number;
  right: number;
  words: StitchWord[];
}

export interface StitchRevealOptions {
  /** Positioned (relative) headline element. */
  root: HTMLElement;
  /** One element per word, in reading order. */
  words: HTMLElement[];
  /** Absolutely positioned layer that receives the stitch-line divs. */
  stitchLayer: HTMLElement;
  /** Machine wrapper element (absolute, top/left 0). Optional. */
  machine?: HTMLElement | null;
  /** Needle speed in px/s. */
  speed: number;
  /** Needle tip / fabric centre in SVG units, and SVG viewBox height. */
  needleTipX: number;
  fabricCenterY: number;
  viewBoxHeight: number;
  classes: {
    sewing: string;
    stitchLine: string;
    stitchDot: string;
  };
  /** Called once when everything is revealed. `animated` = the machine actually ran. */
  onDone?: (animated: boolean) => void;
}

export interface StitchRevealController {
  /** Start the animation. Returns a cleanup function. */
  start(): () => void;
  /** Jump straight to the final state (resize during run, reduced motion, repeat visit). */
  finish(animated?: boolean): void;
  /** Re-measure lines and redraw full stitch lines (after a resize once finished). */
  relayout(): void;
  isRunning(): boolean;
  destroy(): void;
}

const END_OVERSHOOT = 14; // px past the line end
const ENTER_DURATION = 0.3;
const GLIDE_DURATION = 0.35;
const EXIT_DURATION = 0.6;
const EXIT_DRIFT = 40;
const FULL_VISIBLE_PAD = 12;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Group words into visual lines by their top offset. */
export function measureLines(root: HTMLElement, words: HTMLElement[]): StitchLine[] {
  const r = root.getBoundingClientRect();
  const lines: StitchLine[] = [];

  for (const el of words) {
    const b = el.getBoundingClientRect();
    const top = b.top - r.top;
    const bottom = b.bottom - r.top;
    const left = b.left - r.left;
    const right = b.right - r.left;
    const line = lines.find((l) => Math.abs(l.top - top) < b.height / 2);
    if (line) {
      line.top = Math.min(line.top, top);
      line.bottom = Math.max(line.bottom, bottom);
      line.height = line.bottom - line.top;
      line.left = Math.min(line.left, left);
      line.right = Math.max(line.right, right);
      line.words.push({ el, left, right });
    } else {
      lines.push({ top, bottom, height: bottom - top, left, right, words: [{ el, left, right }] });
    }
  }

  lines.sort((a, b) => a.top - b.top);
  for (const l of lines) l.words.sort((a, b) => a.left - b.left);
  return lines;
}

type Phase =
  | { kind: "enter"; dur: number }
  | { kind: "sew"; dur: number; line: number }
  | { kind: "glide"; dur: number; from: number; to: number }
  | { kind: "exit"; dur: number };

export function createStitchReveal(opts: StitchRevealOptions): StitchRevealController {
  const { root, words, stitchLayer, machine, classes } = opts;

  let lines: StitchLine[] = [];
  let stitchEls: HTMLSpanElement[] = [];
  let dotEl: HTMLSpanElement | null = null;
  let raf = 0;
  let running = false;
  let finished = false;
  let destroyed = false;
  let scale = 1;
  let em = 16;

  // Track last applied state per word to avoid redundant style writes.
  const wordState = new Map<HTMLElement, string>();

  const setWord = (el: HTMLElement, state: "hidden" | "visible" | "partial", clip?: string) => {
    const key = state === "partial" ? `p:${clip}` : state;
    if (wordState.get(el) === key) return;
    wordState.set(el, key);
    if (state === "hidden") {
      el.style.opacity = "0";
      el.style.clipPath = "";
    } else if (state === "visible") {
      el.style.opacity = "1";
      el.style.clipPath = "none";
    } else {
      el.style.opacity = "1";
      el.style.clipPath = clip ?? "none";
    }
  };

  const lineCenter = (l: StitchLine) => l.top + l.height / 2;

  const buildStitchLines = () => {
    stitchLayer.replaceChildren();
    dotEl = null;
    em = parseFloat(getComputedStyle(root).fontSize) || 16;
    stitchEls = lines.map((l) => {
      const d = document.createElement("span");
      d.className = classes.stitchLine;
      d.setAttribute("aria-hidden", "true");

      // Only create running stitch underline under lines that contain gold words
      const goldWords = l.words.filter((w) => w.el.hasAttribute("data-sh-gold"));
      if (goldWords.length === 0) {
        d.style.display = "none";
        d.style.width = "0px";
        stitchLayer.appendChild(d);
        return d;
      }

      const goldLeft = Math.min(...goldWords.map((w) => w.left));
      const goldRight = Math.max(...goldWords.map((w) => w.right));

      d.style.left = `${goldLeft}px`;
      d.style.top = `${l.bottom - 0.05 * em}px`;
      d.style.width = "0px";
      d.dataset.goldLeft = String(goldLeft);
      d.dataset.goldRight = String(goldRight);
      stitchLayer.appendChild(d);
      return d;
    });
  };

  const setStitchWidth = (i: number, x: number, withDot: boolean) => {
    const l = lines[i];
    const el = stitchEls[i];
    if (!l || !el) return;

    const goldLeft = parseFloat(el.dataset.goldLeft || String(l.left));
    const goldRight = parseFloat(el.dataset.goldRight || String(l.right));

    if (x <= goldLeft) {
      el.style.width = "0px";
      return;
    }

    const w = Math.max(0, Math.min(x, goldRight) - goldLeft);
    el.style.width = `${w}px`;
    if (withDot && x < goldRight + 10) {
      if (!dotEl) {
        dotEl = document.createElement("span");
        dotEl.className = classes.stitchDot;
      }
      if (dotEl.parentElement !== el) el.appendChild(dotEl);
    }
  };

  const removeDot = () => {
    dotEl?.remove();
  };

  const revealLine = (i: number, x: number) => {
    const l = lines[i];
    for (const w of l.words) {
      if (w.right + FULL_VISIBLE_PAD <= x) setWord(w.el, "visible");
      else if (w.left >= x) setWord(w.el, "hidden");
      else setWord(w.el, "partial", `inset(-0.35em ${Math.max(0, w.right - x)}px -0.35em -0.3em)`);
    }
  };

  const showLine = (i: number) => {
    for (const w of lines[i].words) setWord(w.el, "visible");
    setStitchWidth(i, lines[i].right, false);
  };

  const placeMachine = (x: number, cy: number, opacity: number) => {
    if (!machine) return;
    const tx = x - opts.needleTipX * scale;
    const ty = cy - opts.fabricCenterY * scale;
    machine.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    machine.style.opacity = String(opacity);
  };

  const setSewing = (on: boolean) => {
    machine?.classList.toggle(classes.sewing, on);
  };

  const hideMachine = () => {
    if (!machine) return;
    setSewing(false);
    machine.style.opacity = "0";
    machine.style.display = "none";
  };

  const finish = (animated = false) => {
    if (finished || destroyed) return;
    cancelAnimationFrame(raf);
    running = false;
    finished = true;
    if (!lines.length) {
      lines = measureLines(root, words);
      buildStitchLines();
    }
    removeDot();
    for (const el of words) setWord(el, "visible");
    lines.forEach((_, i) => setStitchWidth(i, lines[i].right, false));
    hideMachine();
    opts.onDone?.(animated);
  };

  const start = () => {
    if (destroyed) return () => undefined;
    lines = measureLines(root, words);
    buildStitchLines();
    wordState.clear();
    for (const el of words) setWord(el, "hidden");

    if (!machine || !lines.length) {
      finish(false);
      return () => cancelAnimationFrame(raf);
    }

    machine.style.display = "";
    scale = machine.getBoundingClientRect().height / opts.viewBoxHeight || 1;

    const phases: Phase[] = [{ kind: "enter", dur: ENTER_DURATION }];
    lines.forEach((l, i) => {
      if (i > 0) phases.push({ kind: "glide", dur: GLIDE_DURATION, from: i - 1, to: i });
      const dist = l.right + END_OVERSHOOT - l.left;
      phases.push({ kind: "sew", dur: Math.max(0.05, dist / opts.speed), line: i });
    });
    phases.push({ kind: "exit", dur: EXIT_DURATION });

    let idx = 0;
    let t = 0;
    let last = -1;
    running = true;
    placeMachine(lines[0].left, lineCenter(lines[0]), 0);

    const apply = (phase: Phase, p: number) => {
      switch (phase.kind) {
        case "enter": {
          const l = lines[0];
          setSewing(false);
          placeMachine(l.left - 24 * (1 - easeOutCubic(p)), lineCenter(l), p);
          break;
        }
        case "sew": {
          const l = lines[phase.line];
          const x = lerp(l.left, l.right + END_OVERSHOOT, p);
          setSewing(true);
          revealLine(phase.line, x);
          setStitchWidth(phase.line, x, true);
          placeMachine(x, lineCenter(l), 1);
          break;
        }
        case "glide": {
          const a = lines[phase.from];
          const b = lines[phase.to];
          const e = easeInOutCubic(p);
          setSewing(false);
          placeMachine(
            lerp(a.right + END_OVERSHOOT, b.left, e),
            lerp(lineCenter(a), lineCenter(b), e),
            1
          );
          break;
        }
        case "exit": {
          const l = lines[lines.length - 1];
          setSewing(false);
          placeMachine(l.right + END_OVERSHOOT + EXIT_DRIFT * easeOutCubic(p), lineCenter(l), 1 - p);
          break;
        }
      }
    };

    const completePhase = (phase: Phase) => {
      if (phase.kind === "sew") {
        removeDot();
        showLine(phase.line);
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      // Clamp delta so a backgrounded tab doesn't skip whole lines on return.
      const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 0.25);
      last = now;
      t += dt;

      while (idx < phases.length && t >= phases[idx].dur) {
        apply(phases[idx], 1);
        completePhase(phases[idx]);
        t -= phases[idx].dur;
        idx++;
      }

      if (idx >= phases.length) {
        finish(true);
        return;
      }

      apply(phases[idx], t / phases[idx].dur);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      running = false;
    };
  };

  const relayout = () => {
    if (destroyed) return;
    lines = measureLines(root, words);
    buildStitchLines();
    lines.forEach((_, i) => setStitchWidth(i, lines[i].right, false));
  };

  const destroy = () => {
    cancelAnimationFrame(raf);
    running = false;
    destroyed = true;
    stitchLayer.replaceChildren();
  };

  return {
    start,
    finish,
    relayout,
    isRunning: () => running,
    destroy,
  };
}
