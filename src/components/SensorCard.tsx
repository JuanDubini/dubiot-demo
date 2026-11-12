import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  ThermometerSnowflake,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import { SensorId, SensorReading, SensorStatus } from '../types/telemetry';
import { formatNumberAr } from '../utils/format';
import { SparklineChart } from './SparklineChart';

interface SensorCardProps {
  sensor: SensorReading;
}

const SENSOR_ICONS: Record<SensorId, typeof Gauge> = {
  pump: Gauge,
  coldroom: ThermometerSnowflake,
  tank: Waves,
  nightflow: Droplets,
  electrical: Zap,
  air: Wind,
};

const STATUS_STYLES: Record<
  SensorStatus,
  {
    cardBorder: string;
    statusColor: string;
    valueColor: string;
    Icon: typeof CheckCircle2;
  }
> = {
  normal: {
    cardBorder: 'border-white/[0.08] hover:border-white/[0.14]',
    statusColor: 'text-emerald-400',
    valueColor: 'text-slate-50',
    Icon: CheckCircle2,
  },
  warning: {
    cardBorder: 'border-amber-500/45 bg-[#16171C]',
    statusColor: 'text-amber-400',
    valueColor: 'text-amber-300',
    Icon: AlertTriangle,
  },
  critical: {
    cardBorder: 'border-red-500/55 bg-[#191319]',
    statusColor: 'text-red-400',
    valueColor: 'text-red-300',
    Icon: AlertCircle,
  },
};

export function SensorCard({ sensor }: SensorCardProps) {
  const SensorIcon = SENSOR_ICONS[sensor.id];
  const style = STATUS_STYLES[sensor.status];
  const StatusIcon = style.Icon;

  return (
    <article
      className={`flex flex-col justify-between rounded-xl border bg-[#111826] p-4 sm:p-5 transition-colors ${
        sensor.isAlertFlashing ? 'animate-alert-blink border-red-500/80' : style.cardBorder
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SensorIcon className="h-4 w-4 shrink-0 text-slate-400" />
              <h3 className="font-display text-base font-semibold text-slate-100 truncate">
                {sensor.name}
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 truncate">{sensor.location}</p>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${style.statusColor}`}
          >
            <StatusIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{sensor.statusText}</span>
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-mono text-3xl font-semibold tracking-tight tabular-nums ${style.valueColor}`}
            >
              {formatNumberAr(sensor.value, sensor.decimals)}
            </span>
            <span className="font-mono text-sm font-medium text-slate-400">
              {sensor.unit}
            </span>
          </div>

          <span
            className={`text-xs font-medium whitespace-nowrap ${
              sensor.status === 'critical'
                ? 'text-red-300'
                : sensor.status === 'warning'
                  ? 'text-amber-300'
                  : 'text-slate-300'
            }`}
          >
            {sensor.operationalLabel}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-3.5">
        <SparklineChart
          history={sensor.history}
          status={sensor.status}
          unit={sensor.unit}
          decimals={sensor.decimals}
          minBound={sensor.minBound}
          maxBound={sensor.maxBound}
          warningThreshold={sensor.warningThreshold}
        />

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Rango óptimo</span>
          <span className="font-mono text-slate-400 tabular-nums">
            {sensor.optimalRangeText}
          </span>
        </div>
      </div>
    </article>
  );
}
