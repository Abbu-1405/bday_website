import React from 'react';
import {
  Users,
  Compass,
  Clock,
  Zap,
  Activity,
  Radio,
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
      id: 'total-users',
      label: 'Total Tracked Users',
      value: metrics.totalTrackedUsers.toString(),
      subtext: `${metrics.onlineUsersNow} currently active`,
      icon: Users,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      badge: metrics.onlineUsersNow > 0 ? `${metrics.onlineUsersNow} online` : undefined,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'total-visits',
      label: 'Total Visits / Sessions',
      value: metrics.totalVisits.toString(),
      subtext: 'Across all recorded browser sessions',
      icon: Compass,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: undefined,
      badgeColor: '',
    },
    {
      id: 'total-time',
      label: 'Total Tracked Time',
      value: metrics.totalTrackedTimeFormatted || '0s',
      subtext: 'Cumulative active engagement time',
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: undefined,
      badgeColor: '',
    },
    {
      id: 'active-users',
      label: 'Active Users (24h / 7d)',
      value: `${metrics.activeUsers24h}`,
      subtext: `${metrics.activeUsers7d} active in past 7 days`,
      icon: Zap,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: `${metrics.activeUsers7d} weekly`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-700/80"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 truncate">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color} shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                {loading ? (
                  <div className="h-8 w-20 bg-slate-800 rounded-lg animate-pulse my-0.5" />
                ) : (
                  <span className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                    {card.value}
                  </span>
                )}
                {card.badge && !loading && (
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${card.badgeColor} shrink-0`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 truncate">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
