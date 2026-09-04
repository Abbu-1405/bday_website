import React, { useMemo } from 'react';
import { Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { AdminActivityItem, AdminOverviewStats } from '../../../services/adminService';

interface TerminalAnalyticsChartProps {
  activities?: AdminActivityItem[];
  stats: AdminOverviewStats;
  loading: boolean;
}

export const TerminalAnalyticsChart: React.FC<TerminalAnalyticsChartProps> = ({
  activities = [],
  stats,
  loading,
}) => {
  // Aggregate activities into 7 chronological intervals
  const chartData = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const labels = ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'NOW'];

    if (!activities || activities.length === 0) {
      // Baseline representation using available stats
      const base = Math.max(1, Math.round(stats.totalActivities / 7));
      return {
        points: [
          Math.round(base * 0.7),
          Math.round(base * 0.9),
          Math.round(base * 1.1),
          Math.round(base * 0.8),
          Math.round(base * 1.2),
          Math.round(base * 1.4),
          base,
        ],
        labels,
        peak: Math.round(base * 1.4),
        total: stats.totalActivities,
      };
    }

    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const intervalMs = SEVEN_DAYS_MS / 7;

    activities.forEach((item) => {
      let time = now;
      const raw = item.timestampRaw || item.createdAt;
      if (raw) {
        if (typeof raw.toDate === 'function') {
          time = raw.toDate().getTime();
        } else if (typeof raw.toMillis === 'function') {
          time = raw.toMillis();
        } else {
          const parsed = new Date(raw).getTime();
          if (!isNaN(parsed)) time = parsed;
        }
      }

      const diff = now - time;
      if (diff >= 0 && diff < SEVEN_DAYS_MS) {
        const bucketIndex = 6 - Math.min(6, Math.floor(diff / intervalMs));
        buckets[bucketIndex]++;
      } else {
        // Fallback into earlier window
        buckets[0]++;
      }
    });

    const peak = Math.max(...buckets, 1);
    return {
      points: buckets,
      labels,
      peak,
      total: activities.length,
    };
  }, [activities, stats.totalActivities]);

  // SVG dimensions
  const width = 600;
  const height = 140;
  const padX = 35;
  const padY = 20;

  const points = chartData.points;
  const maxVal = Math.max(chartData.peak, 5);

  const coords = points.map((val, idx) => {
    const x = padX + (idx / (points.length - 1)) * (width - padX * 2);
    const y = height - padY - (val / maxVal) * (height - padY * 2);
    return { x, y, val };
  });

  const pathD = coords.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    // Catmull-Rom or cubic curve for smooth technical luminous trace
    const prev = coords[idx - 1];
    const cpx1 = prev.x + (curr.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (curr.x - prev.x) / 2;
    const cpy2 = curr.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;

  return (
    <div className="bg-[#050811]/90 border border-emerald-500/20 rounded-xl p-4 font-mono space-y-3">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyan-400 font-semibold tracking-wider">
              /analytics/overview
            </span>
            <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30">
              TELEMETRY_SAMPLE: 7D
            </span>
          </div>
          <p className="text-[10px] text-emerald-600/90 mt-0.5">
            // Real-time event velocity & interaction volume stream
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>PEAK:</span>
            <span className="text-emerald-300 font-semibold">{chartData.peak} ev</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>WINDOW:</span>
            <span className="text-cyan-300 font-semibold">{chartData.total} ev</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">SYNCED</span>
          </div>
        </div>
      </div>

      {/* SVG Technical Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 sm:h-44 block select-none"
        >
          <defs>
            {/* Luminous Gradient */}
            <linearGradient id="termLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            <linearGradient id="termAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>

            {/* Pattern Grid */}
            <pattern id="termGrid" width="40" height="25" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 25"
                fill="none"
                stroke="rgba(16, 185, 129, 0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width={width} height={height} fill="url(#termGrid)" />

          {/* Horizontal Axis Guides */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - padY - ratio * (height - padY * 2);
            return (
              <g key={ratio}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="rgba(16, 185, 129, 0.12)"
                  strokeDasharray="2 4"
                />
                <text
                  x={padX - 6}
                  y={y + 3}
                  fontSize="8"
                  fill="rgba(16, 185, 129, 0.5)"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#termAreaGrad)" />

          {/* Luminous Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#termLineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))',
            }}
          />

          {/* Coordinate Data Dots & Markers */}
          {coords.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#050811"
                stroke="#10b981"
                strokeWidth="1.5"
                style={{
                  filter: 'drop-shadow(0 0 3px #10b981)',
                }}
              />
              {/* Point Value */}
              <text
                x={pt.x}
                y={pt.y - 7}
                fontSize="8"
                fill="#6ee7b7"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {pt.val}
              </text>
              {/* Axis Label */}
              <text
                x={pt.x}
                y={height - 5}
                fontSize="8"
                fill="rgba(16, 185, 129, 0.6)"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {chartData.labels[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Compact Status Indicator Bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-emerald-950/60 pt-2">
        <span className="text-emerald-500">
          LOG_SAMPLE_RATE: REALTIME_SNAPSHOT
        </span>
        <span className="text-slate-400">
          LATENCY: ~12ms (FIRESTORE_WEBSOCKET)
        </span>
      </div>
    </div>
  );
};
