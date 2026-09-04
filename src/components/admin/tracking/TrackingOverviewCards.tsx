import React from 'react';
import {
  Users,
  Compass,
  Clock,
  Zap,
} from 'lucide-react';
import { TrackingSummaryMetrics } from '../../../types/tracking';

interface TrackingOverviewCardsProps {
  metrics: TrackingSummaryMetrics;
  loading?: boolean;
}

export const TrackingOverviewCards: React.FC<TrackingOverviewCardsProps> = ({
  metrics,
  loading = false,
}) => {
  const cards = [
    {
      code: '[01_DIR::USERS]',
      label: 'TOTAL TRACKED USERS',
      value: metrics.totalTrackedUsers.toString(),
      subtext: `${metrics.onlineUsersNow} active now`,
      icon: Users,
      color: 'text-emerald-400',
      badge: metrics.onlineUsersNow > 0 ? `${metrics.onlineUsersNow} ONLINE` : undefined,
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
    },
    {
      code: '[02_DIR::SESSIONS]',
      label: 'TOTAL VISITS / SESSIONS',
      value: metrics.totalVisits.toString(),
      subtext: 'Across all browser sessions',
      icon: Compass,
      color: 'text-cyan-400',
      badge: undefined,
      badgeColor: '',
    },
    {
      code: '[03_DIR::TIME]',
      label: 'TOTAL TRACKED TIME',
      value: metrics.totalTrackedTimeFormatted || '0s',
      subtext: 'Cumulative session duration',
      icon: Clock,
      color: 'text-amber-400',
      badge: undefined,
      badgeColor: '',
    },
    {
      code: '[04_DIR::ACTIVE]',
      label: 'ACTIVE USERS (24H / 7D)',
      value: `${metrics.activeUsers24h}`,
      subtext: `${metrics.activeUsers7d} active in 7 days`,
      icon: Zap,
      color: 'text-teal-300',
      badge: `${metrics.activeUsers7d} 7D_POOL`,
      badgeColor: 'bg-[#020408] text-cyan-400 border-emerald-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.code}
            className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 transition-all shadow-[0_0_12px_rgba(16,185,129,0.03)] hover:border-emerald-500/40 hover:bg-emerald-950/20"
          >
            {/* Terminal Card Header */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-emerald-950/60 pb-2 mb-2">
              <span className="text-emerald-500 font-semibold tracking-wider">
                {card.code}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[11px] text-slate-300 font-medium tracking-wide">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg bg-[#030712] border border-emerald-500/30 flex items-center justify-center ${card.color} shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                {loading ? (
                  <div className="h-7 w-20 bg-emerald-950/60 rounded animate-pulse my-0.5" />
                ) : (
                  <span className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                    {card.value}
                  </span>
                )}
                {card.badge && !loading && (
                  <span
                    className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${card.badgeColor} shrink-0`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>

              <p className="text-[10px] text-slate-400 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
