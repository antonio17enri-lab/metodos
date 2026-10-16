import { Operation, Process, LineMetrics, WestinghouseRating, AllowanceFactors } from '../types/methodox';

/**
 * Calcula el tiempo observado promedio a partir de un conjunto de ciclos
 */
export function calculateObservedTime(cycles: number[]): number {
  if (!cycles || cycles.length === 0) return 0;
  const sum = cycles.reduce((acc, c) => acc + c, 0);
  return parseFloat((sum / cycles.length).toFixed(2));
}

/**
 * Calcula el tamaño de muestra recomendado (Fórmula OIT/Maytag con 95% de confianza y 5% margen de error)
 * N' = [ (40 * sqrt(n * sum(x^2) - (sum(x))^2)) / sum(x) ]^2
 */
export function calculateRecommendedSampleSize(cycles: number[]): number {
  const n = cycles.length;
  if (n < 2) return 5;
  const sum = cycles.reduce((a, b) => a + b, 0);
  const sumSq = cycles.reduce((a, b) => a + b * b, 0);
  const numerator = n * sumSq - sum * sum;
  if (numerator <= 0 || sum === 0) return n;
  
  const val = (40 * Math.sqrt(numerator)) / sum;
  const nPrime = Math.pow(val, 2);
  return Math.min(50, Math.max(3, Math.ceil(nPrime)));
}

/**
 * Calcula el Tiempo Normal: TN = TO * (Ritmo / 100)
 */
export function calculateNormalTime(observedSec: number, ratingFactor: number): number {
  return parseFloat((observedSec * (ratingFactor / 100)).toFixed(2));
}

/**
 * Calcula el Tiempo Estándar: TE = TN * (1 + Suplementos / 100)
 */
export function calculateStandardTime(normalSec: number, allowancePercent: number): number {
  return parseFloat((normalSec * (1 + allowancePercent / 100)).toFixed(2));
}

/**
 * Suma de suplementos OIT
 */
export function calculateTotalAllowance(factors: AllowanceFactors): number {
  return (
    factors.personalNeeds +
    factors.basicFatigue +
    factors.standingWork +
    factors.abnormalPosture +
    factors.weightForce +
    factors.lighting +
    factors.mentalStrain +
    factors.monotony
  );
}

/**
 * Sistema Westinghouse de Calificación de Ritmo
 * Base 100% + Suma algebraica de factores
 */
export function calculateWestinghouseRating(rating: WestinghouseRating): number {
  const sumAlgebraic = rating.skill + rating.effort + rating.conditions + rating.consistency;
  return Math.round((1 + sumAlgebraic) * 100);
}

/**
 * Calcula todas las métricas de balanceo de línea e ingeniería de métodos para un proceso
 */
export function calculateLineMetrics(process: Process): LineMetrics {
  const operations = process.operations || [];
  
  let totalObservedSec = 0;
  let totalStandardSec = 0;
  let valueAddedSec = 0;
  let necessaryNonValueSec = 0;
  let wasteSec = 0;

  const asmeSummary = {
    operation: { count: 0, timeSec: 0 },
    inspection: { count: 0, timeSec: 0 },
    transport: { count: 0, timeSec: 0 },
    delay: { count: 0, timeSec: 0 },
    storage: { count: 0, timeSec: 0 },
    combined: { count: 0, timeSec: 0 },
  };

  // Agrupamiento por estaciones
  const stationTimes: Record<string, number> = {};

  operations.forEach((op) => {
    const stdTime = op.standardTimeSec > 0 
      ? op.standardTimeSec 
      : calculateStandardTime(op.normalTimeSec || (op.observedTimeSec * (op.ratingFactor / 100)), op.allowancePercent || 12);
    
    totalObservedSec += op.observedTimeSec || 0;
    totalStandardSec += stdTime;

    if (op.valueType === 'VA') {
      valueAddedSec += stdTime;
    } else if (op.valueType === 'SVA') {
      necessaryNonValueSec += stdTime;
    } else {
      wasteSec += stdTime;
    }

    if (asmeSummary[op.asmeType]) {
      asmeSummary[op.asmeType].count += 1;
      asmeSummary[op.asmeType].timeSec += stdTime;
    }

    const stationKey = op.station || 'Estación General';
    stationTimes[stationKey] = (stationTimes[stationKey] || 0) + stdTime;
  });

  // Takt Time: Tiempo disponible de turno / Demanda diaria
  // 8 horas = 28,800 segundos
  const availableSeconds = (process.shiftHours || 8) * 3600;
  const demand = process.demandPerDay > 0 ? process.demandPerDay : 60;
  const taktTimeSec = parseFloat((availableSeconds / demand).toFixed(1));

  // Identificar cuello de botella
  const stationsList = Object.entries(stationTimes);
  let bottleneckStation = 'Sin estación';
  let bottleneckCycleSec = 0;

  if (stationsList.length > 0) {
    stationsList.forEach(([stName, stTime]) => {
      if (stTime > bottleneckCycleSec) {
        bottleneckCycleSec = stTime;
        bottleneckStation = stName;
      }
    });
  } else {
    bottleneckCycleSec = totalStandardSec;
  }

  // Eficiencia de balanceo: E = (Suma TE) / (N° estaciones * Cuello de Botella) * 100%
  const numStations = Math.max(1, stationsList.length);
  const lineEfficiency = totalStandardSec > 0 && bottleneckCycleSec > 0 
    ? parseFloat(((totalStandardSec / (numStations * bottleneckCycleSec)) * 100).toFixed(1))
    : 0;
  
  const balanceDelay = totalStandardSec > 0 ? parseFloat((100 - lineEfficiency).toFixed(1)) : 0;

  // Capacidad de producción
  // El ritmo de la línea lo marca la estación cuello de botella (o el total si es monoestación)
  const cycleTimeForOutput = bottleneckCycleSec > 0 ? bottleneckCycleSec : 0;
  const unitsPerHour = cycleTimeForOutput > 0 ? parseFloat((3600 / cycleTimeForOutput).toFixed(1)) : 0;
  const unitsPerShift = Math.floor(unitsPerHour * (process.shiftHours || 8));

  // Costo de mano de obra por unidad
  const totalHourlyCost = (process.hourlyLaborCost || 35.0) * numStations;
  const laborCostPerUnit = unitsPerHour > 0 ? parseFloat((totalHourlyCost / unitsPerHour).toFixed(2)) : 0;

  return {
    totalObservedSec: parseFloat(totalObservedSec.toFixed(2)),
    totalObservedMin: parseFloat((totalObservedSec / 60).toFixed(2)),
    totalStandardSec: parseFloat(totalStandardSec.toFixed(2)),
    totalStandardMin: parseFloat((totalStandardSec / 60).toFixed(2)),
    valueAddedSec: parseFloat(valueAddedSec.toFixed(2)),
    valueAddedPercent: totalStandardSec > 0 ? parseFloat(((valueAddedSec / totalStandardSec) * 100).toFixed(1)) : 0,
    necessaryNonValueSec: parseFloat(necessaryNonValueSec.toFixed(2)),
    necessaryNonValuePercent: totalStandardSec > 0 ? parseFloat(((necessaryNonValueSec / totalStandardSec) * 100).toFixed(1)) : 0,
    wasteSec: parseFloat(wasteSec.toFixed(2)),
    wastePercent: totalStandardSec > 0 ? parseFloat(((wasteSec / totalStandardSec) * 100).toFixed(1)) : 0,
    taktTimeSec,
    taktTimeMin: parseFloat((taktTimeSec / 60).toFixed(2)),
    bottleneckStation,
    bottleneckCycleSec: parseFloat(bottleneckCycleSec.toFixed(2)),
    bottleneckCycleMin: parseFloat((bottleneckCycleSec / 60).toFixed(2)),
    lineEfficiency,
    balanceDelay,
    unitsPerHour,
    unitsPerShift,
    laborCostPerUnit,
    asmeSummary,
  };
}

