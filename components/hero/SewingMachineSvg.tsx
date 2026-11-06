import styles from "./stitch.module.css";

/** Needle tip in SVG user units (viewBox 0 0 200 150). */
export const NEEDLE_TIP = { x: 39, y: 120 } as const;
/** Vertical centre of the "fabric" gap between arm and bed. */
export const FABRIC_CENTER_Y = 97;
export const MACHINE_VIEWBOX_HEIGHT = 150;

const BODY_FILL = "rgba(31,35,41,0.55)";

interface SewingMachineSvgProps {
  className?: string;
}

/**
 * Original gold line-art sewing machine, side view, facing left.
 * The headline line runs through the gap between the arm (top) and the bed (bottom);
 * the needle tip sits at (39, 120).
 */
export default function SewingMachineSvg({ className = "" }: SewingMachineSvgProps) {
  return (
    <svg
      viewBox="0 0 200 150"
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.svg} ${className}`}
      fill="none"
      stroke="#C9A24A"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Arm */}
      <rect x="50" y="22" width="120" height="24" rx="10" fill={BODY_FILL} />
      <path d="M64 30 h70" strokeWidth={1.2} opacity={0.55} />
      {/* Thread guides */}
      <circle cx="80" cy="22" r="2" strokeWidth={1.4} />
      <circle cx="58" cy="22" r="2" strokeWidth={1.4} />

      {/* Pillar (right) */}
      <rect x="146" y="22" width="36" height="106" rx="8" fill={BODY_FILL} />
      {/* Stitch-length dial + pillar seam */}
      <circle cx="164" cy="78" r="6" strokeWidth={1.6} />
      <path d="M164 74 v3" strokeWidth={1.4} />
      <path d="M152 104 h24" strokeWidth={1.2} opacity={0.6} />

      {/* Head (left) */}
      <rect x="18" y="22" width="42" height="40" rx="8" fill={BODY_FILL} />
      <path d="M26 32 v20" strokeWidth={1.2} opacity={0.55} />
      {/* Tension disc */}
      <circle cx="48" cy="36" r="4" strokeWidth={1.6} />

      {/* Spool on top */}
      <path d="M108 22 V4" strokeWidth={1.6} />
      <rect x="100" y="8" width="16" height="12" rx="2" fill={BODY_FILL} />
      <path d="M100 11.5 h16 M100 16.5 h16" strokeWidth={1} opacity={0.6} />

      {/* Thread: spool → guides → tension → needle eye */}
      <path
        d="M100 14 C 88 12, 82 16, 80 20 L 58 20 C 50 22, 50 30, 48 32 C 44 40, 40 48, 39 60 L 39 112"
        strokeWidth={0.9}
        strokeDasharray="2.5 2.5"
        opacity={0.85}
      />

      {/* Bed / base plate */}
      <rect x="0" y="128" width="200" height="14" rx="5" fill={BODY_FILL} />
      {/* Needle plate + feed dog slots */}
      <path d="M26 128 v-1.5 h28 v1.5" strokeWidth={1.4} />
      <path d="M32 133 h6 M42 133 h6" strokeWidth={1.2} opacity={0.7} />
      <path d="M150 135 h40" strokeWidth={1.2} opacity={0.5} />

      {/* Presser bar + foot (static) */}
      <path d="M50 62 V108" strokeWidth={1.8} />
      <path d="M50 108 L44 114 H32" strokeWidth={1.8} />

      {/* Needle (bounces) */}
      <g className={styles.needle}>
        <rect x="36" y="60" width="6" height="30" rx="1.5" fill={BODY_FILL} />
        <path d="M36 82 h6" strokeWidth={1.2} />
        <path d="M39 90 L39 120" strokeWidth={1.6} />
        <circle cx="39" cy="112" r="0.9" strokeWidth={0.8} />
      </g>

      {/* Hand-wheel */}
      <g className={styles.wheel}>
        <circle cx="182" cy="40" r="14" fill={BODY_FILL} />
        <circle cx="182" cy="40" r="3" />
        <path d="M182 37 V27 M184.6 41.5 L193.3 46.5 M179.4 41.5 L170.7 46.5" strokeWidth={1.8} />
      </g>
    </svg>
  );
}
