import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { ItemExplorationStat } from '../../../types/tracking';

interface ItemExplorationTableProps {
  items: ItemExplorationStat[];
}

export const ItemExplorationTable: React.FC<ItemExplorationTableProps> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [sortBy, setSortBy] = useState<'total_opens' | 'revisits' | 'last_opened' | 'first_opened'>('total_opens');

  // Extract distinct sections from items
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.section) set.add(item.section);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedSection !== 'all' && item.section !== selectedSection) {
          return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const titleMatch = item.title?.toLowerCase().includes(q);
          const idMatch = item.itemId?.toLowerCase().includes(q);
          const typeMatch = item.itemType?.toLowerCase().includes(q);
          const secMatch = item.section?.toLowerCase().includes(q);
          if (!titleMatch && !idMatch && !typeMatch && !secMatch) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'revisits':
            return b.revisitCount - a.revisitCount;
          case 'last_opened':
            return (b.lastOpenedEpoch || 0) - (a.lastOpenedEpoch || 0);
          case 'first_opened':
            return (b.firstOpenedEpoch || 0) - (a.firstOpenedEpoch || 0);
          case 'total_opens':
          default:
            return b.totalOpens - a.totalOpens;
        }
      });
  }, [items, selectedSection, searchTerm, sortBy]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Individual Item Exploration & Revisit History
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown of distinct notes, moments, wishes, and letters opened by this user.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredItems.length} of {items.length} items
        </span>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items by title, ID, number..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Sections ({items.length})</option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="total_opens">Sort: Most Opened</option>
            <option value="revisits">Sort: Most Revisits</option>
            <option value="last_opened">Sort: Recently Opened</option>
            <option value="first_opened">Sort: Earliest Opened</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs space-y-1">
          <p className="text-slate-400 font-medium">No items matched your search criteria.</p>
          <p>Try searching for a different keyword or resetting section filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80 font-medium">
                <th className="p-3 whitespace-nowrap">Item Description</th>
                <th className="p-3 whitespace-nowrap">Section</th>
                <th className="p-3 whitespace-nowrap text-center">Total Opens</th>
                <th className="p-3 whitespace-nowrap text-center">Revisits</th>
                <th className="p-3 whitespace-nowrap">First Opened</th>
                <th className="p-3 whitespace-nowrap">Last Opened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredItems.map((item) => (
                <tr
                  key={item.itemKey}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {/* Item Description */}
                  <td className="p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                          {item.title}
                        </span>
                        {item.itemNumber !== undefined && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono">
                            #{item.itemNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>ID: {item.itemId}</span>
                        <span>•</span>
                        <span className="capitalize">{item.itemType}</span>
                      </div>
                    </div>
                  </td>

                  {/* Section */}
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700">
                      {item.section}
                    </span>
                  </td>

                  {/* Total Opens */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Eye className="w-3 h-3" />
                      {item.totalOpens}
                    </span>
                  </td>

                  {/* Revisits */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium border ${
                        item.revisitCount > 0
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-slate-800/80 text-slate-500 border-slate-700/60'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {item.revisitCount}
                    </span>
                  </td>

                  {/* First Opened */}
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{item.firstOpenedFormatted}</span>
                    </div>
                  </td>

                  {/* Last Opened */}
                  <td className="p-3 text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{item.lastOpenedFormatted}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
