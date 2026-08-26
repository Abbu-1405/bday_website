import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  FolderLock,
  Image,
  Calendar,
  Layers,
  Save,
  X,
  Eye,
  Code,
  Tag,
  Loader2,
  Check,
  Info,
} from 'lucide-react';
import {
  NotificationTemplate,
  NotificationEventType,
  TemplateVariables,
} from '../../types';
import {
  fetchAllNotificationTemplates,
  saveNotificationTemplate,
  resetNotificationTemplate,
  validateNotificationTemplate,
  interpolateTemplateText,
  ALLOWED_TEMPLATE_VARIABLES,
  SAMPLE_TEMPLATE_VARIABLES,
  DEFAULT_NOTIFICATION_TEMPLATES,
} from '../../services/notificationTemplateService';
import { useAuth } from '../../hooks';

export function AdminNotificationTemplates() {
  const { currentUser } = useAuth();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for editor
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formActionRoute, setFormActionRoute] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [activeFocusField, setActiveFocusField] = useState<'title' | 'body'>('body');
  const [previewMode, setPreviewMode] = useState<'rendered' | 'raw'>('rendered');

  // Custom preview variables state
  const [previewVariables, setPreviewVariables] = useState<TemplateVariables>(SAMPLE_TEMPLATE_VARIABLES);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const list = await fetchAllNotificationTemplates();
      setTemplates(list);
    } catch (err) {
      console.error('Error fetching notification templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openEditor = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormBody(template.body);
    setFormActionRoute(template.actionRoute);
    setFormEnabled(template.enabled);
    setSaveFeedback(null);
    setPreviewMode('rendered');
  };

  const closeEditor = () => {
    setEditingTemplate(null);
    setSaveFeedback(null);
  };

  const insertVariable = (varKey: string) => {
    const placeholder = `{{${varKey}}}`;
    if (activeFocusField === 'title') {
      const input = titleInputRef.current;
      if (input) {
        const start = input.selectionStart || formTitle.length;
        const end = input.selectionEnd || formTitle.length;
        const updated = formTitle.slice(0, start) + placeholder + formTitle.slice(end);
        setFormTitle(updated);
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + placeholder.length, start + placeholder.length);
        }, 50);
      } else {
        setFormTitle((prev) => `${prev} ${placeholder}`.trim());
      }
    } else {
      const textarea = bodyTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart || formBody.length;
        const end = textarea.selectionEnd || formBody.length;
        const updated = formBody.slice(0, start) + placeholder + formBody.slice(end);
        setFormBody(updated);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
        }, 50);
      } else {
        setFormBody((prev) => `${prev} ${placeholder}`.trim());
      }
    }
  };

  const handleSave = async () => {
    if (!editingTemplate || !currentUser?.uid) return;

    const validation = validateNotificationTemplate({
      title: formTitle,
      body: formBody,
      actionRoute: formActionRoute,
    });

    if (!validation.valid) {
      setSaveFeedback({
        type: 'error',
        message: validation.errors[0] || 'Please fix template validation errors.',
      });
      return;
    }

    setIsSaving(true);
    setSaveFeedback(null);

    try {
      const result = await saveNotificationTemplate(
        {
          id: editingTemplate.id,
          category: editingTemplate.category,
          title: formTitle,
          body: formBody,
          actionRoute: formActionRoute,
          enabled: formEnabled,
          variables: editingTemplate.variables,
          description: editingTemplate.description,
        },
        currentUser.uid
      );

      if (result.success && result.template) {
        setSaveFeedback({
          type: 'success',
          message: `Saved as Version ${result.template.version}. All future ${editingTemplate.category} notifications will use this template.`,
        });
        await loadTemplates();
        setEditingTemplate(result.template);
      } else {
        setSaveFeedback({
          type: 'error',
          message: result.error || 'Failed to save template.',
        });
      }
    } catch (err: any) {
      setSaveFeedback({
        type: 'error',
        message: err?.message || 'Error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!editingTemplate || !currentUser?.uid) return;
    const def = DEFAULT_NOTIFICATION_TEMPLATES[editingTemplate.category];
    if (!def) return;

    if (window.confirm(`Reset template "${editingTemplate.category}" back to authoritative default wording?`)) {
      setIsSaving(true);
      setSaveFeedback(null);
      try {
        const result = await resetNotificationTemplate(editingTemplate.id, currentUser.uid);
        if (result.success && result.template) {
          setFormTitle(result.template.title);
          setFormBody(result.template.body);
          setFormActionRoute(result.template.actionRoute);
          setFormEnabled(result.template.enabled);
          setSaveFeedback({
            type: 'success',
            message: `Template reset to default (New Version: v${result.template.version}).`,
          });
          await loadTemplates();
          setEditingTemplate(result.template);
        }
      } catch (err: any) {
        setSaveFeedback({ type: 'error', message: err?.message || 'Failed to reset template.' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getCategoryIcon = (category: NotificationEventType) => {
    switch (category) {
      case 'LETTER_AVAILABLE':
        return <Mail className="w-5 h-5 text-sky-400" />;
      case 'OPEN_WHEN_AVAILABLE':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'SECRET_UNLOCKED':
        return <FolderLock className="w-5 h-5 text-purple-400" />;
      case 'MOMENT_AVAILABLE':
        return <Image className="w-5 h-5 text-rose-400" />;
      case 'BIRTHDAY':
        return <Calendar className="w-5 h-5 text-emerald-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  const validationResult = validateNotificationTemplate({
    title: formTitle,
    body: formBody,
    actionRoute: formActionRoute,
  });

  const previewRenderedTitle = interpolateTemplateText(
    formTitle,
    previewVariables,
    editingTemplate?.category
  );
  const previewRenderedBody = interpolateTemplateText(
    formBody,
    previewVariables,
    editingTemplate?.category
  );

  return (
    <div className="space-y-6" id="notification-templates-section">
      {/* Header Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Notification Templates & Personalization
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized wording repository for Starlit Letters notifications. Changes are versioned and baked immutably into notification events at creation time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              6 Core Categories
            </span>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
          <p className="text-sm">Loading notification templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              id={`template-card-${tmpl.id}`}
              className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 group"
            >
              <div>
                {/* Top Badge & Version */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-800/90 rounded-xl border border-slate-700/60">
                      {getCategoryIcon(tmpl.category)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-300 font-mono tracking-wider">
                        {tmpl.category}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {tmpl.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono rounded-md">
                      v{tmpl.version || 1}
                    </span>
                    {tmpl.enabled ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Active" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600 ring-4 ring-slate-600/20" title="Disabled" />
                    )}
                  </div>
                </div>

                {/* Description */}
                {tmpl.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2 italic">
                    {tmpl.description}
                  </p>
                )}

                {/* Content Preview */}
                <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-3.5 space-y-2 mb-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Title Template
                    </div>
                    <div className="text-sm font-medium text-amber-100/90 font-sans break-words">
                      {tmpl.title}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Body Template
                    </div>
                    <div className="text-xs text-slate-300 font-sans leading-relaxed break-words line-clamp-3">
                      {tmpl.body}
                    </div>
                  </div>
                </div>

                {/* Variables Used */}
                <div className="mb-4">
                  <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    Supported Variables:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tmpl.variables.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono rounded"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Route: {tmpl.actionRoute || '/'}
                </span>
                <button
                  id={`edit-template-btn-${tmpl.id}`}
                  onClick={() => openEditor(tmpl)}
                  className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Customize
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Customizer Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            id="template-editor-modal"
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                  {getCategoryIcon(editingTemplate.category)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-100 flex items-center gap-2">
                    Edit {editingTemplate.category} Template
                    <span className="px-2 py-0.5 bg-slate-800 text-amber-300 text-xs font-mono rounded">
                      v{editingTemplate.version || 1}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: {editingTemplate.id} • Modifying will increment template version
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditor}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Feedback Alert */}
              {saveFeedback && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    saveFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  {saveFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">{saveFeedback.message}</div>
                </div>
              )}

              {/* Status & Deep Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Deep Link (Action Route)
                  </label>
                  <input
                    type="text"
                    value={formActionRoute}
                    onChange={(e) => setFormActionRoute(e.target.value)}
                    placeholder="/letters"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Template Status
                  </label>
                  <div className="flex items-center gap-3 pt-1.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formEnabled}
                        onChange={(e) => setFormEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <span className="text-xs text-slate-300 font-medium">
                      {formEnabled ? 'Enabled (Active in event creation)' : 'Disabled (Falls back to default)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Variable Helper Toolbar */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-xs font-semibold text-amber-200/90 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Insert Variable Placeholder (Targeting: {activeFocusField === 'title' ? 'Title' : 'Body'})
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Click a variable chip to insert at cursor
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={String(v.key)}
                      type="button"
                      onClick={() => insertVariable(String(v.key))}
                      className="px-2.5 py-1 bg-slate-800/90 hover:bg-amber-500/20 border border-slate-700/80 hover:border-amber-500/40 text-amber-300 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
                      title={v.description}
                    >
                      <span className="text-amber-400 font-bold">+</span>
                      {`{{${v.key}}}`}
                      <span className="text-[10px] text-slate-400 group-hover:text-amber-200">
                        ({v.label})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Notification Title Template
                  </label>
                  <span className={`text-[11px] font-mono ${formTitle.length > 200 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {formTitle.length}/200 chars
                  </span>
                </div>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={formTitle}
                  onFocus={() => setActiveFocusField('title')}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. A little letter is waiting for you 💌"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/90 rounded-xl text-amber-100 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Body Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Notification Message Body Template
                  </label>
                  <span className={`text-[11px] font-mono ${formBody.length > 1000 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {formBody.length}/1000 chars
                  </span>
                </div>
                <textarea
                  ref={bodyTextareaRef}
                  rows={4}
                  value={formBody}
                  onFocus={() => setActiveFocusField('body')}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="e.g. {{letterTitle}} is waiting for you in your starlit inbox."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700/90 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Live Preview Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    Live Web Push Notification Preview
                  </div>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('rendered')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        previewMode === 'rendered' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Sample Personalization
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('raw')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        previewMode === 'raw' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Raw Template
                    </button>
                  </div>
                </div>

                {/* Simulated Notification Card */}
                <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-xl flex items-start gap-3.5 max-w-lg">
                  <img
                    src="/download-7.jpg"
                    alt="App Icon"
                    className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-slate-300">Starlit Letters</span>
                      <span>just now</span>
                    </div>
                    <div className="text-sm font-bold text-amber-100 truncate">
                      {previewMode === 'rendered' ? previewRenderedTitle || '(Empty Title)' : formTitle || '(Empty Title)'}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                      {previewMode === 'rendered' ? previewRenderedBody || '(Empty Body)' : formBody || '(Empty Body)'}
                    </div>
                    <div className="mt-2 text-[10px] text-amber-400/80 font-mono">
                      Target URL: {formActionRoute || '/'}
                    </div>
                  </div>
                </div>

                {/* Sample Variable editor helper */}
                {previewMode === 'rendered' && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Preview sample recipient: <strong className="text-slate-300 font-mono">Noor</strong></span>
                    <span>Letter: <strong className="text-slate-300 font-mono">Midnight Thoughts</strong></span>
                    <span>Envelope: <strong className="text-slate-300 font-mono">When You Need a Smile</strong></span>
                  </div>
                )}
              </div>

              {/* Validation Warnings */}
              {!validationResult.valid && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                  {validationResult.errors.map((err, idx) => (
                    <div key={idx} className="text-xs text-amber-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {err}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isSaving}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !validationResult.valid}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save New Version (v{(editingTemplate.version || 1) + 1})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
