import React from 'react';
import { Process } from '../types/methodox';
import { Plus, RotateCcw, Trash2, FileText } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'operations' | 'stopwatch' | 'dop' | 'yamazumi' | 'kaizen';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  processes: Process[];
  activeProcessId: string;
  onSelectProcess: (id: string) => void;
  onCreateNewProcess: () => void;
  onOpenReport: () => void;
  onClearAllToZero: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  processes,
  activeProcessId,
  onSelectProcess,
  onCreateNewProcess,
  onOpenReport,
  onClearAllToZero,
  onResetDemo,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'operations', label: 'Estudio de Tiempos' },
    { id: 'stopwatch', label: 'Cronómetro' },
    { id: 'dop', label: 'Diagrama ASME' },
    { id: 'yamazumi', label: 'Gráfico de Balanceo' },
    { id: 'kaizen', label: 'Simulación Kaizen' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('dashboard');
              }}
              className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
            >
              METHODOX
            </a>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500 whitespace-nowrap">
              Ingeniería de Métodos
            </span>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                  activeTab === item.id
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions (Borrar Todo a 0 + Restablecer Demo + Ficha OIT) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClearAllToZero}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Borrar todas las operaciones y dejar todo en 0 para ingresar datos propios de fábrica"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Borrar Todo a 0</span>
              <span className="sm:hidden">Limpiar a 0</span>
            </button>

            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Cargar el caso de demostración completo (8 min vs 6 min)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Restablecer Demostración</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Ficha OIT
            </button>
          </div>
        </div>

        {/* Sub-bar for mobile navigation and Process Switcher */}
        <div className="py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Process Switcher dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Proceso:</span>
            <select
              value={activeProcessId}
              onChange={(e) => onSelectProcess(e.target.value)}
              className="font-medium text-xs border border-slate-200 rounded-md px-2.5 py-1 bg-slate-50 text-slate-900 max-w-xs truncate focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              {processes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.operations.length} act.)
                </option>
              ))}
            </select>

            <button
              onClick={onCreateNewProcess}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              title="Crear Nuevo Proceso"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Tab Pills for small screens */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
