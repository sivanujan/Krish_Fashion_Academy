"use client";

import React from "react";

interface SewingMachineProps {
  className?: string;
  isAnimated?: boolean;
}

/**
 * SewingMachine Component
 * 
 * An original, precision line-art illustration of a bespoke atelier sewing machine
 * with tailor shears, curling tape measure, spool, buttons, and floating pin.
 * 
 * Drawn with luxury gold strokes (#C9A24A / #E8C77A) and subtle fills.
 * Styled for Krish Fashion Academy atelier aesthetic.
 */
export default function SewingMachine({ className = "", isAnimated = false }: SewingMachineProps) {
  return (
    <div className={`relative w-full max-w-[560px] mx-auto aspect-[640/520] select-none ${className}`}>
      {/* Ambient gold radial glow */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-full blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle at 50% 55%, rgba(201, 162, 74, 0.45) 0%, rgba(232, 199, 122, 0.15) 40%, transparent 70%)"
        }}
      />

      <svg
        viewBox="0 0 640 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        aria-label="Krish Fashion Academy Atelier Sewing Machine Illustration"
        role="img"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="goldStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8C77A" />
            <stop offset="50%" stopColor="#C9A24A" />
            <stop offset="100%" stopColor="#9B7A2E" />
          </linearGradient>

          <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A24A" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#E8C77A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C9A24A" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="fabricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7F3EC" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#C9A24A" stopOpacity="0.04" />
          </linearGradient>

          <radialGradient id="spoolGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C77A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C9A24A" stopOpacity="0" />
          </radialGradient>

          {/* Filter for subtle gold bloom */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ========================================================= */}
        {/* 1. SEWING MACHINE - BASE & BED PLATFORM                   */}
        {/* ========================================================= */}
        <g id="sm-base-group" stroke="url(#goldStrokeGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bottom plinth / cast base */}
          <path
            d="M 120 388 
               C 120 384, 126 382, 136 382 
               L 504 382 
               C 514 382, 520 384, 520 388 
               L 522 396 
               C 522 399, 516 401, 506 401 
               L 134 401 
               C 124 401, 118 399, 118 396 
               Z"
            fill="#1F2329"
            fillOpacity="0.8"
          />
          {/* Base bottom rim highlight */}
          <line x1="130" y1="398" x2="510" y2="398" stroke="#E8C77A" strokeWidth="0.8" strokeOpacity="0.5" />

          {/* Machine Working Bed (Flat plate) */}
          <path
            d="M 136 360 
               L 496 360 
               C 502 360, 506 364, 506 370 
               L 504 382 
               L 136 382 
               L 134 370 
               C 134 364, 138 360, 136 360 
               Z"
            fill="url(#goldShine)"
          />
          {/* Bed top polished guide line */}
          <line x1="140" y1="363" x2="492" y2="363" stroke="#E8C77A" strokeWidth="1" strokeOpacity="0.7" />

          {/* Needle Throat Plate (Polished silver/gold inlay under needle) */}
          <g id="sm-throat-plate">
            <rect
              x="200"
              y="359"
              width="50"
              height="4"
              rx="1.5"
              fill="#E8C77A"
              fillOpacity="0.3"
              stroke="#E8C77A"
              strokeWidth="1"
            />
            {/* Feed dog slots */}
            <line x1="214" y1="361" x2="222" y2="361" stroke="#2E333B" strokeWidth="1.2" />
            <line x1="228" y1="361" x2="236" y2="361" stroke="#2E333B" strokeWidth="1.2" />
            {/* Needle entrance hole */}
            <circle cx="225" cy="361" r="1.2" fill="#1F2329" stroke="#C9A24A" strokeWidth="0.8" />
          </g>

          {/* Bobbin Slide Plate on the left of throat plate */}
          <rect
            x="155"
            y="360"
            width="38"
            height="3"
            rx="1"
            fill="none"
            stroke="#C9A24A"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
        </g>

        {/* ========================================================= */}
        {/* 2. SEWING MACHINE - CAST IRON ARCH, ARM & HEAD            */}
        {/* ========================================================= */}
        <g id="sm-body-group" stroke="url(#goldStrokeGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Main Body Outline: Right Upright Pillar -> Curved Arm -> Left Head */}
          <path
            d="M 430 360 
               L 468 360 
               C 476 360, 482 352, 480 342 
               L 472 230 
               C 472 205, 462 182, 442 176 
               C 426 172, 380 172, 320 174 
               C 270 176, 240 178, 230 182 
               L 204 182 
               C 198 182, 194 186, 194 192 
               L 194 286 
               C 194 290, 198 294, 204 294 
               L 240 294 
               C 244 294, 248 290, 248 286 
               L 248 250 
               C 255 242, 280 236, 340 236 
               C 390 236, 412 245, 418 265 
               L 426 342 
               C 427 352, 424 360, 430 360 
               Z"
            fill="#1F2329"
            fillOpacity="0.85"
          />

          {/* Elegant internal contour & filigree pinstripe */}
          <path
            d="M 456 348 
               L 458 240 
               C 458 215, 450 196, 432 190 
               C 405 182, 335 186, 252 194 
               L 248 228 
               C 290 224, 370 226, 404 242 
               C 410 245, 414 252, 416 264 
               L 424 348"
            stroke="#E8C77A"
            strokeWidth="0.8"
            strokeOpacity="0.45"
            fill="none"
          />

          {/* Machine Head Faceplate detail (Left upright plate) */}
          <g id="sm-faceplate">
            <line x1="202" y1="192" x2="202" y2="284" stroke="#E8C77A" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="240" y1="192" x2="240" y2="284" stroke="#E8C77A" strokeWidth="0.8" strokeOpacity="0.4" />
            
            {/* Atelier Heritage Emblem badge on machine arm */}
            <g id="sm-emblem">
              <ellipse cx="340" cy="205" rx="22" ry="11" fill="#1F2329" stroke="#E8C77A" strokeWidth="1" />
              <ellipse cx="340" cy="205" rx="18" ry="8" fill="none" stroke="#C9A24A" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
              <text
                x="340"
                y="208"
                textAnchor="middle"
                fontSize="6"
                fontFamily="serif"
                letterSpacing="1.5"
                fill="#E8C77A"
                stroke="none"
                className="font-serif select-none"
              >
                KFA
              </text>
            </g>

            {/* Inspection / faceplate decorative scrolls */}
            <path
              d="M 208 210 Q 212 216 208 222 Q 204 228 208 234"
              stroke="#E8C77A"
              strokeWidth="0.75"
              strokeOpacity="0.5"
              fill="none"
            />
          </g>

          {/* Upper Spool Pin & Thread Spool on top arm */}
          <g id="sm-top-spool">
            {/* Spool post / spindle */}
            <line x1="415" y1="174" x2="415" y2="120" stroke="#C9A24A" strokeWidth="2" strokeLinecap="round" />
            <circle cx="415" cy="118" r="2.5" fill="#E8C77A" stroke="#C9A24A" strokeWidth="1" />

            {/* Mounted wooden / brass thread spool */}
            <path
              d="M 402 166 L 428 166 L 424 162 L 406 162 Z"
              fill="#C9A24A"
              stroke="#E8C77A"
              strokeWidth="1"
            />
            {/* Spool barrel with wound gold silk thread */}
            <rect
              x="405"
              y="132"
              width="20"
              height="30"
              rx="1.5"
              fill="#C9A24A"
              fillOpacity="0.25"
              stroke="#C9A24A"
              strokeWidth="1.2"
            />
            {/* Thread thread wraps */}
            <line x1="406" y1="137" x2="424" y2="137" stroke="#E8C77A" strokeWidth="0.8" />
            <line x1="406" y1="142" x2="424" y2="142" stroke="#E8C77A" strokeWidth="0.8" />
            <line x1="406" y1="147" x2="424" y2="147" stroke="#E8C77A" strokeWidth="0.8" />
            <line x1="406" y1="152" x2="424" y2="152" stroke="#E8C77A" strokeWidth="0.8" />
            <line x1="406" y1="157" x2="424" y2="157" stroke="#E8C77A" strokeWidth="0.8" />

            {/* Top flange of spool */}
            <path
              d="M 402 132 L 428 132 L 425 128 L 405 128 Z"
              fill="#C9A24A"
              stroke="#E8C77A"
              strokeWidth="1"
            />
          </g>

          {/* Thread Guides on top arm */}
          <circle cx="330" cy="170" r="2" fill="none" stroke="#E8C77A" strokeWidth="1.2" />
          <circle cx="245" cy="178" r="2" fill="none" stroke="#E8C77A" strokeWidth="1.2" />

          {/* Upper Tension Dial assembly (circular disc on head) */}
          <g id="sm-tension-dial">
            <circle cx="236" cy="226" r="9" fill="#1F2329" stroke="#C9A24A" strokeWidth="1.5" />
            <circle cx="236" cy="226" r="6" fill="#C9A24A" fillOpacity="0.2" stroke="#E8C77A" strokeWidth="0.8" />
            <circle cx="236" cy="226" r="2" fill="#E8C77A" />
            {/* Calibrated tension notches */}
            <line x1="236" y1="218" x2="236" y2="220" stroke="#E8C77A" strokeWidth="1" />
            <line x1="242" y1="221" x2="240" y2="222" stroke="#E8C77A" strokeWidth="1" />
            <line x1="242" y1="231" x2="240" y2="230" stroke="#E8C77A" strokeWidth="1" />
            <line x1="230" y1="223" x2="232" y2="224" stroke="#E8C77A" strokeWidth="1" />
          </g>

          {/* Take-up Lever (articulated silver lever moving through slot) */}
          <g id="sm-takeup-lever">
            <path
              d="M 216 220 
                 C 212 210, 206 195, 202 188 
                 C 200 184, 195 186, 196 190 
                 C 198 196, 206 215, 212 225"
              fill="#E8C77A"
              fillOpacity="0.4"
              stroke="#E8C77A"
              strokeWidth="1.2"
            />
            {/* Eye of take-up lever */}
            <circle cx="199" cy="188" r="1.8" fill="#1F2329" stroke="#E8C77A" strokeWidth="1" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* 3. HAND WHEEL & BALANCE MECHANISM (Right side)             */}
        {/* ========================================================= */}
        <g id="sm-handwheel-group" stroke="url(#goldStrokeGrad)" strokeLinecap="round" strokeLinejoin="round">
          {/* Wheel housing bracket */}
          <rect x="468" y="210" width="10" height="70" rx="3" fill="#1F2329" stroke="#C9A24A" strokeWidth="1.2" />

          {/* Large Hand Wheel Rim */}
          <ellipse
            id="sm-handwheel-outer"
            cx="486"
            cy="245"
            rx="14"
            ry="46"
            fill="#1F2329"
            fillOpacity="0.9"
            stroke="url(#goldStrokeGrad)"
            strokeWidth="2"
          />

          {/* Inner Wheel Channel / Belt Groove */}
          <ellipse
            cx="486"
            cy="245"
            rx="9"
            ry="36"
            fill="none"
            stroke="#E8C77A"
            strokeWidth="1"
            strokeDasharray="4 2"
            strokeOpacity="0.6"
          />

          {/* Center Hub & Stop-Motion Clutch Knob */}
          <ellipse cx="486" cy="245" rx="5" ry="12" fill="#C9A24A" fillOpacity="0.5" stroke="#E8C77A" strokeWidth="1.2" />
          <circle cx="486" cy="245" r="2.5" fill="#E8C77A" />

          {/* Hand Wheel Turn Handle / Crank Peg */}
          <g id="sm-wheel-handle">
            <rect x="492" y="222" width="10" height="5" rx="2" fill="#E8C77A" stroke="#C9A24A" strokeWidth="1" />
            <line x1="492" y1="224.5" x2="504" y2="224.5" stroke="#9B7A2E" strokeWidth="1.5" />
          </g>

          {/* Leather Drive Belt (running down towards table) */}
          <path
            d="M 482 288 Q 486 330 488 382"
            stroke="#C9A24A"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            fill="none"
            strokeOpacity="0.7"
          />
          <path
            d="M 490 288 Q 494 330 496 382"
            stroke="#C9A24A"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            fill="none"
            strokeOpacity="0.7"
          />
        </g>

        {/* ========================================================= */}
        {/* 4. NEEDLE BAR, PRESSER FOOT & STITCHING HEAD               */}
        {/* ========================================================= */}
        <g id="sm-needle-assembly">
          {/* Presser Bar (Rear vertical rod) */}
          <rect
            id="sm-presser-bar"
            x="228"
            y="275"
            width="3"
            height="72"
            rx="1"
            fill="#C9A24A"
            fillOpacity="0.4"
            stroke="#C9A24A"
            strokeWidth="1"
          />
          {/* Presser Foot Thumb Screw */}
          <rect x="231" y="325" width="5" height="4" rx="1" fill="#E8C77A" stroke="#C9A24A" strokeWidth="0.8" />

          {/* Presser Foot (Sleek hinged twin-toe foot resting on fabric) */}
          <g id="sm-presser-foot" stroke="#E8C77A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Foot shank */}
            <path d="M 229 344 L 229 353 L 221 354" fill="none" />
            {/* Two toes upturned at front */}
            <path
              d="M 215 354 
                 L 233 354 
                 C 237 354, 239 350, 241 348 
                 M 215 356 
                 L 233 356 
                 C 237 356, 239 352, 241 350"
              fill="none"
              stroke="#E8C77A"
              strokeWidth="1.2"
            />
          </g>

          {/* Needle Bar (Front active vertical reciprocating shaft) */}
          <g id="sm-needle-bar">
            {/* Main shaft */}
            <rect
              x="219"
              y="268"
              width="2.5"
              height="66"
              rx="1"
              fill="#E8C77A"
              stroke="#C9A24A"
              strokeWidth="0.8"
            />
            {/* Needle clamp bracket */}
            <rect
              x="217"
              y="328"
              width="6.5"
              height="6"
              rx="1"
              fill="#1F2329"
              stroke="#E8C77A"
              strokeWidth="1"
            />
            {/* Needle clamp horizontal knurled thumb screw */}
            <line x1="223.5" y1="331" x2="228" y2="331" stroke="#E8C77A" strokeWidth="1.5" strokeLinecap="round" />

            {/* Precision Sewing Needle */}
            <g id="sm-needle">
              {/* Needle blade tapering downwards */}
              <path
                d="M 220 334 L 220 355 L 219.5 358 L 220 358 L 220.5 355 L 220.5 334 Z"
                fill="#E8C77A"
                stroke="#E8C77A"
                strokeWidth="0.6"
              />
              {/* Needle Eye */}
              <ellipse cx="220" cy="354" rx="0.5" ry="1.2" fill="#1F2329" />
              {/* Needle Tip piercing throat plate */}
              <line x1="220" y1="358" x2="220" y2="361" stroke="#E8C77A" strokeWidth="0.8" />
            </g>
          </g>
        </g>

        {/* ========================================================= */}
        {/* 5. DRAPED LUXURY FABRIC & GOLD RUNNING STITCHES           */}
        {/* ========================================================= */}
        <g id="sm-fabric-group">
          {/* Silk Fabric Swatch sliding under the presser foot */}
          <path
            d="M 100 366 
               C 125 364, 150 365, 185 364 
               C 215 363, 235 363, 270 363 
               C 290 363, 305 364, 315 366 
               L 310 376 
               C 295 375, 275 375, 250 375 
               C 200 375, 160 377, 105 378 
               C 95 378, 92 372, 100 366 
               Z"
            fill="url(#fabricGrad)"
            stroke="#C9A24A"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Draping fold lines of the textile */}
          <path
            d="M 115 366 Q 130 371 145 376"
            stroke="#E8C77A"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            fill="none"
          />
          <path
            d="M 165 365 Q 180 370 195 375"
            stroke="#E8C77A"
            strokeWidth="0.8"
            strokeOpacity="0.3"
            fill="none"
          />
          <path
            d="M 265 364 Q 280 369 295 375"
            stroke="#E8C77A"
            strokeWidth="0.8"
            strokeOpacity="0.3"
            fill="none"
          />

          {/* Running Stitches: Dashed gold line created by needle */}
          {/* Past stitches (left of needle, already completed) */}
          <path
            id="sm-running-stitch"
            d="M 104 364 L 220 362"
            stroke="#E8C77A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="4 3"
            filter="url(#goldGlow)"
          />
          {/* Subtle stitch puncture marks into the distance */}
          <line
            x1="225"
            y1="362"
            x2="305"
            y2="362"
            stroke="#C9A24A"
            strokeWidth="1"
            strokeDasharray="1 5"
            strokeOpacity="0.4"
          />
        </g>

        {/* ========================================================= */}
        {/* 6. GOLDEN SILK THREAD PATHWAY                             */}
        {/* ========================================================= */}
        <g id="sm-thread-path-group">
          {/* Continuous thread line from top spool -> guides -> tension -> lever -> needle -> stitch */}
          <path
            id="sm-main-thread"
            d="M 405 138 
               C 380 142, 350 162, 332 170 
               C 310 178, 260 174, 246 178 
               C 242 186, 238 210, 236 222 
               C 230 220, 218 205, 201 189 
               C 198 195, 210 240, 218 316 
               L 220 354 
               L 220 362"
            fill="none"
            stroke="#E8C77A"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#goldGlow)"
          />

          {/* Floating animated thread bead / glimmer */}
          <circle cx="201" cy="189" r="2.2" fill="#FFFFFF" opacity="0.9" filter="url(#goldGlow)" />
        </g>

        {/* ========================================================= */}
        {/* 7. FLOATING ATELIER TOOLS (Original Line Art)             */}
        {/* ========================================================= */}

        {/* TOOL A: TAILOR'S SHEARS / SCISSORS (Upper Left, ~-20deg angle) */}
        <g
          id="sm-tool-scissors"
          transform="translate(85, 115) rotate(-22)"
          stroke="url(#goldStrokeGrad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Upper Blade */}
          <path
            d="M 0 0 
               C 20 -4, 55 -6, 85 -4 
               C 55 -1, 30 2, 0 4 
               Z"
            fill="#1F2329"
            fillOpacity="0.8"
          />
          {/* Cutting edge sheen */}
          <line x1="12" y1="-1" x2="82" y2="-3" stroke="#E8C77A" strokeWidth="0.8" />

          {/* Lower Blade (slightly open) */}
          <path
            d="M 0 3 
               C 22 7, 55 12, 82 17 
               C 54 13, 28 8, 0 5 
               Z"
            fill="#1F2329"
            fillOpacity="0.8"
          />
          <line x1="14" y1="5" x2="79" y2="15" stroke="#E8C77A" strokeWidth="0.8" />

          {/* Pivot Screw */}
          <circle cx="0" cy="2" r="3.5" fill="#C9A24A" stroke="#E8C77A" strokeWidth="1" />
          <line x1="-1.5" y1="2" x2="1.5" y2="2" stroke="#1F2329" strokeWidth="0.9" />

          {/* Upper Handle (Small thumb loop) */}
          <path
            d="M -3 -1 
               C -12 -5, -20 -15, -30 -12 
               C -40 -9, -42 2, -32 8 
               C -24 12, -12 5, -3 2"
            fill="none"
            stroke="#E8C77A"
            strokeWidth="1.8"
          />

          {/* Lower Handle (Large elongated 3-finger bow) */}
          <path
            d="M -3 4 
               C -14 9, -22 22, -36 24 
               C -48 26, -52 10, -42 -2 
               C -34 -10, -20 -4, -3 0"
            fill="none"
            stroke="#E8C77A"
            strokeWidth="1.8"
          />
        </g>

        {/* TOOL B: CURLING MEASURING TAPE (Lower Left, undulating ribbon) */}
        <g id="sm-tool-measuring-tape">
          {/* Main serpentine tape ribbon */}
          <path
            d="M 55 450 
               C 80 435, 105 440, 125 460 
               C 145 480, 175 482, 195 468 
               C 210 458, 222 458, 230 464"
            fill="none"
            stroke="#E8C77A"
            strokeWidth="9"
            strokeLinecap="round"
            strokeOpacity="0.2"
          />
          {/* Tape top and bottom border lines */}
          <path
            d="M 55 446 
               C 80 431, 105 436, 125 456 
               C 145 476, 175 478, 195 464 
               C 210 454, 222 454, 230 460"
            fill="none"
            stroke="#C9A24A"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M 55 454 
               C 80 439, 105 444, 125 464 
               C 145 484, 175 486, 195 472 
               C 210 462, 222 462, 230 468"
            fill="none"
            stroke="#C9A24A"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Brass end clip */}
          <rect
            x="50"
            y="445.5"
            width="5"
            height="9"
            rx="1"
            fill="#E8C77A"
            stroke="#C9A24A"
            strokeWidth="1"
          />
          <circle cx="52.5" cy="450" r="1" fill="#1F2329" />

          {/* Measurement inch tick marks */}
          <line x1="68" y1="446" x2="68" y2="451" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="78" y1="443" x2="78" y2="447" stroke="#E8C77A" strokeWidth="0.6" />
          <line x1="88" y1="443" x2="88" y2="448" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="98" y1="446" x2="98" y2="450" stroke="#E8C77A" strokeWidth="0.6" />
          <line x1="108" y1="450" x2="108" y2="455" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="118" y1="456" x2="118" y2="461" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="135" y1="468" x2="135" y2="473" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="150" y1="474" x2="150" y2="479" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="168" y1="472" x2="168" y2="477" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="185" y1="465" x2="185" y2="470" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="205" y1="457" x2="205" y2="462" stroke="#E8C77A" strokeWidth="0.8" />

          {/* Tiny numbers along the tape */}
          <text x="68" y="453" fontSize="4.5" fill="#E8C77A" fontFamily="monospace" textAnchor="middle">1</text>
          <text x="88" y="451" fontSize="4.5" fill="#E8C77A" fontFamily="monospace" textAnchor="middle">2</text>
          <text x="118" y="463" fontSize="4.5" fill="#E8C77A" fontFamily="monospace" textAnchor="middle">3</text>
          <text x="150" y="482" fontSize="4.5" fill="#E8C77A" fontFamily="monospace" textAnchor="middle">4</text>
          <text x="185" y="473" fontSize="4.5" fill="#E8C77A" fontFamily="monospace" textAnchor="middle">5</text>
        </g>

        {/* TOOL C: FLOATING SPOOL OF SILK THREAD (Upper Right) */}
        <g id="sm-tool-spool" transform="translate(540, 95) rotate(18)">
          {/* Top wooden spool rim */}
          <ellipse cx="0" cy="0" rx="14" ry="5" fill="#C9A24A" stroke="#E8C77A" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="2.5" fill="#1F2329" stroke="#E8C77A" strokeWidth="0.8" />

          {/* Spool thread barrel */}
          <rect
            x="-11"
            y="5"
            width="22"
            height="26"
            rx="2"
            fill="#C9A24A"
            fillOpacity="0.3"
            stroke="#C9A24A"
            strokeWidth="1.2"
          />
          {/* Wound silk lines */}
          <line x1="-10" y1="9" x2="10" y2="9" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="-10" y1="14" x2="10" y2="14" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="-10" y1="19" x2="10" y2="19" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="-10" y1="24" x2="10" y2="24" stroke="#E8C77A" strokeWidth="0.8" />
          <line x1="-10" y1="29" x2="10" y2="29" stroke="#E8C77A" strokeWidth="0.8" />

          {/* Bottom wooden spool rim */}
          <ellipse cx="0" cy="31" rx="14" ry="5" fill="#C9A24A" stroke="#E8C77A" strokeWidth="1.2" />

          {/* Floating loose thread spiraling away */}
          <path
            d="M 9 20 
               C 22 25, 28 40, 18 55 
               C 8 70, 24 82, 34 95"
            fill="none"
            stroke="#E8C77A"
            strokeWidth="0.9"
            strokeDasharray="2 1.5"
            strokeOpacity="0.8"
          />
        </g>

        {/* TOOL D: TAILOR BUTTONS & PEARL PIN (Mid and Lower Right) */}
        <g id="sm-tool-buttons">
          {/* 4-hole Mother-of-Pearl Button (Upper right) */}
          <g transform="translate(560, 290) rotate(15)">
            {/* Outer button rim */}
            <circle cx="0" cy="0" r="14" fill="#1F2329" stroke="#E8C77A" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="10" fill="none" stroke="#C9A24A" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            {/* 4 Holes */}
            <circle cx="-4" cy="-4" r="1.5" fill="#1F2329" stroke="#E8C77A" strokeWidth="0.8" />
            <circle cx="4" cy="-4" r="1.5" fill="#1F2329" stroke="#E8C77A" strokeWidth="0.8" />
            <circle cx="-4" cy="4" r="1.5" fill="#1F2329" stroke="#E8C77A" strokeWidth="0.8" />
            <circle cx="4" cy="4" r="1.5" fill="#1F2329" stroke="#E8C77A" strokeWidth="0.8" />
            {/* Cross stitch thread in button center */}
            <line x1="-4" y1="-4" x2="4" y2="4" stroke="#E8C77A" strokeWidth="1" strokeLinecap="round" />
            <line x1="4" y1="-4" x2="-4" y2="4" stroke="#E8C77A" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* 2-hole horn button (Lower right) */}
          <g transform="translate(480, 445) rotate(-20)">
            <circle cx="0" cy="0" r="9" fill="#1F2329" stroke="#C9A24A" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="6.5" fill="none" stroke="#E8C77A" strokeWidth="0.6" strokeOpacity="0.5" />
            <circle cx="-2.5" cy="0" r="1.2" fill="#1F2329" stroke="#E8C77A" strokeWidth="0.8" />
            <circle cx="2.5" cy="0" r="1.2" fill="#1F2329" stroke="#E8C77A" strokeWidth="0.8" />
            <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="#E8C77A" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* Pearl Head Straight Pin (Angled through mid-space) */}
          <g transform="translate(535, 395) rotate(-55)">
            {/* Golden pearl head */}
            <circle cx="0" cy="0" r="4" fill="url(#goldStrokeGrad)" stroke="#E8C77A" strokeWidth="0.8" />
            <circle cx="-1" cy="-1" r="1.2" fill="#FFFFFF" opacity="0.8" />
            {/* Long slender pin shaft */}
            <line x1="0" y1="4" x2="0" y2="46" stroke="#E8C77A" strokeWidth="1.2" strokeLinecap="round" />
            {/* Sharp tapered point */}
            <line x1="0" y1="46" x2="0" y2="52" stroke="#E8C77A" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
