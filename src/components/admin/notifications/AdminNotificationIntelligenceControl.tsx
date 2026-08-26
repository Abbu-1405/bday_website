import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sliders,
  ShieldCheck,
  Clock,
  Zap,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Moon,
  TrendingUp,
} from 'lucide-react';
import {
  NotificationIntelligenceConfig,
  DEFAULT_INTELLIGENCE_CONFIG,
  NotificationEventType,
} from '../../../types';
import {
  getIntelligenceConfig,
  updateIntelligenceConfig,
} from '../../../services/notificationIntelligenceService';

interface AdminNotificationIntelligenceControlProps {
  adminUid?: string;
  onConfigSaved?: (config: NotificationIntelligenceConfig) => void;
}

const CATEGORY_NAMES: { key: NotificationEventType; label: string; defaultLimit: number }[] = [
  { key: 'LETTER_AVAILABLE', label: 'Letters Available', defaultLimit: 5 },
  { key: 'SECRET_UNLOCKED', label: 'Secret Vault Unlocked', defaultLimit: 3 },
  { key: 'OPEN_WHEN_AVAILABLE', label: 'Open When Envelopes', defaultLimit: 3 },
  { key: 'MOMENT_AVAILABLE', label: 'Moments Captured', defaultLimit: 3 },
  { key: 'BIRTHDAY', label: 'Birthday Reminders', defaultLimit: 2 },
  { key: 'GENERAL', label: 'General / System Notices', defaultLimit: 2 },
];

export function AdminNotificationIntelligenceControl({
  adminUid,
  onConfigSaved,
}: AdminNotificationIntelligenceControlProps) {
  const [config, setConfig] = useState<NotificationIntelligenceConfig>(DEFAULT_INTELLIGENCE_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const current = await getIntelligenceConfig();
      setConfig(current);
    } catch (err) {
      console.error('Error loading intelligence config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const result = await updateIntelligenceConfig(config, adminUid);
      if (result.success && result.config) {
        setConfig(result.config);
        setSaveSuccess(true);
        if (onConfigSaved) {
          onConfigSaved(result.config);
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(result.error || 'Failed to save configuration.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error updating configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all smart notification intelligence settings to factory defaults?')) {
      setConfig({ ...DEFAULT_INTELLIGENCE_CONFIG });
    }
  };

  const updateCategoryLimit = (catKey: string, val: number) => {
    const cleanVal = Math.max(1, Math.min(20, isNaN(val) ? 1 : val));
    setConfig((prev) => ({
      ...prev,
      categoryDailyLimits: {
        ...prev.categoryDailyLimits,
        [catKey]: cleanVal,
      },
    }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
        <span>Loading Smart Notification Intelligence configuration...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Phase 8: Smart Notification Intelligence Rules
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                config.enabled
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {config.enabled ? 'INTELLIGENCE ACTIVE' : 'ENGINE PAUSED'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Deterministic, explainable rule engine governing delivery priority, anti-fatigue limits, quiet hours, and timing optimization.
          </p>
        </div>

        {/* Master Switch */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <span className="text-xs text-slate-300 font-medium">Smart Engine</span>
          <button
            type="button"
            onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              config.enabled ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Explanatory Info Card */}
      <div className="p-3.5 bg-purple-950/20 rounded-xl border border-purple-900/30 text-xs text-purple-200/90 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-purple-200">Explainable Hierarchy Guarantee</div>
          <p className="text-[11px] text-purple-300/80 leading-relaxed">
            Evaluation strictly follows: <strong>Emergency Stop → User Preferences → Category Limits → Daily/Hourly Spacing → Quiet Hours → Preferred Windows</strong>. Letters and vault unlocks receive high priority with <em>Fail-Open preservation</em> (delayed to the next morning rather than dropped).
          </p>
        </div>
      </div>

      {/* Rate & Spacing Limits */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-300" />
          <h4 className="text-xs font-semibold text-slate-200">Global Rate & Spacing Limits</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Max Per Hour */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Max Per Hour</label>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                {config.maxPerHour} pushes
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={config.maxPerHour}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, maxPerHour: parseInt(e.target.value, 10) || 1 }))
              }
              className="w-full accent-purple-500 bg-slate-800"
            />
            <p className="text-[10px] text-slate-500">
              Limits burst notifications to any single user within a 60-minute window.
            </p>
          </div>

          {/* Max Per Day */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Max Per Day (Global)</label>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                {config.maxPerDay} pushes
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={config.maxPerDay}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, maxPerDay: parseInt(e.target.value, 10) || 2 }))
              }
              className="w-full accent-purple-500 bg-slate-800"
            />
            <p className="text-[10px] text-slate-500">
              Total maximum notification deliveries permitted across all categories in 24h.
            </p>
          </div>

          {/* Minimum Spacing */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Minimum Spacing</label>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                {config.minimumSpacingMinutes} min
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={config.minimumSpacingMinutes}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  minimumSpacingMinutes: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-full accent-purple-500 bg-slate-800"
            />
            <p className="text-[10px] text-slate-500">
              Enforces a minimum cool-down gap between successive deliveries.
            </p>
          </div>
        </div>
      </div>

      {/* Category Daily Limits */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-300" />
            <h4 className="text-xs font-semibold text-slate-200">Category Daily Delivery Limits (24h)</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Max per category per user</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORY_NAMES.map((cat) => {
            const currentLimit = config.categoryDailyLimits?.[cat.key] ?? cat.defaultLimit;
            return (
              <div
                key={cat.key}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-slate-200">{cat.label}</div>
                  <div className="text-[10px] font-mono text-slate-500">Key: {cat.key}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={currentLimit}
                    onChange={(e) => updateCategoryLimit(cat.key, parseInt(e.target.value, 10))}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-purple-300 focus:outline-hidden focus:border-purple-500"
                  />
                  <span className="text-[11px] text-slate-400">/day</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization Toggles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-semibold text-slate-200">Smart Behavior & Optimization Policies</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Quiet Hours Optimization */}
          <div
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                quietHoursOptimization: !prev.quietHoursOptimization,
              }))
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.quietHoursOptimization
                ? 'bg-purple-950/20 border-purple-800/60 text-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 font-medium text-xs">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Quiet Hours Deferral</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  config.quietHoursOptimization
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {config.quietHoursOptimization ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Automatically postpones night notifications until waking hours in recipient's local timezone.
            </p>
          </div>

          {/* Preferred Timing Window */}
          <div
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                preferredTimingOptimization: !prev.preferredTimingOptimization,
              }))
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.preferredTimingOptimization
                ? 'bg-purple-950/20 border-purple-800/60 text-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 font-medium text-xs">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preferred Reading Window</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  config.preferredTimingOptimization
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {config.preferredTimingOptimization ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Schedules non-urgent letters for the user's historical highest-CTR window (e.g. evening).
            </p>
          </div>

          {/* Adaptive Cooldowns */}
          <div
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                adaptiveCooldowns: !prev.adaptiveCooldowns,
              }))
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.adaptiveCooldowns
                ? 'bg-purple-950/20 border-purple-800/60 text-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 font-medium text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Adaptive Anti-Burst</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  config.adaptiveCooldowns
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {config.adaptiveCooldowns ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Dynamically spreads rapid sequential notifications into separate gentle delivery moments.
            </p>
          </div>
        </div>
      </div>

      {/* Audit & Action Footer */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400">
          {config.lastUpdatedAt ? (
            <span>
              Last updated: {new Date(config.lastUpdatedAt).toLocaleString()} (by {config.updatedBy || 'admin'})
            </span>
          ) : (
            <span>Using default initial settings</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save Rules'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
