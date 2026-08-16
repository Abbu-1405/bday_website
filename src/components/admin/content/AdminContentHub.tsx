import React, { useState, useEffect } from 'react';
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
} from '../../../services/contentService';
import { ContentCategoryManager } from './ContentCategoryManager';

export function AdminContentHub() {
  const [activeCategory, setActiveCategory] = useState<ContentCategory | null>(null);

  // Loaded items for each category
  const [notes, setNotes] = useState<any[]>([]);
  const [wishes, setWishes] = useState<any[]>([]);
  const [openWhen, setOpenWhen] = useState<any[]>([]);
  const [secrets, setSecrets] = useState<any[]>([]);
  const [adore, setAdore] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Load all managed content items
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

  const getCategoryIcon = (cat: ContentCategory) => {
    switch (cat) {
      case 'notes':
        return FileText;
      case 'wishes':
        return Sparkles;
      case 'openWhen':
        return Mail;
      case 'secrets':
        return Lock;
      case 'adore':
        return Heart;
      case 'moments':
        return Camera;
      default:
        return FolderKanban;
    }
  };

  // If a category is selected, render the manager view
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
    <div className="space-y-6 select-none">
      {/* Header Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Content Management</h2>
              <p className="text-xs text-slate-400">
                Data-driven content architecture for Starlit Letters sanctuary.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            LIVE OVERRIDES ACTIVE
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-5 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800" />
              <div className="w-3/4 h-4 rounded bg-slate-800" />
              <div className="w-1/2 h-3 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CONTENT_CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.id);
            const items = getCategoryItems(cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="group relative bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-indigo-500/5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-600 border border-indigo-500/20 group-hover:border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                      {items.length} items
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                      <span>{cat.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-slate-400 group-hover:text-slate-200">
                  <span>Manage Category</span>
                  <span className="text-indigo-400 text-xs">Open Manager →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
