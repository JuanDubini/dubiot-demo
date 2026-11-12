import { DoorOpen, Droplets, PowerOff, RotateCcw, Zap } from 'lucide-react';
import { FaultKey, FaultState } from '../types/telemetry';

interface SimulationToolbarProps {
  faults: FaultState;
  onToggleFault: (key: FaultKey) => void;
  onNormalizeAll: () => void;
}

interface FaultButtonConfig {
  key: FaultKey;
  label: string;
  activeLabel: string;
  icon: typeof PowerOff;
}

const FAULT_BUTTONS: FaultButtonConfig[] = [
  {
    key: 'pumpCut',
    label: 'Cortar bomba',
    activeLabel: 'Restaurar bomba',
    icon: PowerOff,
  },
  {
    key: 'coldRoomOpen',
    label: 'Abrir puerta de cámara',
    activeLabel: 'Cerrar puerta de cámara',
    icon: DoorOpen,
  },
  {
    key: 'waterLeak',
    label: 'Simular fuga',
    activeLabel: 'Detener fuga',
    icon: Droplets,
  },
  {
    key: 'powerSpike',
    label: 'Pico de consumo',
    activeLabel: 'Normalizar consumo',
    icon: Zap,
  },
];

export function SimulationToolbar({
  faults,
  onToggleFault,
  onNormalizeAll,
}: SimulationToolbarProps) {
  const hasActiveFaults = Object.values(faults).some(Boolean);

  return (
    <section
      aria-label="Simulador de fallas para demostración"
      className="rounded-xl border border-white/[0.08] bg-[#111826] p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-0.5">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Simular fallas en vivo
          </h2>
          <p className="text-xs text-slate-400">
            Activá un escenario para ver la reacción de los sensores y las alertas automáticas por WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {FAULT_BUTTONS.map((btn) => {
            const active = faults[btn.key];
            const Icon = btn.icon;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => onToggleFault(btn.key)}
                aria-pressed={active}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  active
                    ? 'border-red-500/60 bg-red-500/15 text-red-200 hover:bg-red-500/25'
                    : 'border-white/10 bg-[#172033] text-slate-200 hover:border-white/20 hover:bg-[#1E293B]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{active ? btn.activeLabel : btn.label}</span>
              </button>
            );
          })}

          {hasActiveFaults && (
            <button
              type="button"
              onClick={onNormalizeAll}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-500/25 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <RotateCcw className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Normalizar todo</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
