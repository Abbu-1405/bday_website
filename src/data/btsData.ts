import { BtsItem } from '../types';

export const btsItems: BtsItem[] = [
  // 1. PHOTOS
  {
    id: 'bts-photo-01',
    title: 'The Failed Wax Seal Experiment',
    type: 'image',
    path: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop',
    caption: 'Attempt #4 at pressing a golden celestial wax stamp on handmade parchment. The wax cooled way too fast and stuck to the brass ring.',
    date: '2026-05-14',
    tags: ['craft', 'wax-seal', 'outtakes', 'letters'],
    downloadable: true,
    fileSize: '2.4 MB',
    authorNote: 'We went through three entire sticks of burgundy wax before getting the seal on Letter #1 right.',
  },
  {
    id: 'bts-photo-02',
    title: 'Midnight Coffee & Ink Smudges',
    type: 'image',
    path: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    caption: 'Desk at 2:40 AM while drafting the 365 Notes calendar prompts. Cold espresso and fountain pen ink fingerprints everywhere.',
    date: '2026-06-02',
    tags: ['desk', 'candid', 'writing', 'coffee'],
    downloadable: true,
    fileSize: '3.1 MB',
    authorNote: 'Half of these prompts were rewritten three times because they were too formal.',
  },
  {
    id: 'bts-photo-03',
    title: 'Drafting Constellation Grid on Graph Paper',
    type: 'image',
    path: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
    caption: 'Early pencil sketch trying to calculate the X/Y coordinates for the starry background in the Wishes and Journey sections.',
    date: '2026-06-19',
    tags: ['sketches', 'wireframes', 'stars', 'geometry'],
    downloadable: true,
    fileSize: '1.8 MB',
    authorNote: 'Math was definitely not cooperating this afternoon.',
  },
  {
    id: 'bts-photo-04',
    title: 'Pressed Botanicals on Cutting Board',
    type: 'image',
    path: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop',
    caption: 'Dried ferns and lavender sprigs collected for the Whimsical Scrapbook corner flourishes.',
    date: '2026-07-08',
    tags: ['scrapbook', 'botanicals', 'pressed-leaves'],
    downloadable: true,
    fileSize: '4.2 MB',
  },
  {
    id: 'bts-photo-05',
    title: 'Testing Paper Textures in Natural Daylight',
    type: 'image',
    path: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
    caption: 'Comparing ivory linen vs handmade cotton rag parchment in window light to match the Letter Archive theme tone.',
    date: '2026-07-25',
    tags: ['paper', 'textures', 'lighting', 'design'],
    downloadable: true,
    fileSize: '2.9 MB',
  },
  {
    id: 'bts-photo-06',
    title: 'The Blurry Camera Dropped Blooper',
    type: 'image',
    path: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=600&auto=format&fit=crop',
    caption: 'Tried to take an overhead flatlay of the vintage envelopes and accidentally fumbled the phone onto the carpet.',
    date: '2026-08-04',
    tags: ['bloopers', 'candid', 'accidents'],
    downloadable: true,
    fileSize: '1.5 MB',
  },

  // 2. VIDEOS
  {
    id: 'bts-video-01',
    title: 'Wax Seal Melting & Pouring Outtake',
    type: 'video',
    path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    caption: 'Raw footage of melting metallic gold granules over the tea-candle furnace. You can hear us giggling when the spoon tilted.',
    date: '2026-05-18',
    tags: ['video', 'wax-seal', 'crafting', 'bloopers'],
    downloadable: true,
    duration: '0:15',
    fileSize: '6.4 MB',
    authorNote: 'The spoon almost touched the parchment table cloth!',
  },
  {
    id: 'bts-video-02',
    title: 'Flipping Through the Prototype Notebook',
    type: 'video',
    path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    caption: 'Quick phone video flipping through the physical binder where the first 50 daily notes were written down by hand.',
    date: '2026-06-28',
    tags: ['notebook', 'video', 'handwritten', 'notes'],
    downloadable: true,
    duration: '0:22',
    fileSize: '8.1 MB',
  },
  {
    id: 'bts-video-03',
    title: 'Star Particle Velocity Tuning Screen-Record',
    type: 'video',
    path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
    caption: 'Screen recording when the star animation speed was accidentally set to 100x and the night sky looked like warp speed.',
    date: '2026-07-14',
    tags: ['screen-record', 'animation', 'bloopers', 'coding'],
    downloadable: true,
    duration: '0:18',
    fileSize: '5.2 MB',
  },

  // 3. AUDIO
  {
    id: 'bts-audio-01',
    title: 'Late Night Voice Memo: Audio Theme Melody',
    type: 'audio',
    path: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    caption: 'Humming the chord progression at 1:15 AM into the phone recorder before turning it into the Web Audio synth loop.',
    date: '2026-06-10',
    tags: ['audio', 'voice-memo', 'music', 'soundscape'],
    downloadable: true,
    duration: '0:45',
    fileSize: '1.2 MB',
    authorNote: 'Excuse the sleepy voice at the beginning.',
  },
  {
    id: 'bts-audio-02',
    title: 'Fountain Pen Nib Scratching Sounds (Raw Foley)',
    type: 'audio',
    path: 'https://actions.google.com/sounds/v1/foley/paper_shuffle.ogg',
    thumbnail: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop',
    caption: 'Testing 6 different microphones to capture the subtle, cozy sound of ink moving across rough cotton paper.',
    date: '2026-07-02',
    tags: ['audio', 'foley', 'asmr', 'writing'],
    downloadable: true,
    duration: '0:30',
    fileSize: '850 KB',
  },
  {
    id: 'bts-audio-03',
    title: 'Bloopers: Trying to pronounce French Stationery Terms',
    type: 'audio',
    path: 'https://actions.google.com/sounds/v1/household/clock_ticking.ogg',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=800&auto=format&fit=crop',
    caption: 'Ten solid minutes of laughing while trying to pronounce French calligraphy nib names correctly.',
    date: '2026-07-29',
    tags: ['bloopers', 'audio', 'laughter', 'candid'],
    downloadable: true,
    duration: '0:50',
    fileSize: '1.6 MB',
  },

  // 4. PDFS
  {
    id: 'bts-pdf-01',
    title: 'Early Concept Outline & Storyboard.pdf',
    type: 'pdf',
    path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=800&auto=format&fit=crop',
    caption: 'Scanned 4-page design document outlining the original architecture for Letter Archive, Open When letters, and 365 Notes.',
    date: '2026-05-02',
    tags: ['pdf', 'document', 'storyboard', 'architecture'],
    downloadable: true,
    fileSize: '1.4 MB',
    authorNote: 'Notice how Secret Vault was originally called "The Locked Drawer" in page 2.',
  },
  {
    id: 'bts-pdf-02',
    title: 'Color Palette Swatch Specimen Sheet.pdf',
    type: 'pdf',
    path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1507842229451-79b1be886a29?q=80&w=800&auto=format&fit=crop',
    caption: 'Exported swatch sheet comparing contrast ratios and hex values across Letter Archive, Midnight Journal, and Whimsical Scrapbook.',
    date: '2026-06-22',
    tags: ['pdf', 'colors', 'themes', 'design-spec'],
    downloadable: true,
    fileSize: '890 KB',
  },

  // 5. HTML EXPERIMENTS
  {
    id: 'bts-html-01',
    title: 'Interactive 3D Envelope Physics (Early Prototype)',
    type: 'html',
    path: '#',
    thumbnail: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=800&auto=format&fit=crop',
    caption: 'An experimental sandbox mock created to test CSS 3D matrix transforms and folding flap animations before building the clean React envelope.',
    date: '2026-06-05',
    tags: ['html', 'prototype', 'css-3d', 'interactive'],
    downloadable: true,
    fileSize: '14 KB',
    authorNote: 'Pure HTML & CSS experiment. Notice how the flap flips around when clicked in the preview!',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 30px 20px;
      font-family: 'Georgia', serif;
      background: #f4eee2;
      color: #3e2d23;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 240px;
      user-select: none;
    }
    .badge {
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: #7a2e3b;
      color: #faf5ec;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    .envelope {
      width: 220px;
      height: 140px;
      background: #e8dbcc;
      border: 2px solid #a38268;
      border-radius: 8px;
      position: relative;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(60, 42, 33, 0.15);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .envelope:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 15px 30px rgba(60, 42, 33, 0.22);
    }
    .seal {
      width: 44px;
      height: 44px;
      background: #7a2e3b;
      color: #e5b369;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.25);
    }
    .note {
      margin-top: 14px;
      font-size: 12px;
      color: #7b6252;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="badge">BTS Lab Prototype</div>
  <div class="envelope" onclick="alert('Early sandbox prototype interaction — Starlit Letters BTS')">
    <div class="seal">✦</div>
  </div>
  <div class="note">Click the wax seal to interact with the sandbox test</div>
</body>
</html>`,
  },
  {
    id: 'bts-html-02',
    title: 'Canvas Twinkle Generator (Raw Sandbox)',
    type: 'html',
    path: '#',
    thumbnail: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=800&auto=format&fit=crop',
    caption: 'Standalone canvas script written in 40 lines of JavaScript to test twinkling particle densities before integrating into Starlit Letters.',
    date: '2026-07-11',
    tags: ['html', 'canvas', 'stars', 'javascript'],
    downloadable: true,
    fileSize: '8 KB',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      background: #09111e;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: sans-serif;
      color: #d6c09b;
    }
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .title {
      position: relative;
      z-index: 10;
      font-size: 14px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      background: rgba(13, 23, 40, 0.7);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(214, 192, 155, 0.3);
      backdrop-filter: blur(4px);
    }
  </style>
</head>
<body>
  <div class="title">✦ Starlit Twinkle Sandbox ✦</div>
  <canvas id="sky"></canvas>
  <script>
    const canvas = document.getElementById('sky');
    const ctx = canvas.getContext('2d');
    let stars = [];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        alpha: Math.random(),
        speed: Math.random() * 0.03 + 0.01
      }));
    }
    window.addEventListener('resize', resize);
    resize();
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        ctx.fillStyle = 'rgba(235, 206, 150, ' + Math.abs(s.alpha) + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>`,
  },
];
