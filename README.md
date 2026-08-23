# Starlit Letters — Final Release

A production-grade, immersive React web application designed for heartfelt letters, memory milestones, daily reflections, and intimate keepsakes.

---

## 1. Technology Stack

- **Framework**: React 19 (SPA with Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & CSS custom property theme tokens
- **Routing**: React Router DOM (v7)
- **State & Motion**: Framer Motion, Context API
- **Persistence & Cloud**: Firebase (Authentication & Cloud Firestore)
- **Audio Engine**: Web Audio API (Ambient soundscape synthesizer & HTML5 Audio)

---

## 2. Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm or bun

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
The development server will boot on `http://localhost:3000`.

---

## 3. Production Build & Deployment

### Create a Production Build
```bash
npm run build
```
This compiles the TypeScript code and produces an optimized static build bundle inside the `dist/` directory.

### Deploying
The application is pre-configured for static deployment on platforms like Firebase Hosting, Vercel (`vercel.json`), or Google Cloud Run.

---

## 4. Environment Variables & Firebase Configuration

Configure environment variables by copying `.env.example` to `.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

*Note: In the AI Studio container environment, `firebase-applet-config.json` provides zero-config integration for Firestore and Firebase Authentication.*

---

## 5. Current Major Sections

1. **Home**: Primary dashboard featuring daily quotes, quick milestone metrics, recent activity, and ambient controls.
2. **Journey**: Interactive chronological timeline with milestone cards, status tracking, and filterable memory checkpoints.
3. **Letter Archive**: Interactive letter envelopes, wax seal reveals, bookmarking, and reading view.
4. **Wishes**: Wish card submission, starry constellation background, and lantern animations.
5. **365 Notes**: Comprehensive calendar date picker, daily notes, forward/backward navigation, and audio notes.
6. **Open When**: Contextual letters categorized by emotional moments with dedicated envelope reveals.
7. **Moments**: High-resolution gallery viewer for precious memories, photo milestones, and video playback.
8. **Adore**: Interactive appreciation cards, custom memory highlights, and heartfelt tokens.
9. **What Am I To You**: Structured prompt explorer, reflection cards, and relational questions.
10. **Your Reflections**: Personal journaling space with category tagging, search filtering, and secure Firestore persistence.
11. **Secret Vault**: Pin-protected security layer preserving private keepsakes and locked letters.
12. **Settings**: Theme customizer, ambient soundscape player, volume levels, font scaling, and data export.

---

## 6. Theme Information

The application features three isolated themes:

1. **Theme 1 — Letter Archive (`letter-archive`)**: Warm parchment surfaces, antique typography, burgundy accents, and vintage ornamental motifs.
2. **Theme 2 — Midnight Journal (`midnight-journal`)**: Deep twilight navy backgrounds, golden candlelight accents, starry glow surfaces, and celestial borders.
3. **Theme 3 — Whimsical Scrapbook (`whimsical-scrapbook`)**: Soft enchanted forest aesthetics, botanical flourishes, warm sage, and playful pastel highlights.

---

## 7. Audio & Media Assets

- **Ambient Audio**: Built-in soundscapes (Starlit Melodies, Midnight Waltz, Twilight Lullaby) with volume sliders and persistent playback controls.
- **Sound Effects**: Web Audio API synthesized SFX for letter unwrapping, button clicks, star shimmers, and secret unlocks.
- **Custom Cursor**: Magical wand cursor for fine desktop pointers, auto-disabled on touch devices.

---

## 8. Photo Booth Status

> **Notice**: Photo Booth is intentionally removed and postponed for a future rebuild. No active routes, camera components, or frame permissions remain in the codebase.

---

## 9. License

Private & Personal Keepsake Application. All rights reserved.
