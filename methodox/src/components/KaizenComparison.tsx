import React, { useState } from 'react';
import { Process } from '../types/methodox';
import { calculateLineMetrics } from '../utils/engineeringMath';
import {
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sliders,
  DollarSign,
  Layers,
  Wrench,
} from 'lucide-react';

interface KaizenComparisonProps {
  currentProcess: Process;
  improvedProcess?: Process;
  allProcesses: Process[];
  onSelectCurrentProcess: (id: string) => void;
  onSelectImprovedProcess: (id: string) => void;
  onForkWithSimulation: (simulatedProcess: Process) => void;
}

export const KaizenComparison: React.FC<KaizenComparisonProps> = ({
  currentProcess,
  improvedProcess,
  allProcesses,
  onSelectCurrentProcess,
  onSelectImprovedProcess,
  onForkWithSimulation,
}) => {
  // Simulator sliders
  const [fiveSToolReductionPercent, setFiveSToolReductionPercent] = useState<number>(100); // 100% eliminación de búsqueda de herramientas
  const [transportReductionPercent, setTransportReductionPercent] = useState<number>(55); // 55% reducción de traslados con celda en U
  const [waitingReductionPercent, setWaitingReductionPercent] = useState<number>(100); // 100% eliminación de esperas con Kanban

  const currentMetrics = calculateLineMetrics(currentProcess);
  const baselineMetrics = improvedProcess ? calculateLineMetrics(improvedProcess) : null;

  // Calculate simulated values from current process based on sliders
  const simulatedOperations = currentProcess.operations.map((op) => {
    let factor = 1.0;
    let note = op.notes || '';

    if (op.wasteCategory === 'tool_search') {
      factor = Math.max(0, 1 - fiveSToolReductionPercent / 100);
      note = `Simulación 5S: Se redujo búsqueda en ${fiveSToolReductionPercent}%`;
    } else if (op.wasteCategory === 'waiting_material') {
      factor = Math.max(0, 1 - waitingReductionPercent / 100);
      note = `Simulación Kanban: Se redujo espera en ${waitingReductionPercent}%`;
    } else if (op.asmeType === 'transport') {
      factor = Math.max(0.2, 1 - transportReductionPercent / 100);
      note = `Simulación Disposición de Planta: Se redujo transporte en ${transportReductionPercent}%`;
    }

    const simObserved = parseFloat((op.observedTimeSec * factor).toFixed(1));
    const simNormal = parseFloat((simObserved * (op.ratingFactor / 100)).toFixed(1));
    const simStd = parseFloat((simNormal * (1 + op.allowancePercent / 100)).toFixed(1));

    return {
      ...op,
      observedTimeSec: simObserved,
      normalTimeSec: simNormal,
      standardTimeSec: simStd,
      standardTimeMin: parseFloat((simStd / 60).toFixed(2)),
      notes: note,
    };
  }).filter((op) => op.standardTimeSec > 0.5); // Filter out completely eliminated waste operations

  const simulatedProcess: Process = {
    ...currentProcess,
    id: `sim-${Date.now()}`,
    name: `${currentProcess.name} (Simulación Kaizen)`,
    code: `${currentProcess.code}-SIM`,
    isImprovedMethod: true,
    baselineProcessId: currentProcess.id,
    operations: simulatedOperations,
    updatedAt: new Date().toISOString(),
  };

  const simulatedMetrics = calculateLineMetrics(simulatedProcess);

  // Use the improved process if explicitly loaded or fall back to simulated metrics
  const targetMetrics = baselineMetrics || simulatedMetrics;

  // Comparison metrics calculations
  const timeSavedMin = parseFloat(
    (currentMetrics.totalStandardMin - targetMetrics.totalStandardMin).toFixed(2)
  );
  const timeSavedPercent =
    currentMetrics.totalStandardMin > 0
      ? parseFloat(((timeSavedMin / currentMetrics.totalStandardMin) * 100).toFixed(1))
      : 0;

  const productivityIncreasePercent =
    currentMetrics.unitsPerHour > 0
      ? parseFloat(
          (((targetMetrics.unitsPerHour - currentMetrics.unitsPerHour) /
            currentMetrics.unitsPerHour) *
            100).toFixed(1)
        )
      : 0;

  const unitsSavedPerShift = targetMetrics.unitsPerShift - currentMetrics.unitsPerShift;

  // Cost calculation (assuming 250 working days/year)
  const annualShiftHours = (currentProcess.shiftHours || 8) * 250;
  const currentAnnualCost = currentMetrics.laborCostPerUnit * (currentMetrics.unitsPerShift * 250);
  const targetAnnualCost = targetMetrics.laborCostPerUnit * (targetMetrics.unitsPerShift * 250);
  const costSavingsPerUnit = parseFloat(
    (currentMetrics.laborCostPerUnit - targetMetrics.laborCostPerUnit).toFixed(2)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Comparación de Métodos: Método Actual vs Método Mejorado (Kaizen)
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
              Antes y Después
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Ejemplo práctico de fábrica: Se analiza el proceso de ensamble (8.00 minutos). La plataforma detecta tiempo perdido buscando herramientas y esperas de material, simulando una reorganización que reduce el tiempo a 6.00 minutos con datos reales de cronometraje.
          </p>
        </div>

        {/* Process selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentProcess.id}
            onChange={(e) => onSelectCurrentProcess(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50"
          >
            {allProcesses.map((p) => (
              <option key={p.id} value={p.id}>
                Actual: {p.name}
              </option>
            ))}
          </select>

          {allProcesses.some((p) => p.isImprovedMethod) && (
            <select
              value={improvedProcess?.id || ''}
              onChange={(e) => onSelectImprovedProcess(e.target.value)}
              className="text-xs font-medium border border-emerald-300 rounded-lg px-3 py-1.5 bg-emerald-50 text-emerald-900"
            >
              <option value="">-- Seleccionar Método Mejorado --</option>
              {allProcesses
                .filter((p) => p.isImprovedMethod)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    Mejorado: {p.name}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* KPI Comparison Cards (Before vs After) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cycle Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Tiempo de Ensamble</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-400 line-through">
                {currentMetrics.totalStandardMin.toFixed(2)}m
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-3xl font-extrabold text-emerald-600">
                {targetMetrics.totalStandardMin.toFixed(2)}m
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Reducción Total:</span>
            <span className="font-mono font-bold text-emerald-700">
              -{timeSavedMin.toFixed(2)} min (-{timeSavedPercent}%)
            </span>
          </div>
        </div>

        {/* Card 2: Production Throughput */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Capacidad de Producción</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-400">
                {currentMetrics.unitsPerShift}
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-3xl font-extrabold text-emerald-600">
                {targetMetrics.unitsPerShift}
              </span>
              <span className="text-xs text-slate-500">uds/turno</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Aumento Productividad:</span>
            <span className="font-mono font-bold text-emerald-700">
              +{unitsSavedPerShift} uds/turno (+{productivityIncreasePercent}%)
            </span>
          </div>
        </div>

        {/* Card 3: Waste Elimination */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Desperdicio / Mudas (NVA)</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-rose-700">
                {currentMetrics.wasteSec.toFixed(0)}s
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-3xl font-extrabold text-emerald-600">
                {targetMetrics.wasteSec.toFixed(0)}s
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Búsqueda de herramientas:</span>
            <span className="font-mono font-bold text-emerald-700">
              {targetMetrics.wasteSec === 0 ? '100% Eliminada' : 'Reducida'}
            </span>
          </div>
        </div>

        {/* Card 4: Line Efficiency */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Eficiencia de Balanceo</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-400">
                {currentMetrics.lineEfficiency}%
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-3xl font-extrabold text-emerald-600">
                {targetMetrics.lineEfficiency}%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Balance Delay:</span>
            <span className="font-mono font-bold text-slate-700">
              De {currentMetrics.balanceDelay}% a {targetMetrics.balanceDelay}%
            </span>
          </div>
        </div>
      </div>

      {/* Financial Savings in Quetzales (Q) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold font-mono text-base flex items-center justify-center shrink-0 shadow-xs">
            Q
          </div>
          <div>
            <div className="font-bold text-emerald-950 text-sm">
              Impacto Económico en Quetzales (Q)
            </div>
            <div className="text-emerald-800 mt-0.5">
              Costo de mano de obra por unidad se reduce de <span className="font-bold font-mono">Q {currentMetrics.laborCostPerUnit.toFixed(2)}</span> a <span className="font-bold font-mono">Q {targetMetrics.laborCostPerUnit.toFixed(2)}</span> (Ahorro directo de <span className="font-bold font-mono">Q {Math.abs(costSavingsPerUnit).toFixed(2)}</span> por unidad producida).
            </div>
          </div>
        </div>
        <div className="bg-white/80 border border-emerald-200 rounded-lg px-3 py-1.5 text-right shrink-0">
          <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Ahorro anual estimado</span>
          <span className="font-mono font-bold text-base text-emerald-700">
            Q {(Math.max(0, costSavingsPerUnit) * (targetMetrics.unitsPerShift * 250)).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Interactive Kaizen Simulator Sliders */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900">
                Simulador Dinámico de Mejoras Kaizen en Tiempo Real
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Modifica los parámetros para proyectar el impacto de implementar 5S, tableros de sombras y flujo continuo.
            </p>
          </div>

          <button
            onClick={() => onForkWithSimulation(simulatedProcess)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Guardar como Método Mejorado Oficial
          </button>
        </div>

        {/* Sliders grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Slider 1: 5S Tool Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                Eliminar Búsqueda de Herramientas (5S)
              </span>
              <span className="font-mono font-bold text-slate-900">
                {fiveSToolReductionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={fiveSToolReductionPercent}
              onChange={(e) => setFiveSToolReductionPercent(parseInt(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">
              Tablero de sombras, gavetas ordenadas e identificación visual (Seiton).
            </div>
          </div>

          {/* Slider 2: Transport & Cell Layout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Optimizar Traslados (Celda en U / Gravedad)
              </span>
              <span className="font-mono font-bold text-slate-900">
                {transportReductionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={transportReductionPercent}
              onChange={(e) => setTransportReductionPercent(parseInt(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">
              Reducción de distancias de caminata y uso de rampas por gravedad.
            </div>
          </div>

          {/* Slider 3: Material Waiting (Kanban) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Eliminar Esperas de Piezas (Kanban)
              </span>
              <span className="font-mono font-bold text-slate-900">
                {waitingReductionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={waitingReductionPercent}
              onChange={(e) => setWaitingReductionPercent(parseInt(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">
              Suministro sincronizado justo a tiempo entre estaciones continuas.
            </div>
          </div>
        </div>
      </div>

      {/* Side by Side Detailed Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method 1: Current */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Línea Base
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Método Actual ({currentMetrics.totalStandardMin.toFixed(2)} min)
              </h3>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-semibold rounded-md">
              {currentProcess.operations.length} actividades
            </span>
          </div>

          <div className="mt-4 space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {currentProcess.operations.map((op, idx) => {
              const isWaste = op.valueType === 'NVA' || op.asmeType === 'delay';
              return (
                <div
                  key={op.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    isWaste
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[75%]">
                    <span className="font-mono text-slate-400 font-semibold">{idx + 1}.</span>
                    <div>
                      <div className="font-medium truncate">{op.name}</div>
                      {isWaste && (
                        <div className="text-[10px] text-rose-700 font-semibold">
                          ⚠️ Muda: Búsqueda / Espera ({op.standardTimeSec.toFixed(1)}s)
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-mono font-bold tabular-nums text-right">
                    {op.standardTimeSec.toFixed(1)}s
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Method 2: Improved Target */}
        <div className="bg-white p-5 rounded-xl border border-emerald-300 ring-1 ring-emerald-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Simulación Kaizen Optimizada
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Método Mejorado ({targetMetrics.totalStandardMin.toFixed(2)} min)
              </h3>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold rounded-md">
              -{(currentMetrics.totalStandardMin - targetMetrics.totalStandardMin).toFixed(2)} min
            </span>
          </div>

          <div className="mt-4 space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {(improvedProcess?.operations || simulatedProcess.operations).map((op, idx) => {
              return (
                <div
                  key={op.id}
                  className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/40 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 max-w-[75%]">
                    <span className="font-mono text-emerald-600 font-semibold">{idx + 1}.</span>
                    <div>
                      <div className="font-medium text-slate-900 truncate">{op.name}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        ✓ 5S / Poka-Yoke implementado
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 tabular-nums text-right">
                    {op.standardTimeSec.toFixed(1)}s
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
