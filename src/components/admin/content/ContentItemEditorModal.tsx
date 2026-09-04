import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Terminal,
} from 'lucide-react';
import { ContentCategory, saveContentItem } from '../../../services/contentService';
import { useAuth, useStarlitCatBridge } from '../../../hooks';

interface ContentItemEditorModalProps {
  category: ContentCategory;
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedItem: any) => void;
}

export function ContentItemEditorModal({
  category,
  item,
  isOpen,
  onClose,
  onSaveSuccess,
}: ContentItemEditorModalProps) {
  const { currentUser } = useAuth();
  const { emitLetter, emitSecret, emitMoment, emitWish, emitError } = useStarlitCatBridge();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Form Fields
  const [title, setTitle] = useState('');
  const [previewText, setPreviewText] = useState(''); // preview / shortDescription / description
  const [content, setContent] = useState(''); // content / story
  const [metaCategory, setMetaCategory] = useState(''); // category / location / trigger
  const [extraMeta, setExtraMeta] = useState(''); // date / secretHint / unlockCondition
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // State flags
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize fields on open
  useEffect(() => {
    if (item && isOpen) {
      setTitle(item.title || '');
      setPreviewText(item.preview || item.shortDescription || item.description || '');
      setContent(item.content || item.story || '');
      setMetaCategory(item.category || item.location || item.trigger || '');
      setExtraMeta(item.date || item.secretHint || item.unlockCondition || '');
      setStatus(item.status === 'draft' ? 'draft' : 'published');
      setIsDirty(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      setActiveTab('edit');

      // Phase 4: Gentle unobtrusive editor open reaction (safe metadata only)
      if (category === 'notes' || category === 'openWhen' || category === 'adore') {
        emitLetter('opened');
      } else if (category === 'secrets') {
        emitSecret('opened', item.id);
      } else if (category === 'moments') {
        emitMoment('opened', item.id);
      } else if (category === 'wishes') {
        emitWish('opened', item.id);
      }
    }
  }, [item, isOpen, category, emitLetter, emitSecret, emitMoment, emitWish]);

  if (!isOpen || !item) return null;

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setIsDirty(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleAttemptClose = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setErrorMessage('Title is required and cannot be empty.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Content body is required and cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedFields: Record<string, any> = {
        title: title.trim(),
        status,
      };

      // Assign specific field names according to category schema
      if (category === 'notes') {
        updatedFields.preview = previewText.trim();
        updatedFields.content = content.trim();
      } else if (category === 'wishes') {
        updatedFields.shortDescription = previewText.trim();
        updatedFields.content = content.trim();
        if (metaCategory) updatedFields.category = metaCategory.trim();
      } else if (category === 'openWhen') {
        updatedFields.shortDescription = previewText.trim();
        updatedFields.content = content.trim();
        if (metaCategory) updatedFields.trigger = metaCategory.trim();
      } else if (category === 'secrets') {
        updatedFields.shortDescription = previewText.trim();
        updatedFields.description = previewText.trim();
        updatedFields.content = content.trim();
        if (extraMeta) updatedFields.secretHint = extraMeta.trim();
      } else if (category === 'adore') {
        updatedFields.shortDescription = previewText.trim();
        updatedFields.content = content.trim();
        if (metaCategory) updatedFields.category = metaCategory.trim();
      } else if (category === 'moments') {
        updatedFields.shortDescription = previewText.trim();
        updatedFields.story = content.trim();
        if (metaCategory) updatedFields.location = metaCategory.trim();
        if (extraMeta) updatedFields.date = extraMeta.trim();
      }

      const adminUid = currentUser?.uid || 'admin';
      await saveContentItem(category, item.id, updatedFields, adminUid);

      const mergedUpdatedItem = {
        ...item,
        ...updatedFields,
      };

      setIsDirty(false);
      setSuccessMessage('Content payload saved successfully to production!');
      onSaveSuccess(mergedUpdatedItem);

      // Event bridge notification on save
      if (status === 'draft') {
        emitLetter('saved', { itemId: item.id });
      } else {
        if (category === 'notes' || category === 'openWhen' || category === 'adore') {
          emitLetter('sent', { itemId: item.id });
        } else if (category === 'secrets') {
          emitSecret('created', item.id);
        } else if (category === 'moments') {
          emitMoment('saved', item.id);
        } else if (category === 'wishes') {
          emitWish('created', item.id);
        }
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save content. Check Firebase permissions.');
      emitError({ category: 'letters', action: 'save_failed', status: 'failure' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#020408]/85 backdrop-blur-sm animate-in fade-in duration-200 select-none font-mono"
      onClick={handleAttemptClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#050811] border border-emerald-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#020408] border-b border-emerald-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase font-semibold">
              {category} / {item.id}
            </span>
            {isDirty && (
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                [UNCOMMITTED_CHANGES]
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Toggle */}
            <div className="flex bg-[#020408] p-0.5 rounded-lg text-xs font-medium border border-emerald-950">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                [EDITOR]
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <Eye className="w-3 h-3" />
                [PREVIEW]
              </button>
            </div>

            <button
              onClick={handleAttemptClose}
              className="p-1 rounded bg-[#020408] text-slate-400 hover:text-emerald-300 border border-emerald-950 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Messages */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#020408] border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-[#020408] border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'edit' ? (
            <form id="content-edit-form" onSubmit={handleSave} className="space-y-3.5">
              {/* Title Field */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 flex items-center justify-between uppercase">
                  <span>PAYLOAD_TITLE *</span>
                  <span className="text-[9px] text-cyan-400 font-mono">
                    IMMUTABLE_ID: {item.id}
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleFieldChange(setTitle, e.target.value)}
                  placeholder="Enter title..."
                  className="w-full px-3 py-2 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              {/* Subtitle / Preview / Short Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">
                  {category === 'notes'
                    ? 'NOTE_PREVIEW / SUMMARY'
                    : category === 'moments'
                    ? 'SHORT_DESCRIPTION'
                    : 'SHORT_OVERVIEW'}
                </label>
                <textarea
                  rows={2}
                  value={previewText}
                  onChange={(e) => handleFieldChange(setPreviewText, e.target.value)}
                  placeholder="Enter short description or preview snippet..."
                  className="w-full px-3 py-2 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono resize-none"
                />
              </div>

              {/* Main Body Content */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 flex items-center justify-between uppercase">
                  <span>{category === 'moments' ? 'STORY_CONTENT *' : 'PAYLOAD_BODY *'}</span>
                  <span className="text-[9px] text-emerald-500 font-mono">
                    {content.length} CHARS
                  </span>
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => handleFieldChange(setContent, e.target.value)}
                  placeholder="Enter full text content..."
                  className="w-full px-3 py-2 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono leading-relaxed"
                />
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-950">
                {(category === 'wishes' ||
                  category === 'openWhen' ||
                  category === 'adore' ||
                  category === 'moments') && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase">
                      {category === 'wishes' || category === 'adore'
                        ? 'CATEGORY_TAG'
                        : category === 'openWhen'
                        ? 'TRIGGER_CONDITION'
                        : 'LOCATION'}
                    </label>
                    <input
                      type="text"
                      value={metaCategory}
                      onChange={(e) => handleFieldChange(setMetaCategory, e.target.value)}
                      placeholder="Category / Location / Trigger..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>
                )}

                {(category === 'moments' || category === 'secrets') && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase">
                      {category === 'moments' ? 'DATE_STRING' : 'SECRET_HINT'}
                    </label>
                    <input
                      type="text"
                      value={extraMeta}
                      onChange={(e) => handleFieldChange(setExtraMeta, e.target.value)}
                      placeholder="Date / Hint..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>
                )}

                {/* Status Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">DEPLOYMENT_STATUS</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      handleFieldChange(setStatus, e.target.value as 'published' | 'draft')
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-[#020408] border border-emerald-500/30 text-emerald-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer font-mono"
                  >
                    <option value="published" className="bg-[#050811] text-emerald-300">PUBLISHED (ACTIVE_PRODUCTION)</option>
                    <option value="draft" className="bg-[#050811] text-amber-300">DRAFT (STAGED_INTERNAL)</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            /* Live Public Preview */
            <div className="p-4 rounded-lg bg-[#020408] border border-emerald-500/30 text-slate-200 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-cyan-400 font-bold">
                    // PAYLOAD_STAGING_PREVIEW //
                  </span>
                  <h3 className="text-sm font-bold text-emerald-200 pt-0.5">
                    {title || 'UNTITLED_PAYLOAD'}
                  </h3>
                </div>
                {metaCategory && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#050811] text-cyan-300 border border-emerald-950">
                    {metaCategory}
                  </span>
                )}
              </div>

              {previewText && (
                <p className="text-xs text-amber-300/90 italic bg-[#050811] p-2.5 rounded border border-emerald-950">
                  "{previewText}"
                </p>
              )}

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                {content || 'NO_CONTENT_BODY'}
              </div>

              {extraMeta && (
                <div className="pt-2 border-t border-emerald-950 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>METADATA: {extraMeta}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#020408] border-t border-emerald-950 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAttemptClose}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-[#050811] transition-colors border border-emerald-950 cursor-pointer"
          >
            [DISCARD]
          </button>

          <button
            type="submit"
            form="content-edit-form"
            disabled={saving || !isDirty}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              saving || !isDirty
                ? 'bg-[#020408] text-slate-600 cursor-not-allowed border border-emerald-950'
                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)] cursor-pointer'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? '[COMMITTING...]' : isDirty ? '[COMMIT_CHANGES]' : '[COMMITTED]'}
          </button>
        </div>
      </div>
    </div>
  );
}
