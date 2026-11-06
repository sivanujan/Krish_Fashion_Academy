"use client";

import { useEffect, useRef } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import RevealText from "@/components/animations/RevealText";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StepItem {
  number: number;
  title: string;
  description: string;
  image: string;
}

const STEPS: StepItem[] = [
  {
    number: 1,
    title: "Body Measurements",
    description: "Learn taking precise anatomical body measurements for a zero-gap, custom contour fit.",
    image: "/images/home/learn-measure.webp",
  },
  {
    number: 2,
    title: "Calculations",
    description: "Master exact mathematical ease formulas and apex calculations for blouses of any size.",
    image: "/images/home/learn-calculations.webp",
  },
  {
    number: 3,
    title: "Paper Pattern",
    description: "Draft your complete 3-dart master paper sloper with neckline and armhole contouring.",
    image: "/images/home/learn-pattern.webp",
  },
  {
    number: 4,
    title: "Cutting",
    description: "Align fabric grainline, place paper patterns, and cut panels with proper seam allowances.",
    image: "/images/home/learn-cutting.webp",
  },
  {
    number: 5,
    title: "Stitching",
    description: "Practise hands-on on sewing machines in class and finish stitching your own blouse in 2 days.",
    image: "/images/home/learn-stitching.webp",
  },
];

export default function WhatYoullLearn() {
  const containerRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGLineElement>(null);
  const circlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    if (!container || !path) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const length = path.getTotalLength ? path.getTotalLength() : 1000;
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const ctx = gsap.context(() => {
      // Animate stitch line drawing smoothly on scroll
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 70%",
          end: "bottom 85%",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            circlesRef.current.forEach((circle, idx) => {
              if (!circle) return;
              const threshold = idx / (STEPS.length - 1);
              if (progress >= threshold) {
                circle.classList.add("bg-gold", "text-bg-dark", "border-gold-light");
                circle.classList.remove("bg-bg-dark", "text-gold-light");
              } else {
                circle.classList.remove("bg-gold", "text-bg-dark", "border-gold-light");
                circle.classList.add("bg-bg-dark", "text-gold-light");
              }
            });
          },
        },
      });

      // Reveal step cards one by one as the stitch reaches them
      cardsRef.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="what-youll-learn"
      className="py-16 sm:py-24 bg-bg-dark text-text-on-dark relative overflow-hidden scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-gold-light mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.25em] font-medium">
              Syllabus &amp; Methodology
            </span>
          </div>
          <RevealText
            tag="h2"
            className="font-serif text-[clamp(2.125rem,4vw,3.25rem)] font-light text-text-on-dark tracking-tight leading-tight"
          >
            From Measurement to Finished Blouse
          </RevealText>
          <p className="mt-3 text-sm sm:text-base text-muted-on-dark font-light max-w-[62ch] mx-auto text-pretty">
            Our structured 5-step curriculum takes complete beginners through the full garment-making lifecycle. You practise in class and finish stitching your own blouse in 2 days.
          </p>
        </div>

        {/* Desktop Single Continuous Dashed Stitch Line Running Through Center of Circles */}
        <div className="hidden lg:block relative mb-6 px-12">
          {/* Continuous SVG Dashed Line */}
          <div className="absolute top-1/2 left-12 right-12 -translate-y-1/2 h-2 z-0 pointer-events-none">
            <svg
              className="w-full h-4 overflow-visible"
              viewBox="0 0 1000 16"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Subtle gold dashed guide line */}
              <line
                x1="0"
                y1="8"
                x2="1000"
                y2="8"
                stroke="#C9A24A"
                strokeWidth="2"
                strokeOpacity="0.25"
                strokeDasharray="10 6"
              />
              {/* Dynamic scroll-drawn gold dashed stitch line */}
              <line
                ref={pathRef}
                x1="0"
                y1="8"
                x2="1000"
                y2="8"
                stroke="#E8C77A"
                strokeWidth="2"
                strokeDasharray="10 6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 5 Numbered Circles Exactly Distributed Over The Continuous Line */}
          <div className="relative z-10 flex justify-between items-center">
            {STEPS.map((step, idx) => (
              <div
                key={step.number}
                ref={(el) => {
                  circlesRef.current[idx] = el;
                }}
                className="w-10 h-10 rounded-full bg-bg-dark border-2 border-gold flex items-center justify-center text-gold-light font-mono font-bold text-sm shadow-md transition-colors duration-300 tabular-nums lining-nums"
              >
                0{step.number}
              </div>
            ))}
          </div>
        </div>

        {/* 5-Step Timeline Grid (5 Equal Columns on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 relative items-stretch">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="bg-bg-dark-2 rounded-sm border border-border-dark p-5 flex flex-col justify-between group hover:border-gold hover:-translate-y-1 transition-all duration-300 shadow-md relative overflow-hidden h-full"
            >
              <div>
                {/* Mobile / Tablet Step Badge (Visible below lg) */}
                <div className="flex lg:hidden items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-full bg-bg-dark border border-gold flex items-center justify-center text-gold-light font-mono font-bold text-xs tabular-nums lining-nums">
                    0{step.number}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-on-dark">
                    Step 0{step.number}
                  </span>
                </div>

                {/* Media: Step Atelier Photograph (4:3 aspect ratio) */}
                <div className="aspect-[4/3] rounded-sm overflow-hidden bg-bg-dark border border-border-dark mb-4 relative flex items-center justify-center">
                  <ImageWithFallback
                    src={step.image}
                    alt={step.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Step Title (one line) */}
                <h3 className="font-serif text-lg font-light text-text-on-dark group-hover:text-gold-light transition-colors leading-snug">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs text-muted-on-dark font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
