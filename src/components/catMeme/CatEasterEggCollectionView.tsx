import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Egg,
  Filter,
  CheckCircle2,
  Lock,
  Volume2,
  Search,
} from 'lucide-react';
import {
  EasterEggDefinition,
  EasterEggDiscovery,
} from '../../types/catMeme';
import {
  getAllEasterEggs,
} from '../../services/catInteraction/easterEggRegistry';
import { EasterEggDiscoveryRepository } from '../../services/catInteraction/EasterEggDiscoveryRepository';
import { getCatDefinition } from '../../services/catInteraction/catRegistry';
import { CatAudioService } from '../../services/catInteraction/CatAudioService';

export interface CatEasterEggCollectionViewProps {
  className?: string;
}

export const CatEasterEggCollectionView: React.FC<
  CatEasterEggCollectionViewProps
> = ({ className = '' }) => {
  const [allEggs] = useState<EasterEggDefinition[]>(() => getAllEasterEggs());
  const [discoveries, setDiscoveries] = useState<
    Record<string, EasterEggDiscovery>
  >(() => EasterEggDiscoveryRepository.getInstance().getAllDiscoveries());
  const [filterMode, setFilterMode] = useState<
    'all' | 'discovered' | 'undiscovered'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsubscribe = EasterEggDiscoveryRepository.getInstance().subscribe(
      (newDiscoveries) => {
        setDiscoveries(newDiscoveries);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const discoveredCount = allEggs.filter((e) => Boolean(discoveries[e.id])).length;
  const totalCount = allEggs.length;
  const progressPercent = totalCount > 0 ? Math.round((discoveredCount / totalCount) * 100) : 0;

  const filteredEggs = allEggs.filter((egg) => {
    const isDiscovered = Boolean(discoveries[egg.id]);
    if (filterMode === 'discovered' && !isDiscovered) return false;
    if (filterMode === 'undiscovered' && isDiscovered) return false;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = isDiscovered && egg.title.toLowerCase().includes(q);
      const matchDesc = isDiscovered && egg.description.toLowerCase().includes(q);
      const matchHint = egg.hint.clueText.toLowerCase().includes(q);
      const matchCat = egg.catIds.some((catId) => {
        const cat = getCatDefinition(catId);
        return cat.displayName.toLowerCase().includes(q);
      });
      return matchTitle || matchDesc || matchHint || matchCat;
    }

    return true;
  });

  const handlePlayEggSound = (egg: EasterEggDefinition) => {
    if (egg.catIds.length > 0) {
      CatAudioService.getInstance().playSignatureSound(egg.catIds[0], 1, 'high');
    }
  };

  return (
    <div
      id="cat-easter-egg-collection-view"
      className={`space-y-6 text-slate-200 ${className}`}
    >
      {/* Overview & Progress Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121620] via-[#161B26] to-[#12151E] border border-amber-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Egg className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Easter Eggs & Secrets Collection</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  {discoveredCount}/{totalCount}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Curated hidden interactions discovered across the One Brain Cell theme.
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-sm font-mono font-bold text-amber-300">
              {progressPercent}% Unlocked
            </div>
            <div className="text-[11px] text-slate-500">
              {totalCount - discoveredCount} secret{totalCount - discoveredCount === 1 ? '' : 's'} remaining
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/80 mt-5">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            id="filter-egg-all"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterMode === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200'
            }`}
          >
            All Secrets ({totalCount})
          </button>
          <button
            id="filter-egg-discovered"
            onClick={() => setFilterMode('discovered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterMode === 'discovered'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200'
            }`}
          >
            Discovered ({discoveredCount})
          </button>
          <button
            id="filter-egg-undiscovered"
            onClick={() => setFilterMode('undiscovered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterMode === 'undiscovered'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200'
            }`}
          >
            Undiscovered ({totalCount - discoveredCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="search-easter-eggs-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search secrets or cats..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>
      </div>

      {/* Easter Egg Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEggs.map((egg) => {
          const isDiscovered = Boolean(discoveries[egg.id]);
          const discovery = discoveries[egg.id];

          return (
            <div
              key={egg.id}
              id={`easter-egg-card-${egg.id}`}
              className={`p-5 rounded-2xl border transition-all ${
                isDiscovered
                  ? 'bg-[#121620]/90 border-amber-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    isDiscovered
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-800/80 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isDiscovered ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-base font-bold truncate ${
                        isDiscovered ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {isDiscovered ? egg.title : '??? (Hidden Secret)'}
                    </h4>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${
                        isDiscovered
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isDiscovered ? 'Discovered' : 'Hidden'}
                    </span>
                  </div>

                  {/* Associated Cats Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {egg.catIds.map((catId) => {
                      const cat = getCatDefinition(catId);
                      return (
                        <span
                          key={catId}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center gap-1"
                        >
                          <span>🐾</span>
                          <span>{cat.displayName}</span>
                        </span>
                      );
                    })}
                    {egg.isCombination && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
                        ✦ Duo Jam
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  {isDiscovered ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {egg.description}
                      </p>

                      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs italic font-mono">
                        "{egg.caption}"
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        <span>
                          {discovery?.discoveredAt
                            ? `Found on ${new Date(
                                discovery.discoveredAt
                              ).toLocaleDateString()}`
                            : 'Discovered'}
                        </span>

                        <button
                          id={`play-sound-egg-${egg.id}`}
                          onClick={() => handlePlayEggSound(egg)}
                          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Sound</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-400 italic">
                        {egg.hint.clueText}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Experiment with different interactions or combinations in the Starlit universe to discover this secret event.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEggs.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-sm border border-slate-800 rounded-2xl bg-slate-900/40">
          No Easter eggs matched your search criteria.
        </div>
      )}
    </div>
  );
};
