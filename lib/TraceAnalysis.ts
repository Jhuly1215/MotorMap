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

const getMean = (arr: number[]) => {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
};

const getMedian = (arr: number[]) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const getStdDev = (arr: number[], mean: number) => {
  if (arr.length <= 1) return 0;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
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

  return totalPoints > 0 ? Math.round((pointsNearTemplate / totalPoints) * 100) : 0;
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
 * Analyzes a connect_dots activity attempt:
 * Checks if the user's strokes pass near all dots in the correct numerical/sequence order.
 */
export const analyzeConnectDots = (
  strokes: Stroke[],
  dots: { x: number; y: number }[],
  threshold: number = 40
): AttemptMetrics => {
  const strokeCount = strokes.length;
  let totalDuration = 0;
  let totalLength = 0;

  strokes.forEach(s => {
    if (s.endTime) totalDuration += (s.endTime - s.startTime);
    totalLength += getPathLength(s.points);
  });

  if (strokeCount === 0 || dots.length === 0) {
    return { accuracy: 0, duration: totalDuration, strokeCount, pathLength: 0 };
  }

  // Flatten all points from all strokes in chronological order
  const allPoints: Point[] = [];
  strokes.forEach(s => {
    allPoints.push(...s.points);
  });

  // Track connected dots in order
  let connectedCount = 0;
  let lastFoundIndex = -1;

  for (let d = 0; d < dots.length; d++) {
    const dot = dots[d];
    let found = false;

    // Search from the last found index forward to enforce sequential order
    for (let i = lastFoundIndex + 1; i < allPoints.length; i++) {
      if (getDistance(allPoints[i], dot) <= threshold) {
        found = true;
        lastFoundIndex = i;
        break;
      }
    }

    if (found) {
      connectedCount++;
    } else {
      break; // Sequential order broken
    }
  }

  const accuracy = Math.round((connectedCount / dots.length) * 100);

  return {
    accuracy,
    duration: totalDuration,
    strokeCount,
    pathLength: Math.round(totalLength),
    departures: 0
  };
};

/**
 * Analyzes a copy_shape activity attempt:
 * Normalizes (centers and scales) both the template and user drawing points to compare them
 * using a hybrid Chamfer distance. This enables evaluating shape similarity regardless
 * of drawing scale or position on the canvas.
 */
export const samplePointsFromPathString = (pathStr: string): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  const commands = (pathStr.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || []) as string[];
  let curX = 0;
  let curY = 0;

  // Simple line sampler helper
  const sampleLine = (x0: number, y0: number, x1: number, y1: number, steps: number) => {
    const pts = [];
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      pts.push({
        x: x0 + (x1 - x0) * t,
        y: y0 + (y1 - y0) * t
      });
    }
    return pts;
  };

  commands.forEach(cmd => {
    const type = cmd[0];
    const args = (cmd.slice(1).trim().replace(/,/g, ' ').match(/[-+]?[0-9]*\.?[0-9]+/g) || []).map(Number);

    if (type === 'M' || type === 'm') {
      if (args.length >= 2) {
        curX = args[0];
        curY = args[1];
        points.push({ x: curX, y: curY });
      }
    } else if (type === 'L' || type === 'l') {
      for (let i = 0; i < args.length; i += 2) {
        if (i + 1 < args.length) {
          const targetX = args[i];
          const targetY = args[i + 1];
          const dist = Math.sqrt(Math.pow(targetX - curX, 2) + Math.pow(targetY - curY, 2));
          const steps = Math.max(5, Math.round(dist / 10));
          points.push(...sampleLine(curX, curY, targetX, targetY, steps));
          curX = targetX;
          curY = targetY;
        }
      }
    } else if (type === 'C' || type === 'c') {
      for (let i = 0; i < args.length; i += 6) {
        if (i + 5 < args.length) {
          const x1 = args[i];
          const y1 = args[i + 1];
          const x2 = args[i + 2];
          const y2 = args[i + 3];
          const targetX = args[i + 4];
          const targetY = args[i + 5];
          const steps = 15;
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const mt = 1 - t;
            const x = mt * mt * mt * curX + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * targetX;
            const y = mt * mt * mt * curY + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * targetY;
            points.push({ x, y });
          }
          curX = targetX;
          curY = targetY;
        }
      }
    } else if (type === 'Q' || type === 'q') {
      for (let i = 0; i < args.length; i += 4) {
        if (i + 3 < args.length) {
          const x1 = args[i];
          const y1 = args[i + 1];
          const targetX = args[i + 2];
          const targetY = args[i + 3];
          const steps = 10;
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const mt = 1 - t;
            const x = mt * mt * curX + 2 * mt * t * x1 + t * t * targetX;
            const y = mt * mt * curY + 2 * mt * t * y1 + t * t * targetY;
            points.push({ x, y });
          }
          curX = targetX;
          curY = targetY;
        }
      }
    } else if (type === 'A' || type === 'a') {
      if (args.length >= 7) {
        const targetX = args[5];
        const targetY = args[6];
        const dist = Math.sqrt(Math.pow(targetX - curX, 2) + Math.pow(targetY - curY, 2));
        const steps = Math.max(5, Math.round(dist / 10));
        points.push(...sampleLine(curX, curY, targetX, targetY, steps));
        curX = targetX;
        curY = targetY;
      }
    }
  });

  return points;
};

