import React, { useState, useEffect } from 'react';
import { Process, Operation } from './types/methodox';
import { INITIAL_PROCESSES } from './data/initialProcesses';
import { calculateLineMetrics } from './utils/engineeringMath';
import { Header, ActiveTab } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { OperationList } from './components/OperationList';
import { DigitalStopwatch } from './components/DigitalStopwatch';
import { DOPDiagram } from './components/DOPDiagram';
import { YamazumiChart } from './components/YamazumiChart';
import { KaizenComparison } from './components/KaizenComparison';
import { TechnicalReportModal } from './components/TechnicalReportModal';
import { NewProcessModal } from './components/NewProcessModal';
import { WelcomeMethodsModal } from './components/WelcomeMethodsModal';
import { CleanSlateModal } from './components/CleanSlateModal';
import { RotateCcw, Trash2 } from 'lucide-react';

export default function App() {
  const [processes, setProcesses] = useState<Process[]>(() => {
    try {
      const saved = localStorage.getItem('methodox_processes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load processes from storage', e);
    }
    return INITIAL_PROCESSES;
  });

  const [activeProcessId, setActiveProcessId] = useState<string>(() => {
    return INITIAL_PROCESSES[0].id;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedOpForTimingId, setSelectedOpForTimingId] = useState<string | undefined>();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isCleanSlateModalOpen, setIsCleanSlateModalOpen] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('methodox_processes', JSON.stringify(processes));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [processes]);

  const activeProcess = processes.find((p) => p.id === activeProcessId) || processes[0];
  const metrics = calculateLineMetrics(activeProcess);

  // Target improved process for Kaizen comparison view
  const improvedProcess =
    processes.find((p) => p.isImprovedMethod && p.baselineProcessId === activeProcess.id) ||
    processes.find((p) => p.id === 'proc-assembly-improved');

  // Handlers for Operations
  const handleAddOperation = (newOpData: Omit<Operation, 'id' | 'order'>) => {
    const newOp: Operation = {
      ...newOpData,
      id: 'op-' + Date.now(),
      order: activeProcess.operations.length + 1,
    };

    const updatedOps = [...activeProcess.operations, newOp];
    updateActiveProcessOperations(updatedOps);
  };

  const handleUpdateOperation = (updatedOp: Operation) => {
    const updatedOps = activeProcess.operations.map((op) =>
      op.id === updatedOp.id ? updatedOp : op
    );
    updateActiveProcessOperations(updatedOps);
  };

  const handleDeleteOperation = (opId: string) => {
    const updatedOps = activeProcess.operations.filter((op) => op.id !== opId);
    updateActiveProcessOperations(updatedOps);
  };

  const updateActiveProcessOperations = (newOps: Operation[]) => {
    const updatedProcess: Process = {
      ...activeProcess,
      operations: newOps,
      updatedAt: new Date().toISOString(),
    };

    setProcesses((prev) =>
      prev.map((p) => (p.id === activeProcess.id ? updatedProcess : p))
    );
  };

  // Stopwatch transfer
  const handleSaveCyclesToOperation = (operationId: string, cycles: number[]) => {
    const targetOp = activeProcess.operations.find((o) => o.id === operationId);
    if (!targetOp || cycles.length === 0) return;

    const avg = parseFloat((cycles.reduce((a, b) => a + b, 0) / cycles.length).toFixed(1));
    const normal = parseFloat((avg * (targetOp.ratingFactor / 100)).toFixed(1));
    const std = parseFloat((normal * (1 + targetOp.allowancePercent / 100)).toFixed(1));

    const updatedOp: Operation = {
      ...targetOp,
      cyclesSec: cycles,
      observedTimeSec: avg,
      normalTimeSec: normal,
      standardTimeSec: std,
      standardTimeMin: parseFloat((std / 60).toFixed(2)),
    };

    handleUpdateOperation(updatedOp);
  };

  // Select operation and switch to stopwatch tab
  const handleSelectForTiming = (opId: string) => {
    setSelectedOpForTimingId(opId);
    setActiveTab('stopwatch');
  };

  // Demand parameters update
  const handleUpdateDemandParams = (shiftHours: number, demandPerDay: number) => {
    const updatedProcess: Process = {
      ...activeProcess,
      shiftHours,
      demandPerDay,
      updatedAt: new Date().toISOString(),
    };

    setProcesses((prev) =>
      prev.map((p) => (p.id === activeProcess.id ? updatedProcess : p))
    );
  };

  // Fork and save simulated Kaizen process
  const handleForkWithSimulation = (simProcess: Process) => {
    setProcesses((prev) => [...prev, simProcess]);
    setActiveProcessId(simProcess.id);
    setActiveTab('operations');
  };

  // Create new custom process
  const handleCreateProcess = (newProc: Process) => {
    setProcesses((prev) => [...prev, newProc]);
    setActiveProcessId(newProc.id);
    setActiveTab('operations');
  };

  // 1. Borrar Todo a 0 (Lienzo completamente limpio para empezar de cero)
  const handleClearAllToZero = () => {
    const blankProcess: Process = {
      id: 'proc-blank-' + Date.now(),
      name: 'Mi Proceso en Blanco (Estudio desde 0)',
      code: 'PR-REAL-01',
      industry: 'Manufactura / Servicios',
      product: 'Producto de Fábrica',
      description: 'Lienzo limpio sin operaciones precargadas. Registra tus actividades reales en el Estudio de Tiempos o cronometra en piso.',
      shiftHours: 8,
      demandPerDay: 50,
      hourlyLaborCost: 35.0,
      operations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProcesses([blankProcess]);
    setActiveProcessId(blankProcess.id);
    localStorage.removeItem('methodox_processes');
    setActiveTab('dashboard');
    setIsCleanSlateModalOpen(true);
  };

  // 2. Restablecer Demostración (Caso práctico completo de fábrica de 8 min a 6 min)
  const handleResetDemo = () => {
    setProcesses(INITIAL_PROCESSES);
    setActiveProcessId(INITIAL_PROCESSES[0].id);
    localStorage.removeItem('methodox_processes');
    setActiveTab('dashboard');
    setIsWelcomeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar adhering to the Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        processes={processes}
        activeProcessId={activeProcess.id}
        onSelectProcess={setActiveProcessId}
        onCreateNewProcess={() => setIsNewProcessModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onClearAllToZero={handleClearAllToZero}
        onResetDemo={handleResetDemo}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            process={activeProcess}
            metrics={metrics}
            onOpenReport={() => setIsReportModalOpen(true)}
            onNavigateToTiming={() => setActiveTab('stopwatch')}
            onNavigateToKaizen={() => setActiveTab('kaizen')}
          />
        )}

        {activeTab === 'operations' && (
          <OperationList
            operations={activeProcess.operations}
            onAddOperation={handleAddOperation}
            onUpdateOperation={handleUpdateOperation}
            onDeleteOperation={handleDeleteOperation}
            onSelectForTiming={handleSelectForTiming}
          />
        )}

        {activeTab === 'stopwatch' && (
          <DigitalStopwatch
            operations={activeProcess.operations}
            selectedOperationId={selectedOpForTimingId}
            onSelectOperation={setSelectedOpForTimingId}
            onSaveCyclesToOperation={handleSaveCyclesToOperation}
          />
        )}

        {activeTab === 'dop' && (
          <DOPDiagram
            operations={activeProcess.operations}
            metrics={metrics}
            processName={activeProcess.name}
          />
        )}

        {activeTab === 'yamazumi' && (
          <YamazumiChart
            operations={activeProcess.operations}
            metrics={metrics}
            shiftHours={activeProcess.shiftHours}
            demandPerDay={activeProcess.demandPerDay}
            onUpdateDemandParams={handleUpdateDemandParams}
          />
        )}

        {activeTab === 'kaizen' && (
          <KaizenComparison
            currentProcess={activeProcess}
            improvedProcess={improvedProcess}
            allProcesses={processes}
            onSelectCurrentProcess={setActiveProcessId}
            onSelectImprovedProcess={(id) => {
              const proc = processes.find((p) => p.id === id);
              if (proc) setActiveProcessId(proc.id);
            }}
            onForkWithSimulation={handleForkWithSimulation}
          />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">METHODOX</span>
            <span>·</span>
            <span>Plataforma de Ingeniería de Métodos</span>
            <span>·</span>
            <span className="font-mono text-emerald-700 font-semibold">Moneda: Quetzales (Q)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAllToZero}
              className="text-rose-700 hover:text-rose-800 flex items-center gap-1.5 transition-colors font-medium"
              title="Borrar todo y empezar desde cero con un proceso limpio"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar Todo a 0</span>
            </button>
            <span>·</span>
            <button
              onClick={handleResetDemo}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-medium"
              title="Restablecer caso de demostración"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Demostración</span>
            </button>
            <span>·</span>
            <span>Normas OIT & ASME</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TechnicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        process={activeProcess}
        metrics={metrics}
      />

      <NewProcessModal
        isOpen={isNewProcessModalOpen}
        onClose={() => setIsNewProcessModalOpen(false)}
        onCreateProcess={handleCreateProcess}
      />

      {/* Welcome Modal when Resetting Demo */}
      <WelcomeMethodsModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      {/* Clean Slate Modal when Clearing to 0 */}
      <CleanSlateModal
        isOpen={isCleanSlateModalOpen}
        onClose={() => setIsCleanSlateModalOpen(false)}
        onGoToOperations={() => setActiveTab('operations')}
        onGoToStopwatch={() => setActiveTab('stopwatch')}
      />
    </div>
  );
}
