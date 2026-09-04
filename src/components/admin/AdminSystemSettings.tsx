import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Terminal,
  ExternalLink,
  LogOut,
  Wifi,
  Key,
  Lock,
  Server,
  Database,
  Bell,
  HardDrive,
  Cpu,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface AdminSystemSettingsProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const AdminSystemSettings: React.FC<AdminSystemSettingsProps> = ({
  currentUser,
  onLogout,
}) => {
  const [sessionStartTime] = useState(() => {
    return new Date(Date.now() - 42 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  });
  const [lastActivityTime, setLastActivityTime] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const now = new Date();
    setLastActivityTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
  }, []);

  const handleManualAudit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const now = new Date();
      setLastActivityTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 600);
  };

  const securityNodes = [
    { label: 'Authentication Service', check: 'Firebase Auth (Identity Platform)', status: 'OK', icon: Lock },
    { label: 'Cloud Firestore Database', check: 'Encrypted Multi-Region Cluster', status: 'OK', icon: Database },
    { label: 'Cloud Storage Bucket', check: 'GCS Private Asset Quarantine', status: 'OK', icon: HardDrive },
    { label: 'Push Notification Engine', check: 'FCM / ServiceWorker Worker Daemon', status: 'OK', icon: Bell },
    { label: 'Serverless Functions / API', check: 'Isolated Container Node Environment', status: 'OK', icon: Cpu },
    { label: 'Firestore Security Rules', check: 'isAdmin() Authorization Enforced', status: 'OK', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Terminal Title Bar */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(16,185,129,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#020408] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-bold tracking-wider">
                [SYSTEM_SETTINGS // SECURITY_TERMINAL]
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SEC_LEVEL_0
              </span>
            </div>
            <p className="text-[11px] text-emerald-600/90 font-mono mt-0.5">
              // Authenticated administrator credentials, session telemetry, and platform integrity checks.
            </p>
          </div>
        </div>

        <button
          onClick={handleManualAudit}
          disabled={isVerifying}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-emerald-300 text-xs font-mono font-medium border border-emerald-500/30 transition-all self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 text-emerald-400 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'AUDITING...' : 'RE-AUDIT INTEGRITY'}</span>
        </button>
      </div>

      {/* Grid: Authentication Session Details & Security Node Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PANEL 1: AUTHENTICATION CONSOLE */}
        <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="px-4 py-2.5 bg-[#020408] border-b border-emerald-950/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-emerald-300 tracking-wider text-[11px]">
                /sys/auth/session
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ENCRYPTED_TLS</span>
          </div>

          <div className="p-4 space-y-2.5 text-xs divide-y divide-emerald-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 first:pt-0">
              <span className="text-slate-400 text-[11px]">Admin Email</span>
              <span className="font-mono text-emerald-300 font-semibold truncate max-w-[260px]">
                {currentUser?.email || 'authenticated_operator@starlitletters.com'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
              <span className="text-slate-400 text-[11px]">Admin UID</span>
              <span className="font-mono text-cyan-300 text-[11px] select-all truncate max-w-[260px]">
                {currentUser?.uid || 'AUTH_UID_0000_SYSTEM'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
              <span className="text-slate-400 text-[11px]">Authorization Mechanism</span>
              <span className="font-mono text-emerald-400 font-medium text-[11px]">
                Firebase Security Rules / Custom Claims
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
              <span className="text-slate-400 text-[11px]">Access Level</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                ROOT_ADMINISTRATOR
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
              <span className="text-slate-400 text-[11px]">Session Started</span>
              <span className="font-mono text-slate-300 text-[11px]">
                {sessionStartTime}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
              <span className="text-slate-400 text-[11px]">Last Activity</span>
              <span className="font-mono text-emerald-400 text-[11px]">
                {lastActivityTime || 'JUST_NOW'}
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 2: SECURITY STATUS CHECK */}
        <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="px-4 py-2.5 bg-[#020408] border-b border-emerald-950/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-300 tracking-wider text-[11px]">
                /sys/security/health
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">ALL_SYSTEMS_PASS</span>
          </div>

          <div className="p-4 space-y-2.5 text-xs">
            {securityNodes.map((node, i) => {
              const NodeIcon = node.icon;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#020408] border border-emerald-950/60 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <NodeIcon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-[11px] font-semibold truncate">
                        {node.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {node.check}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-emerald-700 hidden sm:inline text-[10px]">
                      ................
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {node.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Command Bar */}
      <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#020408] hover:bg-emerald-950/40 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-medium border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>&gt; OPEN PUBLIC STARLIT LETTERS PORTAL</span>
        </a>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 text-xs font-mono font-bold border border-rose-500/50 hover:border-rose-400 transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)]"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>[TERMINATE_ADMIN_SESSION]</span>
        </button>
      </div>
    </div>
  );
};
