import React, { useState } from 'react';
import { Operation, LineMetrics } from '../types/methodox';
import { getASMEInfo, getValueCategoryInfo, getWasteCategoryLabel, formatSecondsToTime } from '../utils/engineeringMath';
import { AlertTriangle, Clock, ArrowDown, ChevronRight, Layers } from 'lucide-react';

interface DOPDiagramProps {
  operations: Operation[];
  metrics: LineMetrics;
  processName: string;
}

export const DOPDiagram: React.FC<DOPDiagramProps> = ({ operations, metrics, processName }) => {
  const [selectedStation, setSelectedStation] = useState<string>('all');

  const stations = Array.from(new Set(operations.map((op) => op.station)));

  const filteredOps =
    selectedStation === 'all'
      ? operations
      : operations.filter((op) => op.station === selectedStation);

  const asmeStats = [
    {
      type: 'operation',
      name: 'Operación',
      symbol: '○',
      description: 'Modifica o agrega valor físico al producto',
      count: metrics.asmeSummary.operation.count,
      timeSec: metrics.asmeSummary.operation.timeSec,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    },
    {
      type: 'inspection',
      name: 'Inspección',
      symbol: '□',
      description: 'Verificación de calidad, dimensiones o especificaciones',
      count: metrics.asmeSummary.inspection.count,
      timeSec: metrics.asmeSummary.inspection.timeSec,
      color: 'bg-blue-50 text-blue-700 border-blue-300',
    },
    {
      type: 'transport',
      name: 'Transporte',
      symbol: '⇨',
      description: 'Traslado de materiales entre puestos o mesas',
      count: metrics.asmeSummary.transport.count,
      timeSec: metrics.asmeSummary.transport.timeSec,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    },
    {
      type: 'delay',
      name: 'Demora / Espera',
      symbol: 'D',
      description: 'Tiempo improductivo, búsqueda de herramientas o esperas',
      count: metrics.asmeSummary.delay.count,
      timeSec: metrics.asmeSummary.delay.timeSec,
      color: 'bg-amber-50 text-amber-700 border-amber-300',
    },
    {
      type: 'storage',
      name: 'Almacenamiento',
      symbol: '▽',
      description: 'Depósito en almacén o custodia protegida',
      count: metrics.asmeSummary.storage.count,
      timeSec: metrics.asmeSummary.storage.timeSec,
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Diagrama de Operaciones del Proceso (DOP / ASME Standard)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeo formal del flujo de actividades según simbología internacional de ingeniería de métodos.
          </p>
        </div>

        {/* Station Filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">Filtrar Estación:</span>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">Todas las Estaciones ({operations.length} actividades)</option>
            {stations.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ASME Summary Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Resumen General del Proceso (Matriz ASME)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {asmeStats.map((item) => {
            const percent =
              metrics.totalStandardSec > 0
                ? ((item.timeSec / metrics.totalStandardSec) * 100).toFixed(1)
                : '0.0';

            return (
              <div
                key={item.type}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-bold text-sm border ${item.color}`}
                  >
                    {item.symbol}
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {item.count} act.
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-semibold text-slate-800">{item.name}</div>
                  <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                    {item.timeSec.toFixed(1)} s ({parseFloat((item.timeSec / 60).toFixed(2))} min)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {percent}% del tiempo total
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Interactive Flowchart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
          Secuencia de Flujo de Operaciones ({filteredOps.length} actividades)
        </h3>

        {filteredOps.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
            No hay actividades registradas en este proceso para diagramar el flujo ASME. Dirígete a la pestaña "Estudio de Tiempos" para agregar tu primera operación.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[27px] sm:before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {filteredOps.map((op, idx) => {
            const asme = getASMEInfo(op.asmeType);
            const valInfo = getValueCategoryInfo(op.valueType);
            const isDelay = op.asmeType === 'delay' || op.valueType === 'NVA';

            return (
              <div key={op.id} className="relative flex items-start gap-4 group">
                {/* Flow Node Circle/Square with ASME symbol */}
                <div
                  className={`relative z-10 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 font-bold text-base sm:text-lg shadow-xs shrink-0 transition-transform group-hover:scale-105 ${asme.color}`}
                  title={`${asme.name}: ${asme.symbol}`}
                >
                  {asme.symbol}
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-mono font-normal">
                    {idx + 1}
                  </span>
                </div>

                {/* Activity Card */}
                <div
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    isDelay
                      ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {op.station}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${valInfo.color}`}>
                        {op.valueType}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Resp: {op.operator || 'Operario'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{op.standardTimeSec.toFixed(1)} s</span>
                        <span className="text-slate-500 font-normal">
                          ({op.standardTimeMin.toFixed(2)} min)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {op.name}
                  </div>

                  {/* Delay or Waste Warning */}
                  {isDelay && (
                    <div className="mt-2.5 p-2.5 bg-rose-100/70 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Oportunidad de Mejora / Muda Identificada:</div>
                        <div className="text-rose-800 mt-0.5">
                          {getWasteCategoryLabel(op.wasteCategory)}
                        </div>
                        {op.notes && (
                          <div className="text-[11px] text-rose-700 mt-1 italic">
                            Detalle: "{op.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tools and standard notes */}
                  {!isDelay && (op.toolsUsed || op.notes) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {op.toolsUsed && (
                        <span>
                          <strong className="text-slate-700">Herramientas:</strong> {op.toolsUsed}
                        </span>
                      )}
                      {op.notes && (
                        <span>
                          <strong className="text-slate-700">Observación:</strong> {op.notes}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};
