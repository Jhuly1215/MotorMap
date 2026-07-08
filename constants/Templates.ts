import { ActivityTemplate } from '../types/drawing';

export interface MotorActivityTemplate extends ActivityTemplate {
  guidePoints: { x: number; y: number }[];
  type: 'line' | 'curve' | 'shape' | 'lane';
  laneWidth?: number;
  dots?: { x: number; y: number; label?: string }[] | null;
  backgroundPaths?: string[];
  showDashedLine?: boolean;
}

// Helper methods to sample paths accurately
const sampleLine = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  steps: number
) => {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const x = p0.x + (p1.x - p0.x) * t;
    const y = p0.y + (p1.y - p0.y) * t;
    points.push({ x, y });
  }
  return points;
};

const sampleQuadBezier = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  steps: number
) => {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const mt = 1 - t;
    const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
    const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
    points.push({ x, y });
  }
  return points;
};

const sampleCubicBezier = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  steps: number
) => {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const mt = 1 - t;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
    points.push({ x, y });
  }
  return points;
};

const sampleCircle = (cx: number, cy: number, r: number, steps: number) => {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    points.push({ x, y });
  }
  return points;
};

export const TEMPLATES: Record<string, MotorActivityTemplate> = {
  'line-simple': {
    id: 'line-simple',
    path: 'M 50 400 L 550 400',
    width: 600,
    height: 800,
    type: 'line',
    guidePoints: sampleLine({ x: 50, y: 400 }, { x: 550, y: 400 }, 11)
  },
  'curve-basic': {
    id: 'curve-basic',
    path: 'M 50 300 Q 300 50, 550 300',
    width: 600,
    height: 800,
    type: 'curve',
    guidePoints: sampleQuadBezier({ x: 50, y: 300 }, { x: 300, y: 50 }, { x: 550, y: 300 }, 21)
  },
  'lane-s': {
    id: 'lane-s',
    path: 'M 100 200 C 100 100, 500 100, 500 400 S 100 700, 100 600',
    width: 600,
    height: 800,
    type: 'lane',
    laneWidth: 80,
    guidePoints: [
      ...sampleCubicBezier({ x: 100, y: 200 }, { x: 100, y: 100 }, { x: 500, y: 100 }, { x: 500, y: 400 }, 16),
      ...sampleCubicBezier({ x: 500, y: 400 }, { x: 500, y: 700 }, { x: 100, y: 700 }, { x: 100, y: 600 }, 16).slice(1)
    ]
  },
  'connect-dots-triangle': {
    id: 'connect-dots-triangle',
    path: 'M 300 150 L 150 550 L 450 550 Z',
    width: 600,
    height: 800,
    type: 'shape',
    guidePoints: [
      ...sampleLine({ x: 300, y: 150 }, { x: 150, y: 550 }, 11),
      ...sampleLine({ x: 150, y: 550 }, { x: 450, y: 550 }, 11).slice(1),
      ...sampleLine({ x: 450, y: 550 }, { x: 300, y: 150 }, 11).slice(1)
    ],
    dots: [
      { x: 300, y: 150, label: '1' },
      { x: 150, y: 550, label: '2' },
      { x: 450, y: 550, label: '3' }
    ]
  },
  'copy-circle': {
    id: 'copy-circle',
    path: 'M 300 250 A 150 150 0 1 1 299.9 250 Z',
    width: 600,
    height: 800,
    type: 'shape',
    guidePoints: sampleCircle(300, 400, 150, 32)
  },
  'curve-rollercoaster': {
    id: 'curve-rollercoaster',
    path: 'M 50 400 Q 175 150, 300 400 T 550 400',
    width: 600,
    height: 800,
    type: 'curve',
    guidePoints: [
      ...sampleQuadBezier({ x: 50, y: 400 }, { x: 175, y: 150 }, { x: 300, y: 400 }, 16),
      ...sampleQuadBezier({ x: 300, y: 400 }, { x: 425, y: 650 }, { x: 550, y: 400 }, 16).slice(1)
    ]
  },
  'lane-maze': {
    id: 'lane-maze',
    path: 'M 100 150 L 500 150 L 500 400 L 100 400 L 100 650 L 500 650',
    width: 600,
    height: 800,
    type: 'lane',
    laneWidth: 80,
    guidePoints: [
      ...sampleLine({ x: 100, y: 150 }, { x: 500, y: 150 }, 9),
      ...sampleLine({ x: 500, y: 150 }, { x: 500, y: 400 }, 7).slice(1),
      ...sampleLine({ x: 500, y: 400 }, { x: 100, y: 400 }, 9).slice(1),
      ...sampleLine({ x: 100, y: 400 }, { x: 100, y: 650 }, 7).slice(1),
      ...sampleLine({ x: 100, y: 650 }, { x: 500, y: 650 }, 9).slice(1)
    ]
  }
};