/**
 * Analyzes a copy_shape activity attempt:
 * Normalizes (centers and scales) both the template and user drawing points to compare them
 * using a hybrid Chamfer distance. This enables evaluating shape similarity regardless
 * of drawing scale or position on the canvas.
 */
export const analyzeCopyShape = (
  strokes: Stroke[],
  templatePoints: { x: number; y: number }[],
  threshold: number = 40
): AttemptMetrics => {
  const strokeCount = strokes.length;
  let totalDuration = 0;
  let totalLength = 0;

  strokes.forEach(s => {
    if (s.endTime) totalDuration += (s.endTime - s.startTime);
    totalLength += getPathLength(s.points);
  });

  if (strokeCount === 0 || templatePoints.length === 0) {
    return { accuracy: 0, duration: totalDuration, strokeCount, pathLength: 0 };
  }

  // Gather all points drawn by the user
  const userPoints: { x: number; y: number }[] = [];
  strokes.forEach(s => {
    s.points.forEach(p => userPoints.push({ x: p.x, y: p.y }));
  });

  if (userPoints.length === 0) {
    return { accuracy: 0, duration: totalDuration, strokeCount, pathLength: 0 };
  }

  // Normalization helper: centers bounding box at (0,0) and scales max dimension to 100px
  const normalizePoints = (pts: { x: number; y: number }[]) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const size = Math.max(width, height);
    const scale = 100 / size;

    return pts.map(p => ({
      x: (p.x - centerX) * scale,
      y: (p.y - centerY) * scale
    }));
  };

  const normTemplate = normalizePoints(templatePoints);
  const normUser = normalizePoints(userPoints);

  // Chamfer Distance: average minimum distance from User -> Template
  let userToTemplateSum = 0;
  normUser.forEach(up => {
    let minDist = Infinity;
    normTemplate.forEach(tp => {
      const d = getDistance(up, tp);
      if (d < minDist) minDist = d;
    });
    userToTemplateSum += minDist;
  });
  const avgUserToTemplate = userToTemplateSum / normUser.length;

  // Chamfer Distance: average minimum distance from Template -> User
  let templateToUserSum = 0;
  normTemplate.forEach(tp => {
    let minDist = Infinity;
    normUser.forEach(up => {
      const d = getDistance(tp, up);
      if (d < minDist) minDist = d;
    });
    templateToUserSum += minDist;
  });
  const avgTemplateToUser = templateToUserSum / normTemplate.length;

  const avgDistance = (avgUserToTemplate + avgTemplateToUser) / 2;

  // Map the avgDistance to 0-100 score. E.g. avgDistance = 0 -> 100%, avgDistance >= 30 -> 0%
  const scoreFactor = Math.max(0, 30 - avgDistance) / 30;
  const accuracy = Math.round(scoreFactor * 100);

  // === Advanced copy_shape metrics for study ===

  // 1. closureError: Loop meeting deviation or endpoint deviation
  const firstTemp = templatePoints[0];
  const lastTemp = templatePoints[templatePoints.length - 1];
  const isClosed = getDistance(firstTemp, lastTemp) < 30;
  const firstUser = userPoints[0];
  const lastUser = userPoints[userPoints.length - 1];

  let closureError = 0;
  if (isClosed) {
    closureError = Math.round(getDistance(firstUser, lastUser));
  } else {
    const d1 = getDistance(firstUser, firstTemp) + getDistance(lastUser, lastTemp);
    const d2 = getDistance(firstUser, lastTemp) + getDistance(lastUser, firstTemp);
    closureError = Math.round(Math.min(d1, d2) / 2);
  }

  // 2. scaleDifference
  let tempMinX = Infinity, tempMaxX = -Infinity, tempMinY = Infinity, tempMaxY = -Infinity;
  templatePoints.forEach(p => {
    if (p.x < tempMinX) tempMinX = p.x;
    if (p.x > tempMaxX) tempMaxX = p.x;
    if (p.y < tempMinY) tempMinY = p.y;
    if (p.y > tempMaxY) tempMaxY = p.y;
  });
  const tempW = tempMaxX - tempMinX || 1;
  const tempH = tempMaxY - tempMinY || 1;
  const tempSize = Math.max(tempW, tempH);

  let userMinX = Infinity, userMaxX = -Infinity, userMinY = Infinity, userMaxY = -Infinity;
  userPoints.forEach(p => {
    if (p.x < userMinX) userMinX = p.x;
    if (p.x > userMaxX) userMaxX = p.x;
    if (p.y < userMinY) userMinY = p.y;
    if (p.y > userMaxY) userMaxY = p.y;
  });
  const userW = userMaxX - userMinX || 1;
  const userH = userMaxY - userMinY || 1;
  const userSize = Math.max(userW, userH);

  const scaleDifference = Math.round((Math.abs(userSize - tempSize) / tempSize) * 100);

  // 3. proportionDifference
  const ratioTemp = tempW / tempH;
  const ratioUser = userW / userH;
  const proportionDifference = Math.round((Math.abs(ratioUser - ratioTemp) / ratioTemp) * 100);

  // 4. rotationDifference
  const getCentroid = (pts: { x: number; y: number }[]) => {
    let sumX = 0, sumY = 0;
    pts.forEach(p => { sumX += p.x; sumY += p.y; });
    return { x: sumX / pts.length, y: sumY / pts.length };
  };

  const getFurthestPointAngle = (pts: { x: number; y: number }[], centroid: { x: number; y: number }) => {
    let maxDist = -1;
    let furthestPt = pts[0] || { x: 0, y: 0 };
    pts.forEach(p => {
      const dist = Math.pow(p.x - centroid.x, 2) + Math.pow(p.y - centroid.y, 2);
      if (dist > maxDist) {
        maxDist = dist;
        furthestPt = p;
      }
    });
    return Math.atan2(furthestPt.y - centroid.y, furthestPt.x - centroid.x);
  };

  const cT = getCentroid(templatePoints);
  const cU = getCentroid(userPoints);
  const angleT = getFurthestPointAngle(templatePoints, cT);
  const angleU = getFurthestPointAngle(userPoints, cU);
  let diffRad = Math.abs(angleU - angleT);
  while (diffRad > Math.PI) diffRad -= 2 * Math.PI;
  diffRad = Math.abs(diffRad);
  const rotationDifference = Math.round(diffRad * 180 / Math.PI);

  return {
    accuracy,
    duration: totalDuration,
    strokeCount,
    pathLength: Math.round(totalLength),
    departures: 0,
    shapeSimilarityScore: accuracy,
    closureError,
    scaleDifference,
    proportionDifference,
    rotationDifference
  };
};

