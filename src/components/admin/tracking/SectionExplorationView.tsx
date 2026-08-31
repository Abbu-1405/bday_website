import React from 'react';
import {
  Compass,
  Clock,
  Layers,
  BookOpen,
  Calendar,
  Sparkles,
  Heart,
  Mail,
  Camera,
  Eye,
  Key,
  HelpCircle,
  Film,
  Pen,
  FileText,
} from 'lucide-react';
import { SectionExplorationStat } from '../../../types/tracking';

interface SectionExplorationViewProps {
  sections: SectionExplorationStat[];
}

export const SectionExplorationView: React.FC<SectionExplorationViewProps> = ({ sections }) => {
  const getSectionIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('365') || lower.includes('note')) return FileText;
    if (lower.includes('moment')) return Camera;
    if (lower.includes('adore')) return Heart;
    if (lower.includes('open when') || lower.includes('letter')) return Mail;
    if (lower.includes('wish')) return Sparkles;
    if (lower.includes('secret') || lower.includes('vault')) return Key;
    if (lower.includes('bts') || lower.includes('behind')) return Film;
    if (lower.includes('sneak')) return Eye;
    if (lower.includes('what am i')) return HelpCircle;
    if (lower.includes('doodle')) return Pen;
    return BookOpen;
  };

  const getSectionColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('365') || lower.includes('note'))
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (lower.includes('moment'))
      return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    if (lower.includes('adore'))
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (lower.includes('open when') || lower.includes('letter'))
      return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (lower.includes('wish'))
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    if (lower.includes('secret') || lower.includes('vault'))
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (lower.includes('bts') || lower.includes('behind'))
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  };

  if (sections.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 space-y-2">
        <Compass className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-sm font-medium text-slate-400">No Section Exploration Recorded</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          This user has not navigated through or opened content sections on the platform yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Section Exploration Overview
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {sections.length} active section{sections.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sec) => {
          const Icon = getSectionIcon(sec.sectionName);
          const colorClasses = getSectionColor(sec.sectionName);

          return (
            <div
              key={sec.sectionId || sec.sectionName}
              id={`section-stat-${sec.sectionId}`}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${colorClasses}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 tracking-tight">
                      {sec.sectionName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      {sec.route}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-mono font-medium text-slate-300 border border-slate-700">
                  {sec.visitCount} visit{sec.visitCount === 1 ? '' : 's'}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    <span>Unique Items</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-200">
                    {sec.uniqueItemsCount}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Total Opens</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-200">
                    {sec.totalItemOpens}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>Active Time</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-200">
                    {sec.totalActiveTimeFormatted}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    <span>Last Explored</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 truncate">
                    {sec.lastExploredFormatted}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
