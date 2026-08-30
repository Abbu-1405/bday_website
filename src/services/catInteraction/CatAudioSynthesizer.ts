import { CatSoundSpec, CatSynthType } from '../../types/catMeme';

/**
 * Web Audio API synthesizer for procedural cat meows, purrs, snacks, and meme effects.
 * Completely self-contained: zero external network assets, zero copyrighted media, zero latency.
 */
export class CatAudioSynthesizer {
  /**
   * Synthesizes and plays a procedural audio clip based on sound specification.
   */
  public static playSound(
    ctx: AudioContext,
    destination: AudioNode,
    spec: CatSoundSpec,
    volumeMultiplier = 1.0,
    relationshipLevel = 1
  ): { stop: () => void } {
    const now = ctx.currentTime;
    const duration = spec.duration || 0.6;
    const baseFreq = spec.baseFreq || 440;
    const pitchMultiplier = spec.pitchMultiplier || 1.0;
    const effectiveBaseFreq = baseFreq * pitchMultiplier;

    // High relationship adds extra warmth and subtle harmonic resonance (Lvl >= 4)
    const isHighBond = relationshipLevel >= 4;
    const effectiveWarmth = spec.warmth !== undefined ? spec.warmth : (isHighBond ? 0.35 : 0.0);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.connect(destination);

    const activeNodes: (AudioNode & { stop?: (t?: number) => void })[] = [masterGain];

    const cleanup = () => {
      try {
        activeNodes.forEach((node) => {
          if (typeof node.stop === 'function') {
            node.stop();
          }
        });
      } catch {
        // Safe disposal
      }
    };

    switch (spec.synthType) {
      case 'purr':
        this.synthesizePurr(ctx, masterGain, now, duration, volumeMultiplier, effectiveWarmth, activeNodes);
        break;

      case 'crunch':
        this.synthesizeCrunch(ctx, masterGain, now, duration, volumeMultiplier, activeNodes);
        break;

      case 'dramatic_boing':
        this.synthesizeDramaticShoo(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'pop':
        this.synthesizePop(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'screech':
        this.synthesizeScreech(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'chirp':
        this.synthesizeChirp(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, effectiveWarmth, activeNodes);
        break;

      case 'piano_tinkle':
        this.synthesizePianoTinkle(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'wobble':
        this.synthesizeWobble(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'deep_grumble':
        this.synthesizeDeepGrumble(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'churu_slurp':
        this.synthesizeChuruSlurp(ctx, masterGain, now, duration, volumeMultiplier, activeNodes);
        break;

      case 'laser':
        this.synthesizeLaser(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'spinning_hum':
        this.synthesizeSpinningHum(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'glissando':
        this.synthesizeGlissando(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, activeNodes);
        break;

      case 'meow':
      default:
        this.synthesizeMeow(ctx, masterGain, now, duration, effectiveBaseFreq, volumeMultiplier, effectiveWarmth, activeNodes);
        break;
    }

    return {
      stop: () => {
        try {
          const stopTime = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(stopTime);
          masterGain.gain.setValueAtTime(masterGain.gain.value, stopTime);
          masterGain.gain.linearRampToValueAtTime(0.0001, stopTime + 0.05);
          setTimeout(cleanup, 60);
        } catch {
          cleanup();
        }
      },
    };
  }

  /**
   * Classic procedural meow with natural pitch formant curve (m-e-o-w).
   */
  private static synthesizeMeow(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    warmth: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc2.type = 'sine';

    // Meow frequency trajectory: slight rise, peak, then softer fall
    const startFreq = baseFreq * 0.85;
    const peakFreq = baseFreq * 1.35;
    const endFreq = baseFreq * 0.75;
    const peakTime = now + duration * 0.35;
    const endTime = now + duration;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, peakTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, endTime);

    osc2.frequency.setValueAtTime(startFreq * 2.01, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 2.01, peakTime);
    osc2.frequency.exponentialRampToValueAtTime(endFreq * 1.99, endTime);

    // Formant vocal filter
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.8 + warmth * 1.5, now);
    filter.frequency.setValueAtTime(startFreq * 1.8, now);
    filter.frequency.exponentialRampToValueAtTime(peakFreq * 2.2, peakTime);
    filter.frequency.exponentialRampToValueAtTime(endFreq * 1.4, endTime);

    // Envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.28 * vol, now + duration * 0.12);
    gain.gain.setValueAtTime(0.25 * vol, peakTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc2.start(now);
    osc.stop(endTime);
    osc2.stop(endTime);

    nodes.push(osc, osc2, filter, gain);
  }

  /**
   * Exaggerated Meme Purr (Pet Action) - Warm vibrating motor sub-bass with rapid flutter.
   */
  private static synthesizePurr(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    vol: number,
    warmth: number,
    nodes: any[]
  ): void {
    const carrier = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(65 + warmth * 15, now);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(32.5, now);

    // LFO for rhythmic purring rumble (~24 Hz)
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(24, now);
    lfoGain.gain.setValueAtTime(0.4, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220 + warmth * 80, now);
    filter.Q.setValueAtTime(1.5, now);

    // Amplitude envelope
    const attack = 0.08;
    const endTime = now + duration;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.35 * vol, now + attack);
    gain.gain.setValueAtTime(0.35 * vol, endTime - 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    lfo.connect(lfoGain.gain);
    carrier.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    carrier.start(now);
    subOsc.start(now);
    lfo.start(now);

    carrier.stop(endTime);
    subOsc.stop(endTime);
    lfo.stop(endTime);

    nodes.push(carrier, subOsc, lfo, lfoGain, filter, gain);
  }

  /**
   * Exaggerated Meme Treat Sound (Crunch / Nom Nom).
   */
  private static synthesizeCrunch(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    vol: number,
    nodes: any[]
  ): void {
    // 3 rapid munch syllables (nom nom crunch)
    const syllables = [0, 0.14, 0.28];
    const syllableDur = 0.11;

    syllables.forEach((offset, idx) => {
      const startTime = now + offset;
      const osc = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx === 2 ? 'triangle' : 'sine';
      const base = idx === 2 ? 380 : 520 - idx * 60;
      osc.frequency.setValueAtTime(base * 1.2, startTime);
      osc.frequency.exponentialRampToValueAtTime(base * 0.7, startTime + syllableDur);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(idx === 2 ? 2400 : 1800, startTime);
      filter.Q.setValueAtTime(3.5, startTime);

      noiseGain.gain.setValueAtTime(0.0001, startTime);
      noiseGain.gain.linearRampToValueAtTime(0.32 * vol, startTime + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + syllableDur);

      osc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      osc.start(startTime);
      osc.stop(startTime + syllableDur);
      nodes.push(osc, filter, noiseGain);
    });
  }

  /**
   * Exaggerated Dramatic Annoyed / Departure Sound (Shoo Action).
   */
  private static synthesizeDramaticShoo(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startFreq = baseFreq || 580;
    const dropFreq = startFreq * 0.35;
    const endTime = now + Math.min(duration, 0.55);

    // Comic downward slide-whistle / boing trajectory
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(dropFreq, endTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(400, endTime);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.35 * vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(endTime);
    nodes.push(osc, filter, gain);
  }

  /**
   * Pop Cat Bubble Pop Sound.
   */
  private static synthesizePop(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = baseFreq || 650;
    const popDur = Math.min(duration, 0.12);

    osc.frequency.setValueAtTime(startFreq * 0.6, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, now + 0.02);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.4, now + popDur);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.45 * vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + popDur);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + popDur);
    nodes.push(osc, gain);
  }

  /**
   * Thurston Waffles / Screaming Cat dramatic short shout.
   */
  private static synthesizeScreech(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const center = baseFreq || 780;
    osc.frequency.setValueAtTime(center, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(35, now);
    lfoGain.gain.setValueAtTime(80, now);

    lfo.connect(osc.frequency);

    const screechDur = Math.min(duration, 0.45);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.26 * vol, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + screechDur);

    osc.connect(gain);
    gain.connect(dest);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + screechDur);
    osc.stop(now + screechDur);

    nodes.push(osc, lfo, lfoGain, gain);
  }

  /**
   * Bird-like curious chirp.
   */
  private static synthesizeChirp(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    warmth: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const start = (baseFreq || 600) * 1.1;
    const peak = start * 1.6;
    const dur = Math.min(duration, 0.22);

    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(peak, now + dur * 0.4);
    osc.frequency.exponentialRampToValueAtTime(start * 0.9, now + dur);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime((0.3 + warmth * 0.1) * vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + dur);
    nodes.push(osc, gain);
  }

  /**
   * Keyboard Cat short cheerful pentatonic musical flourish.
   */
  private static synthesizePianoTinkle(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const noteDur = 0.09;

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(0.24 * vol, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + noteDur);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(noteTime);
      osc.stop(noteTime + noteDur);
      nodes.push(osc, gain);
    });
  }

  /**
   * Wobbly Cat vibrating pitch wave.
   */
  private static synthesizeWobble(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const center = baseFreq || 440;
    osc.frequency.setValueAtTime(center, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(8, now);
    lfoGain.gain.setValueAtTime(60, now);
    lfo.connect(osc.frequency);

    const dur = Math.min(duration, 0.5);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.3 * vol, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(dest);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + dur);
    osc.stop(now + dur);

    nodes.push(osc, lfo, lfoGain, gain);
  }

  /**
   * Grumpy Cat deep grumble.
   */
  private static synthesizeDeepGrumble(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const freq = baseFreq || 140;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 0.8, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.3 * vol, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + duration);
    nodes.push(osc, filter, gain);
  }

  /**
   * Churu Slurp squishy munch.
   */
  private static synthesizeChuruSlurp(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.28);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.32 * vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.28);
    nodes.push(osc, filter, gain);
  }

  /**
   * Nyan Cat Laser / Cosmic synth tone.
   */
  private static synthesizeLaser(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const start = baseFreq || 1200;
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.exponentialRampToValueAtTime(start * 0.25, now + 0.22);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.25 * vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.22);
    nodes.push(osc, gain);
  }

  /**
   * Maxwell the Cat Spinning Hum.
   */
  private static synthesizeSpinningHum(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq || 330, now);

    const dur = Math.min(duration, 0.6);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.28 * vol, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    if (panner) {
      panner.pan.setValueAtTime(-0.8, now);
      panner.pan.linearRampToValueAtTime(0.8, now + dur);
      osc.connect(panner);
      panner.connect(gain);
      nodes.push(panner);
    } else {
      osc.connect(gain);
    }

    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
    nodes.push(osc, gain);
  }

  /**
   * Comic Glissando (Confused sliding sound).
   */
  private static synthesizeGlissando(
    ctx: AudioContext,
    dest: AudioNode,
    now: number,
    duration: number,
    baseFreq: number,
    vol: number,
    nodes: any[]
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const start = baseFreq || 350;
    osc.frequency.setValueAtTime(start, now);
    osc.frequency.linearRampToValueAtTime(start * 1.5, now + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(start * 0.9, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.28 * vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + duration);
    nodes.push(osc, gain);
  }
}
