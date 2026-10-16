import React, { useState } from 'react';
import { Operation, LineMetrics } from '../types/methodox';
import { formatSecondsToTime } from '../utils/engineeringMath';
import { Layers, AlertCircle, TrendingUp, Gauge, CheckCircle2 } from 'lucide-react';

interface YamazumiChartProps {
  operations: Operation[];
  metrics: LineMetrics;
  shiftHours: number;
  demandPerDay: number;
  onUpdateDemandParams: (shiftHours: number, demandPerDay: number) => void;
}

export const YamazumiChart: React.FC<YamazumiChartProps> = ({
  operations,
  metrics,
  shiftHours,
  demandPerDay,
  onUpdateDemandParams,
}) => {
  const [viewMode, setViewMode] = useState<'station' | 'activity'>('station');

  // Group by stations for station balance view
  const stationsMap: Record<
    string,
    {
      station: string;
      vaSec: number;
      svaSec: number;
      nvaSec: number;
      totalSec: number;
      operations: Operation[];
    }
  > = {};

  operations.forEach((op) => {
    const stName = op.station || 'General';
    if (!stationsMap[stName]) {
      stationsMap[stName] = {
        station: stName,
        vaSec: 0,
        svaSec: 0,
        nvaSec: 0,
        totalSec: 0,
        operations: [],
      };
    }

    const t = op.standardTimeSec;
    stationsMap[stName].totalSec += t;
    stationsMap[stName].operations.push(op);

    if (op.valueType === 'VA') {
      stationsMap[stName].vaSec += t;
    } else if (op.valueType === 'SVA') {
      stationsMap[stName].svaSec += t;
    } else {
      stationsMap[stName].nvaSec += t;
    }
  });

  const stationData = Object.values(stationsMap);

  // Compute maximum height for chart scaling (including Takt Time)
  const maxBarValue = Math.max(
    metrics.taktTimeSec,
    ...stationData.map((s) => s.totalSec),
    ...operations.map((o) => o.standardTimeSec),
    60
  );
  const chartHeightLimit = maxBarValue * 1.25;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Gráfico Yamazumi de Balanceo de Cargas
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
              Lean / TPS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualización apilada de tiempos de ciclo clasificados por valor agregado frente al Takt Time de la demanda.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('station')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'station'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Estaciones ({stationData.length})
            </button>
            <button
              onClick={() => setViewMode('activity')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'activity'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Actividad ({operations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Takt Time & Demand Adjuster Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Horas de Turno:</span>
            <input
              type="number"
              step="0.5"
              min="1"
              max="24"
              value={shiftHours}
              onChange={(e) => onUpdateDemandParams(parseFloat(e.target.value) || 8, demandPerDay)}
              className="w-16 px-2 py-1 font-mono border border-slate-200 rounded text-center bg-slate-50"
            />
            <span className="text-slate-500">h</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Demanda Diaria del Cliente:</span>
            <input
              type="number"
              step="5"
              min="1"
              max="5000"
              value={demandPerDay}
              onChange={(e) => onUpdateDemandParams(shiftHours, parseInt(e.target.value) || 60)}
              className="w-20 px-2 py-1 font-mono border border-slate-200 rounded text-center bg-slate-50"
            />
            <span className="text-slate-500">piezas/día</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Takt Time Calculado:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {metrics.taktTimeSec} s ({metrics.taktTimeMin} min)
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-500 rounded-xs" />
            <span className="text-slate-700">Valor Agregado (VA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-400 rounded-xs" />
            <span className="text-slate-700">Necesario s/valor (SVA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-rose-500 rounded-xs" />
            <span className="text-slate-700">Muda / Demora (NVA)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-rose-600" />
            <span className="text-rose-700 font-semibold">Takt Time</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Yamazumi Canvas */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative h-[380px] w-full border-b border-l border-slate-200 pt-6 px-4">
          {/* Takt Time Horizontal Guideline */}
          {metrics.taktTimeSec > 0 && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none transition-all duration-300"
              style={{
                bottom: `${(metrics.taktTimeSec / chartHeightLimit) * 100}%`,
              }}
            >
              <div className="w-full border-b-2 border-dashed border-rose-500" />
              <div className="absolute right-2 -top-6 bg-rose-50 border border-rose-300 text-rose-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold shadow-xs whitespace-nowrap">
                Takt Time: {metrics.taktTimeSec} s ({metrics.taktTimeMin} min)
              </div>
            </div>
          )}

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const val = chartHeightLimit * ratio;
            return (
              <div
                key={ratio}
                className="absolute left-0 right-0 border-b border-slate-100 flex items-center pointer-events-none"
                style={{ bottom: `${ratio * 100}%` }}
              >
                <span className="text-[10px] text-slate-300 font-mono -ml-10">
                  {Math.round(val)}s
                </span>
              </div>
            );
          })}

          {/* Bars Render */}
          {operations.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Lienzo de balanceo vacío. No hay actividades registradas aún para apilar en el gráfico Yamazumi.
            </div>
          ) : (
            <div className="h-full flex items-end justify-around gap-4 sm:gap-6 relative z-10">
              {viewMode === 'station' ? (
                // Station Bars
              stationData.map((st) => {
                const totalH = (st.totalSec / chartHeightLimit) * 100;
                const vaH = (st.vaSec / chartHeightLimit) * 100;
                const svaH = (st.svaSec / chartHeightLimit) * 100;
                const nvaH = (st.nvaSec / chartHeightLimit) * 100;
                const isOverTakt = st.totalSec > metrics.taktTimeSec;
                const isBottleneck = st.station === metrics.bottleneckStation;

                return (
                  <div
                    key={st.station}
                    className="flex-1 max-w-[120px] h-full flex flex-col justify-end items-center group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white p-2 rounded-lg text-[11px] whitespace-nowrap z-30 shadow-lg font-mono">
                      <div>Total: {st.totalSec.toFixed(1)} s ({(st.totalSec / 60).toFixed(2)} min)</div>
                      <div className="text-emerald-300">VA: {st.vaSec.toFixed(1)} s</div>
                      <div className="text-amber-300">SVA: {st.svaSec.toFixed(1)} s</div>
                      <div className="text-rose-300">NVA: {st.nvaSec.toFixed(1)} s</div>
                    </div>

                    {/* Value label on top of bar */}
                    <div className="text-[11px] font-mono font-bold text-slate-800 mb-1">
                      {st.totalSec.toFixed(0)}s
                    </div>

                    {/* Stacked Bar Container */}
                    <div
                      className={`w-full rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-300 ${
                        isBottleneck ? 'ring-2 ring-rose-500 shadow-md' : ''
                      }`}
                      style={{ height: `${Math.max(2, totalH)}%` }}
                    >
                      {/* Green VA */}
                      <div
                        style={{ height: `${(st.vaSec / st.totalSec) * 100}%` }}
                        className="bg-emerald-500 hover:bg-emerald-600 transition-colors"
                      />
                      {/* Amber SVA */}
                      <div
                        style={{ height: `${(st.svaSec / st.totalSec) * 100}%` }}
                        className="bg-amber-400 hover:bg-amber-500 transition-colors"
                      />
                      {/* Red NVA */}
                      <div
                        style={{ height: `${(st.nvaSec / st.totalSec) * 100}%` }}
                        className="bg-rose-500 hover:bg-rose-600 transition-colors"
                      />
                    </div>

                    {/* X-axis label */}
                    <div className="mt-3 text-center w-full">
                      <div className="text-xs font-semibold text-slate-800 truncate" title={st.station}>
                        {st.station}
                      </div>
                      {isBottleneck && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          Cuello de Botella
                        </span>
                      )}
                      {isOverTakt && !isBottleneck && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono text-amber-700">
                          Excede Takt
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // Individual Operation Bars
              operations.map((op, idx) => {
                const totalH = (op.standardTimeSec / chartHeightLimit) * 100;
                const barColor =
                  op.valueType === 'VA'
                    ? 'bg-emerald-500'
                    : op.valueType === 'SVA'
                    ? 'bg-amber-400'
                    : 'bg-rose-500';

                return (
                  <div
                    key={op.id}
                    className="flex-1 max-w-[80px] h-full flex flex-col justify-end items-center group relative"
                  >
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white p-2 rounded-lg text-[11px] whitespace-nowrap z-30 shadow-lg font-mono">
                      <div>#{idx + 1}: {op.name}</div>
                      <div>{op.standardTimeSec.toFixed(1)} s ({op.valueType})</div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-600 mb-1">
                      {op.standardTimeSec.toFixed(0)}s
                    </div>

                    <div
                      className={`w-full rounded-t-sm ${barColor} hover:brightness-110 transition-all`}
                      style={{ height: `${Math.max(2, totalH)}%` }}
                    />

                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-mono font-medium text-slate-500">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          )}
        </div>

        {/* Balancing Diagnostic Summary */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Estación Cuello de Botella:</span>
            <div className="font-bold text-slate-900 text-sm truncate mt-0.5">
              {metrics.bottleneckStation}
            </div>
            <span className="text-slate-500 font-mono text-[11px]">
              {metrics.bottleneckCycleSec} s / ciclo
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Eficiencia de Balanceo (E):</span>
            <div className="font-bold font-mono text-slate-900 text-base mt-0.5">
              {metrics.lineEfficiency}%
            </div>
            <span className="text-slate-500 text-[11px]">
              {metrics.lineEfficiency >= 85 ? 'Óptimo balanceo' : 'Desbalanceada (<85%)'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Retraso de Balanceo (Balance Delay):</span>
            <div className="font-bold font-mono text-rose-700 text-base mt-0.5">
              {metrics.balanceDelay}%
            </div>
            <span className="text-slate-500 text-[11px]">Tiempo muerto ocioso en línea</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Capacidad de Salida Real:</span>
            <div className="font-bold font-mono text-emerald-700 text-base mt-0.5">
              {metrics.unitsPerHour} u/h
            </div>
            <span className="text-slate-500 text-[11px]">
              {metrics.unitsPerShift} unidades / turno
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
