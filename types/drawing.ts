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
