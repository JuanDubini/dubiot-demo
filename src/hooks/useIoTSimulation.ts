import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FacilityConfig,
  FacilityId,
  FaultKey,
  FaultState,
  HistoryPoint,
  SensorId,
  SensorReading,
  SensorStatus,
  WhatsAppMessage,
} from '../types/telemetry';
import { formatNumberAr, formatTimeHHMM } from '../utils/format';
import { playAlertSound, unlockAlertAudio } from '../utils/sound';

export const FACILITIES: Record<FacilityId, FacilityConfig> = {
  hotel: {
    id: 'hotel',
    name: 'Hotel Demo',
    typeLabel: 'Hotelería · 12 pisos · 84 habitaciones',
    baseMonthlySavingsArs: 350000,
    electricalBaselineKw: 41.5,
    locations: {
      pump: 'Sala de máquinas · Subsuelo',
      coldroom: 'Cámara de frío 2 · Cocina',
      tank: 'Cisterna azotea · Piso 12',
      nightflow: 'Montante agua fría · PB',
      electrical: 'Tablero general · Subsuelo',
      air: 'Salón desayuno · Piso 1',
    },
  },
  building: {
    id: 'building',
    name: 'Edificio Demo',
    typeLabel: 'Edificio residencial · 18 pisos · 72 unidades',
    baseMonthlySavingsArs: 350000,
    electricalBaselineKw: 28.4,
    locations: {
      pump: 'Bomba presurizadora · Subsuelo',
      coldroom: 'Cámara SUM / Catering · PB',
      tank: 'Tanque reserva · Azotea',
      nightflow: 'Caño maestro · Subsuelo',
      electrical: 'Tablero servicios comunes',
      air: 'Cochera / Hall · Subsuelo 1',
    },
  },
};

const FAULT_AVOIDED_SAVINGS_ARS: Record<FaultKey, number> = {
  pumpCut: 45000,
  coldRoomOpen: 65000,
  waterLeak: 55000,
  powerSpike: 85000,
};

const INITIAL_FAULT_STATE: FaultState = {
  pumpCut: false,
  coldRoomOpen: false,
  waterLeak: false,
  powerSpike: false,
};

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function buildInitialHistory(
  baseValue: number,
  variance: number,
  min: number,
  max: number,
  decimals: number
): HistoryPoint[] {
  const now = Date.now();
  const points: HistoryPoint[] = [];
  let current = baseValue;
  for (let i = 29; i >= 0; i--) {
    const pointDate = new Date(now - i * 2 * 60 * 1000);
    const delta = (Math.random() - 0.5) * variance;
    current = clamp(current + delta * 0.6 + (baseValue - current) * 0.25, min, max);
    points.push({
      time: formatTimeHHMM(pointDate),
      value: Number(current.toFixed(decimals)),
    });
  }
  return points;
}

