import React from 'react';
import { X, Sparkles, Plus, Clock, ArrowRight } from 'lucide-react';

interface CleanSlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToOperations: () => void;
  onGoToStopwatch: () => void;
}

export const CleanSlateModal: React.FC<CleanSlateModalProps> = ({
  isOpen,
  onClose,
  onGoToOperations,
  onGoToStopwatch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Lienzo en Blanco a 0
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-emerald-400">Moneda: Quetzales (Q)</span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Todo Restablecido a Cero (0)
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Se han borrado todas las operaciones de prueba. La plataforma está completamente vacía y lista para que ingreses las estaciones, tareas y tiempos reales de tu planta.
          </p>
        </div>

        {/* Action recommendations */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-semibold text-slate-900 text-xs">
              ¿Por dónde deseas empezar tu estudio de métodos?
            </div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Puedes registrar tus actividades en la tabla técnica o cronometrar directamente en piso con el cronómetro digital.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                onClose();
                onGoToOperations();
              }}
              className="p-3 border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-slate-900">
                  <Plus className="w-4 h-4 text-slate-700" />
                  <span>Registrar Operaciones</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ingresa actividades, operarios y puestos manualmente.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-900">
                <span>Abrir Tabla</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onGoToStopwatch();
              }}
              className="p-3 border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-slate-900">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Cronómetro en Vivo</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Toma tiempos en piso de planta con la barra espaciadora.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <span>Abrir Cronómetro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Entendido, ver Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
