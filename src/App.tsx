import { MessageCircle } from 'lucide-react';
import { Footer } from './components/Footer';
import { SensorCard } from './components/SensorCard';
import { SimulationToolbar } from './components/SimulationToolbar';
import { SummaryStrip } from './components/SummaryStrip';
import { TopBar } from './components/TopBar';
import { WhatsAppAlertsPanel } from './components/WhatsAppAlertsPanel';
import { useIoTSimulation } from './hooks/useIoTSimulation';

const WHATSAPP_CTA_URL = `https://wa.me/5491164824115?text=${encodeURIComponent(
  'Hola JuanDo, vi la demo de DubIoT y quiero saber más'
)}`;

export default function App() {
  const {
    facility,
    facilityId,
    selectFacility,
    isLive,
    setIsLive,
    faults,
    toggleFault,
    normalizeAll,
    sensors,
    messages,
    sendOperatorReply,
    alertsToday,
    avoidedAlertsCount,
    operationalCount,
    activeFaultCount,
    estimatedMonthlySavingsArs,
    lastUpdated,
  } = useIoTSimulation();

  return (
    <div id="top" className="flex min-h-screen flex-col bg-[#0B0F17] text-slate-100">
      <TopBar
        facilityId={facilityId}
        onSelectFacility={selectFacility}
        isLive={isLive}
        onToggleLive={() => setIsLive((prev) => !prev)}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <SummaryStrip
          totalSensors={sensors.length}
          operationalCount={operationalCount}
          alertsToday={alertsToday}
          avoidedAlertsCount={avoidedAlertsCount}
          activeFaultCount={activeFaultCount}
          estimatedMonthlySavingsArs={estimatedMonthlySavingsArs}
          facilityName={facility.name}
          facilityTypeLabel={facility.typeLabel}
          lastUpdated={lastUpdated}
        />

        <SimulationToolbar
          faults={faults}
          onToggleFault={toggleFault}
          onNormalizeAll={normalizeAll}
        />

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_410px]">
          <section aria-label="Sensores en tiempo real">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))}
            </div>
          </section>

          <WhatsAppAlertsPanel
            messages={messages}
            onSendReply={sendOperatorReply}
            facilityName={facility.name}
          />
        </div>
      </main>

      <Footer />

      <a
        href={WHATSAPP_CTA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-40 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/40 transition-colors hover:bg-[#15803D] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>Quiero esto en mi edificio</span>
      </a>
    </div>
  );
}
