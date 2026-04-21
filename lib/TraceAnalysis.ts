import { Point, Stroke, AttemptMetrics } from '../types/drawing';

/**
 * Calculates the Euclidean distance between two points
 */
export const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculates the total length of a path defined by points
 */
export const getPathLength = (points: { x: number; y: number }[]): number => {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += getDistance(points[i - 1], points[i]);
  }
  return length;
};

/**
 * Simplified accuracy calculation:
 * For each point in the user's strokes, find the distance to the nearest point in the template.
 * The score is based on how many points were within a certain threshold.
 */
export const calculateAccuracy = (
  userStrokes: Stroke[],
  templatePoints: { x: number; y: number }[],
  threshold: number = 30
): number => {
  if (userStrokes.length === 0 || templatePoints.length === 0) return 0;

  let totalPoints = 0;
  let pointsNearTemplate = 0;

  userStrokes.forEach(stroke => {
    stroke.points.forEach(p => {
      totalPoints++;
      // Find nearest point in template
      let minDistance = Infinity;
      templatePoints.forEach(tp => {
        const dist = getDistance(p, tp);
        if (dist < minDistance) minDistance = dist;
      });

      if (minDistance <= threshold) {
        pointsNearTemplate++;
      }
    });
  });

  return Math.round((pointsNearTemplate / totalPoints) * 100);
};

/**
 * Detects how many times the user leaves the "lane"
 */
export const calculateDepartures = (
  strokes: Stroke[],
  templatePoints: { x: number; y: number }[],
  laneWidth: number
): number => {
  let departures = 0;
  let isCurrentlyOutside = false;
  const radius = laneWidth / 2;

  strokes.forEach(stroke => {
    stroke.points.forEach(p => {
      let minDistance = Infinity;
      templatePoints.forEach(tp => {
        const dist = getDistance(p, tp);
        if (dist < minDistance) minDistance = dist;
      });

      const outside = minDistance > radius;
      if (outside && !isCurrentlyOutside) {
        departures++;
        isCurrentlyOutside = true;
      } else if (!outside && isCurrentlyOutside) {
        isCurrentlyOutside = false;
      }
    });
  });

  return departures;
};

/**
 * Calculates metrics for an attempt
 */
export const analyzeAttempt = (
  strokes: Stroke[],
  templatePoints: { x: number; y: number }[],
  activityType: string,
  threshold: number = 40,
  laneWidth: number = 60
): AttemptMetrics => {
  const strokeCount = strokes.length;
  let totalDuration = 0;
  let totalLength = 0;
  
  strokes.forEach(s => {
    if (s.endTime) totalDuration += (s.endTime - s.startTime);
    totalLength += getPathLength(s.points);
  });

  const accuracy = calculateAccuracy(strokes, templatePoints, threshold);
  
  let departures = 0;
  if (activityType === 'stay_inside') {
    departures = calculateDepartures(strokes, templatePoints, laneWidth);
  }

  return {
    accuracy,
    duration: totalDuration,
    strokeCount,
    pathLength: Math.round(totalLength),
    departures
  };
};
