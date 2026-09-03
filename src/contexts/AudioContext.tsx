import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import backgroundGuitarAudio from '../assets/audio/background_guitar.mp3';

export type AmbientTrack = 'starlit' | 'rain' | 'piano';

export interface AudioTrackOption {
  id: AmbientTrack;
  label: string;
  url: string;
  desc: string;
}

export const AMBIENT_TRACKS: AudioTrackOption[] = [
  {
    id: 'starlit',
    label: 'Background Guitar (Our Song)',
    url: backgroundGuitarAudio,
    desc: 'Gentle acoustic guitar melodies played softly in the background',
  },
  {
    id: 'rain',
    label: 'Soft Rain Ambient',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-rain-ambient-111154.mp3',
    desc: 'Gentle night rain falling softly outside the window',
  },
  {
    id: 'piano',
    label: 'Piano Reverie',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=piano-moment-10331.mp3',
    desc: 'Quiet, reflective piano melodies for quiet reading',
  },
];

interface AudioContextType {
  isPlaying: boolean;
  volume: number; // 0 to 1
  currentTrack: AmbientTrack;
  isMixerOpen: boolean;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  setTrack: (track: AmbientTrack) => void;
  toggleMixer: () => void;
  closeMixer: () => void;
  duckAudio: () => void;
  unduckAudio: () => void;
  playMagicalClick: () => void;
  playShimmer: () => void;
  playPaperRustle: () => void;
  playSecretReveal: () => void;
  playWishChime: () => void;
  playBadgeFanfare: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const MUTED_KEY = 'starlit_audio_muted';
const VOLUME_KEY = 'starlit_audio_volume';
const TRACK_KEY = 'starlit_audio_track';

let sharedAudioCtx: (typeof window extends { AudioContext: infer T } ? any : any) = null;

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    try {
      const muted = localStorage.getItem(MUTED_KEY);
      return muted ? !JSON.parse(muted) : false; // Default off to respect browser policies
    } catch {
      return false;
    }
  });

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const v = localStorage.getItem(VOLUME_KEY);
      return v ? parseFloat(v) : 0.3;
    } catch {
      return 0.3;
    }
  });

  const [currentTrack, setCurrentTrackState] = useState<AmbientTrack>(() => {
    try {
      const t = localStorage.getItem(TRACK_KEY) as AmbientTrack;
      return t && AMBIENT_TRACKS.some((item) => item.id === t) ? t : 'starlit';
    } catch {
      return 'starlit';
    }
  });

  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDuckedRef = useRef(false);

  // Initialize or update audio object
  useEffect(() => {
    const trackObj = AMBIENT_TRACKS.find((t) => t.id === currentTrack) || AMBIENT_TRACKS[0];

    if (!audioRef.current) {
      const audio = new Audio(trackObj.url);
      audio.loop = true;
      audio.volume = isDuckedRef.current ? Math.max(0, volume * 0.2) : volume;
      audioRef.current = audio;
    } else {
      const audio = audioRef.current;
      if (audio.src !== trackObj.url) {
        const wasPlaying = !audio.paused;
        audio.pause();
        audio.src = trackObj.url;
        audio.load();
        if (wasPlaying && isPlaying) {
          audio.play().catch(() => setIsPlaying(false));
        }
      }
    }
  }, [currentTrack]);

  // Handle Play/Pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback prevented by browser policy:', err);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }

    try {
      localStorage.setItem(MUTED_KEY, JSON.stringify(!isPlaying));
    } catch (e) {
      console.warn('Failed to store audio state', e);
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isDuckedRef.current ? Math.max(0, volume * 0.2) : volume;
    }
    try {
      localStorage.setItem(VOLUME_KEY, volume.toString());
    } catch (e) {
      console.warn('Failed to store volume state', e);
    }
  }, [volume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const setVolume = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
  };

  const setTrack = (track: AmbientTrack) => {
    setCurrentTrackState(track);
    try {
      localStorage.setItem(TRACK_KEY, track);
    } catch (e) {
      console.warn('Failed to store track state', e);
    }
  };

  const toggleMixer = () => {
    setIsMixerOpen((prev) => !prev);
  };

  const closeMixer = () => {
    setIsMixerOpen(false);
  };

  const duckAudio = () => {
    isDuckedRef.current = true;
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, volume * 0.2);
    }
  };

  const unduckAudio = () => {
    isDuckedRef.current = false;
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  // Reusable singleton AudioContext for synthesized sound effects
  const getAudioCtx = (): any => {
    try {
      const AudioCtxClass =
        (window as any).AudioContext ||
        (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
        sharedAudioCtx = new AudioCtxClass();
      }
      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().catch(() => {});
      }
      return sharedAudioCtx;
    } catch {
      return null;
    }
  };

  const playMagicalClick = () => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore audio errors gracefully
    }
  };

  const playShimmer = () => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C-E-G-C
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.05 * volume, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.4);
      });
    } catch {}
  };

  const playPaperRustle = () => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 2.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } catch {}
  };

  const playSecretReveal = () => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.07 * volume, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.65);
      });
    } catch {}
  };

  const playWishChime = () => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.09 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.75);
    } catch {}
  };

  const playBadgeFanfare = () => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.85);
      });
    } catch {}
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        currentTrack,
        isMixerOpen,
        togglePlay,
        setVolume,
        setTrack,
        toggleMixer,
        closeMixer,
        duckAudio,
        unduckAudio,
        playMagicalClick,
        playShimmer,
        playPaperRustle,
        playSecretReveal,
        playWishChime,
        playBadgeFanfare,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