function createInitialSensors(facility: FacilityConfig): Record<SensorId, SensorReading> {
  const pumpHistory = buildInitialHistory(8.8, 0.7, 7.6, 10.2, 1);
  const coldHistory = buildInitialHistory(3.1, 0.4, 2.2, 4.1, 1);
  const tankHistory = buildInitialHistory(84, 2.0, 76, 92, 0);
  const flowHistory = buildInitialHistory(11, 4.0, 4, 18, 0);
  const elecHistory = buildInitialHistory(facility.electricalBaselineKw, 3.6, 22, 50, 1);
  const airHistory = buildInitialHistory(615, 42, 460, 740, 0);

  return {
    pump: {
      id: 'pump',
      name: 'Bomba de agua',
      location: facility.locations.pump,
      unit: 'A',
      value: pumpHistory[pumpHistory.length - 1].value,
      decimals: 1,
      operationalLabel: 'En marcha',
      status: 'normal',
      statusText: 'Normal',
      optimalRangeText: '6,5 – 12,0 A',
      warningThreshold: 12.0,
      criticalThreshold: 14.5,
      thresholdDirection: 'band',
      minBound: 0,
      maxBound: 16,
      history: pumpHistory,
    },
    coldroom: {
      id: 'coldroom',
      name: 'Cámara de frío',
      location: facility.locations.coldroom,
      unit: '°C',
      value: coldHistory[coldHistory.length - 1].value,
      decimals: 1,
      operationalLabel: 'Puerta cerrada',
      status: 'normal',
      statusText: 'Normal',
      optimalRangeText: '1,5 – 4,5 °C',
      warningThreshold: 5.0,
      criticalThreshold: 8.0,
      thresholdDirection: 'above',
      minBound: 0,
      maxBound: 14,
      history: coldHistory,
    },
    tank: {
      id: 'tank',
      name: 'Tanque de agua',
      location: facility.locations.tank,
      unit: '%',
      value: tankHistory[tankHistory.length - 1].value,
      decimals: 0,
      operationalLabel: 'Reserva óptima',
      status: 'normal',
      statusText: 'Normal',
      optimalRangeText: '65 – 95 %',
      warningThreshold: 60,
      criticalThreshold: 35,
      thresholdDirection: 'below',
      minBound: 0,
      maxBound: 100,
      history: tankHistory,
    },
    nightflow: {
      id: 'nightflow',
      name: 'Caudal nocturno',
      location: facility.locations.nightflow,
      unit: 'L/h',
      value: flowHistory[flowHistory.length - 1].value,
      decimals: 0,
      operationalLabel: 'Sin pérdidas',
      status: 'normal',
      statusText: 'Normal',
      optimalRangeText: '0 – 20 L/h',
      warningThreshold: 25,
      criticalThreshold: 80,
      thresholdDirection: 'above',
      minBound: 0,
      maxBound: 360,
      history: flowHistory,
    },
    electrical: {
      id: 'electrical',
      name: 'Tablero eléctrico',
      location: facility.locations.electrical,
      unit: 'kW',
      value: elecHistory[elecHistory.length - 1].value,
      decimals: 1,
      operationalLabel: 'Carga nominal',
      status: 'normal',
      statusText: 'Normal',
      optimalRangeText: '20 – 54 kW',
      warningThreshold: 54,
      criticalThreshold: 68,
      thresholdDirection: 'above',
      minBound: 15,
      maxBound: 95,
      history: elecHistory,
    },
    air: {
      id: 'air',
      name: 'Calidad de aire',
      location: facility.locations.air,
      unit: 'ppm',
      value: airHistory[airHistory.length - 1].value,
      decimals: 0,
      operationalLabel: 'CO₂ óptimo',
      status: 'normal',
      statusText: 'Normal',
      optimalRangeText: '400 – 800 ppm',
      warningThreshold: 800,
      criticalThreshold: 1150,
      thresholdDirection: 'above',
      minBound: 350,
      maxBound: 1400,
      history: airHistory,
    },
  };
}

function createInitialMessages(): WhatsAppMessage[] {
  return [
    {
      id: 'seed-1',
      sender: 'DubIoT Alertas',
      text: '🚰 Consumo de agua a las 03:12: posible fuga (195 L/h en montante).',
      timestamp: '03:12',
      severity: 'warning',
      sensorId: 'nightflow',
    },
    {
      id: 'seed-2',
      sender: 'Guardia Mantenimiento',
      text: 'Válvula de sector B cerrada. Revisamos junta mañana a primera hora.',
      timestamp: '03:24',
      severity: 'reply',
      sensorId: 'nightflow',
    },
    {
      id: 'seed-3',
      sender: 'DubIoT Alertas',
      text: '✅ Caudal nocturno normalizado en 11 L/h. Ahorro estimado evitado: $ 55.000.',
      timestamp: '03:26',
      severity: 'resolved',
      sensorId: 'nightflow',
    },
    {
      id: 'seed-4',
      sender: 'DubIoT Alertas',
      text: 'ℹ️ Chequeo matinal: 6 de 6 sensores en línea y dentro de rango operativo.',
      timestamp: '08:30',
      severity: 'info',
    },
  ];
}

function evaluatePumpStatus(value: number, cut: boolean): { status: SensorStatus; statusText: string; op: string } {
  if (cut || value <= 0.1) {
    return { status: 'critical', statusText: 'Crítico', op: 'Detenida' };
  }
  if (value > 14.5) {
    return { status: 'critical', statusText: 'Crítico', op: 'Sobrecarga' };
  }
  if (value > 12.0 || value < 6.5) {
    return { status: 'warning', statusText: 'Precaución', op: 'Carga irregular' };
  }
  return { status: 'normal', statusText: 'Normal', op: 'En marcha' };
}

