import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SfxId, PlaySfxOptions, SfxContextType } from '../types/sfx';
import { sfxService } from '../services/sfxService';

const SFX_ENABLED_KEY = 'starlit_sfx_enabled';
const SFX_VOLUME_KEY = 'starlit_sfx_volume';

const DEFAULT_SFX_ENABLED = true;
const DEFAULT_SFX_VOLUME = 0.5;

const SfxContext = createContext<SfxContextType | undefined>(undefined);

export const SfxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. SFX Enabled State (Defaults to ON)
  const [isSfxEnabled, setIsSfxEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SFX_ENABLED_KEY);
      if (stored !== null) {
        return JSON.parse(stored) === true;
      }
      return DEFAULT_SFX_ENABLED;
    } catch {
      return DEFAULT_SFX_ENABLED;
    }
  });

  // 2. SFX Master Volume (0.0 to 1.0, Defaults to subtle 0.5)
  const [sfxVolume, setSfxVolumeState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(SFX_VOLUME_KEY);
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          return parsed;
        }
      }
      return DEFAULT_SFX_VOLUME;
    } catch {
      return DEFAULT_SFX_VOLUME;
    }
  });

  // Persist Enabled state changes
  useEffect(() => {
    try {
      localStorage.setItem(SFX_ENABLED_KEY, JSON.stringify(isSfxEnabled));
    } catch (e) {
      console.warn('[SfxContext] Failed to persist SFX enabled state', e);
    }
  }, [isSfxEnabled]);

  // Persist Volume state changes
  useEffect(() => {
    try {
      localStorage.setItem(SFX_VOLUME_KEY, sfxVolume.toString());
    } catch (e) {
      console.warn('[SfxContext] Failed to persist SFX volume', e);
    }
  }, [sfxVolume]);

  const enableSfx = useCallback(() => {
    setIsSfxEnabled(true);
  }, []);

  const disableSfx = useCallback(() => {
    setIsSfxEnabled(false);
  }, []);

  const toggleSfx = useCallback(() => {
    setIsSfxEnabled((prev) => !prev);
  }, []);

  const setSfxVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSfxVolumeState(clamped);
  }, []);

  const playSfx = useCallback(
    (id: SfxId, options?: PlaySfxOptions) => {
      sfxService.play(id, sfxVolume, isSfxEnabled, options);
    },
    [sfxVolume, isSfxEnabled]
  );

  return (
    <SfxContext.Provider
      value={{
        isSfxEnabled,
        sfxVolume,
        playSfx,
        enableSfx,
        disableSfx,
        toggleSfx,
        setSfxVolume,
      }}
    >
      {children}
    </SfxContext.Provider>
  );
};

export const useSfx = (): SfxContextType => {
  const context = useContext(SfxContext);
  if (!context) {
    throw new Error('useSfx must be used within an SfxProvider');
  }
  return context;
};
