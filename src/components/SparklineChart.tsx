import { useId, useState } from 'react';
import { HistoryPoint, SensorStatus } from '../types/telemetry';
import { formatNumberAr } from '../utils/format';

interface SparklineChartProps {
  history: HistoryPoint[];
  status: SensorStatus;
  unit: string;
  decimals: number;
  minBound: number;
  maxBound: number;
  warningThreshold: number;
}

const STROKE_BY_STATUS: Record<SensorStatus, string> = {
  normal: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
};

export function SparklineChart({
  history,
  status,
  unit,
  decimals,
  minBound,
  maxBound,
  warningThreshold,
}: SparklineChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 280;
  const height = 64;
  const padY = 6;
  const padX = 2;

  const values = history.map((p) => p.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // Adaptive domain padded cleanly within bounds so small fluctuations remain visible
  const span = Math.max(dataMax - dataMin, (maxBound - minBound) * 0.14);
  const yMin = Math.max(minBound, dataMin - span * 0.28);
  const yMax = Math.min(maxBound, dataMax + span * 0.28);
  const effectiveSpan = Math.max(yMax - yMin, 0.1);

  const toX = (index: number) =>
    padX + (index / Math.max(history.length - 1, 1)) * (width - padX * 2);

  const toY = (val: number) =>
    height - padY - ((val - yMin) / effectiveSpan) * (height - padY * 2);

  const points = history.map((pt, idx) => ({
    x: toX(idx),
    y: toY(pt.value),
    ...pt,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`
      : '';

  const strokeColor = STROKE_BY_STATUS[status];
  const showThresholdLine = warningThreshold > yMin && warningThreshold < yMax;
  const thresholdY = toY(warningThreshold);

  const activePoint =
    hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Última hora</span>
        {activePoint ? (
          <span className="font-mono text-slate-200 tabular-nums">
            {activePoint.time} · {formatNumberAr(activePoint.value, decimals)} {unit}
          </span>
        ) : (
          <span className="font-mono tabular-nums">
            Mín {formatNumberAr(dataMin, decimals)} · Máx {formatNumberAr(dataMax, decimals)} {unit}
          </span>
        )}
      </div>

      <div
        className="relative h-16 w-full select-none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Gráfico de tendencia de la última hora en ${unit}`}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const idx = Math.round(relX * (points.length - 1));
            setHoverIndex(idx);
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {showThresholdLine && (
            <line
              x1={padX}
              y1={thresholdY}
              x2={width - padX}
              y2={thresholdY}
              stroke="rgba(245, 158, 11, 0.35)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activePoint ? (
            <>
              <line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={height}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3.5"
                fill={strokeColor}
                stroke="#0B0F17"
                strokeWidth="1.5"
              />
            </>
          ) : (
            points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3"
                fill={strokeColor}
              />
            )
          )}
        </svg>
      </div>
    </div>
  );
}
