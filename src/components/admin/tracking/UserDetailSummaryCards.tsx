import React from 'react';
import {
  Compass,
  Hourglass,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
} from 'lucide-react';
import { TrackedUserOverview, DeviceCategory } from '../../../types/tracking';

interface UserDetailSummaryCardsProps {
  user: TrackedUserOverview;
}

export const UserDetailSummaryCards: React.FC<UserDetailSummaryCardsProps> = ({ user }) => {
  const getDeviceIcon = (category?: DeviceCategory) => {
    switch (category) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Laptop;
    }
  };

  const DeviceIcon = getDeviceIcon(user.deviceCategory);

  const cards = [
    {
      id: 'card-total-visits',
      label: 'Total Visits',
      value: user.totalVisits.toString(),
      subtext: 'Recorded sessions',
      icon: Compass,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'card-total-time',
      label: 'Total Tracked Time',
      value: user.totalTimeSpentFormatted,
      subtext: 'Cumulative active time',
      icon: Hourglass,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'card-first-visit',
      label: 'First Visit',
      value: user.firstVisitFormatted,
      subtext: 'Initial onboarding',
      icon: Calendar,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      id: 'card-last-seen',
      label: 'Last Seen',
      value: user.lastActiveFormatted,
      subtext: user.status === 'online' ? 'Active now' : 'Latest activity signal',
      icon: Clock,
      color: user.status === 'online' 
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
        : 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'card-last-section',
      label: 'Last Known Section',
      value: user.currentSection,
      subtext: user.currentRoute,
      icon: MapPin,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      id: 'card-device-info',
      label: 'Platform & Browser',
      value: user.browser || 'Browser',
      subtext: `${user.os || 'OS'} • ${user.deviceCategory || 'Desktop'}`,
      icon: DeviceIcon,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-sm hover:border-slate-700/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 tracking-tight line-clamp-1">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border shrink-0 ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-slate-100 truncate tracking-tight font-mono">
                {card.value}
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
