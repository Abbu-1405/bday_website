import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Mail,
  Lock,
  Heart,
  Camera,
  FolderKanban,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Terminal,
  Server,
  Layers,
  ArrowUpDown,
  Search,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  Edit2,
  Radio,
  Sliders,
  X,
} from 'lucide-react';
import {
  ContentCategory,
  CONTENT_CATEGORIES,
  getManagedNotes365,
  getManagedWishes,
  getManagedOpenWhenLetters,
  getManagedSecrets,
  getManagedAdoreItems,
  getManagedMoments,
  saveContentItem,
} from '../../../services/contentService';
import { ContentCategoryManager } from './ContentCategoryManager';
import { ContentItemEditorModal } from './ContentItemEditorModal';
import { AdminNotes365Preview } from '../preview/AdminNotes365Preview';

interface AdminContentHubProps {
  onOpen365Preview?: () => void;
}

type PayloadFilter = 'ALL' | 'notes' | 'wishes' | 'openWhen' | 'secrets' | 'adore' | 'moments';
type StatusType = 'ACTIVE' | 'STAGED' | 'ARCHIVED' | 'SCHEDULED';

interface UnifiedPayload {
  id: string;
  category: ContentCategory;
  title: string;
  preview: string;
  status: StatusType;
  lastDeployed: string;
  operator: string;
  rawItem: any;
}

