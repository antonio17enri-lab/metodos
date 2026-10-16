import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Method Engineering Diagnostic endpoint
app.post('/api/ai-diagnose', async (req, res) => {
  try {
    const { processName, operations, totalStandardTimeMin, bottleneckStation, taktTimeMin } = req.body;

    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({ error: 'Operaciones no válidas' });
    }

    if (!ai) {
      // Deterministic expert engine fallback when API key is not yet set
      const wasteOps = operations.filter((op: any) => op.valueType === 'NVA' || op.asmeType === 'delay' || op.name.toLowerCase().includes('busc') || op.name.toLowerCase().includes('esper'));
      const wasteTimeMin = wasteOps.reduce((acc: number, op: any) => acc + (op.standardTimeMin || 0), 0);
      const potentialTime = Math.max(1, totalStandardTimeMin - wasteTimeMin * 0.85);

      return res.json({
        source: 'rule-engine',
        diagnosticSummary: `El proceso "${processName}" cuenta con ${operations.length} actividades registradas. Se detectó un tiempo total de ciclo de ${totalStandardTimeMin.toFixed(2)} min, con ${wasteOps.length} actividades identificadas como Desperdicio (Muda) o Demoras que consumen aprox. ${wasteTimeMin.toFixed(2)} min.`,
        bottleneckAnalysis: bottleneckStation ? `El cuello de botella crítico se sitúa en la estación "${bottleneckStation}", limitando el ritmo de salida global.` : 'Variabilidad moderada entre estaciones de trabajo.',
        fiveSRecommendations: [
          'Implementar Tablero de Sombras (Shadow Board) para herramientas mecánicas y tornillería en el punto de uso (Poka-Yoke / 5S).',
          'Eliminar desplazamientos y transportes intermedios mediante un diseño de celda en U o mesa de ensamble con alimentación por gravedad (Kamban).',
          'Estandarizar el kit de ensamble previo para evitar esperas y desplazamientos del operario fuera de su radio ergonómico de alcance (Regla de Barnes).'
        ],
        simulatedImprovements: {
          currentCycleMin: totalStandardTimeMin,
          proposedCycleMin: parseFloat(potentialTime.toFixed(2)),
          timeSavedMin: parseFloat((totalStandardTimeMin - potentialTime).toFixed(2)),
          productivityIncreasePercent: parseFloat((((totalStandardTimeMin / potentialTime) - 1) * 100).toFixed(1)),
          keyAction: 'Eliminación sistemática de mudas de búsqueda de herramientas y esperas de piezas.'
        }
      });
    }

    const prompt = `Actúa como un Ingeniero Industrial Senior especialista en Ingeniería de Métodos, Estudio de Tiempos y Movimientos (Frank & Lillian Gilbreth, Maynard MTM) y Lean Manufacturing (Yamazumi, 5S, SMED, Balanceo de Líneas).
Analiza el siguiente proceso productivo:
Proceso: ${processName}
Tiempo Estándar Total Actual: ${totalStandardTimeMin} minutos
Takt Time objetivo: ${taktTimeMin ? taktTimeMin + ' minutos' : 'No especificado'}
Estación Cuello de Botella: ${bottleneckStation || 'No especificada'}

Lista de Operaciones registradas con tiempos cronometrados y clasificación ASME/Muda:
${JSON.stringify(operations.map((o: any, idx: number) => ({
  orden: idx + 1,
  nombre: o.name,
  estacion: o.station,
  tipoASME: o.asmeType,
  clasificacionValor: o.valueType,
  tiempoObservadoMin: o.observedTimeMin,
  tiempoEstandarMin: o.standardTimeMin,
  detalles: o.notes || ''
})), null, 2)}

Genera un diagnóstico técnico riguroso en formato JSON con la siguiente estructura exacta:
{
  "diagnosticSummary": "Resumen conciso del estado actual y pérdidas detectadas",
  "bottleneckAnalysis": "Análisis específico del cuello de botella y su causa raíz",
  "fiveSRecommendations": [
    "Recomendación 1 específica (ej. 5S, ergonomía, distribución de puesto)",
    "Recomendación 2 específica",
    "Recomendación 3 específica"
  ],
  "simulatedImprovements": {
    "currentCycleMin": ${totalStandardTimeMin},
    "proposedCycleMin": 0.0,
    "timeSavedMin": 0.0,
    "productivityIncreasePercent": 0.0,
    "keyAction": "Acción principal de alto impacto"
  }
}`;

    let parsed: any = null;
    if (ai) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout')), 8000)
        );
        const aiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const response: any = await Promise.race([aiCall, timeoutPromise]);
        parsed = JSON.parse(response.text || '{}');
      } catch (aiErr) {
        console.warn('AI call fallback to rule engine:', aiErr);
      }
    }

    if (parsed && parsed.diagnosticSummary) {
      return res.json({
        source: 'gemini-3.8-flash',
        ...parsed,
      });
    }

    // Fallback deterministic expert engine
    const wasteOps = operations.filter((op: any) => op.valueType === 'NVA' || op.asmeType === 'delay' || (op.name && (op.name.toLowerCase().includes('busc') || op.name.toLowerCase().includes('esper'))));
    const wasteTimeMin = wasteOps.reduce((acc: number, op: any) => acc + (op.standardTimeMin || 0), 0);
    const potentialTime = Math.max(1, totalStandardTimeMin - wasteTimeMin * 0.85);

    return res.json({
      source: 'rule-engine',
      diagnosticSummary: `El proceso "${processName}" cuenta con ${operations.length} actividades registradas. Se detectó un tiempo total de ciclo de ${totalStandardTimeMin.toFixed(2)} min, con ${wasteOps.length} actividades identificadas como Desperdicio (Muda) o Demoras que consumen aprox. ${wasteTimeMin.toFixed(2)} min.`,
      bottleneckAnalysis: bottleneckStation ? `El cuello de botella crítico se sitúa en la estación "${bottleneckStation}", limitando el ritmo de salida global.` : 'Variabilidad moderada entre estaciones de trabajo.',
      fiveSRecommendations: [
        'Implementar Tablero de Sombras (Shadow Board) para herramientas mecánicas y tornillería en el punto de uso (Poka-Yoke / 5S).',
        'Eliminar desplazamientos y transportes intermedios mediante un diseño de celda en U o mesa de ensamble con alimentación por gravedad.',
        'Estandarizar el kit de ensamble previo para evitar esperas y desplazamientos del operario fuera de su radio ergonómico de alcance (Regla de Barnes).'
      ],
      simulatedImprovements: {
        currentCycleMin: totalStandardTimeMin,
        proposedCycleMin: parseFloat(potentialTime.toFixed(2)),
        timeSavedMin: parseFloat((totalStandardTimeMin - potentialTime).toFixed(2)),
        productivityIncreasePercent: parseFloat((((totalStandardTimeMin / potentialTime) - 1) * 100).toFixed(1)),
        keyAction: 'Eliminación sistemática de mudas de búsqueda de herramientas y esperas de piezas.'
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai-diagnose:', error);
    return res.status(500).json({ error: error.message || 'Error en el análisis de métodos' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`METHODOX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
