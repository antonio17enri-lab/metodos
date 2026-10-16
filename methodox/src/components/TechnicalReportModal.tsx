import React from 'react';
import { X, Printer, Download, FileSpreadsheet } from 'lucide-react';
import { Process, LineMetrics } from '../types/methodox';
import { getASMEInfo, getValueCategoryInfo } from '../utils/engineeringMath';

interface TechnicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: Process;
  metrics: LineMetrics;
}

export const TechnicalReportModal: React.FC<TechnicalReportModalProps> = ({
  isOpen,
  onClose,
  process,
  metrics,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Orden',
      'Estacion',
      'Actividad',
      'Tipo_ASME',
      'Clase_Valor',
      'T_Observado_seg',
      'Ritmo_pct',
      'Suplemento_OIT_pct',
      'T_Normal_seg',
      'T_Estandar_seg',
      'T_Estandar_min',
      'Herramientas',
      'Notas',
    ];

    const rows = process.operations.map((op, idx) => [
      idx + 1,
      `"${op.station}"`,
      `"${op.name.replace(/"/g, '""')}"`,
      op.asmeType,
      op.valueType,
      op.observedTimeSec,
      op.ratingFactor,
      op.allowancePercent,
      op.normalTimeSec,
      op.standardTimeSec,
      op.standardTimeMin,
      `"${(op.toolsUsed || '').replace(/"/g, '""')}"`,
      `"${(op.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Estudio_Tiempos_${process.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-4">
        {/* Top bar (modal only, hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ficha Técnica de Estudio de Tiempos & Métodos (OIT / ASME)
            </h3>
            <p className="text-xs text-slate-500">
              Documento formal de ingeniería industrial listo para firma y auditoría.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Exportar CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans" id="printable-report">
          {/* Formal Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-base font-extrabold tracking-tight text-slate-900">
                METHODOX — PLATAFORMA DE INGENIERÍA DE MÉTODOS
              </div>
              <div className="text-xs font-medium text-slate-600 mt-0.5">
                INFORME TÉCNICO DE ESTUDIO DE TIEMPOS Y BALANCEO DE LÍNEA
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Norma Técnica: Metodología OIT / ASME Standard 101
              </div>
            </div>

            <div className="text-right text-[11px] font-mono space-y-0.5">
              <div><strong className="text-slate-900">CÓDIGO:</strong> {process.code}</div>
              <div><strong className="text-slate-900">FECHA:</strong> {new Date().toLocaleDateString('es-ES')}</div>
              <div><strong className="text-slate-900">TURNO:</strong> {process.shiftHours} Horas</div>
            </div>
          </div>

          {/* Process Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Proceso:</span>
              <span className="font-bold text-slate-900">{process.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Producto / Pieza:</span>
              <span className="font-bold text-slate-900">{process.product}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Industria:</span>
              <span className="font-bold text-slate-900">{process.industry}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Demanda Diaria:</span>
              <span className="font-bold font-mono text-slate-900">{process.demandPerDay} unidades/día</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Costo M.O. / Hora:</span>
              <span className="font-bold font-mono text-slate-900">Q {process.hourlyLaborCost.toFixed(2)}/h</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Costo M.O. / Unidad:</span>
              <span className="font-bold font-mono text-slate-900">Q {metrics.laborCostPerUnit.toFixed(2)} / ud</span>
            </div>
          </div>

          {/* Executive Indicators Grid */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2">
              1. Indicadores Principales de Eficiencia y Capacidad
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Tiempo Estándar (TE)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {metrics.totalStandardMin.toFixed(2)} min
                </span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Takt Time</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {metrics.taktTimeMin.toFixed(2)} min
                </span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Eficiencia Línea</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {metrics.lineEfficiency}%
                </span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Balance Delay</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {metrics.balanceDelay}%
                </span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Capacidad / Turno</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {metrics.unitsPerShift} uds
                </span>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Ratio Valor Agregado</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {metrics.valueAddedPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Operations Table */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2">
              2. Tabla Analítica de Estudio de Tiempos
            </h4>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800">
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2">Estación</th>
                    <th className="py-2 px-3">Actividad</th>
                    <th className="py-2 px-2 text-center">ASME</th>
                    <th className="py-2 px-2 text-center">Clase</th>
                    <th className="py-2 px-2 text-right">TO (s)</th>
                    <th className="py-2 px-2 text-right">Ritmo</th>
                    <th className="py-2 px-2 text-right">Supl.</th>
                    <th className="py-2 px-2 text-right">TN (s)</th>
                    <th className="py-2 px-2 text-right font-bold">TE (s)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {process.operations.map((op, idx) => {
                    const asme = getASMEInfo(op.asmeType);
                    return (
                      <tr key={op.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 font-medium">{op.station}</td>
                        <td className="py-2 px-3">{op.name}</td>
                        <td className="py-2 px-2 text-center font-bold">{asme.symbol}</td>
                        <td className="py-2 px-2 text-center">{op.valueType}</td>
                        <td className="py-2 px-2 text-right font-mono">{op.observedTimeSec.toFixed(1)}</td>
                        <td className="py-2 px-2 text-right font-mono">{op.ratingFactor}%</td>
                        <td className="py-2 px-2 text-right font-mono">{op.allowancePercent}%</td>
                        <td className="py-2 px-2 text-right font-mono">{op.normalTimeSec.toFixed(1)}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">{op.standardTimeSec.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold font-mono">
                    <td colSpan={5} className="py-2 px-3 text-right">TOTALES DEL PROCESO:</td>
                    <td className="py-2 px-2 text-right">{metrics.totalObservedSec.toFixed(1)}s</td>
                    <td colSpan={2} />
                    <td className="py-2 px-2 text-right">-</td>
                    <td className="py-2 px-2 text-right text-slate-900">
                      {metrics.totalStandardSec.toFixed(1)}s ({metrics.totalStandardMin.toFixed(2)} min)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ASME Summary Breakdown */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2">
              3. Resumen ASME de Distribución de Actividades
            </h4>
            <div className="grid grid-cols-5 gap-2 border border-slate-200 p-2 rounded text-center">
              <div>
                <span className="font-bold text-slate-800">○ Operación</span>
                <div className="font-mono">{metrics.asmeSummary.operation.count} act. ({metrics.asmeSummary.operation.timeSec.toFixed(1)}s)</div>
              </div>
              <div>
                <span className="font-bold text-slate-800">□ Inspección</span>
                <div className="font-mono">{metrics.asmeSummary.inspection.count} act. ({metrics.asmeSummary.inspection.timeSec.toFixed(1)}s)</div>
              </div>
              <div>
                <span className="font-bold text-slate-800">⇨ Transporte</span>
                <div className="font-mono">{metrics.asmeSummary.transport.count} act. ({metrics.asmeSummary.transport.timeSec.toFixed(1)}s)</div>
              </div>
              <div>
                <span className="font-bold text-rose-700">D Demora / Espera</span>
                <div className="font-mono text-rose-700 font-bold">{metrics.asmeSummary.delay.count} act. ({metrics.asmeSummary.delay.timeSec.toFixed(1)}s)</div>
              </div>
              <div>
                <span className="font-bold text-slate-800">▽ Almacenamiento</span>
                <div className="font-mono">{metrics.asmeSummary.storage.count} act. ({metrics.asmeSummary.storage.timeSec.toFixed(1)}s)</div>
              </div>
            </div>
          </div>

          {/* Signatures block for formal documentation */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-[10px]">
            <div>
              <div className="border-b border-slate-400 pb-8" />
              <div className="mt-1 font-bold text-slate-900">Ingeniero de Métodos / Analista</div>
              <div className="text-slate-500">Levantamiento de Tiempos</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8" />
              <div className="mt-1 font-bold text-slate-900">Supervisor de Producción</div>
              <div className="text-slate-500">Validación de Piso</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8" />
              <div className="mt-1 font-bold text-slate-900">Gerencia de Operaciones</div>
              <div className="text-slate-500">Aprobación de Tiempo Estándar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