export const calculateCommonMetrics = (
  strokes: Stroke[],
  accuracy: number,
  pathLength: number
): Partial<AttemptMetrics> => {
  const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  if (strokes.length === 0) {
    return {
      attemptId,
      createdAt,
      pointCount: 0,
      totalTimeMs: 0,
      traceLength: 0,
      pauseCount: 0,
      pauseTotalMs: 0,
      meanSpeed: 0,
      medianSpeed: 0,
      maxSpeed: 0,
      speedVariability: 0,
      accelerationMean: 0,
      accelerationVariability: 0,
      smoothnessScore: 100,
      stabilityScore: 100,
      precisionScore: accuracy,
      completionScore: accuracy
    };
  }

  // Count points and trace length
  let pointCount = 0;
  let traceLength = 0;
  strokes.forEach(s => {
    pointCount += s.points.length;
    traceLength += getPathLength(s.points);
  });

  // Calculate total time: from first stroke start to last stroke end
  const startTimes = strokes.map(s => s.startTime);
  const endTimes = strokes.map(s => s.endTime || s.startTime);
  const minStart = Math.min(...startTimes);
  const maxEnd = Math.max(...endTimes);
  const totalTimeMs = maxEnd - minStart;

  // Pauses detection
  let pauseCount = 0;
  let pauseTotalMs = 0;
  const sortedStrokes = [...strokes].sort((a, b) => a.startTime - b.startTime);
  
  // Pauses between strokes
  for (let i = 1; i < sortedStrokes.length; i++) {
    const gap = sortedStrokes[i].startTime - (sortedStrokes[i - 1].endTime || sortedStrokes[i - 1].startTime);
    if (gap > 150) {
      pauseCount++;
      pauseTotalMs += gap;
    }
  }

  // Pauses inside strokes (time gaps)
  sortedStrokes.forEach(s => {
    for (let i = 1; i < s.points.length; i++) {
      const dt = s.points[i].t - s.points[i - 1].t;
      if (dt > 150) {
        pauseCount++;
        pauseTotalMs += dt;
      }
    }
  });

  // Calculate speeds and accelerations
  const speeds: number[] = [];
  const accelerations: number[] = [];

  strokes.forEach(s => {
    const strokeSpeeds: number[] = [];
    for (let i = 1; i < s.points.length; i++) {
      const p1 = s.points[i - 1];
      const p2 = s.points[i];
      const dist = getDistance(p1, p2);
      const dt = p2.t - p1.t;
      if (dt > 0) {
        const speed = (dist / dt) * 1000; // pixels per second
        speeds.push(speed);
        strokeSpeeds.push(speed);
      }
    }

    for (let i = 1; i < strokeSpeeds.length; i++) {
      const dv = strokeSpeeds[i] - strokeSpeeds[i - 1];
      const dt = (s.points[i + 1]?.t - s.points[i]?.t) || 16;
      if (dt > 0) {
        const accel = (dv / dt) * 1000; // pixels per second squared
        accelerations.push(accel);
      }
    }
  });

  const meanSpeed = Math.round(getMean(speeds));
  const medianSpeed = Math.round(getMedian(speeds));
  const maxSpeed = speeds.length > 0 ? Math.round(Math.max(...speeds)) : 0;
  const speedVariability = Math.round(getStdDev(speeds, meanSpeed));

  const accelerationMean = Math.round(getMean(accelerations));
  const accelerationVariability = Math.round(getStdDev(accelerations, accelerationMean));

  // Smoothness score based on speed peaks (frequency of velocity direction changes)
  let peaksCount = 0;
  for (let i = 1; i < speeds.length - 1; i++) {
    if (speeds[i] > speeds[i - 1] && speeds[i] > speeds[i + 1]) {
      peaksCount++;
    }
  }
  const smoothnessScore = Math.max(10, Math.min(100, Math.round(100 - (peaksCount / Math.max(1, traceLength)) * 1500)));

  // Stability score based on speed coefficient of variation (SD / mean)
  const stabilityScore = meanSpeed > 0 
    ? Math.max(10, Math.min(100, Math.round(100 - (speedVariability / meanSpeed) * 100))) 
    : 100;

  return {
    attemptId,
    strokeCount: strokes.length,
    pointCount,
    totalTimeMs,
    traceLength: Math.round(traceLength),
    pauseCount,
    pauseTotalMs,
    meanSpeed,
    medianSpeed,
    maxSpeed,
    speedVariability,
    accelerationMean,
    accelerationVariability,
    smoothnessScore,
    stabilityScore,
    precisionScore: accuracy,
    completionScore: accuracy,
    createdAt
  };
};

