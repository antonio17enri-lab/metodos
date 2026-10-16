import React, { useState } from 'react';
import { Plus, Clock, Edit2, Trash2, Sliders, AlertTriangle, ArrowUpDown, ShieldAlert } from 'lucide-react';
import { Operation, ASMEType, ValueCategory, WasteCategory } from '../types/methodox';
import { getASMEInfo, getValueCategoryInfo, getWasteCategoryLabel, calculateObservedTime, calculateNormalTime, calculateStandardTime } from '../utils/engineeringMath';
import { AllowanceModal } from './AllowanceModal';

interface OperationListProps {
  operations: Operation[];
  onAddOperation: (op: Omit<Operation, 'id' | 'order'>) => void;
  onUpdateOperation: (op: Operation) => void;
  onDeleteOperation: (id: string) => void;
  onSelectForTiming: (id: string) => void;
}

export const OperationList: React.FC<OperationListProps> = ({
  operations,
  onAddOperation,
  onUpdateOperation,
  onDeleteOperation,
  onSelectForTiming,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<Operation | null>(null);

  // Allowance modal state
  const [allowanceTargetOp, setAllowanceTargetOp] = useState<Operation | null>(null);

  // Form state for new/edit operation
  const [formData, setFormData] = useState<{
    name: string;
    station: string;
    operator: string;
    asmeType: ASMEType;
    valueType: ValueCategory;
    wasteCategory: WasteCategory;
    observedTimeSec: number;
    ratingFactor: number;
    allowancePercent: number;
    toolsUsed: string;
    notes: string;
  }>({
    name: '',
    station: 'Estación 1',
    operator: 'Operario 1',
    asmeType: 'operation',
    valueType: 'VA',
    wasteCategory: 'none',
    observedTimeSec: 45,
    ratingFactor: 100,
    allowancePercent: 12,
    toolsUsed: '',
    notes: '',
  });

  const openCreateModal = () => {
    setEditingOp(null);
    setFormData({
      name: '',
      station: operations[0]?.station || 'Estación 1',
      operator: operations[0]?.operator || 'Operario 1',
      asmeType: 'operation',
      valueType: 'VA',
      wasteCategory: 'none',
      observedTimeSec: 30,
      ratingFactor: 100,
      allowancePercent: 12,
      toolsUsed: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (op: Operation) => {
    setEditingOp(op);
    setFormData({
      name: op.name,
      station: op.station,
      operator: op.operator,
      asmeType: op.asmeType,
      valueType: op.valueType,
      wasteCategory: op.wasteCategory,
      observedTimeSec: op.observedTimeSec,
      ratingFactor: op.ratingFactor,
      allowancePercent: op.allowancePercent,
      toolsUsed: op.toolsUsed || '',
      notes: op.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const normSec = calculateNormalTime(formData.observedTimeSec, formData.ratingFactor);
    const stdSec = calculateStandardTime(normSec, formData.allowancePercent);
    const stdMin = parseFloat((stdSec / 60).toFixed(2));

    if (editingOp) {
      onUpdateOperation({
        ...editingOp,
        ...formData,
        normalTimeSec: normSec,
        standardTimeSec: stdSec,
        standardTimeMin: stdMin,
      });
    } else {
      onAddOperation({
        ...formData,
        cyclesSec: [formData.observedTimeSec],
        normalTimeSec: normSec,
        standardTimeSec: stdSec,
        standardTimeMin: stdMin,
      });
    }

    setIsModalOpen(false);
  };

  const handleApplyAllowance = (newAllowance: number) => {
    if (!allowanceTargetOp) return;
    const normSec = allowanceTargetOp.normalTimeSec;
    const stdSec = calculateStandardTime(normSec, newAllowance);
    const stdMin = parseFloat((stdSec / 60).toFixed(2));

    onUpdateOperation({
      ...allowanceTargetOp,
      allowancePercent: newAllowance,
      standardTimeSec: stdSec,
      standardTimeMin: stdMin,
    });
  };

  return (
    <div className="space-y-6">
      {/* Table Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Hoja de Registro de Operaciones y Estudio de Tiempos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro detallado de actividades productivas, símbolos ASME, valoración del ritmo y tolerancias OIT.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar Nueva Operación
        </button>
      </div>

      {/* Main Operations Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3 min-w-[130px]">Estación</th>
                <th className="py-3 px-4 min-w-[240px]">Descripción de la Actividad</th>
                <th className="py-3 px-3 text-center">ASME</th>
                <th className="py-3 px-3 text-center">Clase</th>
                <th className="py-3 px-3 text-right">T. Observado</th>
                <th className="py-3 px-3 text-right">Ritmo</th>
                <th className="py-3 px-3 text-right">Supl. (OIT)</th>
                <th className="py-3 px-3 text-right font-medium">T. Normal</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">T. Estándar</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                    No hay operaciones registradas en este proceso. Haz clic en "Registrar Nueva Operación" para comenzar.
                  </td>
                </tr>
              ) : (
                operations.map((op, idx) => {
                  const asme = getASMEInfo(op.asmeType);
                  const valInfo = getValueCategoryInfo(op.valueType);
                  const isWaste = op.valueType === 'NVA' || op.asmeType === 'delay';

                  return (
                    <tr
                      key={op.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isWaste ? 'bg-rose-50/25' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {op.station}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{op.name}</div>
                        {isWaste && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-rose-700 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Muda detectada: {getWasteCategoryLabel(op.wasteCategory)}</span>
                          </div>
                        )}
                        {op.notes && !isWaste && (
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm">
                            {op.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-bold text-sm border ${asme.color}`}
                          title={`${asme.name} (${asme.symbol})`}
                        >
                          {asme.symbol}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${valInfo.color}`}
                        >
                          {op.valueType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {op.observedTimeSec.toFixed(1)} s
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                        {op.ratingFactor}%
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setAllowanceTargetOp(op)}
                          className="font-mono text-xs text-indigo-700 hover:text-indigo-900 underline decoration-dotted transition-colors"
                          title="Hacer clic para desglosar suplementos de la OIT"
                        >
                          {op.allowancePercent}%
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {op.normalTimeSec.toFixed(1)} s
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        <div>{op.standardTimeSec.toFixed(1)} s</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {(op.standardTimeSec / 60).toFixed(2)} min
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectForTiming(op.id)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Cronometrar actividad en vivo"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(op)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Editar operación"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOperation(op.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Eliminar operación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Operation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              {editingOp ? 'Editar Operación del Proceso' : 'Registrar Nueva Operación'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre de la Actividad / Tarea *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Fijar placa base con atornillador neumático"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estación / Puesto de Trabajo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    placeholder="Ej: Estación 1: Bastidor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operario Responsable
                  </label>
                  <input
                    type="text"
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    placeholder="Ej: Carlos M."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Símbolo ASME (Norma OIT) *
                  </label>
                  <select
                    value={formData.asmeType}
                    onChange={(e) => setFormData({ ...formData, asmeType: e.target.value as ASMEType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="operation">○ Operación (Modifica o transforma)</option>
                    <option value="inspection">□ Inspección (Verifica calidad o dimensiones)</option>
                    <option value="transport">⇨ Transporte (Movimiento o traslado de material)</option>
                    <option value="delay">D Demora / Espera (Tiempo perdido / cuello de botella)</option>
                    <option value="storage">▽ Almacenamiento (Custodia protegida)</option>
                    <option value="combined">⨀ Combinada (Operación + Inspección simultánea)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clasificación de Valor Lean *
                  </label>
                  <select
                    value={formData.valueType}
                    onChange={(e) => setFormData({ ...formData, valueType: e.target.value as ValueCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="VA">Valor Agregado (VA) - Cliente paga por ello</option>
                    <option value="SVA">Sin Valor Agregado Necesario (SVA) - Imprescindible actual</option>
                    <option value="NVA">Desperdicio Puro / Muda (NVA) - Eliminar</option>
                  </select>
                </div>
              </div>

              {/* Categoría de Muda si es NVA o Demora */}
              {(formData.valueType === 'NVA' || formData.asmeType === 'delay') && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <label className="block font-semibold text-rose-800 mb-1">
                    Tipo de Muda / Causa Raíz de Demora:
                  </label>
                  <select
                    value={formData.wasteCategory}
                    onChange={(e) => setFormData({ ...formData, wasteCategory: e.target.value as WasteCategory })}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="tool_search">Búsqueda innecesaria de herramientas / Desorden en puesto</option>
                    <option value="waiting_material">Espera de material / Desbalanceo de puesto previo</option>
                    <option value="excess_motion">Movimientos excesivos fuera del radio de alcance</option>
                    <option value="rework">Retrabajo / Ajustes manuales por tolerancias</option>
                    <option value="overprocessing">Sobreprocesamiento / Pasos redundantes</option>
                    <option value="unnecessary_transport">Transporte o caminata innecesaria</option>
                  </select>
                </div>
              )}

              {/* Time Parameters */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tiempo Observado (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.observedTimeSec}
                    onChange={(e) => setFormData({ ...formData, observedTimeSec: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ritmo / Rating (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="150"
                    required
                    value={formData.ratingFactor}
                    onChange={(e) => setFormData({ ...formData, ratingFactor: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Suplementos OIT (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="40"
                    required
                    value={formData.allowancePercent}
                    onChange={(e) => setFormData({ ...formData, allowancePercent: parseInt(e.target.value) || 12 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Calculated Preview */}
              <div className="p-3 bg-slate-100 rounded-lg text-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Tiempo Estándar Calculado:</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {calculateStandardTime(calculateNormalTime(formData.observedTimeSec, formData.ratingFactor), formData.allowancePercent)} s
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">En minutos:</span>
                  <span className="font-mono font-semibold text-xs text-slate-700">
                    {(calculateStandardTime(calculateNormalTime(formData.observedTimeSec, formData.ratingFactor), formData.allowancePercent) / 60).toFixed(2)} min
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Herramientas y Dispositivos Utilizados
                </label>
                <input
                  type="text"
                  value={formData.toolsUsed}
                  onChange={(e) => setFormData({ ...formData, toolsUsed: e.target.value })}
                  placeholder="Ej: Llave Allen 4mm, tornillos M5"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observaciones Técnicas / Ergonomía
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas sobre postura, desorden, posibles mejoras 5S..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {editingOp ? 'Guardar Cambios' : 'Registrar Operación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allowance Calculator Modal */}
      {allowanceTargetOp && (
        <AllowanceModal
          isOpen={!!allowanceTargetOp}
          onClose={() => setAllowanceTargetOp(null)}
          currentAllowancePercent={allowanceTargetOp.allowancePercent}
          onApplyAllowance={handleApplyAllowance}
          operationName={allowanceTargetOp.name}
        />
      )}
    </div>
  );
};
