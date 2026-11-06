const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(process.cwd(), 'public', 'images', 'home');
fs.mkdirSync(outDir, { recursive: true });

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function createSvg(title, subtitle, iconSvg, width = 800, height = 600, isHero = false) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#181B20" />
        <stop offset="40%" stop-color="#1F2329" />
        <stop offset="100%" stop-color="#2B3038" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#C9A24A" />
        <stop offset="50%" stop-color="#E8C77A" />
        <stop offset="100%" stop-color="#C9A24A" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#C9A24A" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#C9A24A" stop-opacity="0" />
      </radialGradient>
      <pattern id="stitchPattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 L 40 20" stroke="#C9A24A" stroke-width="1" stroke-dasharray="4,6" stroke-opacity="0.12" />
        <path d="M 20 0 L 20 40" stroke="#C9A24A" stroke-width="1" stroke-dasharray="4,6" stroke-opacity="0.12" />
      </pattern>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#stitchPattern)" />
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.45}" fill="url(#glow)" />

    <!-- Outer Gold Border -->
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="10,12" stroke-opacity="0.4" rx="4" />
    <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="#C9A24A" stroke-width="0.8" stroke-opacity="0.2" rx="2" />

    <!-- Center Emblem & Icon -->
    <g transform="translate(${width / 2}, ${height / 2 - 25})">
      <circle cx="0" cy="0" r="54" fill="#1F2329" stroke="url(#goldGrad)" stroke-width="2" />
      <circle cx="0" cy="0" r="48" fill="none" stroke="#C9A24A" stroke-width="1" stroke-dasharray="4,4" stroke-opacity="0.5" />
      ${iconSvg}
    </g>

    <!-- Typography -->
    <text x="${width / 2}" y="${height / 2 + 65}" text-anchor="middle" font-family="'Times New Roman', serif" font-size="24" font-weight="400" fill="#F7F3EC" letter-spacing="1">
      ${safeTitle}
    </text>
    <text x="${width / 2}" y="${height / 2 + 95}" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="500" fill="#E8C77A" letter-spacing="2" text-transform="uppercase">
      ${safeSubtitle}
    </text>

    <!-- Bottom KFA Seal -->
    <text x="${width / 2}" y="${height - 35}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#F7F3EC" fill-opacity="0.4" letter-spacing="3">
      KRISH FASHION ACADEMY · SCARBOROUGH, TORONTO
    </text>
  </svg>`;
}

const icons = {
  hero: `<path d="M-20 -10 L0 -25 L20 -10 L15 18 L-15 18 Z" fill="none" stroke="#E8C77A" stroke-width="2.5" /><circle cx="0" cy="-2" r="6" fill="none" stroke="#E8C77A" stroke-width="2" />`,
  blouse: `<path d="M-22 -18 C -10 -10, 10 -10, 22 -18 L26 14 C 15 22, -15 22, -26 14 Z" fill="none" stroke="#E8C77A" stroke-width="2.5" /><path d="M0 -10 L0 18" stroke="#E8C77A" stroke-width="1.5" stroke-dasharray="3,3" /><path d="M-12 0 L-22 8 M12 0 L22 8" stroke="#E8C77A" stroke-width="1.5" />`,
  measure: `<path d="M-24 0 L24 0" stroke="#E8C77A" stroke-width="3" /><path d="M-20 -6 L-20 6 M-10 -4 L-10 4 M0 -6 L0 6 M10 -4 L10 4 M20 -6 L20 6" stroke="#E8C77A" stroke-width="2" />`,
  pattern: `<rect x="-20" y="-20" width="40" height="40" fill="none" stroke="#E8C77A" stroke-width="2" stroke-dasharray="4,3" /><path d="M-15 15 Q 0 -5 15 -15" fill="none" stroke="#E8C77A" stroke-width="2.5" />`,
  cutting: `<circle cx="-12" cy="14" r="8" fill="none" stroke="#E8C77A" stroke-width="2" /><circle cx="12" cy="14" r="8" fill="none" stroke="#E8C77A" stroke-width="2" /><path d="M-6 8 L18 -18 M6 8 L-18 -18" stroke="#E8C77A" stroke-width="2.5" />`,
  stitching: `<path d="M-18 12 L18 12 M0 -20 L0 8" stroke="#E8C77A" stroke-width="2.5" /><path d="M-6 8 L0 12 L6 8" fill="none" stroke="#E8C77A" stroke-width="2.5" /><circle cx="0" cy="-12" r="2.5" fill="#E8C77A" />`,
  studio: `<rect x="-20" y="-14" width="40" height="28" rx="2" fill="none" stroke="#E8C77A" stroke-width="2" /><path d="M-10 14 L-14 22 M10 14 L14 22 M-16 22 L16 22" stroke="#E8C77A" stroke-width="2" />`,
  online: `<rect x="-22" y="-16" width="44" height="28" rx="3" fill="none" stroke="#E8C77A" stroke-width="2" /><polygon points="-4,-6 8,0 -4,6" fill="#E8C77A" /><path d="M0 12 L0 18 M-10 18 L10 18" stroke="#E8C77A" stroke-width="2" />`
};

const images = [
  { file: 'hero-stitch.webp', title: 'Master Saree Blouse Atelier', sub: 'Scarborough · Toronto · In-Person & Online', icon: icons.hero, w: 1920, h: 1080, isHero: true },
  { file: 'masterclass-blouse.webp', title: '2-Day Saree Blouse Master Class', sub: '3-Dart Blouse Tailoring For Beginners', icon: icons.blouse, w: 1200, h: 900 },
  { file: 'learn-measure.webp', title: '1. Body Measurements', sub: 'Precision Anatomic Markings & Ease', icon: icons.measure, w: 800, h: 600 },
  { file: 'learn-pattern.webp', title: '3. Paper Pattern', sub: '3-Dart Sloper Drafting & Grading', icon: icons.pattern, w: 800, h: 600 },
  { file: 'learn-cutting.webp', title: '4. Fabric Cutting', sub: 'Grainline Alignment & Seam Ease', icon: icons.cutting, w: 800, h: 600 },
  { file: 'learn-stitching.webp', title: '5. Finished Stitching', sub: 'Machine Practice & Flawless Assembly', icon: icons.stitching, w: 800, h: 600 },
  { file: 'studio-class.webp', title: 'In-Person Studio Masterclass', sub: 'Middlefield & McNicoll, Scarborough', icon: icons.studio, w: 800, h: 600 },
  { file: 'online-class.webp', title: 'Live Online Masterclass', sub: 'Live Class & Portal Recordings', icon: icons.online, w: 800, h: 600 },
];

async function generateAll() {
  for (const item of images) {
    const svg = createSvg(item.title, item.sub, item.icon, item.w, item.h, item.isHero);
    const dest = path.join(outDir, item.file);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toFile(dest);
    console.log('Generated WebP:', item.file);
  }
}

generateAll().catch(console.error);
