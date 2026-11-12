import { formatCurrencyArs, formatTimeHHMMSS } from '../utils/format';

interface SummaryStripProps {
  totalSensors: number;
  operationalCount: number;
  alertsToday: number;
  avoidedAlertsCount: number;
  activeFaultCount: number;
  estimatedMonthlySavingsArs: number;
  facilityName: string;
  facilityTypeLabel: string;
  lastUpdated: Date;
}

export function SummaryStrip({
  totalSensors,
  operationalCount,
  alertsToday,
  avoidedAlertsCount,
  activeFaultCount,
  estimatedMonthlySavingsArs,
  facilityName,
  facilityTypeLabel,
  lastUpdated,
}: SummaryStripProps) {
  return (
    <section aria-label="Resumen operativo" className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl text-balance">
            Monitoreo en vivo · {facilityName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {facilityTypeLabel}
          </p>
        </div>
        <p className="font-mono text-xs text-slate-400 tabular-nums">
          Última lectura: {formatTimeHHMMSS(lastUpdated)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#111826] p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-400">Equipos monitoreados</p>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-semibold text-slate-50 tabular-nums sm:text-3xl">
              {totalSensors}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              {operationalCount} de {totalSensors} en rango óptimo
            </span>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 sm:p-5 transition-colors ${
            activeFaultCount > 0
              ? 'border-red-500/40 bg-[#18141E]'
              : 'border-white/[0.08] bg-[#111826]'
          }`}
        >
          <p className="text-xs font-medium text-slate-400">Alertas de hoy</p>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span
              className={`font-mono text-2xl font-semibold tabular-nums sm:text-3xl ${
                activeFaultCount > 0 ? 'text-red-400' : 'text-slate-50'
              }`}
            >
              {alertsToday}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              {activeFaultCount > 0
                ? `${activeFaultCount} ${activeFaultCount === 1 ? 'falla activa ahora' : 'fallas activas ahora'}`
                : 'Notificaciones enviadas a WhatsApp'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#111826] p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-400">Ahorro estimado del mes</p>
          <div className="mt-2 flex items-baseline gap-2.5 flex-wrap">
            <span className="font-mono text-2xl font-semibold text-emerald-400 tabular-nums sm:text-3xl">
              {formatCurrencyArs(estimatedMonthlySavingsArs)}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              {avoidedAlertsCount} {avoidedAlertsCount === 1 ? 'alerta evitada' : 'alertas evitadas'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
