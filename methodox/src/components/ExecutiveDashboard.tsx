import React, { useState } from 'react';
import { Process, LineMetrics, AIDiagnosticResult } from '../types/methodox';
import {
  Clock,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  DollarSign,
  FileText,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  process: Process;
  metrics: LineMetrics;
  onOpenReport: () => void;
  onNavigateToTiming: () => void;
  onNavigateToKaizen: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  process,
  metrics,
  onOpenReport,
  onNavigateToTiming,
  onNavigateToKaizen,
}) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiResult, setAiResult] = useState<AIDiagnosticResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAIDiagnosis = async () => {
    setIsDiagnosing(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processName: process.name,
          operations: process.operations,
          totalStandardTimeMin: metrics.totalStandardMin,
          bottleneckStation: metrics.bottleneckStation,
          taktTimeMin: metrics.taktTimeMin,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el servidor al procesar el diagnóstico');
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudo conectar con el motor de IA. Usando análisis determinístico.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            METHODOX — Plataforma Inteligente de Ingeniería de Métodos
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Dashboard de Productividad & Balanceo de Procesos
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Proceso activo: <strong className="text-slate-900">{process.name}</strong> · Código: {process.code}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            Reporte Técnico OIT
          </button>

          <button
            onClick={runAIDiagnosis}
            disabled={isDiagnosing}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isDiagnosing ? 'Analizando Métodos...' : 'Diagnóstico Inteligente (Gemini AI)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Tiempo Estándar</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {metrics.totalStandardMin.toFixed(2)}m
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {metrics.totalStandardSec.toFixed(1)} segundos
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Takt Time</span>
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {metrics.taktTimeMin.toFixed(2)}m
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {metrics.taktTimeSec.toFixed(1)} s / pieza
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Eficiencia Línea</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {metrics.lineEfficiency}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Delay: {metrics.balanceDelay}%
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Capacidad Turno</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {metrics.unitsPerShift}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {metrics.unitsPerHour} piezas/hora
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Ratio Valor Agregado</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {metrics.valueAddedPercent}%
          </div>
          <div className="text-[11px] text-rose-600 font-mono mt-0.5">
            Muda: {metrics.wastePercent}% ({metrics.wasteSec.toFixed(0)}s)
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
            <span>Costo Unitario M.O.</span>
            <span className="text-xs font-mono font-bold text-slate-400">GTQ</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            Q {metrics.laborCostPerUnit.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            por unidad fabricada (Quetzales)
          </div>
        </div>
      </div>

      {/* AI Diagnostic Result Banner if triggered */}
      {aiResult && (
        <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-bold tracking-tight text-white">
                Diagnóstico Experto de Métodos & Kaizen ({aiResult.source})
              </h3>
            </div>
            <button
              onClick={onNavigateToKaizen}
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
            >
              <span>Ver Simulación Kaizen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed">
            {aiResult.diagnosticSummary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <span className="font-semibold text-rose-400 block mb-1">
                Análisis de Cuello de Botella & Desperdicio:
              </span>
              <p className="text-slate-300">{aiResult.bottleneckAnalysis}</p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <span className="font-semibold text-emerald-400 block mb-1">
                Potencial de Reducción Proyectado:
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-slate-400 line-through">
                  {aiResult.simulatedImprovements?.currentCycleMin} min
                </span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span className="text-base font-bold font-mono text-emerald-400">
                  {aiResult.simulatedImprovements?.proposedCycleMin} min
                </span>
                <span className="text-[11px] text-emerald-300 font-mono">
                  (+{aiResult.simulatedImprovements?.productivityIncreasePercent}% productividad)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {aiResult.simulatedImprovements?.keyAction}
              </p>
            </div>
          </div>

          {aiResult.fiveSRecommendations?.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Plan de Acción Recomendado (5S / Layout / Poka-Yoke):
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {aiResult.fiveSRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Two Column Section: Quick Actions & Operations Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Actions */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
              Módulos de Ingeniería de Métodos
            </h3>
            <div className="mt-4 space-y-3">
              <button
                onClick={onNavigateToTiming}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-slate-800">
                    Cronometraje Digital de Ciclos
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Toma de tiempos con teclado y cronómetro industrial continuo / vuelta a cero.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                onClick={onNavigateToKaizen}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-colors flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-900">
                    Simulación Kaizen (8 min a 6 min)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Compara el método actual contra el método optimizado eliminando mudas de herramientas.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-[11px] text-slate-500">
              Estándar internacional: Metodología según normas de la OIT (Organización Internacional del Trabajo) y ASME.
            </div>
          </div>
        </div>

        {/* Right: Waste Breakdown & Bottleneck Station */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
            Diagnóstico de Cuello de Botella y Desperdicios
          </h3>

          <div className="mt-4 space-y-4">
            {/* Bottleneck Callout */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-bold text-amber-900">
                  Estación Crítica Cuello de Botella: {metrics.bottleneckStation}
                </span>
              </div>
              <p className="text-amber-800 mt-1">
                Esta estación marca el tiempo de ciclo máximo ({metrics.bottleneckCycleSec} s). Cualquier retraso en este puesto ralentiza la salida total de la línea.
              </p>
            </div>

            {/* Waste Breakdown bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Desglose del Tiempo de Ciclo</span>
                <span className="font-mono text-slate-500">{metrics.totalStandardMin.toFixed(2)} min total</span>
              </div>

              <div className="h-4 w-full rounded-md overflow-hidden flex bg-slate-100">
                <div
                  style={{ width: `${metrics.valueAddedPercent}%` }}
                  className="bg-emerald-500"
                  title={`Valor Agregado: ${metrics.valueAddedPercent}%`}
                />
                <div
                  style={{ width: `${metrics.necessaryNonValuePercent}%` }}
                  className="bg-amber-400"
                  title={`Necesario s/valor: ${metrics.necessaryNonValuePercent}%`}
                />
                <div
                  style={{ width: `${metrics.wastePercent}%` }}
                  className="bg-rose-500"
                  title={`Muda / Desperdicio: ${metrics.wastePercent}%`}
                />
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
                  <span>VA: {metrics.valueAddedPercent}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-xs" />
                  <span>SVA: {metrics.necessaryNonValuePercent}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                  <span>Muda: {metrics.wastePercent}% ({metrics.wasteSec.toFixed(0)}s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
