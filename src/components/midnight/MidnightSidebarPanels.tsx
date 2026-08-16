import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ChevronRight, ArrowRight, Heart, Star } from 'lucide-react';
import { Surface } from '../Surface';
import { Badge } from '../Badge';
import { MidnightCorner, MidnightWaxSeal, MiniWishLantern, MidnightGoldDivider } from './MidnightDecorations';
import { ROUTES } from '../../constants';
import { getStageProgress } from '../../services/discoveryService';
import { useAudio } from '../../contexts';

export const MidnightSidebarPanels: React.FC = () => {
  const navigate = useNavigate();
  const { playMagicalClick } = useAudio();
  const stages = getStageProgress();

  const wishesStage = stages.find((s) => s.key === 'wishes') || { discovered: 0, total: 20 };
  const openWhenStage = stages.find((s) => s.key === 'openWhen') || { discovered: 0, total: 12 };
  const vaultStage = stages.find((s) => s.key === 'secretVault') || { discovered: 0, total: 7 };

  const handleNavigate = (route: string) => {
    playMagicalClick();
    navigate(route);
  };

  return (
    <aside className="space-y-6">
      {/* 1. Wishes Panel */}
      <Surface
        variant="elevated"
        padding="md"
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:border-[rgba(226,189,120,0.55)] hover:-translate-y-0.5"
        onClick={() => handleNavigate(ROUTES.WISHES)}
      >
        <MidnightCorner position="top-right" size={26} className="absolute top-1 right-1 opacity-60" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MiniWishLantern size={20} isLit={true} />
              <h3 className="font-serif font-semibold text-sm text-[#F2E4CF] group-hover:text-[#F4D18A] transition-colors">
                Wishes & Lanterns
              </h3>
            </div>
            <span className="text-[11px] font-serif px-2 py-0.5 rounded-full bg-[rgba(16,27,45,0.7)] text-[#E2BD78] border border-[rgba(201,155,88,0.25)]">
              {wishesStage.discovered} / {wishesStage.total}
            </span>
          </div>

          <p className="text-xs font-serif text-[#C2AF99] leading-relaxed">
            Glowing sky lanterns carrying unspoken hopes and shared constellation dreams.
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-[rgba(201,155,88,0.15)]">
            <span className="text-[11px] font-handwritten text-[#C99B58]">
              release a wish into the sky
            </span>
            <div className="flex items-center gap-1 text-xs text-[#E2BD78] group-hover:translate-x-0.5 transition-transform">
              <span>View Lanterns</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Surface>

      {/* 2. Open When Letters Panel */}
      <Surface
        variant="elevated"
        padding="md"
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:border-[rgba(226,189,120,0.55)] hover:-translate-y-0.5"
        onClick={() => handleNavigate(ROUTES.OPEN_WHEN)}
      >
        <MidnightCorner position="top-right" size={26} className="absolute top-1 right-1 opacity-60" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MidnightWaxSeal size={22} label="✉" />
              <h3 className="font-serif font-semibold text-sm text-[#F2E4CF] group-hover:text-[#F4D18A] transition-colors">
                Open When Envelopes
              </h3>
            </div>
            <span className="text-[11px] font-serif px-2 py-0.5 rounded-full bg-[rgba(16,27,45,0.7)] text-[#E2BD78] border border-[rgba(201,155,88,0.25)]">
              {openWhenStage.discovered} / {openWhenStage.total}
            </span>
          </div>

          <p className="text-xs font-serif text-[#C2AF99] leading-relaxed">
            Sealed letters resting in dark parchment, penned for specific moods and midnight hours.
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-[rgba(201,155,88,0.15)]">
            <span className="text-[11px] font-handwritten text-[#C99B58]">
              when you need quiet comfort
            </span>
            <div className="flex items-center gap-1 text-xs text-[#E2BD78] group-hover:translate-x-0.5 transition-transform">
              <span>Open Letters</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Surface>

      {/* 3. Secret Vault Panel */}
      <Surface
        variant="elevated"
        padding="md"
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:border-[rgba(226,189,120,0.55)] hover:-translate-y-0.5"
        onClick={() => handleNavigate(ROUTES.SECRET_VAULT)}
      >
        <MidnightCorner position="top-right" size={26} className="absolute top-1 right-1 opacity-60" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[rgba(16,27,45,0.8)] border border-[rgba(201,155,88,0.3)] flex items-center justify-center text-[#C99B58]">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-serif font-semibold text-sm text-[#F2E4CF] group-hover:text-[#F4D18A] transition-colors">
                The Secret Vault
              </h3>
            </div>
            <span className="text-[11px] font-serif px-2 py-0.5 rounded-full bg-[rgba(16,27,45,0.7)] text-[#E2BD78] border border-[rgba(201,155,88,0.25)]">
              {vaultStage.discovered} / {vaultStage.total}
            </span>
          </div>

          <p className="text-xs font-serif text-[#C2AF99] leading-relaxed">
            Hidden passages, sealed curiosities, and quiet discoveries waiting to be unlocked.
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-[rgba(201,155,88,0.15)]">
            <span className="text-[11px] font-handwritten text-[#C99B58]">
              a hidden lock awaits
            </span>
            <div className="flex items-center gap-1 text-xs text-[#E2BD78] group-hover:translate-x-0.5 transition-transform">
              <span>Unlock Vault</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Surface>
    </aside>
  );
};
