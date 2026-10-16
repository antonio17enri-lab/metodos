import React from 'react';
import { X, CheckCircle, ArrowRight, Clock, Layers, Sparkles, TrendingUp, Wrench } from 'lucide-react';

interface WelcomeMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeMethodsModal: React.FC<WelcomeMethodsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header with badge */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              METHODOX
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-emerald-400">Moneda: Quetzales (Q)</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            ¡Bienvenidos! Implementemos la Ingeniería de Métodos
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Se han restablecido todos los procesos y parámetros a la línea base estándar de fábrica. La plataforma está configurada en <strong>Quetzales (Q)</strong> para evaluar costos y ahorros de mano de obra en Guatemala y la región.
          </p>
        </div>

        {/* Content Guide */}
        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[60vh] overflow-y-auto">
          <div className="font-semibold text-slate-900 text-sm">
            Ruta recomendada para optimizar la productividad de tu planta:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Step 1 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-slate-700 shrink-0" />
                <span>1. Registro & Cronometraje</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Toma tiempos en piso con el cronómetro digital interactivo. Calcula tiempos observados, calificación de ritmo y suplementos reglamentarios OIT.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Layers className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>2. Diagrama de Operaciones (DOP)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Clasifica cada actividad con la simbología ASME (Operación, Inspección, Transporte, Demora y Almacenaje) y detecta cuellos de botella.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Wrench className="w-4 h-4 text-rose-700 shrink-0" />
                <span>3. Eliminación de Mudas</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Identifica tiempos muertos por búsqueda de herramientas o desorden en gavetas, reduciéndolos a cero mediante tableros de sombras (5S).
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>4. Simulación Kaizen (8m a 6m)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Compara el Método Actual vs el Método Mejorado. Observa el aumento de 60 a 80 unidades por turno y el ahorro en Quetzales (Q) por pieza.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Caso práctico precargado:</strong> Ensamble de Motor BLDC (Método Actual de 8 min vs Método Mejorado de 6 min).
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Estudio normalizado OIT / ASME
          </span>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            <span>Comenzar Implementación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
