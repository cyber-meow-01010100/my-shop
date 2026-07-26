/* Botanical line-icon library used across product thumbnails.
   Pure inline SVG strings, colored via currentColor + CSS vars. */
window.ALCHIMIA_ICONS = {
  leafBottle: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20h20v14h-20z" stroke="#1f3b2c" stroke-width="2"/>
    <path d="M42 34h36l6 60a10 10 0 01-10 10H46a10 10 0 01-10-10l6-60z" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <path d="M60 50c-10-6-22-2-24 10 12 4 20-2 24-10z" stroke="#b8863b" stroke-width="2" fill="none"/>
    <path d="M60 50c10-6 22-2 24 10-12 4-20-2-24-10z" stroke="#b8863b" stroke-width="2" fill="none"/>
    <line x1="60" y1="50" x2="60" y2="94" stroke="#8fa688" stroke-width="2"/>
  </svg>`,
  driedHerb: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="60" y1="30" x2="60" y2="95" stroke="#b8863b" stroke-width="2"/>
    <path d="M60 40c-14-10-28-4-30 8 14 6 24-2 30-8z" stroke="#1f3b2c" stroke-width="2"/>
    <path d="M60 55c14-10 28-4 30 8-14 6-24-2-30-8z" stroke="#1f3b2c" stroke-width="2"/>
    <path d="M60 70c-12-8-22-2-24 8 12 5 20-2 24-8z" stroke="#1f3b2c" stroke-width="2"/>
    <circle cx="60" cy="28" r="4" stroke="#b8863b" stroke-width="2"/>
  </svg>`,
  oilDropper: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="42" y="42" width="36" height="52" rx="6" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <path d="M48 30h24l4 12H44z" stroke="#1f3b2c" stroke-width="2"/>
    <rect x="52" y="16" width="16" height="14" rx="2" stroke="#b8863b" stroke-width="2"/>
    <line x1="50" y1="60" x2="70" y2="60" stroke="#8fa688" stroke-width="2"/>
    <line x1="50" y1="72" x2="70" y2="72" stroke="#8fa688" stroke-width="2"/>
  </svg>`,
  honeyJar: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="36" y="46" width="48" height="46" rx="6" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <rect x="42" y="32" width="36" height="14" rx="3" stroke="#b8863b" stroke-width="2"/>
    <line x1="36" y1="64" x2="84" y2="64" stroke="#8fa688" stroke-width="2"/>
    <line x1="36" y1="78" x2="84" y2="78" stroke="#8fa688" stroke-width="2"/>
  </svg>`,
  teaLeaf: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="34" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <path d="M60 40c-10 4-16 14-12 26 12-2 18-12 12-26z" stroke="#b8863b" stroke-width="2"/>
    <path d="M60 40c10 4 16 14 12 26-12-2-18-12-12-26z" stroke="#b8863b" stroke-width="2"/>
    <line x1="60" y1="40" x2="60" y2="76" stroke="#8fa688" stroke-width="2"/>
  </svg>`,
  soapBar: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="46" width="60" height="34" rx="10" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <path d="M46 55c4-6 12-6 14 0s10 6 14 0" stroke="#b8863b" stroke-width="2" fill="none"/>
    <line x1="60" y1="34" x2="60" y2="46" stroke="#8fa688" stroke-width="2"/>
  </svg>`,
  seedPod: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="60" rx="18" ry="30" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <line x1="60" y1="30" x2="60" y2="90" stroke="#8fa688" stroke-width="2"/>
    <circle cx="60" cy="45" r="3" fill="#b8863b"/>
    <circle cx="60" cy="60" r="3" fill="#b8863b"/>
    <circle cx="60" cy="75" r="3" fill="#b8863b"/>
  </svg>`,
  rootRhizome: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 50c10-8 30-8 40 0s10 22 0 30-30 8-40 0-10-22 0-30z" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <path d="M46 60l8 8M74 60l-8 8M60 46v28" stroke="#b8863b" stroke-width="2"/>
  </svg>`,
  cinnamonQuills: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#1f3b2c" stroke-width="2">
      <ellipse cx="45" cy="60" rx="8" ry="34" fill="#f6f1e4"/>
      <ellipse cx="45" cy="60" rx="3.4" ry="34" fill="none" stroke="#b8863b"/>
      <ellipse cx="66" cy="62" rx="7" ry="30" fill="#f6f1e4" transform="rotate(-8 66 62)"/>
      <ellipse cx="66" cy="62" rx="3" ry="30" fill="none" stroke="#b8863b" transform="rotate(-8 66 62)"/>
      <ellipse cx="84" cy="58" rx="6" ry="26" fill="#f6f1e4" transform="rotate(10 84 58)"/>
    </g>
  </svg>`,
  peppercorn: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4">
      <circle cx="45" cy="50" r="9"/>
      <circle cx="68" cy="46" r="7"/>
      <circle cx="58" cy="66" r="10"/>
      <circle cx="80" cy="64" r="8"/>
      <circle cx="42" cy="72" r="6"/>
      <circle cx="70" cy="82" r="7"/>
    </g>
    <path d="M40 35c4-8 12-12 20-10" stroke="#8fa688" stroke-width="2"/>
  </svg>`,
  cardamomPod: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="60" rx="16" ry="28" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <line x1="60" y1="34" x2="60" y2="88" stroke="#b8863b" stroke-width="1.5"/>
    <line x1="48" y1="45" x2="72" y2="45" stroke="#8fa688" stroke-width="1.2"/>
    <line x1="46" y1="60" x2="74" y2="60" stroke="#8fa688" stroke-width="1.2"/>
    <line x1="48" y1="75" x2="72" y2="75" stroke="#8fa688" stroke-width="1.2"/>
  </svg>`,
  vanillaPod: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 40c20-6 50 4 62 26-22 14-52 8-66-10 1-6 2-11 4-16z" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <path d="M34 42c20 0 44 10 54 22" stroke="#b8863b" stroke-width="1.5"/>
    <circle cx="34" cy="41" r="2.4" fill="#b8863b"/>
  </svg>`,
  coffeeBean: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4">
      <ellipse cx="48" cy="52" rx="14" ry="20" transform="rotate(-25 48 52)"/>
      <ellipse cx="74" cy="66" rx="14" ry="20" transform="rotate(-25 74 66)"/>
    </g>
    <path d="M48 38c2 8 2 20 0 28" stroke="#b8863b" stroke-width="2" transform="rotate(-25 48 52)"/>
    <path d="M74 52c2 8 2 20 0 28" stroke="#b8863b" stroke-width="2" transform="rotate(-25 74 66)"/>
  </svg>`,
  lotusFlower: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#1f3b2c" stroke-width="1.6" fill="#f6f1e4">
      <path d="M60 90c-8-16-8-34 0-50 8 16 8 34 0 50z"/>
      <path d="M60 90c-20-6-32-20-34-38 18 2 30 16 34 38z"/>
      <path d="M60 90c20-6 32-20 34-38-18 2-30 16-34 38z"/>
      <path d="M60 90c-12-10-16-24-12-40 12 8 18 22 12 40z"/>
      <path d="M60 90c12-10 16-24 12-40-12 8-18 22-12 40z"/>
    </g>
    <line x1="60" y1="90" x2="60" y2="104" stroke="#8fa688" stroke-width="2"/>
  </svg>`,
  herbalCapsule: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="52" width="60" height="26" rx="13" stroke="#1f3b2c" stroke-width="2" fill="#f6f1e4"/>
    <path d="M60 52v26" stroke="#1f3b2c" stroke-width="2"/>
    <rect x="60" y="52" width="30" height="26" rx="13" fill="#b8863b" opacity="0.25"/>
    <circle cx="45" cy="65" r="3" fill="#8fa688"/>
  </svg>`
};

window.ALCHIMIA_ICON_KEYS = Object.keys(window.ALCHIMIA_ICONS);