/**
 * Calculates metrics for an attempt based on the activity type
 */
export const analyzeAttempt = (
  strokes: Stroke[],
  templatePoints: { x: number; y: number }[],
  activityType: string,
  threshold: number = 40,
  laneWidth: number = 60,
  dots: { x: number; y: number }[] | null = null,
  backgroundPaths: string[] | null = null
): AttemptMetrics => {
  let result: AttemptMetrics;

  if (activityType === 'connect_dots' && dots) {
    result = analyzeConnectDots(strokes, dots, threshold);
  } else if (activityType === 'copy_shape') {
    result = analyzeCopyShape(strokes, templatePoints, threshold);
  } else {
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

    // Check if we are doing a Maze activity
    const isMaze = activityType === 'stay_inside' && backgroundPaths && backgroundPaths.length > 0;

    if (isMaze && backgroundPaths) {
      // 1. sample all background paths
      const deadEndPoints: { x: number; y: number }[] = [];
      backgroundPaths.forEach(bgPath => {
        deadEndPoints.push(...samplePointsFromPathString(bgPath));
      });

      const validPoints = [...templatePoints, ...deadEndPoints];

      // 2. collisionCount: departures from overall valid paths
      const collisionCount = calculateDepartures(strokes, validPoints, laneWidth);

      // 3. deadEndCount
      let deadEndCount = 0;
      let isCurrentlyInDeadEnd = false;
      strokes.forEach(stroke => {
        stroke.points.forEach(p => {
          let minTempDist = Infinity;
          templatePoints.forEach(tp => {
            const d = getDistance(p, tp);
            if (d < minTempDist) minTempDist = d;
          });

          let minDeadDist = Infinity;
          deadEndPoints.forEach(dep => {
            const d = getDistance(p, dep);
            if (d < minDeadDist) minDeadDist = d;
          });

          const inDeadEnd = (minDeadDist <= laneWidth / 2) && (minTempDist > laneWidth / 2);
          
          if (inDeadEnd && !isCurrentlyInDeadEnd) {
            deadEndCount++;
            isCurrentlyInDeadEnd = true;
          } else if (!inDeadEnd && isCurrentlyInDeadEnd) {
            isCurrentlyInDeadEnd = false;
          }
        });
      });

      // 4. backtrackCount
      let backtrackCount = 0;
      let maxIdx = -1;
      let isBacktracking = false;
      strokes.forEach(stroke => {
        stroke.points.forEach(p => {
          let minDist = Infinity;
          let closestIdx = -1;
          templatePoints.forEach((tp, idx) => {
            const d = getDistance(p, tp);
            if (d < minDist) {
              minDist = d;
              closestIdx = idx;
            }
          });
          
          if (minDist <= laneWidth / 2) {
            if (maxIdx === -1) {
              maxIdx = closestIdx;
            } else {
              if (closestIdx < maxIdx - 4) {
                if (!isBacktracking) {
                  backtrackCount++;
                  isBacktracking = true;
                }
              } else if (closestIdx > maxIdx) {
                maxIdx = closestIdx;
                isBacktracking = false;
              }
            }
          }
        });
      });

      // 5. mazeCompletionPercent
      let visitedCount = 0;
      templatePoints.forEach(tp => {
        let visited = false;
        strokes.forEach(stroke => {
          stroke.points.forEach(p => {
            if (getDistance(p, tp) <= laneWidth / 2) {
              visited = true;
            }
          });
        });
        if (visited) visitedCount++;
      });
      const mazeCompletionPercent = Math.round((visitedCount / templatePoints.length) * 100);

      // 6. timeInsidePathPercent
      let totalPoints = 0;
      let insidePoints = 0;
      strokes.forEach(stroke => {
        stroke.points.forEach(p => {
          totalPoints++;
          let minTempDist = Infinity;
          templatePoints.forEach(tp => {
            const d = getDistance(p, tp);
            if (d < minTempDist) minTempDist = d;
          });

          let minDeadDist = Infinity;
          deadEndPoints.forEach(dep => {
            const d = getDistance(p, dep);
            if (d < minDeadDist) minDeadDist = d;
          });

          if (minTempDist <= laneWidth / 2 || minDeadDist <= laneWidth / 2) {
            insidePoints++;
          }
        });
      });
      const timeInsidePathPercent = totalPoints > 0 ? Math.round((insidePoints / totalPoints) * 100) : 0;

      result = {
        accuracy,
        duration: totalDuration,
        strokeCount,
        pathLength: Math.round(totalLength),
        departures,
        collisionCount,
        deadEndCount,
        backtrackCount,
        mazeCompletionPercent,
        timeInsidePathPercent
      };
    } else if (activityType === 'stay_inside') {
      // 1. percentInsideLane
      let totalPts = 0;
      let insidePts = 0;
      strokes.forEach(s => {
        s.points.forEach(p => {
          totalPts++;
          let minDist = Infinity;
          templatePoints.forEach(tp => {
            const d = getDistance(p, tp);
            if (d < minDist) minDist = d;
          });
          if (minDist <= laneWidth / 2) insidePts++;
        });
      });
      const percentInsideLane = totalPts > 0 ? Math.round((insidePts / totalPts) * 100) : 0;

      // 2. timeOutsideLaneMs
      let timeOutsideLaneMs = 0;
      strokes.forEach(stroke => {
        for (let i = 1; i < stroke.points.length; i++) {
          const p1 = stroke.points[i - 1];
          const p2 = stroke.points[i];
          let minDist = Infinity;
          templatePoints.forEach(tp => {
            const d = getDistance(p2, tp);
            if (d < minDist) minDist = d;
          });
          if (minDist > laneWidth / 2) {
            const dt = p2.t - p1.t;
            if (dt > 0 && dt < 1000) {
              timeOutsideLaneMs += dt;
            }
          }
        }
      });

      // 3. meanDistanceOutsideLane
      let sumDistanceOutside = 0;
      let countOutside = 0;
      strokes.forEach(s => {
        s.points.forEach(p => {
          let minDist = Infinity;
          templatePoints.forEach(tp => {
            const d = getDistance(p, tp);
            if (d < minDist) minDist = d;
          });
          if (minDist > laneWidth / 2) {
            sumDistanceOutside += minDist;
            countOutside++;
          }
        });
      });
      const meanDistanceOutsideLane = countOutside > 0 ? Math.round((sumDistanceOutside / countOutside) * 10) / 10 : 0;

      result = {
        accuracy,
        duration: totalDuration,
        strokeCount,
        pathLength: Math.round(totalLength),
        departures,
        percentInsideLane,
        exitCount: departures,
        timeOutsideLaneMs,
        meanDistanceOutsideLane
      };
    } else {
      result = {
        accuracy,
        duration: totalDuration,
        strokeCount,
        pathLength: Math.round(totalLength),
        departures
      };
    }
  }

  // Calculate common kinematic metrics and merge them
  const kinematics = calculateCommonMetrics(strokes, result.accuracy, result.pathLength);
  return {
    ...result,
    ...kinematics
  };
};

