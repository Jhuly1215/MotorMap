export interface Point {
  x: number;
  y: number;
  t: number; // timestamp in ms relative to start
}

export interface Stroke {
  id: string;
  points: Point[];
  startTime: number;
  endTime?: number;
  color: string;
  width: number;
}

export interface AttemptMetrics {
  accuracy: number; // 0-100
  duration: number; // ms
  strokeCount: number;
  pathLength: number;
  departures?: number; // times left the lane
  avgSpeed?: number;

  // Laberinto
  collisionCount?: number;
  deadEndCount?: number;
  backtrackCount?: number;
  mazeCompletionPercent?: number;
  timeInsidePathPercent?: number;

  // Copia la forma
  shapeSimilarityScore?: number;
  closureError?: number;
  scaleDifference?: number;
  proportionDifference?: number;
  rotationDifference?: number;

  // Dentro del carril
  percentInsideLane?: number;
  exitCount?: number;
  timeOutsideLaneMs?: number;
  meanDistanceOutsideLane?: number;

  // Sigue el Camino (doc Métricas de desarrollo, sección 1)
  meanDistanceToPath?: number;
  maxDistanceToPath?: number;
  percentWithinTolerance?: number;
  pathCompletionPercent?: number;

  // Une los Puntos (doc, sección 3)
  pointsReached?: number;
  correctSequencePercent?: number;
  sequenceErrors?: number;
  omissions?: number;
  timeBetweenPoints?: number; // ms promedio entre puntos consecutivos correctos

  // Montaña Rusa (doc, sección 5)
  curveErrorMean?: number;
  curveErrorMax?: number;
  directionChangeControl?: number;    // 0-100
  speedVariabilityInCurves?: number;  // coeficiente de variación en zonas de curva

  // Trazo crudo por intento (Informe abril, 3.3)
  traceJson?: TraceJSON;

  // Métricas comunes de cada intento
  attemptId?: string;
  pointCount?: number;
  totalTimeMs?: number;
  traceLength?: number;
  pauseCount?: number;
  pauseTotalMs?: number;
  meanSpeed?: number;
  medianSpeed?: number;
  maxSpeed?: number;
  speedVariability?: number;
  accelerationMean?: number;
  accelerationVariability?: number;
  smoothnessScore?: number;
  stabilityScore?: number;
  precisionScore?: number;
  completionScore?: number;
  createdAt?: string;
}

export interface Attempt {
  id: string;
  activityId: string;
  timestamp: number;
  strokes: Stroke[];
  metrics: AttemptMetrics;
  completed: boolean;
}

export type ActivityType = 'follow_line' | 'connect_dots' | 'copy_shape' | 'stay_inside' | 'free_draw';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  color: string;
  difficulty: 1 | 2 | 3;
}

export interface ActivityTemplate {
  id: string;
  path: string; // SVG path data
  width: number; // design width context
  height: number; // design height context
}

export interface Participant {
  participantId: string;
  ageMonths: number;
  sex: 'M' | 'F' | 'other';
  dominantHand: 'right' | 'left' | 'ambidextrous';
  groupId: string;
}

export interface Session {
  sessionId: string;
  participantId: string;
  deviceId: string;
  startedAt: string;
  endedAt?: string;
  sessionNumber: number;
}

export interface AttemptRecord {
  attemptId: string;
  sessionId: string;
  activityId: string;
  templateId: string;
  attemptNumber: number;
  durationMs: number;
  completed: boolean;
  qualityFlag: 'good' | 'noisy' | 'empty';
}

export interface TraceDataRecord {
  attemptId: string;
  traceJson: string;
}

export interface MetricsRecord {
  attemptId: string;
  strokeCount: number;
  pointCount: number;
  traceLength: number;
  meanSpeed: number;
  speedVariability: number;
  pauseCount: number;
  precisionScore: number;
  completionScore: number;
  smoothnessScore: number;
}

/**
 * Formato del trazo crudo por intento (Informe de abril, sección 3.3):
 * { formatVersion: "1.0", strokes: [{ strokeId, points: [{ i, t, x, y, p?, phase }] }] }
 * t es relativo al inicio del intento, en ms.
 */
export interface TracePoint {
  i: number;
  t: number;
  x: number;
  y: number;
  p?: number;
  phase?: 'down' | 'move' | 'up';
}

export interface TraceStroke {
  strokeId: number;
  points: TracePoint[];
}

export interface TraceJSON {
  formatVersion: '1.0';
  strokes: TraceStroke[];
}

/** Registro completo de métricas por intento (doc "Métricas de desarrollo") */
export interface FullMetricsRecord {
  attemptId: string;
  // Generales
  strokeCount: number;
  pointCount: number;
  totalTimeMs: number;
  traceLength: number;
  pauseCount: number;
  pauseTotalMs: number;
  meanSpeed: number;
  medianSpeed: number;
  maxSpeed: number;
  speedVariability: number;
  accelerationMean: number;
  accelerationVariability: number;
  smoothnessScore: number;
  stabilityScore: number;
  precisionScore: number;
  completionScore: number;
  // Específicas de la actividad (solo las que apliquen)
  activitySpecific: Record<string, number>;
}

/** Payload completo listo para enviar al backend (Firestore) */
export interface BackendAttemptPayload {
  participant: Participant;
  session: Session;
  attempt: AttemptRecord;
  metrics: FullMetricsRecord;
  traceData: {
    attemptId: string;
    traceJson: TraceJSON;
  };
}
