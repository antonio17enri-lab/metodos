export type ASMEType = 'operation' | 'inspection' | 'transport' | 'delay' | 'storage' | 'combined';

export type ValueCategory = 'VA' | 'SVA' | 'NVA'; // Valor Agregado | Sin Valor Agregado pero Necesario | No Agrega Valor (Desperdicio/Muda)

export type WasteCategory =
  | 'tool_search'
  | 'waiting_material'
  | 'excess_motion'
  | 'rework'
  | 'overprocessing'
  | 'unnecessary_transport'
  | 'inventory_clutter'
  | 'none';

export interface WestinghouseRating {
  skill: number; // e.g. +0.06 Excelente B1, 0.00 Promedio
  effort: number;
  conditions: number;
  consistency: number;
}

export interface AllowanceFactors {
  personalNeeds: number; // Suplemento OIT Fijo: 5%
  basicFatigue: number; // Suplemento OIT Fijo: 4%
  standingWork: number; // De pie: 2%
  abnormalPosture: number; // Postura incómoda: 0-7%
  weightForce: number; // Uso de fuerza / peso: 0-15%
  lighting: number; // Iluminación: 0-5%
  mentalStrain: number; // Tensión mental / precisión: 0-8%
  monotony: number; // Monotonía: 0-4%
}

export interface Operation {
  id: string;
  order: number;
  name: string;
  station: string;
  operator: string;
  asmeType: ASMEType;
  valueType: ValueCategory;
  wasteCategory: WasteCategory;
  cyclesSec: number[];
  observedTimeSec: number;
  ratingFactor: number; // En porcentaje, ej. 100%
  normalTimeSec: number;
  allowancePercent: number; // En porcentaje, ej. 13%
  standardTimeSec: number;
  standardTimeMin: number;
  toolsUsed?: string;
  notes?: string;
}

export interface Process {
  id: string;
  name: string;
  code: string;
  industry: string;
  product: string;
  description: string;
  shiftHours: number; // Ej. 8 horas
  demandPerDay: number; // Ej. 60 unidades por día
  hourlyLaborCost: number; // Costo hora/hombre en Quetzales (Q), ej. Q 35.00
  operations: Operation[];
  isImprovedMethod?: boolean;
  baselineProcessId?: string;
  notesKaizen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineMetrics {
  totalObservedSec: number;
  totalObservedMin: number;
  totalStandardSec: number;
  totalStandardMin: number;
  valueAddedSec: number;
  valueAddedPercent: number;
  necessaryNonValueSec: number;
  necessaryNonValuePercent: number;
  wasteSec: number;
  wastePercent: number;
  taktTimeSec: number;
  taktTimeMin: number;
  bottleneckStation: string;
  bottleneckCycleSec: number;
  bottleneckCycleMin: number;
  lineEfficiency: number; // %
  balanceDelay: number; // %
  unitsPerHour: number;
  unitsPerShift: number;
  laborCostPerUnit: number;
  asmeSummary: {
    operation: { count: number; timeSec: number };
    inspection: { count: number; timeSec: number };
    transport: { count: number; timeSec: number };
    delay: { count: number; timeSec: number };
    storage: { count: number; timeSec: number };
    combined: { count: number; timeSec: number };
  };
}

export interface AIDiagnosticResult {
  source: 'gemini-3.8-flash' | 'rule-engine';
  diagnosticSummary: string;
  bottleneckAnalysis: string;
  fiveSRecommendations: string[];
  simulatedImprovements: {
    currentCycleMin: number;
    proposedCycleMin: number;
    timeSavedMin: number;
    productivityIncreasePercent: number;
    keyAction: string;
  };
}