/* ============================================================================
 * Motor de medición v2 (Desarrollo 1) — integrado al análisis unificado.
 * - Distancia contra SEGMENTOS de la guía (lib/geometry), no contra puntos.
 * - Trazo JSON por intento (Informe abril 3.3).
 * - Analizadores de: Sigue el Camino, Une los Puntos, Montaña Rusa,
 *   con los nombres de métricas del doc "Métricas de desarrollo".
 * Las funciones v1 (arriba) se conservan para Carril, Copia la Forma y
 * Laberinto, más las métricas cinemáticas comunes.
 * ==========================================================================*/

import { TraceJSON, TracePoint } from '../types/drawing';
import {
  XY,
  distToPolyline,
  turnAngleAt,
  dist as geoDist,
} from './geometry';

interface TimedPoint extends XY {
  abs: number;
  strokeIdx: number;
}

const flattenTimed = (strokes: Stroke[]): TimedPoint[] => {
  const out: TimedPoint[] = [];
  strokes.forEach((s, idx) => {
    s.points.forEach(p => {
      out.push({ x: p.x, y: p.y, abs: s.startTime + p.t, strokeIdx: idx });
    });
  });
  out.sort((a, b) => a.abs - b.abs);
  return out;
};

/** Exporta los strokes al formato de trazo JSON por intento */
export const toTraceJSON = (strokes: Stroke[]): TraceJSON => {
  const attemptStart = strokes.length > 0
    ? Math.min(...strokes.map(s => s.startTime))
    : 0;
  return {
    formatVersion: '1.0',
    strokes: strokes.map((s, sIdx) => ({
      strokeId: sIdx + 1,
      points: s.points.map((p, i): TracePoint => ({
        i: i + 1,
        t: Math.round(s.startTime + p.t - attemptStart),
        x: Math.round(p.x * 100) / 100,
        y: Math.round(p.y * 100) / 100,
        phase: i === 0 ? 'down' : i === s.points.length - 1 ? 'up' : 'move',
      })),
    })),
  };
};

