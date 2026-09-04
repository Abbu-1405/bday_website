import React from 'react';
import { ShieldCheck, Server, Key, ChevronRight, Terminal, Lock } from 'lucide-react';

interface TerminalSecurityPanelProps {
  adminEmail?: string;
  adminUid?: string;
  totalUsersCount: number;
  onNavigateToNotifications?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToContent?: () => void;
  onNavigateToActivity?: () => void;
  onNavigateToLetters?: () => void;
  onNavigateToFeelings?: () => void;
  onNavigateToBts?: () => void;
  onNavigateToSettings?: () => void;
}

export const TerminalSecurityPanel: React.FC<TerminalSecurityPanelProps> = ({
  adminEmail,
  adminUid,
  totalUsersCount,
  onNavigateToNotifications,
  onNavigateToUsers,
  onNavigateToContent,
  onNavigateToActivity,
  onNavigateToLetters,
  onNavigateToFeelings,
  onNavigateToBts,
  onNavigateToSettings,
}) => {
  const systemStatusItems = [
    { service: 'AUTHENTICATION', status: 'OK', protocol: 'Google Identity / Firebase' },
    { service: 'DATABASE', status: 'OK', protocol: 'Firestore (Snapshot Listeners)' },
    { service: 'STORAGE', status: 'OK', protocol: 'Firebase Storage (Media Bucket)' },
    { service: 'NOTIFICATIONS', status: 'OK', protocol: 'FCM / Cloud Messaging' },
    { service: 'FUNCTIONS', status: 'OK', protocol: 'Vite / Cloud Run Container' },
  ];

  const quickActions = [
    { label: 'MANAGE USERS', code: '01', onClick: onNavigateToUsers },
    { label: 'SEND NOTIFICATION', code: '02', onClick: onNavigateToNotifications },
    { label: 'REVIEW LETTERS', code: '03', onClick: onNavigateToLetters },
    { label: 'VIEW FEELINGS', code: '04', onClick: onNavigateToFeelings },
    { label: 'INSPECT BTS HUB', code: '05', onClick: onNavigateToBts },
    { label: 'MANAGE CONTENT', code: '06', onClick: onNavigateToContent },
    { label: 'OPEN ACTIVITY LOG', code: '07', onClick: onNavigateToActivity },
    { label: 'SYSTEM SETTINGS', code: '08', onClick: onNavigateToSettings },
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* ──────────────────────────────────────────────────
          1. SYSTEM HEALTH & TELEMETRY PANEL
          ────────────────────────────────────────────────── */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-950/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-cyan-400 font-semibold tracking-wider">
              /system/status
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30">
            HEALTH: 100%
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          {systemStatusItems.map((item) => (
            <div
              key={item.service}
              className="flex items-center justify-between py-1 px-2 rounded bg-[#020408] border border-emerald-950/50"
            >
              <span className="text-slate-400 text-[11px] font-medium">
                {item.service}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                <span className="text-emerald-300 font-semibold text-[11px]">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────
          2. SECURITY CREDENTIALS TELEMETRY PANEL
          ────────────────────────────────────────────────── */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-950/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-semibold tracking-wider">
              /security
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30">
            ENCRYPTED
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2 rounded bg-[#020408] border border-emerald-950/50 space-y-0.5">
            <div className="text-[10px] text-slate-400">ADMIN_IDENTITY</div>
            <div className="text-emerald-300 text-[11px] truncate">
              {adminEmail || 'admin@starlitletters.com'}
            </div>
          </div>

          <div className="p-2 rounded bg-[#020408] border border-emerald-950/50 space-y-0.5">
            <div className="text-[10px] text-slate-400">SESSION_TOKEN_UID</div>
            <div className="text-slate-300 text-[11px] truncate font-mono">
              {adminUid ? `${adminUid.substring(0, 16)}...` : 'ROOT_AUTHENTICATED'}
            </div>
          </div>

          <div className="p-2 rounded bg-[#020408] border border-emerald-950/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">SECURITY_RULES</span>
            <span className="text-emerald-400 text-[10px] font-semibold">
              isAdmin() ENFORCED
            </span>
          </div>

          <div className="p-2 rounded bg-[#020408] border border-emerald-950/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">REGISTERED_USERS</span>
            <span className="text-cyan-300 text-[11px] font-semibold">
              {totalUsersCount} PROFILES
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────
          3. QUICK ACTIONS TERMINAL PANEL
          ────────────────────────────────────────────────── */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-950/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-semibold tracking-wider">
              /quick-actions
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            INDEX: 8
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action.code}
              type="button"
              onClick={action.onClick}
              disabled={!action.onClick}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#020408] border border-emerald-950/80 hover:border-emerald-500/50 hover:bg-emerald-950/30 text-slate-300 hover:text-emerald-300 text-xs transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-[10px] group-hover:text-emerald-400 font-bold">
                  &gt; [{action.code}]
                </span>
                <span className="tracking-wide text-[11px]">{action.label}</span>
              </div>
              <ChevronRight className="w-3 h-3 text-emerald-600 group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
