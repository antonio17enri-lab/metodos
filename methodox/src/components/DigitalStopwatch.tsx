import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Operation } from '../types/methodox';
import { formatSecondsToTime, calculateObservedTime, calculateRecommendedSampleSize } from '../utils/engineeringMath';

interface DigitalStopwatchProps {
  operations: Operation[];
  selectedOperationId?: string;
  onSelectOperation: (id: string) => void;
  onSaveCyclesToOperation: (operationId: string, cycles: number[]) => void;
}

export const DigitalStopwatch: React.FC<DigitalStopwatchProps> = ({
  operations,
  selectedOperationId,
  onSelectOperation,
  onSaveCyclesToOperation,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mode, setMode] = useState<'flyback' | 'continuous'>('flyback'); // Vuelta a cero vs Continuo
  const [laps, setLaps] = useState<number[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const activeOp = operations.find((o) => o.id === selectedOperationId) || operations[0];

  // Update timer loop
  const updateTimer = () => {
    const now = performance.now();
    const current = accumulatedTimeRef.current + (now - startTimeRef.current) / 1000;
    setElapsedSeconds(current);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStartPause = () => {
    if (isRunning) {
      // Pause
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      accumulatedTimeRef.current = elapsedSeconds;
      setIsRunning(false);
    } else {
      // Start
      startTimeRef.current = performance.now();
      setIsRunning(true);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const handleReset = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsRunning(false);
    accumulatedTimeRef.current = 0;
    setElapsedSeconds(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (elapsedSeconds <= 0) return;

    if (mode === 'flyback') {
      // En modo vuelta a cero, registramos el tiempo del ciclo actual y reiniciamos el segundero
      const lapTime = parseFloat(elapsedSeconds.toFixed(2));
      setLaps((prev) => [...prev, lapTime]);

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      accumulatedTimeRef.current = 0;
      setElapsedSeconds(0);

      if (isRunning) {
        startTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    } else {
      // Modo continuo: calculamos la diferencia respecto a la vuelta anterior
      const totalLapTime = parseFloat(elapsedSeconds.toFixed(2));
      const previousTotal = laps.reduce((a, b) => a + b, 0);
      const currentLapDuration = parseFloat((totalLapTime - previousTotal).toFixed(2));
      if (currentLapDuration > 0) {
        setLaps((prev) => [...prev, currentLapDuration]);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.code === 'Enter' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleLap();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, elapsedSeconds, mode, laps]);

  // Statistics from recorded laps
  const lapCount = laps.length;
  const avgLap = calculateObservedTime(laps);
  const minLap = lapCount > 0 ? Math.min(...laps) : 0;
  const maxLap = lapCount > 0 ? Math.max(...laps) : 0;
  const recommendedN = calculateRecommendedSampleSize(laps);

  const handleTransferTimes = () => {
    if (!activeOp || laps.length === 0) return;
    onSaveCyclesToOperation(activeOp.id, laps);
    setNotification(`Se transfirieron ${laps.length} ciclos cronometrados a "${activeOp.name}"`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Operation Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 font-medium">Cronometraje Digital de Procesos</div>
          <h2 className="text-lg font-bold text-slate-900">Estudio de Tiempos en Piso de Planta</h2>
          <p className="text-xs text-slate-600">
            Utiliza atajos de teclado: <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">Espacio</kbd> (Iniciar/Pausar), <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">Enter</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">L</kbd> (Vuelta), <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono">R</kbd> (Reiniciar).
          </p>
        </div>

        {/* Selected target operation */}
        <div className="w-full md:w-auto min-w-[320px]">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Actividad Destino a Cronometrar:
          </label>
          <select
            value={activeOp?.id || ''}
            onChange={(e) => onSelectOperation(e.target.value)}
            disabled={operations.length === 0}
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          >
            {operations.length === 0 ? (
              <option value="">-- Sin operaciones aún (Crea una en Estudio de Tiempos) --</option>
            ) : (
              operations.map((op, idx) => (
                <option key={op.id} value={op.id}>
                  {idx + 1}. {op.name} ({op.station})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Stopwatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stopwatch Display and Controls */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              onClick={() => setMode('flyback')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'flyback'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vuelta a Cero (Flyback)
            </button>
            <button
              onClick={() => setMode('continuous')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'continuous'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lectura Continua (Cumulative)
            </button>
          </div>

          {/* Digital Chrono Face */}
          <div className="w-full max-w-md py-8 px-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner my-2">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
              {isRunning ? 'CRONOMETRANDO...' : elapsedSeconds > 0 ? 'EN PAUSA' : 'LISTO'}
            </div>
            <div className="font-mono text-5xl md:text-6xl font-bold tracking-tight text-emerald-400 tabular-nums">
              {formatSecondsToTime(elapsedSeconds)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-3">
              {elapsedSeconds.toFixed(2)} segundos acumulados
            </div>
          </div>

          {/* Current Operation Info */}
          {activeOp && (
            <div className="mt-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 max-w-md w-full">
              <span className="font-semibold text-slate-900">{activeOp.station}:</span> {activeOp.name}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar (R)
            </button>

            <button
              onClick={handleStartPause}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg text-white transition-colors ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  Pausar (Espacio)
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Iniciar (Espacio)
                </>
              )}
            </button>

            <button
              onClick={handleLap}
              disabled={elapsedSeconds === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors"
            >
              <Flag className="w-4 h-4" />
              Registrar Ciclo (Enter / L)
            </button>
          </div>
        </div>

        {/* Right: Recorded Laps & Sample Size Statistics */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Ciclos Cronometrados ({lapCount})
              </h3>
              {lapCount > 0 && (
                <button
                  onClick={() => setLaps([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  Limpiar vueltas
                </button>
              )}
            </div>

            {/* Lap list */}
            <div className="mt-4 max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
              {lapCount === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Aún no se han registrado tomas de tiempo. Presiona <span className="font-semibold text-slate-600">Iniciar</span> y pulsa <span className="font-semibold text-slate-600">Registrar Ciclo</span> al concluir cada ciclo.
                </div>
              ) : (
                laps.map((lap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-medium text-slate-600">Ciclo {idx + 1}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {lap.toFixed(2)} s ({formatSecondsToTime(lap)})
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Statistical summary */}
            {lapCount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Tiempo Observado Promedio (TO):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{avgLap} s</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Rango de Variabilidad:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{(maxLap - minLap).toFixed(2)} s</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Muestra Recomendada (OIT/Maytag):</span>
                    <span className="text-slate-700 text-xs">
                      {lapCount >= recommendedN ? 'Confianza estadística alcanzada' : `Se requieren ${recommendedN} ciclos para 95% de confianza`}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${lapCount >= recommendedN ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {lapCount} / {recommendedN} tomas
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action: Transfer to selected operation */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            {notification && (
              <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            <button
              onClick={handleTransferTimes}
              disabled={lapCount === 0 || !activeOp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-xs"
            >
              <span>
                {activeOp
                  ? `Transferir ${lapCount} Tiempos a "${activeOp.name}"`
                  : 'Registra una operación en Estudio de Tiempos para transferir'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
