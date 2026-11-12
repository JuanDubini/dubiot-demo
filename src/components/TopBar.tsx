import { Pause, Play } from 'lucide-react';
import { FacilityId } from '../types/telemetry';

interface TopBarProps {
  facilityId: FacilityId;
  onSelectFacility: (id: FacilityId) => void;
  isLive: boolean;
  onToggleLive: () => void;
}

export function TopBar({
  facilityId,
  onSelectFacility,
  isLive,
  onToggleLive,
}: TopBarProps) {
  return (
    <>
      <div className="border-b border-white/[0.06] bg-[#0F1726] px-4 py-1.5 text-center text-xs font-medium text-slate-300">
        Demo con datos simulados
      </div>

      <header className="z-30 border-b border-white/[0.08] bg-[#0B0F17]/95 backdrop-blur-md md:sticky md:top-0">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="font-mono text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
          >
            DubIoT
          </a>

          <nav
            aria-label="Seleccionar propiedad demo"
            className="flex items-center gap-1 rounded-lg bg-[#121927] p-1 border border-white/[0.06]"
          >
            <button
              type="button"
              onClick={() => onSelectFacility('hotel')}
              className={`min-h-[34px] rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                facilityId === 'hotel'
                  ? 'bg-slate-800 text-slate-50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hotel Demo
            </button>
            <button
              type="button"
              onClick={() => onSelectFacility('building')}
              className={`min-h-[34px] rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                facilityId === 'building'
                  ? 'bg-slate-800 text-slate-50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Edificio Demo
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onToggleLive}
              aria-pressed={isLive}
              className={`inline-flex min-h-[36px] items-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isLive
                  ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-white/10 bg-[#121927] text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isLive ? 'En vivo · 2s' : 'Pausado'}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
