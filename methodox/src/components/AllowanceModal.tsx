import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AllowanceFactors } from '../types/methodox';
import { calculateTotalAllowance } from '../utils/engineeringMath';

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAllowancePercent: number;
  onApplyAllowance: (totalPercent: number) => void;
  operationName: string;
}

export const AllowanceModal: React.FC<AllowanceModalProps> = ({
  isOpen,
  onClose,
  currentAllowancePercent,
  onApplyAllowance,
  operationName,
}) => {
  const [factors, setFactors] = useState<AllowanceFactors>({
    personalNeeds: 5, // Fijo OIT
    basicFatigue: 4, // Fijo OIT
    standingWork: 2, // De pie estándar
    abnormalPosture: 0,
    weightForce: 0,
    lighting: 0,
    mentalStrain: 1,
    monotony: 0,
  });

  if (!isOpen) return null;

  const total = calculateTotalAllowance(factors);

  const handleApply = () => {
    onApplyAllowance(total);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Calculadora de Suplementos y Tolerancias (OIT)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
              Actividad: {operationName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
            Los suplementos según la Organización Internacional del Trabajo (OIT) se añaden al Tiempo Normal para compensar la fatiga y necesidades del trabajador.
          </div>

          {/* Suplementos Fijos */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              1. Suplementos Fijos Obligatorios
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-700">Necesidades Personales</span>
                  <span className="text-xs font-mono font-semibold text-slate-900">{factors.personalNeeds}%</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">Hidratación, higiene personal</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-700">Fatiga Básica</span>
                  <span className="text-xs font-mono font-semibold text-slate-900">{factors.basicFatigue}%</span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">Recuperación de energía vital</span>
              </div>
            </div>
          </div>

          {/* Suplementos Variables */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              2. Suplementos Variables de Trabajo
            </h4>

            <div className="space-y-3">
              {/* Trabajo de pie */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-800">Postura de pie</div>
                  <div className="text-[11px] text-slate-500">Operario labora de pie sin asiento</div>
                </div>
                <select
                  value={factors.standingWork}
                  onChange={(e) => setFactors({ ...factors, standingWork: Number(e.target.value) })}
                  className="text-xs font-mono border border-slate-200 rounded px-2 py-1 bg-white"
                >
                  <option value={0}>Sentado (0%)</option>
                  <option value={2}>De pie estándar (+2%)</option>
                  <option value={4}>De pie continuo sin pausas (+4%)</option>
                </select>
              </div>

              {/* Postura anormal */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-800">Postura incómoda / Ergonómica</div>
                  <div className="text-[11px] text-slate-500">Inclinación de tronco, agachado o brazos en alto</div>
                </div>
                <select
                  value={factors.abnormalPosture}
                  onChange={(e) => setFactors({ ...factors, abnormalPosture: Number(e.target.value) })}
                  className="text-xs font-mono border border-slate-200 rounded px-2 py-1 bg-white"
                >
                  <option value={0}>Normal y cómoda (0%)</option>
                  <option value={2}>Inclinado ligeramente (+2%)</option>
                  <option value={5}>Agachado o brazos elevados (+5%)</option>
                  <option value={7}>Extremadamente incómoda (+7%)</option>
                </select>
              </div>

              {/* Uso de fuerza / peso levantado */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-800">Uso de fuerza o carga levantada</div>
                  <div className="text-[11px] text-slate-500">Peso de herramientas o piezas ensambladas</div>
                </div>
                <select
                  value={factors.weightForce}
                  onChange={(e) => setFactors({ ...factors, weightForce: Number(e.target.value) })}
                  className="text-xs font-mono border border-slate-200 rounded px-2 py-1 bg-white"
                >
                  <option value={0}>Menos de 2.5 kg (0%)</option>
                  <option value={2}>Entre 2.5 kg y 5 kg (+2%)</option>
                  <option value={5}>Entre 5 kg y 10 kg (+5%)</option>
                  <option value={9}>Entre 10 kg y 15 kg (+9%)</option>
                  <option value={14}>Más de 15 kg (+14%)</option>
                </select>
              </div>

              {/* Tensión mental y precisión */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-800">Tensión mental / Precisión requerida</div>
                  <div className="text-[11px] text-slate-500">Ajuste de tolerancias milimétricas, circuitos</div>
                </div>
                <select
                  value={factors.mentalStrain}
                  onChange={(e) => setFactors({ ...factors, mentalStrain: Number(e.target.value) })}
                  className="text-xs font-mono border border-slate-200 rounded px-2 py-1 bg-white"
                >
                  <option value={0}>Proceso rutinario bajo (0%)</option>
                  <option value={1}>Atención normal moderada (+1%)</option>
                  <option value={4}>Alta precisión de ensamble (+4%)</option>
                  <option value={8}>Inspección micro-electrónica / Calibración (+8%)</option>
                </select>
              </div>

              {/* Monotonía */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-800">Monotonía de ciclo corto</div>
                  <div className="text-[11px] text-slate-500">Ciclos de trabajo menores a 15 segundos repetitivos</div>
                </div>
                <select
                  value={factors.monotony}
                  onChange={(e) => setFactors({ ...factors, monotony: Number(e.target.value) })}
                  className="text-xs font-mono border border-slate-200 rounded px-2 py-1 bg-white"
                >
                  <option value={0}>Ciclo variado normal (0%)</option>
                  <option value={2}>Repetición constante (+2%)</option>
                  <option value={4}>Altamente monótono y repetitivo (+4%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with total */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Suplemento Total Calculado:</span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {total}% <span className="text-xs font-normal text-slate-500">({(1 + total / 100).toFixed(2)}x sobre TN)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Check className="w-4 h-4" />
              Aplicar Suplemento ({total}%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
