export type SensorId =
  | 'pump'
  | 'coldroom'
  | 'tank'
  | 'nightflow'
  | 'electrical'
  | 'air';

export type SensorStatus = 'normal' | 'warning' | 'critical';

export type FaultKey = 'pumpCut' | 'coldRoomOpen' | 'waterLeak' | 'powerSpike';

export type FacilityId = 'hotel' | 'building';

export interface HistoryPoint {
  time: string;
  value: number;
}

export interface SensorReading {
  id: SensorId;
  name: string;
  location: string;
  unit: string;
  value: number;
  decimals: number;
  operationalLabel: string;
  status: SensorStatus;
  statusText: string;
  optimalRangeText: string;
  warningThreshold: number;
  criticalThreshold: number;
  thresholdDirection: 'above' | 'below' | 'band';
  minBound: number;
  maxBound: number;
  history: HistoryPoint[];
  isAlertFlashing?: boolean;
}

export interface FaultState {
  pumpCut: boolean;
  coldRoomOpen: boolean;
  waterLeak: boolean;
  powerSpike: boolean;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'DubIoT Alertas' | 'Guardia Mantenimiento';
  text: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical' | 'resolved' | 'reply';
  sensorId?: SensorId;
}

export interface FacilityConfig {
  id: FacilityId;
  name: string;
  typeLabel: string;
  baseMonthlySavingsArs: number;
  locations: Record<SensorId, string>;
  electricalBaselineKw: number;
}