/**
 * Formatear segundos a MM:SS.cc
 */
export function formatSecondsToTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths = Math.floor((seconds - Math.floor(seconds)) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

/**
 * Símbolo y nombre legible de actividad ASME
 */
export function getASMEInfo(asmeType: string) {
  switch (asmeType) {
    case 'operation':
      return { symbol: '○', name: 'Operación', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badge: 'Operación' };
    case 'inspection':
      return { symbol: '□', name: 'Inspección', color: 'text-blue-700 bg-blue-50 border-blue-200', badge: 'Inspección' };
    case 'transport':
      return { symbol: '⇨', name: 'Transporte', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', badge: 'Transporte' };
    case 'delay':
      return { symbol: 'D', name: 'Demora / Espera', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'Demora' };
    case 'storage':
      return { symbol: '▽', name: 'Almacenamiento', color: 'text-slate-700 bg-slate-100 border-slate-300', badge: 'Almacenaje' };
    case 'combined':
      return { symbol: '⨀', name: 'Operación + Inspección', color: 'text-teal-700 bg-teal-50 border-teal-200', badge: 'Combinada' };
    default:
      return { symbol: '•', name: 'Actividad', color: 'text-slate-700 bg-slate-100 border-slate-300', badge: 'General' };
  }
}

/**
 * Nombre y etiqueta de categoría de valor Lean
 */
export function getValueCategoryInfo(valueType: string) {
  switch (valueType) {
    case 'VA':
      return { label: 'Valor Agregado (VA)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-500' };
    case 'SVA':
      return { label: 'Sin Valor Agregado Necesario (SVA)', color: 'text-amber-700 bg-amber-50 border-amber-200', barColor: 'bg-amber-400' };
    case 'NVA':
      return { label: 'Desperdicio Puro / Muda (NVA)', color: 'text-rose-700 bg-rose-50 border-rose-200', barColor: 'bg-rose-500' };
    default:
      return { label: 'No Clasificado', color: 'text-slate-600 bg-slate-100 border-slate-200', barColor: 'bg-slate-400' };
  }
}

/**
 * Nombre y descripción de mudas industriales
 */
export function getWasteCategoryLabel(waste: string) {
  switch (waste) {
    case 'tool_search':
      return 'Búsqueda innecesaria de herramientas / Desorden en puesto';
    case 'waiting_material':
      return 'Espera de material / Desabastecimiento de piezas';
    case 'excess_motion':
      return 'Movimientos innecesarios del operario fuera de rango ergonómico';
    case 'rework':
      return 'Retrabajo por defecto o ajuste manual redundante';
    case 'overprocessing':
      return 'Sobreprocesamiento / Doble verificación';
    case 'unnecessary_transport':
      return 'Transporte o acarreo manual prescindible';
    case 'inventory_clutter':
      return 'Acumulación de WIP que bloquea el flujo continuo';
    default:
      return 'Ninguna';
  }
}
