import { ActivityTemplate } from '../types/drawing';

export interface MotorActivityTemplate extends ActivityTemplate {
  guidePoints: { x: number; y: number }[];
  type: 'line' | 'curve' | 'shape' | 'lane';
  laneWidth?: number;
}

export const TEMPLATES: Record<string, MotorActivityTemplate> = {
  'line-simple': {
    id: 'line-simple',
    path: 'M 50 400 L 550 400',
    width: 600,
    height: 800,
    type: 'line',
    guidePoints: Array.from({ length: 11 }, (_, i) => ({ x: 50 + i * 50, y: 400 }))
  },
  'curve-basic': {
    id: 'curve-basic',
    path: 'M 50 300 Q 300 50, 550 300',
    width: 600,
    height: 800,
    type: 'curve',
    guidePoints: Array.from({ length: 21 }, (_, i) => {
      const t = i / 20;
      // Quadratic bezier: (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
      const x = Math.pow(1 - t, 2) * 50 + 2 * (1 - t) * t * 300 + Math.pow(t, 2) * 550;
      const y = Math.pow(1 - t, 2) * 300 + 2 * (1 - t) * t * 50 + Math.pow(t, 2) * 300;
      return { x, y };
    })
  },
  'lane-s': {
    id: 'lane-s',
    path: 'M 100 200 C 100 100, 500 100, 500 400 S 100 700, 100 600',
    width: 600,
    height: 800,
    type: 'lane',
    laneWidth: 80,
    guidePoints: Array.from({ length: 31 }, (_, i) => {
      const t = i / 30;
      // Cubic bezier logic roughly approximated for the S shape
      // This is a placeholder for actual sampled points
      return { x: 300, y: 100 + i * 20 }; // TODO: Improve sampling
    })
  }
};
