const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. FULL LOGO SVG (1024 x 1024)
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="spaceGlow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#0c142b" />
      <stop offset="40%" stop-color="#070b18" />
      <stop offset="80%" stop-color="#03050a" />
      <stop offset="100%" stop-color="#020306" />
    </radialGradient>

    <!-- Celestial Moon Gold Gradient -->
    <linearGradient id="moonGold" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#fff9e6" />
      <stop offset="25%" stop-color="#fae29c" />
      <stop offset="60%" stop-color="#e5b85a" />
      <stop offset="85%" stop-color="#b8832a" />
      <stop offset="100%" stop-color="#7a5313" />
    </linearGradient>

    <!-- Moon Inner Glow -->
    <radialGradient id="moonGlow" cx="35%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#fae7b2" stop-opacity="0.6" />
      <stop offset="80%" stop-color="#e5b85a" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#b8832a" stop-opacity="0" />
    </radialGradient>

    <!-- Star Glow Filter -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Soft Glow Filter -->
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Gold Text Gradient -->
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fff8db" />
      <stop offset="30%" stop-color="#f5d78a" />
      <stop offset="70%" stop-color="#e6b95b" />
      <stop offset="100%" stop-color="#bf8c2f" />
    </linearGradient>

    <!-- Wax Seal Crimson Gradient -->
    <radialGradient id="waxSeal" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#d93b4f" />
      <stop offset="35%" stop-color="#ad1d30" />
      <stop offset="75%" stop-color="#7d0e1e" />
      <stop offset="100%" stop-color="#45050e" />
    </radialGradient>

    <!-- Parchment Paper Gradient -->
    <linearGradient id="parchment" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#fdfaf3" />
      <stop offset="40%" stop-color="#f7efe0" />
      <stop offset="85%" stop-color="#ebdcc3" />
      <stop offset="100%" stop-color="#dfcca9" />
    </linearGradient>

    <!-- Gold Twine Gradient -->
    <linearGradient id="goldCord" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff4cc" />
      <stop offset="50%" stop-color="#d4a342" />
      <stop offset="100%" stop-color="#8a6119" />
    </linearGradient>

    <!-- Cloud Gradient -->
    <radialGradient id="cloudGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1e2945" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#11182c" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#070a14" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadow for Letter -->
    <filter id="envelopeShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.75" />
    </filter>

    <!-- Outer Golden Ring Clip -->
    <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
      <stop offset="90%" stop-color="#e8bf66" stop-opacity="0" />
      <stop offset="98%" stop-color="#ffd980" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#e8bf66" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Dark Midnight Background Canvas -->
  <rect width="1024" height="1024" fill="url(#spaceGlow)" />

  <!-- Outer Fine Celestial Orbit Ring -->
  <circle cx="512" cy="450" r="380" fill="none" stroke="#dcb460" stroke-width="1.2" stroke-opacity="0.45" />
  <circle cx="512" cy="450" r="378" fill="none" stroke="#ffe599" stroke-width="0.6" stroke-opacity="0.25" stroke-dasharray="8 16 32 16" />

  <!-- Shooting Star in Upper Right -->
  <g filter="url(#glow)">
    <line x1="680" y1="130" x2="780" y2="190" stroke="url(#moonGold)" stroke-width="1.8" stroke-linecap="round" opacity="0.85" />
    <line x1="710" y1="148" x2="790" y2="196" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="0.95" />
    <circle cx="788" cy="195" r="3.5" fill="#ffffff" />
    <!-- Starlight sparkles -->
    <polygon points="788,187 790,194 797,195 790,196 788,203 786,196 779,195 786,194" fill="#fff5d1" />
  </g>

  <!-- Constellation Nodes & Connecting Lines in Upper Sky -->
  <g stroke="#e2ba66" stroke-opacity="0.4" stroke-width="0.9" fill="none">
    <polyline points="420,110 490,135 580,165 670,225 725,260 760,330" />
  </g>

  <!-- Twinkling Constellation Stars -->
  <!-- 8-Point Star at 580,165 -->
  <g transform="translate(580, 165)" filter="url(#glow)">
    <polygon points="0,-18 3,-4 18,0 3,4 0,18 -3,4 -18,0 -3,-4" fill="#fff9e6" />
    <circle cx="0" cy="0" r="3" fill="#ffffff" />
  </g>

  <!-- Star at 670, 225 -->
  <g transform="translate(670, 225)" filter="url(#glow)">
    <polygon points="0,-12 2,-3 12,0 2,3 0,12 -2,3 -12,0 -2,-3" fill="#ffd978" />
    <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
  </g>

  <!-- Star at 760, 330 -->
  <g transform="translate(760, 330)" filter="url(#glow)">
    <polygon points="0,-15 2.5,-3.5 15,0 2.5,3.5 0,15 -2.5,3.5 -15,0 -2.5,-3.5" fill="#fff5d1" />
    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
  </g>

  <!-- Star at 435, 115 -->
  <g transform="translate(435, 115)" filter="url(#glow)">
    <polygon points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2" fill="#ffd978" />
  </g>

  <!-- Additional Starfield Sprinkles -->
  <circle cx="210" cy="280" r="1.5" fill="#ffd978" opacity="0.7" />
  <circle cx="230" cy="220" r="2.2" fill="#ffffff" opacity="0.85" filter="url(#glow)" />
  <circle cx="350" cy="115" r="1.8" fill="#ffd978" opacity="0.6" />
  <circle cx="490" cy="135" r="2.5" fill="#ffffff" opacity="0.9" filter="url(#glow)" />
  <circle cx="650" cy="120" r="1.5" fill="#ffffff" opacity="0.6" />
  <circle cx="705" cy="290" r="2.2" fill="#ffd978" opacity="0.75" />
  <circle cx="810" cy="460" r="3.2" fill="#ffd978" opacity="0.8" filter="url(#glow)" />
  <circle cx="205" cy="420" r="1.8" fill="#ffffff" opacity="0.6" />

  <!-- The Radiant Golden Crescent Moon -->
  <!-- Outer glowing aura -->
  <path d="M 370 70 A 340 340 0 1 0 540 685 A 300 300 0 1 1 370 70 Z"
        fill="url(#moonGold)" filter="url(#softGlow)" opacity="0.4" />

  <!-- Moon Body -->
  <path d="M 370 70 A 340 340 0 1 0 540 685 A 300 300 0 1 1 370 70 Z"
        fill="url(#moonGold)" />

  <!-- Moon Highlight Texture & Craters -->
  <g opacity="0.35">
    <ellipse cx="280" cy="230" rx="36" ry="24" fill="#a1701b" transform="rotate(-20 280 230)" />
    <ellipse cx="270" cy="225" rx="30" ry="18" fill="#5c3d0b" opacity="0.5" transform="rotate(-20 270 225)" />
    <circle cx="245" cy="340" r="28" fill="#a1701b" />
    <circle cx="240" cy="336" r="22" fill="#5c3d0b" opacity="0.5" />
    <ellipse cx="260" cy="440" rx="42" ry="26" fill="#a1701b" transform="rotate(15 260 440)" />
    <circle cx="315" cy="540" r="25" fill="#a1701b" />
    <circle cx="380" cy="620" r="20" fill="#a1701b" />
  </g>

  <!-- Moon Inner Light Rim -->
  <path d="M 370 70 A 340 340 0 0 0 220 400 A 340 340 0 0 0 540 685 A 328 328 0 0 1 238 395 A 328 328 0 0 1 370 70 Z"
        fill="#ffffff" opacity="0.8" filter="url(#glow)" />

  <!-- Fluffy Dark Midnight Clouds (Beneath the letter) -->
  <g filter="url(#softGlow)">
    <circle cx="370" cy="480" r="95" fill="url(#cloudGlow)" />
    <circle cx="480" cy="495" r="115" fill="url(#cloudGlow)" />
    <circle cx="610" cy="485" r="105" fill="url(#cloudGlow)" />
    <circle cx="680" cy="450" r="85" fill="url(#cloudGlow)" />
    <ellipse cx="512" cy="510" rx="230" ry="70" fill="url(#cloudGlow)" />
  </g>

  <!-- Baby's Breath / White Blossoms Sprig (Tucked behind left of envelope) -->
  <g transform="translate(350, 280)">
    <!-- Slender Olive Green Stems -->
    <path d="M 50 140 Q 20 80 -10 20 M 35 95 Q 60 50 45 -10 M 25 110 Q -5 90 -25 70"
          stroke="#475f3e" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.9" />

    <!-- Dainty White Star Flowers -->
    <!-- Flower Cluster 1 -->
    <g transform="translate(-10, 18)">
      <circle cx="-6" cy="0" r="4.5" fill="#ffffff" />
      <circle cx="6" cy="0" r="4.5" fill="#ffffff" />
      <circle cx="0" cy="-6" r="4.5" fill="#ffffff" />
      <circle cx="0" cy="6" r="4.5" fill="#ffffff" />
      <circle cx="0" cy="0" r="3.2" fill="#fae8a7" />
    </g>
    <!-- Flower Cluster 2 -->
    <g transform="translate(45, -12)">
      <circle cx="-5" cy="0" r="4" fill="#ffffff" />
      <circle cx="5" cy="0" r="4" fill="#ffffff" />
      <circle cx="0" cy="-5" r="4" fill="#ffffff" />
      <circle cx="0" cy="5" r="4" fill="#ffffff" />
      <circle cx="0" cy="0" r="2.8" fill="#fae8a7" />
    </g>
    <!-- Flower Cluster 3 -->
    <g transform="translate(18, 45)">
      <circle cx="-5.5" cy="0" r="4.2" fill="#ffffff" />
      <circle cx="5.5" cy="0" r="4.2" fill="#ffffff" />
      <circle cx="0" cy="-5.5" r="4.2" fill="#ffffff" />
      <circle cx="0" cy="5.5" r="4.2" fill="#ffffff" />
      <circle cx="0" cy="0" r="3" fill="#fae8a7" />
    </g>
    <!-- Flower Cluster 4 -->
    <g transform="translate(-25, 70)">
      <circle cx="-4" cy="0" r="3.5" fill="#ffffff" />
      <circle cx="4" cy="0" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="-4" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="4" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="0" r="2.2" fill="#fae8a7" />
    </g>
    <!-- Flower Cluster 5 -->
    <g transform="translate(68, 30)">
      <circle cx="-4" cy="0" r="3.5" fill="#ffffff" />
      <circle cx="4" cy="0" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="-4" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="4" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="0" r="2.5" fill="#fae8a7" />
    </g>
  </g>

  <!-- Sealed Vintage Love Letter Envelope (Centerpiece) -->
  <!-- Tilted gracefully at -11 degrees -->
  <g transform="translate(525, 360) rotate(-11)" filter="url(#envelopeShadow)">
    <!-- Envelope Main Rectangle Base -->
    <rect x="-165" y="-105" width="330" height="210" rx="14" fill="url(#parchment)" stroke="#cfbba0" stroke-width="1.6" />

    <!-- Envelope Flap Triangular Lines / Creases -->
    <path d="M -165 -105 L 0 22 L 165 -105" fill="none" stroke="#cfb89a" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
    <path d="M -165 105 L -35 -5" fill="none" stroke="#d5c2a7" stroke-width="1.4" opacity="0.6" />
    <path d="M 165 105 L 35 -5" fill="none" stroke="#d5c2a7" stroke-width="1.4" opacity="0.6" />

    <!-- Delicate Golden Twine Wrapped Across the Letter -->
    <line x1="-165" y1="5" x2="165" y2="5" stroke="url(#goldCord)" stroke-width="2.5" stroke-linecap="round" />
    <line x1="0" y1="-105" x2="0" y2="105" stroke="url(#goldCord)" stroke-width="2.5" stroke-linecap="round" />

    <!-- Handwritten Romantic Inscription on Envelope: "To You Always.... ♡" -->
    <g transform="translate(38, -60)" font-family="'Caveat', 'Brush Script MT', 'Dancing Script', cursive" fill="#423326" opacity="0.95">
      <text x="0" y="0" font-size="28" font-weight="600" letter-spacing="1">To You</text>
      <text x="12" y="32" font-size="25" font-weight="600">Always.... ♡</text>
    </g>

    <!-- Deep Crimson Ruby Wax Seal -->
    <g transform="translate(0, 5)">
      <!-- Seal Outer Irregular Organic Edge -->
      <circle cx="0" cy="0" r="36" fill="url(#waxSeal)" filter="url(#glow)" opacity="0.5" />
      <path d="M 0 -35 Q 26 -38 35 0 Q 38 28 0 35 Q -32 38 -35 0 Q -38 -28 0 -35 Z" fill="url(#waxSeal)" />
      <!-- Seal Inner Ring -->
      <circle cx="0" cy="0" r="27" fill="none" stroke="#e05367" stroke-width="1.4" opacity="0.75" />
      <circle cx="0" cy="0" r="25" fill="#690916" />

      <!-- Embossed Golden 8-Point Star on Wax Seal -->
      <g filter="url(#glow)">
        <polygon points="0,-18 3,-4 18,0 3,4 0,18 -3,4 -18,0 -3,-4" fill="url(#moonGold)" />
        <circle cx="0" cy="0" r="3.2" fill="#ffffff" />
      </g>
    </g>
  </g>

  <!-- Floating Romantic Pink Blossom Petals -->
  <!-- Petal 1 -->
  <path d="M 370 240 C 355 245 350 260 365 268 C 380 270 390 255 385 242 C 380 235 372 238 370 240 Z"
        fill="#f8c3cd" opacity="0.8" filter="url(#glow)" />
  <!-- Petal 2 -->
  <path d="M 295 410 C 285 415 280 425 292 432 C 302 435 312 425 308 415 Z"
        fill="#f8c3cd" opacity="0.75" />
  <!-- Petal 3 -->
  <path d="M 720 315 C 710 320 705 332 718 338 C 730 340 740 330 735 320 Z"
        fill="#f8c3cd" opacity="0.8" filter="url(#glow)" />
  <!-- Petal 4 -->
  <path d="M 430 455 C 420 458 418 468 428 472 C 438 474 445 466 442 458 Z"
        fill="#f8c3cd" opacity="0.7" />

  <!-- Golden Orbit Swirl Arc Sweeping Through -->
  <path d="M 730 340 Q 820 400 790 480 Q 760 550 670 560"
        fill="none" stroke="url(#moonGold)" stroke-width="1.6" opacity="0.7" />

  <!-- ============================================== -->
  <!-- MAIN TYPOGRAPHY: Gaalimaatalu (Calligraphic)   -->
  <!-- ============================================== -->
  <g transform="translate(512, 595)" text-anchor="middle">
    <!-- Golden Background Bloom Glow -->
    <text x="0" y="0"
          font-family="'Playfair Display', 'Cormorant Garamond', 'Great Vibes', 'Allura', cursive, serif"
          font-size="124"
          font-style="italic"
          font-weight="600"
          fill="#ffd980"
          opacity="0.35"
          filter="url(#glow)">
      Gaalimaatalu
    </text>

    <!-- Crisp Rich Gold Gradient Text -->
    <text x="0" y="0"
          font-family="'Playfair Display', 'Cormorant Garamond', 'Great Vibes', 'Allura', cursive, serif"
          font-size="124"
          font-style="italic"
          font-weight="600"
          fill="url(#goldText)">
      Gaalimaatalu
    </text>
  </g>

  <!-- ============================================== -->
  <!-- SUBTITLE: — S T A R L I T   L E T T E R S —    -->
  <!-- ============================================== -->
  <g transform="translate(512, 650)">
    <!-- Left Accent Line -->
    <line x1="-310" y1="-5" x2="-185" y2="-5" stroke="url(#moonGold)" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />

    <!-- Subtitle Text -->
    <text x="0" y="0"
          text-anchor="middle"
          font-family="'Cinzel', 'Cormorant Garamond', 'Trajan Pro', 'Times New Roman', serif"
          font-size="28"
          font-weight="600"
          letter-spacing="12"
          fill="#f6d389">
      STARLIT LETTERS
    </text>

    <!-- Right Accent Line -->
    <line x1="185" y1="-5" x2="310" y2="-5" stroke="url(#moonGold)" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />

    <!-- Center Star Accent Below Subtitle -->
    <g transform="translate(0, 32)" filter="url(#glow)">
      <polygon points="0,-14 2.5,-3 14,0 2.5,3 0,14 -2.5,3 -14,0 -2.5,-3" fill="#ffeaa3" />
      <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
    </g>
  </g>

  <!-- ============================================== -->
  <!-- TAGLINE: SOME FEELINGS ALWAYS FIND A WAY        -->
  <!-- ============================================== -->
  <g transform="translate(512, 725)" text-anchor="middle" opacity="0.88">
    <text x="0" y="0"
          font-family="'Plus Jakarta Sans', 'Inter', sans-serif"
          font-size="16"
          font-weight="500"
          letter-spacing="9"
          fill="#dfba72">
      SOME FEELINGS
    </text>
    <text x="0" y="24"
          font-family="'Plus Jakarta Sans', 'Inter', sans-serif"
          font-size="16"
          font-weight="500"
          letter-spacing="9"
          fill="#dfba72">
      ALWAYS FIND A WAY
    </text>
  </g>