export function AdminContentHub({ onOpen365Preview }: AdminContentHubProps) {
  const [activeCategory, setActiveCategory] = useState<ContentCategory | null>(null);
  const [showInternalPreview, setShowInternalPreview] = useState<boolean>(false);

  // Raw datasets
  const [notes, setNotes] = useState<any[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [openWhen, setOpenWhen] = useState<any[]>([]);
  const [secrets, setSecrets] = useState<any[]>([]);
  const [adore, setAdore] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<PayloadFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkAction, setBulkAction] = useState<string>('NONE');
  const [terminalNotice, setTerminalNotice] = useState<string | null>(null);

  // Editor and Inspector modals
  const [editingItem, setEditingItem] = useState<{ category: ContentCategory; item: any } | null>(null);
  const [inspectingPayload, setInspectingPayload] = useState<UnifiedPayload | null>(null);

  // Pagination for staging table
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Local overrides for deployment status
  const [statusOverrides, setStatusOverrides] = useState<Record<string, { status: StatusType; lastDeployed: string }>>({});

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [nData, wData, owData, sData, aData, mData] = await Promise.all([
        getManagedNotes365(),
        getManagedWishes(),
        getManagedOpenWhenLetters(),
        getManagedSecrets(),
        getManagedAdoreItems(),
        getManagedMoments(),
      ]);

      setNotes(nData);
      setWishes(wData);
      setOpenWhen(owData);
      setSecrets(sData);
      setAdore(aData);
      setMoments(mData);
    } catch (err) {
      console.warn('Error fetching managed content datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  const getCategoryItems = (cat: ContentCategory) => {
    switch (cat) {
      case 'notes':
        return notes;
      case 'wishes':
        return wishes;
      case 'openWhen':
        return openWhen;
      case 'secrets':
        return secrets;
      case 'adore':
        return adore;
      case 'moments':
        return moments;
      default:
        return [];
    }
  };

  const handleItemUpdated = (cat: ContentCategory, updatedItem: any) => {
    const updateList = (prev: any[]) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item));

    switch (cat) {
      case 'notes':
        setNotes(updateList);
        break;
      case 'wishes':
        setWishes(updateList);
        break;
      case 'openWhen':
        setOpenWhen(updateList);
        break;
      case 'secrets':
        setSecrets(updateList);
        break;
      case 'adore':
        setAdore(updateList);
        break;
      case 'moments':
        setMoments(updateList);
        break;
    }
  };

  // Convert all content items into unified payload rows
  const allPayloads: UnifiedPayload[] = useMemo(() => {
    const mapCategory = (items: any[], cat: ContentCategory): UnifiedPayload[] => {
      return items.map((it, idx) => {
        const id = it.id || `${cat}-${idx + 1}`;
        const override = statusOverrides[id];
        let computedStatus: StatusType = 'ACTIVE';
        if (it.status === 'draft') computedStatus = 'STAGED';
        else if (it.status === 'archived') computedStatus = 'ARCHIVED';
        else if (it.status === 'scheduled') computedStatus = 'SCHEDULED';

        if (override) {
          computedStatus = override.status;
        }

        const title = it.title || it.heading || (it.number ? `Wish #${it.number}` : `Payload ${id}`);
        const preview = it.preview || it.shortDescription || it.description || it.content || it.story || '';
        const lastDeployed = override?.lastDeployed || it.date || it.updatedAt || 'LIVE_SYNC';

        return {
          id,
          category: cat,
          title,
          preview,
          status: computedStatus,
          lastDeployed,
          operator: 'ROOT_SYS',
          rawItem: it,
        };
      });
    };

    return [
      ...mapCategory(notes, 'notes'),
      ...mapCategory(wishes, 'wishes'),
      ...mapCategory(openWhen, 'openWhen'),
      ...mapCategory(secrets, 'secrets'),
      ...mapCategory(adore, 'adore'),
      ...mapCategory(moments, 'moments'),
    ];
  }, [notes, wishes, openWhen, secrets, adore, moments, statusOverrides]);

  // Inventory analytics
  const { totalBlocks, activeCount, draftCount, footprintKb } = useMemo(() => {
    let active = 0;
    let draft = 0;
    let totalChars = 0;

    allPayloads.forEach((p) => {
      if (p.status === 'ACTIVE') active++;
      else draft++;
      totalChars += p.title.length + p.preview.length;
    });

    const kb = (totalChars / 1024).toFixed(1);
    return {
      totalBlocks: allPayloads.length,
      activeCount: active,
      draftCount: draft,
      footprintKb: kb,
    };
  }, [allPayloads]);

  // Filtered payloads
  const filteredPayloads = useMemo(() => {
    return allPayloads.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesContent = p.preview.toLowerCase().includes(q);
        return matchesId || matchesTitle || matchesContent;
      }
      return true;
    });
  }, [allPayloads, categoryFilter, searchQuery]);

  const totalPages = Math.ceil(filteredPayloads.length / ITEMS_PER_PAGE) || 1;
  const paginatedPayloads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayloads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPayloads, currentPage]);

  const handleDeploy = (id: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setStatusOverrides((prev) => ({
      ...prev,
      [id]: { status: 'ACTIVE', lastDeployed: timestamp },
    }));
    setTerminalNotice(`PAYLOAD [${id}] &gt; DEPLOYED_TO_PRODUCTION // STATUS: ACTIVE`);
    setTimeout(() => setTerminalNotice(null), 3000);
  };

  const handleRollback = (id: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setStatusOverrides((prev) => ({
      ...prev,
      [id]: { status: 'STAGED', lastDeployed: `${timestamp} (STAGED)` },
    }));
    setTerminalNotice(`PAYLOAD [${id}] &gt; ROLLED_BACK // STATUS: STAGED`);
    setTimeout(() => setTerminalNotice(null), 3000);
  };

  const handleOpen365 = () => {
    if (onOpen365Preview) {
      onOpen365Preview();
    } else {
      setShowInternalPreview(true);
    }
  };

  const handleCreateNewPayload = () => {
    const targetCat: ContentCategory = categoryFilter !== 'ALL' ? categoryFilter : 'notes';
    const newItem = {
      id: `${targetCat}-${Date.now().toString().slice(-4)}`,
      title: 'New Mission Payload',
      content: '',
      preview: '',
      status: 'draft',
    };
    setEditingItem({ category: targetCat, item: newItem });
  };

  const handleBulkExecute = () => {
    if (bulkAction === 'SYNC_ALL') {
      loadAllContent();
      setTerminalNotice('&gt; FULL MISSION PAYLOAD RE-SYNC EXECUTED');
    } else if (bulkAction === 'STAMP_DEPLOY') {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const updates: Record<string, { status: StatusType; lastDeployed: string }> = {};
      paginatedPayloads.forEach((p) => {
        updates[p.id] = { status: 'ACTIVE', lastDeployed: timestamp };
      });
      setStatusOverrides((prev) => ({ ...prev, ...updates }));
      setTerminalNotice(`&gt; BATCH DEPLOYMENT STAMPED FOR ${paginatedPayloads.length} PAYLOADS`);
    } else if (bulkAction === 'EXPORT_MANIFEST') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allPayloads, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `payload_manifest_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setTerminalNotice('&gt; MISSION PAYLOAD MANIFEST EXPORTED');
    }
    setTimeout(() => setTerminalNotice(null), 3000);
    setBulkAction('NONE');
  };

  // If internal 365 preview is active, render preview
  if (showInternalPreview) {
    return <AdminNotes365Preview onNavigateToContent={() => setShowInternalPreview(false)} />;
  }

  // If a category is selected in manager mode, render the category manager view
  if (activeCategory) {
    const catInfo = CONTENT_CATEGORIES.find((c) => c.id === activeCategory);
    return (
      <ContentCategoryManager
        category={activeCategory}
        categoryTitle={catInfo?.title || 'Category'}
        items={getCategoryItems(activeCategory)}
        onBack={() => setActiveCategory(null)}
        onItemUpdated={(updated) => handleItemUpdated(activeCategory, updated)}
      />
    );
  }

  return (
    <div className="space-y-4 font-mono select-none" id="admin-content-hub">
      {/* Header */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#020408] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-emerald-400 font-bold tracking-wider">
                  [PAYLOAD_STAGING // CONTENT_DEPOT]
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DEPOT::ONLINE
                </span>
                <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  [OPERATOR: PRIVILEGED]
                </span>
              </div>
              <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
                // Mission asset repository, payload staging, version manifests, and live deployment dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpen365}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-cyan-950/40 text-cyan-300 text-xs font-mono border border-cyan-500/30 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>[EXEC_365_SIMULATOR]</span>
            </button>

            <button
              onClick={() => loadAllContent()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
              <span>{loading ? '[SYNCING...]' : '[REFRESH_DEPOT]'}</span>
            </button>
          </div>
        </div>

        {/* Asset Inventory Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-950/60">
          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">TOTAL CONTENT BLOCKS</span>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">{totalBlocks}</div>
            <p className="text-[9px] text-slate-400 mt-0.5">Unified assets registered</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold">PUBLISHED VS DRAFT</span>
            <div className="text-sm font-bold text-emerald-300 font-mono mt-1.5">
              {activeCount} ACT / {draftCount} STG
            </div>
            <p className="text-[9px] text-emerald-700 mt-0.5">Deployment ratio</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-amber-400 uppercase font-semibold">ACTIVE CAMPAIGNS</span>
            <div className="text-sm font-bold text-amber-300 font-mono mt-1.5">
              6 CORE CAMPAIGNS
            </div>
            <p className="text-[9px] text-amber-700 mt-0.5">Target domains online</p>
          </div>

          <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950">
            <span className="text-[10px] text-purple-400 uppercase font-semibold">DATABASE FOOTPRINT</span>
            <div className="text-sm font-bold text-purple-300 font-mono mt-1.5">
              ~{footprintKb} KB
            </div>
            <p className="text-[9px] text-purple-700 mt-0.5">Optimized cache memory</p>
          </div>
        </div>
      </div>

      {/* Quick Action Terminal Bar */}
      <div className="bg-[#050811]/90 p-3.5 rounded-xl border border-emerald-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Create New Payload Button */}
          <button
            onClick={handleCreateNewPayload}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/50 text-xs font-bold transition-colors cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>[+ CREATE_NEW_PAYLOAD]</span>
          </button>

          {/* Bulk Operations & Search */}
          <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
            <div className="flex items-center gap-1.5 bg-[#020408] px-2 py-1 rounded-lg border border-emerald-500/30 text-xs">
              <span className="text-[10px] text-slate-400 font-semibold">BULK:</span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bg-transparent text-emerald-300 focus:outline-none font-mono text-xs cursor-pointer"
              >
                <option value="NONE" className="bg-[#050811] text-slate-400">[BULK_ACTION: NONE]</option>
                <option value="SYNC_ALL" className="bg-[#050811] text-cyan-300">[FORCE_SYNC_ALL]</option>
                <option value="STAMP_DEPLOY" className="bg-[#050811] text-emerald-300">[STAMP_CURRENT_PAGE_ACTIVE]</option>
                <option value="EXPORT_MANIFEST" className="bg-[#050811] text-amber-300">[EXPORT_MANIFEST_JSON]</option>
              </select>
              {bulkAction !== 'NONE' && (
                <button
                  onClick={handleBulkExecute}
                  className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold border border-emerald-500/40 cursor-pointer"
                >
                  EXEC
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-1.5 bg-[#020408] px-2.5 py-1.5 rounded-lg border border-emerald-500/30 text-xs w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <input
                type="text"
                placeholder="Search ID, title, payload..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-emerald-200 placeholder:text-emerald-800 focus:outline-none w-full font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-emerald-950/60 pt-2.5">
          <span className="text-[10px] text-emerald-500 uppercase font-semibold shrink-0 mr-1">
            TARGET_CAMPAIGN:
          </span>
          {(['ALL', 'notes', 'wishes', 'openWhen', 'secrets', 'adore', 'moments'] as const).map((cat) => {
            const label =
              cat === 'ALL'
                ? 'ALL'
                : cat === 'notes'
                ? 'NOTES_365'
                : cat === 'openWhen'
                ? 'OPEN_WHEN'
                : cat.toUpperCase();
            return (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors shrink-0 cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950'
                }`}
              >
                [{label}]
              </button>
            );
          })}
        </div>
      </div>

      {terminalNotice && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-xs text-emerald-200 font-mono">
          &gt; {terminalNotice}
        </div>
      )}

      {/* Payload Staging Table */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-emerald-400 space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">&gt; LOADING_PAYLOAD_REGISTRY...</p>
          </div>
        ) : paginatedPayloads.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2 font-mono">
            <Server className="w-8 h-8 text-emerald-900 mx-auto" />
            <p className="text-xs font-semibold text-emerald-400">&gt; ZERO PAYLOADS MATCH SPECIFIED PARAMETERS</p>
            <p className="text-[10px] text-slate-400">
              Clear search query or select another target campaign.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#020408] border-b border-emerald-950 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">[ID]</th>
                  <th className="py-2.5 px-3 font-semibold">[PAYLOAD_NAME]</th>
                  <th className="py-2.5 px-3 font-semibold">[CATEGORY / TARGET]</th>
                  <th className="py-2.5 px-3 font-semibold">[STATUS]</th>
                  <th className="py-2.5 px-3 font-semibold">[LAST_DEPLOYED]</th>
                  <th className="py-2.5 px-3 font-semibold">[OPERATOR]</th>
                  <th className="py-2.5 px-3 font-semibold text-right">[ACTIONS]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/50">
                {paginatedPayloads.map((payload) => {
                  const statusTag = payload.status;
                  const statusClass =
                    statusTag === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : statusTag === 'STAGED'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      : statusTag === 'SCHEDULED'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                      : 'bg-[#020408] text-slate-400 border-emerald-950';

                  return (
                    <tr
                      key={payload.id}
                      className="hover:bg-[#080d1a] transition-colors"
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3 font-bold text-cyan-400 whitespace-nowrap text-[11px]">
                        #{payload.id.substring(0, 14)}
                      </td>

                      {/* Name / Preview */}
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-semibold text-emerald-200 truncate text-[11px]">
                          {payload.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {payload.preview}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#020408] text-emerald-400 border border-emerald-950 font-semibold uppercase">
                          {payload.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${statusClass}`}>
                          [{statusTag}]
                        </span>
                      </td>

                      {/* Last Deployed */}
                      <td className="py-2.5 px-3 text-[10px] text-slate-400 whitespace-nowrap">
                        {payload.lastDeployed}
                      </td>

                      {/* Operator */}
                      <td className="py-2.5 px-3 text-[10px] text-slate-400 whitespace-nowrap">
                        {payload.operator}
                      </td>

                      {/* Actions: [INSPECT], [DEPLOY], [ROLLBACK], [EDIT] */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingPayload(payload)}
                            className="px-2 py-0.5 rounded bg-[#020408] hover:bg-cyan-950/40 text-cyan-300 border border-emerald-950 text-[10px] transition-colors cursor-pointer"
                            title="Inspect full payload envelope"
                          >
                            [INSPECT]
                          </button>

                          <button
                            onClick={() => handleDeploy(payload.id)}
                            className="px-2 py-0.5 rounded bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-950 text-[10px] transition-colors cursor-pointer"
                            title="Deploy payload live"
                          >
                            [DEPLOY]
                          </button>

                          <button
                            onClick={() => handleRollback(payload.id)}
                            className="px-2 py-0.5 rounded bg-[#020408] hover:bg-amber-950/40 text-amber-300 border border-emerald-950 text-[10px] transition-colors cursor-pointer"
                            title="Rollback to staged state"
                          >
                            [ROLLBACK]
                          </button>

                          <button
                            onClick={() => setEditingItem({ category: payload.category, item: payload.rawItem })}
                            className="px-2 py-0.5 rounded bg-[#050811] hover:bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 text-[10px] transition-colors cursor-pointer font-bold"
                            title="Edit payload data"
                          >
                            [EDIT]
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#020408] border-t border-emerald-950 flex items-center justify-between text-xs text-slate-400">
            <span>
              PAGE {currentPage} OF {totalPages} ({filteredPayloads.length} PAYLOADS)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-950 disabled:opacity-40 cursor-pointer"
              >
                &lt; PREV
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-[#050811] hover:bg-emerald-950/40 text-emerald-300 border border-emerald-950 disabled:opacity-40 cursor-pointer"
              >
                NEXT &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payload Inspection Modal */}
      {inspectingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#020408]/85 backdrop-blur-sm animate-fade-in font-mono select-none">
          <div className="relative w-full max-w-2xl bg-[#050811] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-950 bg-[#020408]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300">
                  /payload/envelope/{inspectingPayload.id}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {inspectingPayload.category.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setInspectingPayload(null)}
                className="p-1 rounded bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-slate-300">
              <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
                <div className="text-[10px] text-slate-400">PAYLOAD_TITLE:</div>
                <div className="text-sm font-bold text-emerald-200">{inspectingPayload.title}</div>
              </div>

              <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
                <div className="text-[10px] text-slate-400">RAW_CONTENT_BODY:</div>
                <div className="text-emerald-100 whitespace-pre-wrap leading-relaxed select-text text-xs">
                  {inspectingPayload.preview || inspectingPayload.rawItem?.content || 'EMPTY'}
                </div>
              </div>

              <div className="bg-[#020408] p-3 rounded-lg border border-emerald-950 space-y-1">
                <div className="text-[10px] text-slate-400">RAW_METADATA_JSON:</div>
                <pre className="text-[10px] text-cyan-300 overflow-x-auto select-text font-mono">
                  {JSON.stringify(inspectingPayload.rawItem, null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#020408] border-t border-emerald-950 flex items-center justify-between text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleDeploy(inspectingPayload.id);
                    setInspectingPayload(null);
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] cursor-pointer"
                >
                  [DEPLOY_NOW]
                </button>
                <button
                  onClick={() => {
                    const itemToEdit = inspectingPayload;
                    setInspectingPayload(null);
                    setEditingItem({ category: itemToEdit.category, item: itemToEdit.rawItem });
                  }}
                  className="px-2.5 py-1 rounded bg-[#020408] hover:bg-emerald-950 text-emerald-300 border border-emerald-950 text-[10px] cursor-pointer"
                >
                  [EDIT_RECORD]
                </button>
              </div>
              <button
                onClick={() => setInspectingPayload(null)}
                className="px-3 py-1 rounded bg-[#050811] text-slate-400 hover:text-emerald-300 border border-emerald-950 text-xs cursor-pointer"
              >
                [DISMISS]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Editor Modal */}
      {editingItem && (
        <ContentItemEditorModal
          category={editingItem.category}
          item={editingItem.item}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSaveSuccess={(updated) => {
            handleItemUpdated(editingItem.category, updated);
            setTerminalNotice(`PAYLOAD [${updated.id}] &gt; SAVED_SUCCESSFULLY`);
            setTimeout(() => setTerminalNotice(null), 3000);
          }}
        />
      )}
    </div>
  );
}
