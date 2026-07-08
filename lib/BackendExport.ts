/**
 * MotorMap — lib/BackendExport.ts
 * Construye el payload relacional por intento, listo para persistir en el
 * backend (Firebase: Firestore + Storage), siguiendo:
 * - Informe de abril, sección 3.2 (colecciones) y 3.3 (trazo JSON)
 * - Plan de Julio, sección 8 (estructura mínima de almacenamiento)
 * - Doc "Métricas de desarrollo" (métricas generales + por actividad)
 *
 * En la Fase 4 (Semana 4) este payload se envía tal cual a Firestore:
 *   participants / sessions / sessions/{id}/attempts / .../trace_data / .../metrics
 */

import {
  Stroke,
  AttemptMetrics,
  Participant,
  Session,
  AttemptRecord,
  FullMetricsRecord,
  BackendAttemptPayload,
} from '../types/drawing';
import { toTraceJSON } from './TraceAnalysis';

/** Métricas específicas por actividad según el doc "Métricas de desarrollo" */
const ACTIVITY_SPECIFIC_KEYS: Record<string, (keyof AttemptMetrics)[]> = {
  // 1. Sigue el Camino
  '1': ['meanDistanceToPath', 'maxDistanceToPath', 'percentWithinTolerance', 'pathCompletionPercent'],
  // 2. Dentro del Carril
  '2': ['percentInsideLane', 'exitCount', 'timeOutsideLaneMs', 'meanDistanceOutsideLane'],
  // 3. Une los Puntos
  '3': ['pointsReached', 'correctSequencePercent', 'sequenceErrors', 'omissions', 'timeBetweenPoints'],
  // 4. Copia la Forma
  '4': ['shapeSimilarityScore', 'closureError', 'scaleDifference', 'proportionDifference', 'rotationDifference'],
  // 5. Montaña Rusa
  '5': ['curveErrorMean', 'curveErrorMax', 'directionChangeControl', 'speedVariabilityInCurves'],
  // 6. Laberinto
  '6': ['collisionCount', 'deadEndCount', 'backtrackCount', 'mazeCompletionPercent'],
};

const num = (v: number | undefined): number => (typeof v === 'number' && isFinite(v) ? v : 0);

export interface BuildPayloadArgs {
  participant: Participant;
  session: Session;
  activityId: string;
  templateId: string;
  attemptNumber: number;
  strokes: Stroke[];
  metrics: AttemptMetrics;
}

export const buildAttemptPayload = (args: BuildPayloadArgs): BackendAttemptPayload => {
  const { participant, session, activityId, templateId, attemptNumber, strokes, metrics } = args;

  const attemptId = metrics.attemptId || `attempt-${Date.now()}`;

  // Control de calidad del dato (heurística de Desarrollo 2, conservada)
  const qualityFlag: AttemptRecord['qualityFlag'] =
    strokes.length === 0 || num(metrics.pointCount) === 0
      ? 'empty'
      : strokes.length > 15 && num(metrics.totalTimeMs) < 3000
        ? 'noisy'
        : 'good';

  const attempt: AttemptRecord = {
    attemptId,
    sessionId: session.sessionId,
    activityId,
    templateId,
    attemptNumber,
    durationMs: num(metrics.totalTimeMs) || num(metrics.duration),
    completed: metrics.accuracy >= 70,
    qualityFlag,
  };

  // Métricas generales del doc + específicas de la actividad
  const activitySpecific: Record<string, number> = {};
  (ACTIVITY_SPECIFIC_KEYS[activityId] || []).forEach(key => {
    const v = metrics[key];
    if (typeof v === 'number') activitySpecific[key] = v;
  });

  const fullMetrics: FullMetricsRecord = {
    attemptId,
    strokeCount: num(metrics.strokeCount),
    pointCount: num(metrics.pointCount),
    totalTimeMs: num(metrics.totalTimeMs),
    traceLength: num(metrics.traceLength),
    pauseCount: num(metrics.pauseCount),
    pauseTotalMs: num(metrics.pauseTotalMs),
    meanSpeed: num(metrics.meanSpeed),
    medianSpeed: num(metrics.medianSpeed),
    maxSpeed: num(metrics.maxSpeed),
    speedVariability: num(metrics.speedVariability),
    accelerationMean: num(metrics.accelerationMean),
    accelerationVariability: num(metrics.accelerationVariability),
    smoothnessScore: num(metrics.smoothnessScore),
    stabilityScore: num(metrics.stabilityScore),
    precisionScore: num(metrics.precisionScore),
    completionScore: num(metrics.completionScore),
    activitySpecific,
  };

  return {
    participant,
    session: { ...session, endedAt: new Date().toISOString() },
    attempt,
    metrics: fullMetrics,
    traceData: {
      attemptId,
      traceJson: toTraceJSON(strokes),
    },
  };
};

/**
 * Log estructurado del payload (reemplaza los console.log inline).
 * En la Fase 4 se sustituye el cuerpo por las escrituras a Firestore.
 */
export const logAttemptPayload = (payload: BackendAttemptPayload): void => {
  console.log('==================================================');
  console.log('📊 MOTORMAP · PAYLOAD DE INTENTO PARA BACKEND');
  console.log(`Fecha: ${new Date().toISOString()}`);
  console.log('==================================================');
  console.log('👤 [participants]');
  console.log(JSON.stringify(payload.participant, null, 2));
  console.log('📅 [sessions]');
  console.log(JSON.stringify(payload.session, null, 2));
  console.log('✏️ [sessions/{id}/attempts]');
  console.log(JSON.stringify(payload.attempt, null, 2));
  console.log('📈 [.../metrics]');
  console.log(JSON.stringify(payload.metrics, null, 2));
  console.log('🖌️ [.../trace_data]  (formatVersion ' + payload.traceData.traceJson.formatVersion + ')');
  console.log(JSON.stringify({
    attemptId: payload.traceData.attemptId,
    strokes: payload.traceData.traceJson.strokes.length,
    points: payload.traceData.traceJson.strokes.reduce((a, s) => a + s.points.length, 0),
  }, null, 2));
  console.log('==================================================');
};