function evaluateColdRoomStatus(
  value: number,
  doorOpen: boolean
): { status: SensorStatus; statusText: string; op: string } {
  if (value >= 8.0) {
    return {
      status: 'critical',
      statusText: 'Crítico',
      op: doorOpen ? 'Puerta abierta' : 'Fuera de rango',
    };
  }
  if (doorOpen || value >= 4.8) {
    return {
      status: 'warning',
      statusText: 'Precaución',
      op: doorOpen ? 'Puerta abierta' : 'Temp. en ascenso',
    };
  }
  return { status: 'normal', statusText: 'Normal', op: 'Puerta cerrada' };
}

function evaluateTankStatus(value: number): { status: SensorStatus; statusText: string; op: string } {
  if (value < 35) {
    return { status: 'critical', statusText: 'Crítico', op: 'Nivel crítico' };
  }
  if (value < 60) {
    return { status: 'warning', statusText: 'Precaución', op: 'Nivel en descenso' };
  }
  return { status: 'normal', statusText: 'Normal', op: 'Reserva óptima' };
}

function evaluateFlowStatus(value: number): { status: SensorStatus; statusText: string; op: string } {
  if (value > 80) {
    return { status: 'critical', statusText: 'Crítico', op: 'Posible fuga' };
  }
  if (value > 25) {
    return { status: 'warning', statusText: 'Precaución', op: 'Flujo elevado' };
  }
  return { status: 'normal', statusText: 'Normal', op: 'Sin pérdidas' };
}

function evaluateElectricalStatus(value: number): { status: SensorStatus; statusText: string; op: string } {
  if (value > 68) {
    return { status: 'critical', statusText: 'Crítico', op: 'Pico tarifario' };
  }
  if (value > 54) {
    return { status: 'warning', statusText: 'Precaución', op: 'Demanda alta' };
  }
  return { status: 'normal', statusText: 'Normal', op: 'Carga nominal' };
}

function evaluateAirStatus(value: number): { status: SensorStatus; statusText: string; op: string } {
  if (value > 1150) {
    return { status: 'critical', statusText: 'Crítico', op: 'CO₂ elevado' };
  }
  if (value > 800) {
    return { status: 'warning', statusText: 'Precaución', op: 'Ventilar zona' };
  }
  return { status: 'normal', statusText: 'Normal', op: 'CO₂ óptimo' };
}