/**
 * SIGUE EL CAMINO — métricas del doc, sección 1:
 * meanDistanceToPath, maxDistanceToPath, percentWithinTolerance,
 * pathCompletionPercent. precisionScore = percentWithinTolerance.
 */
export const analyzeFollowPathV2 = (
  strokes: Stroke[],
  guide: XY[],
  tolerance: number = 30
): Partial<AttemptMetrics> => {
  const userPoints = flattenTimed(strokes);
  if (userPoints.length === 0 || guide.length < 2) {
    return {
      meanDistanceToPath: 0, maxDistanceToPath: 0,
      percentWithinTolerance: 0, pathCompletionPercent: 0,
      precisionScore: 0, completionScore: 0, accuracy: 0,
    };
  }

  let sum = 0, max = 0, within = 0;
  userPoints.forEach(p => {
    const d = distToPolyline(p, guide);
    sum += d;
    if (d > max) max = d;
    if (d <= tolerance) within++;
  });

  let covered = 0;
  guide.forEach(g => {
    for (let i = 0; i < userPoints.length; i++) {
      if (geoDist(g, userPoints[i]) <= tolerance) { covered++; break; }
    }
  });

  const percentWithinTolerance = Math.round((within / userPoints.length) * 100);
  const pathCompletionPercent = Math.round((covered / guide.length) * 100);

  return {
    meanDistanceToPath: Math.round(sum / userPoints.length),
    maxDistanceToPath: Math.round(max),
    percentWithinTolerance,
    pathCompletionPercent,
    precisionScore: percentWithinTolerance,
    completionScore: pathCompletionPercent,
    accuracy: percentWithinTolerance,
  };
};