</svg>`;

// 2. SIMPLIFIED FAVICON / APP ICON SVG (512 x 512)
// As requested: "CRESCENT MOON + SEALED LOVE LETTER + SMALL CELESTIAL DETAILS"
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="favSpace" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#0f1936" />
      <stop offset="60%" stop-color="#070a16" />
      <stop offset="100%" stop-color="#020306" />
    </radialGradient>

    <linearGradient id="favMoon" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#fff9e6" />
      <stop offset="30%" stop-color="#fae29c" />
      <stop offset="70%" stop-color="#e5b85a" />
      <stop offset="100%" stop-color="#996a1a" />
    </linearGradient>

    <linearGradient id="favParchment" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbf2" />
      <stop offset="60%" stop-color="#f5ecdb" />
      <stop offset="100%" stop-color="#dfcca9" />
    </linearGradient>

    <radialGradient id="favWax" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e03b4f" />
      <stop offset="45%" stop-color="#b01b2e" />
      <stop offset="100%" stop-color="#4a0610" />
    </radialGradient>

    <linearGradient id="favCord" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff4cc" />
      <stop offset="100%" stop-color="#ad7c23" />
    </linearGradient>

    <filter id="favGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="favShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Deep Midnight Rounded Squircle / Badge Canvas -->
  <rect width="512" height="512" rx="115" fill="url(#favSpace)" />
  <!-- Elegant Fine Gold Squircle Border -->
  <rect x="8" y="8" width="496" height="496" rx="107" fill="none" stroke="#e5b85a" stroke-width="3" stroke-opacity="0.6" />

  <!-- Outer Celestial Starlight Ring -->
  <circle cx="256" cy="256" r="215" fill="none" stroke="#dcb460" stroke-width="1.5" stroke-opacity="0.35" />

  <!-- Stars in the sky -->
  <!-- Top 8-point star -->
  <g transform="translate(360, 105)" filter="url(#favGlow)">
    <polygon points="0,-16 3,-4 16,0 3,4 0,16 -3,4 -16,0 -3,-4" fill="#fff9e6" />
    <circle cx="0" cy="0" r="3" fill="#ffffff" />
  </g>
  <!-- Small Star Right -->
  <g transform="translate(425, 220)" filter="url(#favGlow)">
    <polygon points="0,-12 2,-3 12,0 2,3 0,12 -2,3 -12,0 -2,-3" fill="#ffd978" />
  </g>
  <circle cx="160" cy="100" r="3" fill="#ffffff" opacity="0.8" filter="url(#favGlow)" />
  <circle cx="395" cy="370" r="2.5" fill="#ffd978" opacity="0.8" />
  <circle cx="130" cy="380" r="2.5" fill="#ffffff" opacity="0.7" />

  <!-- Golden Crescent Moon -->
  <path d="M 180 65 A 205 205 0 1 0 310 440 A 175 175 0 1 1 180 65 Z"
        fill="url(#favMoon)" filter="url(#favGlow)" opacity="0.95" />

  <!-- White Baby's Breath Blossoms Behind Envelope -->
  <g transform="translate(195, 175)">
    <circle cx="-5" cy="0" r="6" fill="#ffffff" />
    <circle cx="5" cy="0" r="6" fill="#ffffff" />
    <circle cx="0" cy="-5" r="6" fill="#ffffff" />
    <circle cx="0" cy="5" r="6" fill="#ffffff" />
    <circle cx="0" cy="0" r="3.5" fill="#f8e49b" />

    <circle cx="25" cy="-25" r="5" fill="#ffffff" />
    <circle cx="33" cy="-25" r="5" fill="#ffffff" />
    <circle cx="29" cy="-29" r="5" fill="#ffffff" />
    <circle cx="29" cy="-21" r="5" fill="#ffffff" />
    <circle cx="29" cy="-25" r="3" fill="#f8e49b" />
  </g>

  <!-- Floating Petal -->
  <path d="M 160 290 C 150 295 145 305 158 312 C 170 315 180 305 175 295 Z"
        fill="#f8c3cd" opacity="0.85" filter="url(#favGlow)" />

  <!-- Vintage Parchment Sealed Love Letter (Centered & Prominent) -->
  <g transform="translate(280, 275) rotate(-11)" filter="url(#favShadow)">
    <!-- Base Rectangle -->
    <rect x="-140" y="-90" width="280" height="180" rx="14" fill="url(#favParchment)" stroke="#cfbba0" stroke-width="2.5" />

    <!-- Flap Folds -->
    <path d="M -140 -90 L 0 20 L 140 -90" fill="none" stroke="#caa985" stroke-width="2.8" stroke-linecap="round" />
    <path d="M -140 90 L -30 -5" fill="none" stroke="#caa985" stroke-width="2" opacity="0.7" />
    <path d="M 140 90 L 30 -5" fill="none" stroke="#caa985" stroke-width="2" opacity="0.7" />

    <!-- Gold Twine Tie -->
    <line x1="-140" y1="5" x2="140" y2="5" stroke="url(#favCord)" stroke-width="3" />
    <line x1="0" y1="-90" x2="0" y2="90" stroke="url(#favCord)" stroke-width="3" />

    <!-- Handwritten "To You Always.... ♡" -->
    <g transform="translate(28, -50)" font-family="'Caveat', cursive, serif" fill="#3b2b1e">
      <text x="0" y="0" font-size="24" font-weight="700">To You</text>
      <text x="8" y="28" font-size="22" font-weight="700">Always.. ♡</text>
    </g>

    <!-- Ruby Crimson Wax Seal with 8-Point Star -->
    <g transform="translate(0, 5)">
      <circle cx="0" cy="0" r="38" fill="url(#favWax)" filter="url(#favGlow)" opacity="0.6" />
      <path d="M 0 -36 Q 28 -38 36 0 Q 38 28 0 36 Q -34 38 -36 0 Q -38 -28 0 -36 Z" fill="url(#favWax)" />
      <circle cx="0" cy="0" r="26" fill="#690916" stroke="#ea5669" stroke-width="1.8" />
      <!-- Star in Seal -->
      <polygon points="0,-18 3,-4 18,0 3,4 0,18 -3,4 -18,0 -3,-4" fill="url(#favMoon)" filter="url(#favGlow)" />
      <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
    </g>
  </g>
</svg>`;