export function useIoTSimulation() {
  const [facilityId, setFacilityId] = useState<FacilityId>('hotel');
  const [isLive, setIsLive] = useState(true);
  const [faults, setFaults] = useState<FaultState>(INITIAL_FAULT_STATE);
  const [sensors, setSensors] = useState<Record<SensorId, SensorReading>>(() =>
    createInitialSensors(FACILITIES.hotel)
  );
  const [messages, setMessages] = useState<WhatsAppMessage[]>(createInitialMessages);
  const [alertsToday, setAlertsToday] = useState<number>(1);
  const [avoidedAlertsCount, setAvoidedAlertsCount] = useState<number>(4);
  const [estimatedMonthlySavingsArs, setEstimatedMonthlySavingsArs] = useState<number>(
    FACILITIES.hotel.baseMonthlySavingsArs
  );
  const [flashingUntilBySensor, setFlashingUntilBySensor] = useState<Partial<Record<SensorId, number>>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  const faultsRef = useRef(faults);
  faultsRef.current = faults;
  const facilityRef = useRef(FACILITIES[facilityId]);
  facilityRef.current = FACILITIES[facilityId];
  const coldCriticalSentRef = useRef(false);
  const tankCriticalSentRef = useRef(false);
  const coldOpenTicksRef = useRef(0);

  const triggerSensorFlash = useCallback((sensorId?: SensorId) => {
    if (!sensorId) return;
    const until = Date.now() + 6500;
    setFlashingUntilBySensor((prev) => ({ ...prev, [sensorId]: until }));
  }, []);

  const pushMessage = useCallback(
    (
      text: string,
      severity: WhatsAppMessage['severity'],
      sender: WhatsAppMessage['sender'] = 'DubIoT Alertas',
      sensorId?: SensorId
    ) => {
      const now = new Date();
      const newMsg: WhatsAppMessage = {
        id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
        sender,
        text,
        timestamp: formatTimeHHMM(now),
        severity,
        sensorId,
      };
      setMessages((prev) => [...prev.slice(-39), newMsg]);
      if (severity === 'warning' || severity === 'critical') {
        setAlertsToday((count) => count + 1);
        playAlertSound(severity);
        triggerSensorFlash(sensorId);
      }
    },
    [triggerSensorFlash]
  );

  const selectFacility = useCallback((nextId: FacilityId) => {
    setFacilityId(nextId);
    setFaults(INITIAL_FAULT_STATE);
    coldCriticalSentRef.current = false;
    tankCriticalSentRef.current = false;
    coldOpenTicksRef.current = 0;
    setSensors(createInitialSensors(FACILITIES[nextId]));
    setMessages(createInitialMessages());
    setAlertsToday(1);
    setAvoidedAlertsCount(4);
    setEstimatedMonthlySavingsArs(FACILITIES[nextId].baseMonthlySavingsArs);
    setFlashingUntilBySensor({});
    setLastUpdated(new Date());
  }, []);

  const toggleFault = useCallback(
    (faultKey: FaultKey) => {
      unlockAlertAudio();
      const wasActive = faultsRef.current[faultKey];
      const nextActive = !wasActive;

      setFaults((prev) => ({ ...prev, [faultKey]: nextActive }));

      if (faultKey === 'pumpCut') {
        if (nextActive) {
          setSensors((prev) => ({
            ...prev,
            pump: {
              ...prev.pump,
              value: 0,
              operationalLabel: 'Detenida',
              status: 'critical',
              statusText: 'Crítico',
            },
          }));
          pushMessage(
            '🔴 Bomba de agua: 0,0 A, equipo detenido. Revisar térmica en sala de máquinas.',
            'critical',
            'DubIoT Alertas',
            'pump'
          );
        } else {
          tankCriticalSentRef.current = false;
          setAvoidedAlertsCount((c) => c + 1);
          setEstimatedMonthlySavingsArs((s) => s + FAULT_AVOIDED_SAVINGS_ARS.pumpCut);
          pushMessage(
            '✅ Bomba de agua restablecida: 8,7 A en marcha nominal (+$ 45.000 daño evitado).',
            'resolved',
            'DubIoT Alertas',
            'pump'
          );
        }
      }

      if (faultKey === 'coldRoomOpen') {
        if (nextActive) {
          coldCriticalSentRef.current = false;
          coldOpenTicksRef.current = 0;
          setSensors((prev) => ({
            ...prev,
            coldroom: {
              ...prev.coldroom,
              operationalLabel: 'Puerta abierta',
              status: 'warning',
              statusText: 'Precaución',
            },
          }));
          pushMessage(
            '⚠️ Cámara de frío 2: puerta abierta detectada, temperatura en ascenso.',
            'warning',
            'DubIoT Alertas',
            'coldroom'
          );
        } else {
          coldCriticalSentRef.current = false;
          coldOpenTicksRef.current = 0;
          setAvoidedAlertsCount((c) => c + 1);
          setEstimatedMonthlySavingsArs((s) => s + FAULT_AVOIDED_SAVINGS_ARS.coldRoomOpen);
          pushMessage(
            '✅ Cámara de frío 2: puerta cerrada. Mercadería protegida (+$ 65.000 ahorro estimado).',
            'resolved',
            'DubIoT Alertas',
            'coldroom'
          );
        }
      }

      if (faultKey === 'waterLeak') {
        if (nextActive) {
          setSensors((prev) => ({
            ...prev,
            nightflow: {
              ...prev.nightflow,
              value: 285,
              operationalLabel: 'Posible fuga',
              status: 'critical',
              statusText: 'Crítico',
            },
          }));
          pushMessage(
            '🚰 Caudal nocturno elevado (285 L/h): posible fuga continua en montante.',
            'critical',
            'DubIoT Alertas',
            'nightflow'
          );
        } else {
          tankCriticalSentRef.current = false;
          setAvoidedAlertsCount((c) => c + 1);
          setEstimatedMonthlySavingsArs((s) => s + FAULT_AVOIDED_SAVINGS_ARS.waterLeak);
          pushMessage(
            '✅ Fuga contenida: caudal descendiendo a valores normales (+$ 55.000 ahorro en agua).',
            'resolved',
            'DubIoT Alertas',
            'nightflow'
          );
        }
      }

      if (faultKey === 'powerSpike') {
        if (nextActive) {
          setSensors((prev) => ({
            ...prev,
            electrical: {
              ...prev.electrical,
              value: 84.2,
              operationalLabel: 'Pico tarifario',
              status: 'critical',
              statusText: 'Crítico',
            },
          }));
          pushMessage(
            '⚡ Tablero eléctrico general: pico de demanda supera 80 kW. Riesgo de multa por potencia.',
            'critical',
            'DubIoT Alertas',
            'electrical'
          );
        } else {
          setAvoidedAlertsCount((c) => c + 1);
          setEstimatedMonthlySavingsArs((s) => s + FAULT_AVOIDED_SAVINGS_ARS.powerSpike);
          pushMessage(
            '✅ Tablero eléctrico normalizado debajo del límite contratado (+$ 85.000 pico evitado).',
            'resolved',
            'DubIoT Alertas',
            'electrical'
          );
        }
      }
    },
    [pushMessage]
  );

  const normalizeAll = useCallback(() => {
    unlockAlertAudio();
    const active = faultsRef.current;
    const activeKeys = (Object.keys(active) as FaultKey[]).filter((k) => active[k]);
    if (activeKeys.length === 0) return;

    const addedSavings = activeKeys.reduce(
      (acc, key) => acc + FAULT_AVOIDED_SAVINGS_ARS[key],
      0
    );

    setFaults(INITIAL_FAULT_STATE);
    coldCriticalSentRef.current = false;
    tankCriticalSentRef.current = false;
    coldOpenTicksRef.current = 0;
    setFlashingUntilBySensor({});
    setAvoidedAlertsCount((c) => c + activeKeys.length);
    setEstimatedMonthlySavingsArs((s) => s + addedSavings);

    pushMessage(
      `✅ Sistema normalizado por operador (${activeKeys.length} ${
        activeKeys.length === 1 ? 'alerta atendida' : 'alertas atendidas'
      }). Todos los sensores en rango óptimo.`,
      'resolved',
      'DubIoT Alertas'
    );
  }, [pushMessage]);

  const sendOperatorReply = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      pushMessage(trimmed, 'reply', 'Guardia Mantenimiento');
    },
    [pushMessage]
  );

  useEffect(() => {
    if (!isLive) return;

    const timer = window.setInterval(() => {
      const now = new Date();
      const timeLabel = formatTimeHHMM(now);
      const currentFaults = faultsRef.current;
      const facility = facilityRef.current;

      setSensors((prev) => {
        const nextPumpVal = currentFaults.pumpCut
          ? 0
          : Number(
              clamp(
                prev.pump.value === 0
                  ? 8.7
                  : prev.pump.value + (Math.random() - 0.5) * 0.6 + (8.8 - prev.pump.value) * 0.25,
                7.6,
                10.4
              ).toFixed(1)
            );
        const pumpMeta = evaluatePumpStatus(nextPumpVal, currentFaults.pumpCut);

        let nextColdVal: number;
        if (currentFaults.coldRoomOpen) {
          coldOpenTicksRef.current += 1;
          const step = prev.coldroom.value < 6.0 ? 1.45 : prev.coldroom.value < 9.4 ? 1.1 : 0.2;
          nextColdVal = Number(
            clamp(prev.coldroom.value + step + (Math.random() - 0.35) * 0.25, 2.0, 11.4).toFixed(1)
          );
          if (nextColdVal >= 8.2 && !coldCriticalSentRef.current) {
            coldCriticalSentRef.current = true;
            const displayMins = Math.max(4, coldOpenTicksRef.current + 3);
            pushMessage(
              `⚠️ Cámara de frío 2: ${formatNumberAr(nextColdVal, 1)} °C, puerta abierta hace ${displayMins} min`,
              'critical',
              'DubIoT Alertas',
              'coldroom'
            );
          }
        } else {
          nextColdVal = Number(
            clamp(
              prev.coldroom.value + (3.2 - prev.coldroom.value) * 0.35 + (Math.random() - 0.5) * 0.25,
              2.1,
              11.4
            ).toFixed(1)
          );
        }
        const coldMeta = evaluateColdRoomStatus(nextColdVal, currentFaults.coldRoomOpen);

        const nextFlowVal = currentFaults.waterLeak
          ? Math.round(
              clamp(
                prev.nightflow.value < 150
                  ? 265 + Math.random() * 45
                  : prev.nightflow.value + (Math.random() - 0.48) * 32,
                220,
                345
              )
            )
          : Math.round(
              clamp(
                prev.nightflow.value > 40
                  ? prev.nightflow.value * 0.38
                  : prev.nightflow.value + (Math.random() - 0.5) * 4 + (11 - prev.nightflow.value) * 0.3,
                4,
                19
              )
            );
        const flowMeta = evaluateFlowStatus(nextFlowVal);

        let tankDelta = (84 - prev.tank.value) * 0.22 + (Math.random() - 0.5) * 1.6;
        if (currentFaults.pumpCut && currentFaults.waterLeak) {
          tankDelta = -5.5;
        } else if (currentFaults.pumpCut) {
          tankDelta = -3.2;
        } else if (currentFaults.waterLeak) {
          tankDelta = -2.4;
        }
        const nextTankVal = Math.round(clamp(prev.tank.value + tankDelta, 12, 96));
        if (nextTankVal < 35 && !tankCriticalSentRef.current) {
          tankCriticalSentRef.current = true;
          pushMessage(
            `🚨 Tanque de agua en nivel crítico (${nextTankVal}%). Autonomía estimada < 45 min.`,
            'critical',
            'DubIoT Alertas',
            'tank'
          );
        }
        const tankMeta = evaluateTankStatus(nextTankVal);

        const targetElec = currentFaults.powerSpike ? 84.5 : facility.electricalBaselineKw;
        const nextElecVal = Number(
          clamp(
            prev.electrical.value +
              (targetElec - prev.electrical.value) * (currentFaults.powerSpike ? 0.55 : 0.35) +
              (Math.random() - 0.5) * (currentFaults.powerSpike ? 4.4 : 2.1),
            18,
            94
          ).toFixed(1)
        );
        const elecMeta = evaluateElectricalStatus(nextElecVal);

        const targetAir = currentFaults.powerSpike ? 875 : 615;
        const nextAirVal = Math.round(
          clamp(
            prev.air.value + (targetAir - prev.air.value) * 0.18 + (Math.random() - 0.5) * 26,
            430,
            1350
          )
        );
        const airMeta = evaluateAirStatus(nextAirVal);

        const pushHistory = (hist: HistoryPoint[], val: number): HistoryPoint[] => [
          ...hist.slice(-29),
          { time: timeLabel, value: val },
        ];

        return {
          pump: {
            ...prev.pump,
            value: nextPumpVal,
            operationalLabel: pumpMeta.op,
            status: pumpMeta.status,
            statusText: pumpMeta.statusText,
            history: pushHistory(prev.pump.history, nextPumpVal),
          },
          coldroom: {
            ...prev.coldroom,
            value: nextColdVal,
            operationalLabel: coldMeta.op,
            status: coldMeta.status,
            statusText: coldMeta.statusText,
            history: pushHistory(prev.coldroom.history, nextColdVal),
          },
          tank: {
            ...prev.tank,
            value: nextTankVal,
            operationalLabel: tankMeta.op,
            status: tankMeta.status,
            statusText: tankMeta.statusText,
            history: pushHistory(prev.tank.history, nextTankVal),
          },
          nightflow: {
            ...prev.nightflow,
            value: nextFlowVal,
            operationalLabel: flowMeta.op,
            status: flowMeta.status,
            statusText: flowMeta.statusText,
            history: pushHistory(prev.nightflow.history, nextFlowVal),
          },
          electrical: {
            ...prev.electrical,
            value: nextElecVal,
            operationalLabel: elecMeta.op,
            status: elecMeta.status,
            statusText: elecMeta.statusText,
            history: pushHistory(prev.electrical.history, nextElecVal),
          },
          air: {
            ...prev.air,
            value: nextAirVal,
            operationalLabel: airMeta.op,
            status: airMeta.status,
            statusText: airMeta.statusText,
            history: pushHistory(prev.air.history, nextAirVal),
          },
        };
      });

      setLastUpdated(now);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [isLive, pushMessage]);

  const nowMs = Date.now();
  const sensorList: SensorReading[] = [
    sensors.pump,
    sensors.coldroom,
    sensors.tank,
    sensors.nightflow,
    sensors.electrical,
    sensors.air,
  ].map((s) => ({
    ...s,
    isAlertFlashing:
      s.status === 'critical' || Boolean(flashingUntilBySensor[s.id] && (flashingUntilBySensor[s.id] ?? 0) > nowMs),
  }));

  const operationalCount = sensorList.filter((s) => s.status === 'normal').length;
  const activeFaultCount = Object.values(faults).filter(Boolean).length;
  const facility = FACILITIES[facilityId];

  return {
    facility,
    facilityId,
    selectFacility,
    isLive,
    setIsLive,
    faults,
    toggleFault,
    normalizeAll,
    sensors: sensorList,
    messages,
    sendOperatorReply,
    alertsToday,
    avoidedAlertsCount,
    operationalCount,
    activeFaultCount,
    estimatedMonthlySavingsArs,
    lastUpdated,
  };
}