/**
 * UNE LOS PUNTOS — métricas del doc, sección 3:
 * pointsReached, correctSequencePercent, sequenceErrors, omissions,
 * timeBetweenPoints. El orden esperado es el índice del arreglo de puntos.
 * Un punto se registra al ENTRAR a su radio (con debounce de salida).
 */
export const analyzeDotsSequence = (
  strokes: Stroke[],
  dots: XY[],
  hitRadius: number = 45
): Partial<AttemptMetrics> => {
  const userPoints = flattenTimed(strokes);
  const dotsTotal = dots.length;
  if (userPoints.length === 0 || dotsTotal === 0) {
    return {
      pointsReached: 0, correctSequencePercent: 0, sequenceErrors: 0,
      omissions: dotsTotal, timeBetweenPoints: 0,
      precisionScore: 0, completionScore: 0, accuracy: 0,
    };
  }

  const reached = new Set<number>();
  const insideNow = new Set<number>();
  let expected = 0;
  let sequenceErrors = 0;
  const correctHitTimes: number[] = [];

  userPoints.forEach(p => {
    dots.forEach((dot, idx) => {
      const inside = geoDist(p, dot) <= hitRadius;
      if (inside && !insideNow.has(idx)) {
        insideNow.add(idx);
        if (idx === expected) {
          correctHitTimes.push(p.abs);
          reached.add(idx);
          expected++;
        } else if (!reached.has(idx)) {
          if (idx > expected) sequenceErrors++;
          reached.add(idx);
        }
      } else if (!inside && insideNow.has(idx)) {
        insideNow.delete(idx);
      }
    });
  });

  let timeBetweenPoints = 0;
  if (correctHitTimes.length > 1) {
    let s = 0;
    for (let i = 1; i < correctHitTimes.length; i++) s += correctHitTimes[i] - correctHitTimes[i - 1];
    timeBetweenPoints = Math.round(s / (correctHitTimes.length - 1));
  }

  const correctSequencePercent = Math.round((correctHitTimes.length / dotsTotal) * 100);
  const completion = Math.round((reached.size / dotsTotal) * 100);

  return {
    pointsReached: reached.size,
    correctSequencePercent,
    sequenceErrors,
    omissions: dotsTotal - reached.size,
    timeBetweenPoints,
    precisionScore: correctSequencePercent,
    completionScore: completion,
    accuracy: correctSequencePercent,
  };
};

