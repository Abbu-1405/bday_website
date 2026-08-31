/**
 * Lightweight Web Audio Synthesizer for Vintage Typewriter Ambience
 * Produces very quiet, sparse mechanical micro-clicks that feel authentic and non-intrusive.
 */

let typingAudioCtx: AudioContext | null = null;

const getTypingAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!typingAudioCtx || typingAudioCtx.state === 'closed') {
      typingAudioCtx = new AudioContextClass();
    }
    if (typingAudioCtx.state === 'suspended') {
      typingAudioCtx.resume().catch(() => {});
    }
    return typingAudioCtx;
  } catch {
    return null;
  }
};

/**
 * Play a faint, sparse typewriter key click.
 * Kept ultra-subtle (duration ~15ms, heavily attenuated).
 */
export const playVintageTypingClick = (
  isSfxEnabled: boolean,
  sfxVolume: number
): void => {
  if (!isSfxEnabled || sfxVolume <= 0) return;

  try {
    const ctx = getTypingAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.015);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Filtered noise impulse simulating mechanical lever strike
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // High bandpass for subtle vintage mechanical clack
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800 + Math.random() * 400, now);
    filter.Q.setValueAtTime(3.5, now);

    const gain = ctx.createGain();
    const targetVolume = Math.min(0.04, 0.04 * sfxVolume);
    gain.gain.setValueAtTime(targetVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.015);
  } catch {
    // Non-blocking catch for browser autoplay policies
  }
};
