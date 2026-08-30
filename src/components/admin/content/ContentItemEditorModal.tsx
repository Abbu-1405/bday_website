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
      setSuccessMessage('Content saved successfully to production!');
      onSaveSuccess(mergedUpdatedItem);

      // Phase 4: Event bridge notification on save (safe metadata only)
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleAttemptClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-semibold">
              {category} / {item.id}
            </span>
            {isDirty && (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-medium border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>

            <button
              onClick={handleAttemptClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'edit' ? (
            <form id="content-edit-form" onSubmit={handleSave} className="space-y-4">
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Content Title *</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID Immutable: {item.id}
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleFieldChange(setTitle, e.target.value)}
                  placeholder="Enter title..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-serif"
                />
              </div>

              {/* Subtitle / Preview / Short Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {category === 'notes'
                    ? 'Note Preview / Summary'
                    : category === 'moments'
                    ? 'Short Description'
                    : 'Short Overview'}
                </label>
                <textarea
                  rows={2}
                  value={previewText}
                  onChange={(e) => handleFieldChange(setPreviewText, e.target.value)}
                  placeholder="Enter short description or preview snippet..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-serif resize-none"
                />
              </div>

              {/* Main Body Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>{category === 'moments' ? 'Story Content *' : 'Main Content Body *'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {content.length} chars
                  </span>
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => handleFieldChange(setContent, e.target.value)}
                  placeholder="Enter full text content..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-serif leading-relaxed"
                />
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                {(category === 'wishes' ||
                  category === 'openWhen' ||
                  category === 'adore' ||
                  category === 'moments') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      {category === 'wishes' || category === 'adore'
                        ? 'Category Tag'
                        : category === 'openWhen'
                        ? 'Trigger Condition'
                        : 'Location'}
                    </label>
                    <input
                      type="text"
                      value={metaCategory}
                      onChange={(e) => handleFieldChange(setMetaCategory, e.target.value)}
                      placeholder="Category / Location / Trigger..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                {(category === 'moments' || category === 'secrets') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      {category === 'moments' ? 'Date String' : 'Secret Discovery Hint'}
                    </label>
                    <input
                      type="text"
                      value={extraMeta}
                      onChange={(e) => handleFieldChange(setExtraMeta, e.target.value)}
                      placeholder="Date / Hint..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                {/* Status Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Publishing Status</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      handleFieldChange(setStatus, e.target.value as 'published' | 'draft')
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="published">Published (Visible to Users)</option>
                    <option value="draft">Draft (Hidden in Admin)</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            /* Live Public Preview Approximation */
            <div className="p-5 rounded-2xl bg-amber-50/5 border border-slate-700/60 text-slate-200 space-y-4 font-serif">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Public Preview View</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight pt-1">
                    {title || 'Untitled'}
                  </h3>
                </div>
                {metaCategory && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-sans border border-slate-700">
                    {metaCategory}
                  </span>
                )}
              </div>

              {previewText && (
                <p className="text-xs text-amber-200/80 italic bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                  "{previewText}"
                </p>
              )}

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {content || 'No content written yet.'}
              </div>

              {extraMeta && (
                <div className="pt-3 border-t border-slate-800 text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Metadata: {extraMeta}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAttemptClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="content-edit-form"
            disabled={saving || !isDirty}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium text-white transition-all ${
              saving || !isDirty
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 cursor-pointer'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>
    </div>
  );
}
