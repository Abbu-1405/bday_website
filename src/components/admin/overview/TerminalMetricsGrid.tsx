import React from 'react';
import {
  Users,
  Activity,
  BookOpen,
  Sparkles,
  Heart,
  Mail,
  Award,
  KeyRound,
  Film,
  Radio,
} from 'lucide-react';
import { AdminOverviewStats } from '../../../services/adminService';

interface TerminalMetricsGridProps {
  stats: AdminOverviewStats;
  loading: boolean;
  onNavigateToActivity: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToFeelings?: () => void;
  onNavigateToLetters?: () => void;
  onNavigateToBts?: () => void;
}

export const TerminalMetricsGrid: React.FC<TerminalMetricsGridProps> = ({
  stats,
  loading,
  onNavigateToActivity,
  onNavigateToUsers,
  onNavigateToFeelings,
  onNavigateToLetters,
  onNavigateToBts,
}) => {
  const cards = [
    {
      code: '[01_SYS::USERS]',
      label: 'AUTHENTICATED USERS',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-emerald-400',
      tag: 'DATABASE_REGISTRY',
      onClick: onNavigateToUsers,
    },
    {
      code: '[02_SYS::EVENTS]',
      label: 'TOTAL ACTIVITY EVENTS',
      value: stats.totalActivities,
      icon: Activity,
      color: 'text-cyan-400',
      tag: 'STREAM_LOGS',
      onClick: onNavigateToActivity,
    },
    {
      code: '[03_HUB::BTS]',
      label: 'BTS ACTIVITY HUB',
      value: 'ACTIVE',
      icon: Film,
      color: 'text-emerald-300',
      tag: 'LIVE_FEED',
      onClick: onNavigateToBts,
    },
    {
      code: '[04_VAULT::NOTES]',
      label: 'NOTES OPENED',
      value: stats.notesOpened,
      icon: BookOpen,
      color: 'text-amber-400',
      tag: 'READ_COUNT',
      onClick: undefined,
    },
    {
      code: '[05_WISH::STARS]',
      label: 'WISHES COLLECTED',
      value: stats.wishesCollected,
      icon: Sparkles,
      color: 'text-yellow-400',
      tag: 'USER_SUBMITTED',
      onClick: undefined,
    },
    {
      code: '[06_CRYPT::SECRETS]',
      label: 'SECRETS DISCOVERED',
      value: stats.secretsDiscovered,
      icon: KeyRound,
      color: 'text-teal-400',
      tag: 'PASSPHRASE_OK',
      onClick: undefined,
    },
    {
      code: '[07_INBOX::FEELINGS]',
      label: 'FEELINGS SUBMITTED',
      value: stats.feelingsSubmitted,
      icon: Heart,
      color: 'text-rose-400',
      tag: 'PRIVATE_INBOX',
      onClick: onNavigateToFeelings,
    },
    {
      code: '[08_POST::LETTERS]',
      label: 'LETTERS SUBMITTED',
      value: stats.lettersSubmitted,
      icon: Mail,
      color: 'text-purple-400',
      tag: 'ENCRYPTED_POST',
      onClick: onNavigateToLetters,
    },
    {
      code: '[09_MEDAL::BADGES]',
      label: 'BADGES UNLOCKED',
      value: stats.badgesUnlocked,
      icon: Award,
      color: 'text-cyan-300',
      tag: 'ACHIEVEMENT_RECS',
      onClick: undefined,
    },
  ];

  return (
    <div className="space-y-2 font-mono">
      <div className="flex items-center justify-between text-[11px] text-emerald-500/80 px-1">
        <span>/telemetry/metrics [CLUSTER:ALL]</span>
        <span>STATUS: 9/9 SENSORS OPERATIONAL</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.code}
              onClick={card.onClick}
              className={`relative bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 transition-all duration-150 ${
                card.onClick
                  ? 'hover:border-emerald-400/60 hover:bg-emerald-950/20 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.05)] hover:shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                  : ''
              }`}
            >
              {/* Card Terminal Header */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-emerald-950/60 pb-2 mb-2.5">
                <span className="text-emerald-500 font-semibold tracking-wider">
                  {card.code}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#030712] border border-emerald-950 text-slate-400">
                  {card.tag}
                </span>
              </div>

              {/* Card Content */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-300 font-medium tracking-wide">
                    {card.label}
                  </div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-baseline gap-2">
                    {loading ? (
                      <span className="text-emerald-600 animate-pulse text-lg">
                        READING...
                      </span>
                    ) : typeof card.value === 'number' ? (
                      card.value.toLocaleString()
                    ) : (
                      <span className="text-emerald-400 text-lg tracking-widest">
                        {card.value}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-lg bg-[#030712] border border-emerald-500/30 flex items-center justify-center shrink-0 ${card.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom Subtle Status Line */}
              <div className="mt-3 pt-2 border-t border-emerald-950/40 flex items-center justify-between text-[9px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
                <span className="text-slate-400">
                  {card.onClick ? 'CLICK_TO_VIEW →' : 'AUTOMATED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
