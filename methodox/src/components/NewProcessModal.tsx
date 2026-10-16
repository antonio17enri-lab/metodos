import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Process } from '../types/methodox';

interface NewProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProcess: (newProc: Process) => void;
}

export const NewProcessModal: React.FC<NewProcessModalProps> = ({
  isOpen,
  onClose,
  onCreateProcess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: 'PR-' + Math.floor(100 + Math.random() * 900),
    industry: 'Manufactura General',
    product: '',
    description: '',
    shiftHours: 8,
    demandPerDay: 60,
    hourlyLaborCost: 18.0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newProc: Process = {
      id: 'proc-' + Date.now(),
      name: formData.name,
      code: formData.code,
      industry: formData.industry,
      product: formData.product || formData.name,
      description: formData.description,
      shiftHours: formData.shiftHours,
      demandPerDay: formData.demandPerDay,
      hourlyLaborCost: formData.hourlyLaborCost,
      operations: [
        {
          id: 'op-' + Date.now() + '-1',
          order: 1,
          name: 'Preparación de puesto y toma de materia prima',
          station: 'Estación 1: Preparación',
          operator: 'Operario 1',
          asmeType: 'transport',
          valueType: 'SVA',
          wasteCategory: 'none',
          cyclesSec: [20, 22, 21],
          observedTimeSec: 21.0,
          ratingFactor: 100,
          normalTimeSec: 21.0,
          allowancePercent: 12,
          standardTimeSec: 23.5,
          standardTimeMin: 0.39,
          notes: 'Operación inicial',
        },
        {
          id: 'op-' + Date.now() + '-2',
          order: 2,
          name: 'Operación principal de ensamble / maquinado',
          station: 'Estación 2: Ensamble Nuclear',
          operator: 'Operario 2',
          asmeType: 'operation',
          valueType: 'VA',
          wasteCategory: 'none',
          cyclesSec: [85, 90, 88],
          observedTimeSec: 87.7,
          ratingFactor: 100,
          normalTimeSec: 87.7,
          allowancePercent: 12,
          standardTimeSec: 98.2,
          standardTimeMin: 1.64,
          notes: 'Actividad que agrega valor',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateProcess(newProc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Crear Nuevo Proceso Productivo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre del Proceso *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Ensamble de Bomba de Agua Serie X"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código del Proceso</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industria / Sector</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Producto o Pieza Fabricada</label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              placeholder="Ej: Módulo de Potencia 24V"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Turno (Horas)</label>
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                required
                value={formData.shiftHours}
                onChange={(e) => setFormData({ ...formData, shiftHours: parseFloat(e.target.value) || 8 })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono bg-white text-center"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Demanda / Día</label>
              <input
                type="number"
                min="1"
                step="5"
                required
                value={formData.demandPerDay}
                onChange={(e) => setFormData({ ...formData, demandPerDay: parseInt(e.target.value) || 60 })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono bg-white text-center"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Costo M.O. (Q/h)</label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={formData.hourlyLaborCost}
                onChange={(e) => setFormData({ ...formData, hourlyLaborCost: parseFloat(e.target.value) || 18 })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono bg-white text-center"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descripción / Objetivos</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve reseña del proceso productivo y alcance del estudio..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              <Check className="w-4 h-4" />
              Crear Proceso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
