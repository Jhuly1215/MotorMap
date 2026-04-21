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