/** Ángulo de giro a partir del cual un punto guía es "zona de curva" */
const CURVE_ANGLE_DEG = 12;

/**
 * MONTAÑA RUSA — métricas del doc, sección 5:
 * curveErrorMean, curveErrorMax, directionChangeControl,
 * speedVariabilityInCurves; más las de trayectoria (sección 1).
 */
export const analyzeCoasterV2 = (
  strokes: Stroke[],
  guide: XY[],
  tolerance: number = 35
): Partial<AttemptMetrics> => {
  const base = analyzeFollowPathV2(strokes, guide, tolerance);
  const userPoints = flattenTimed(strokes);

  // Zonas de curva de la guía
  const curveIdx: number[] = [];
  for (let i = 1; i < guide.length - 1; i++) {
    if (turnAngleAt(guide, i) >= CURVE_ANGLE_DEG) curveIdx.push(i);
  }

  // Error en curvas: distancia de cada punto guía "curvo" al trazo del usuario
  let curveSum = 0, curveMax = 0, curveCovered = 0;
  curveIdx.forEach(i => {
    let min = Infinity;
    for (let j = 0; j < userPoints.length; j++) {
      const d = geoDist(guide[i], userPoints[j]);
      if (d < min) min = d;
    }
    if (min !== Infinity) {
      curveSum += min;
      if (min > curveMax) curveMax = min;
      if (min <= tolerance) curveCovered++;
    }
  });
  const curveErrorMean = curveIdx.length > 0 ? Math.round(curveSum / curveIdx.length) : 0;
  const curveErrorMax = Math.round(curveMax);

  // Control de cambios de dirección: % de zonas de curva cubiertas con precisión
  const directionChangeControl = curveIdx.length > 0
    ? Math.round((curveCovered / curveIdx.length) * 100)
    : 100;

  // Variabilidad de velocidad SOLO en zonas de curva
  const curvePoints = curveIdx.map(i => guide[i]);
  const curveSpeeds: number[] = [];
  for (let i = 1; i < userPoints.length; i++) {
    const a = userPoints[i - 1];
    const b = userPoints[i];
    if (a.strokeIdx !== b.strokeIdx) continue;
    const dt = b.abs - a.abs;
    if (dt <= 0) continue;
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    let nearCurve = false;
    for (let c = 0; c < curvePoints.length; c++) {
      if (geoDist(mid, curvePoints[c]) <= tolerance * 2) { nearCurve = true; break; }
    }
    if (nearCurve) curveSpeeds.push((geoDist(a, b) / dt) * 1000);
  }
  let speedVariabilityInCurves = 0;
  if (curveSpeeds.length > 1) {
    const mean = curveSpeeds.reduce((x, y) => x + y, 0) / curveSpeeds.length;
    if (mean > 0) {
      const variance = curveSpeeds.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / curveSpeeds.length;
      speedVariabilityInCurves = Math.round((Math.sqrt(variance) / mean) * 100) / 100;
    }
  }

  return {
    ...base,
    curveErrorMean,
    curveErrorMax,
    directionChangeControl,
    speedVariabilityInCurves,
  };
};