async function buildAssets() {
  console.log('Generating Gaalimaatalu celestial branding assets...');

  // 1. Write SVGs
  fs.writeFileSync(path.join(publicDir, 'gaalimaatalu-logo.svg'), logoSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'gaalimaatalu-favicon.svg'), faviconSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg, 'utf8');

  // 2. Render Full Logo PNGs
  await sharp(Buffer.from(logoSvg))
    .resize(1024, 1024)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'gaalimaatalu-logo.png'));

  await sharp(Buffer.from(logoSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'gaalimaatalu-logo-512.png'));

  // 3. Render Favicon & App Icon PNGs
  const faviconBuffer = Buffer.from(faviconSvg);

  // 512x512 App Icon
  await sharp(faviconBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'gaalimaatalu-icon-512.png'));

  // 192x192 PWA Icon
  await sharp(faviconBuffer)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'gaalimaatalu-icon-192.png'));

  // 180x180 Apple Touch Icon
  await sharp(faviconBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 96x96
  await sharp(faviconBuffer)
    .resize(96, 96)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'gaalimaatalu-icon-96.png'));

  // 48x48
  await sharp(faviconBuffer)
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-48x48.png'));

  // 32x32 Favicon
  await sharp(faviconBuffer)
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'gaalimaatalu-favicon.png'));

  await sharp(faviconBuffer)
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // 16x16 Favicon
  await sharp(faviconBuffer)
    .resize(16, 16)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // favicon.ico (using 32x32 PNG as standard modern browser ICO)
  await sharp(faviconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  // 4. Create Web App Manifests
  const manifest = {
    name: 'Gaalimaatalu',
    short_name: 'Gaalimaatalu',
    description: 'Starlit Letters - A quiet sanctuary reserved for letters, memories, and little constellations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050811',
    theme_color: '#050811',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png'
      },
      {
        src: '/gaalimaatalu-icon-96.png',
        sizes: '96x96',
        type: 'image/png'
      },
      {
        src: '/gaalimaatalu-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/gaalimaatalu-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log('All branding assets successfully created in public/ directory!');
}

buildAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
