export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  path: string;
  guidePoints: { x: number; y: number }[];
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

// Programmatically generate the spiral template to ensure mathematical match
const generateSpiral = (cx: number, cy: number, maxTheta: number, steps: number) => {
  const points = [];
  let pathStr = '';
  for (let i = 0; i < steps; i++) {
    const theta = (i / (steps - 1)) * maxTheta;
    const r = 40 + 14 * theta;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    points.push({ x, y });
    if (i === 0) pathStr += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    else pathStr += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return { path: pathStr, guidePoints: points };
};

const spiralData = generateSpiral(300, 400, 4.2 * Math.PI, 60);

const generateStar = (cx: number, cy: number, rOuter: number, rInner: number, stepsPerSegment: number = 5) => {
  const points = [];
  let pathStr = '';
  const numPoints = 10;
  for (let i = 0; i <= numPoints; i++) {
    const idx = i % numPoints;
    const theta = -Math.PI / 2 + (idx * Math.PI) / 5;
    const r = i % 2 === 0 ? rOuter : rInner;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    points.push({ x, y });
  }

  const sampled: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const segment = sampleLine(p0, p1, stepsPerSegment);
    if (i === 0) {
      pathStr += `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)}`;
      sampled.push(...segment);
    } else {
      sampled.push(...segment.slice(1));
    }
    pathStr += ` L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  pathStr += ' Z';
  return { path: pathStr, guidePoints: sampled };
};

export const LEVELS: Record<string, Level[]> = {
  // Activity ID '2' is "Dentro del carril" (stay_inside)
  '2': [
    // === FÁCIL ===
    {
      id: 'stay-inside-lvl-1',
      name: 'Carril recto ancho',
      description: 'Traza recto por el medio del carril ancho.',
      difficulty: 'easy',
      path: 'M 50 400 L 550 400',
      guidePoints: sampleLine({ x: 50, y: 400 }, { x: 550, y: 400 }, 11),
      laneWidth: 100
    },
    {
      id: 'stay-inside-lvl-2',
      name: 'Carril vertical ancho',
      description: 'Trazado vertical de abajo hacia arriba.',
      difficulty: 'easy',
      path: 'M 300 650 L 300 150',
      guidePoints: sampleLine({ x: 300, y: 650 }, { x: 300, y: 150 }, 11),
      laneWidth: 100
    },
    {
      id: 'stay-inside-lvl-3',
      name: 'Curva amplia',
      description: 'Sigue la gran curva sin tocar los bordes.',
      difficulty: 'easy',
      path: 'M 50 450 Q 300 150, 550 450',
      guidePoints: sampleQuadBezier({ x: 50, y: 450 }, { x: 300, y: 150 }, { x: 550, y: 450 }, 21),
      laneWidth: 90
    },
    {
      id: 'stay-inside-lvl-4',
      name: 'Círculo ancho',
      description: 'Completa el círculo redondo dentro del carril.',
      difficulty: 'easy',
      path: 'M 300 250 A 150 150 0 1 1 299.9 250 Z',
      guidePoints: sampleCircle(300, 400, 150, 32),
      laneWidth: 90
    },
    {
      id: 'stay-inside-lvl-5',
      name: 'Onda ancha',
      description: 'Deslízate suavemente por la ola gigante.',
      difficulty: 'easy',
      path: 'M 50 400 Q 175 250, 300 400 T 550 400',
      guidePoints: [
        ...sampleQuadBezier({ x: 50, y: 400 }, { x: 175, y: 250 }, { x: 300, y: 400 }, 16),
        ...sampleQuadBezier({ x: 300, y: 400 }, { x: 425, y: 550 }, { x: 550, y: 400 }, 16).slice(1)
      ],
      laneWidth: 90
    },

    // === MEDIO ===
    {
      id: 'stay-inside-lvl-6',
      name: 'Zigzag moderado',
      description: 'Controla los cambios de dirección en zigzag.',
      difficulty: 'medium',
      path: 'M 100 250 L 250 550 L 400 250 L 550 550',
      guidePoints: [
        ...sampleLine({ x: 100, y: 250 }, { x: 250, y: 550 }, 11),
        ...sampleLine({ x: 250, y: 550 }, { x: 400, y: 250 }, 11).slice(1),
        ...sampleLine({ x: 400, y: 250 }, { x: 550, y: 550 }, 11).slice(1)
      ],
      laneWidth: 70
    },
    {
      id: 'stay-inside-lvl-7',
      name: 'Curva en S',
      description: 'Traza con precisión el carril en forma de S.',
      difficulty: 'medium',
      path: 'M 100 200 C 100 100, 500 100, 500 400 S 100 700, 100 600',
      guidePoints: [
        ...sampleCubicBezier({ x: 100, y: 200 }, { x: 100, y: 100 }, { x: 500, y: 100 }, { x: 500, y: 400 }, 16),
        ...sampleCubicBezier({ x: 500, y: 400 }, { x: 500, y: 700 }, { x: 100, y: 700 }, { x: 100, y: 600 }, 16).slice(1)
      ],
      laneWidth: 70
    },
    {
      id: 'stay-inside-lvl-8',
      name: 'Ocho horizontal',
      description: 'Dibuja el lazo del infinito cruzando por el centro.',
      difficulty: 'medium',
      path: 'M 300 400 C 100 200, 100 600, 300 400 C 500 200, 500 600, 300 400',
      guidePoints: [
        ...sampleCubicBezier({ x: 300, y: 400 }, { x: 100, y: 200 }, { x: 100, y: 600 }, { x: 300, y: 400 }, 21),
        ...sampleCubicBezier({ x: 300, y: 400 }, { x: 500, y: 200 }, { x: 500, y: 600 }, { x: 300, y: 400 }, 21).slice(1)
      ],
      laneWidth: 70
    },
    {
      id: 'stay-inside-lvl-9',
      name: 'Carril con estrechamiento',
      description: 'El carril se vuelve más estrecho y desafiante.',
      difficulty: 'medium',
      path: 'M 80 400 Q 300 250, 520 400',
      guidePoints: sampleQuadBezier({ x: 80, y: 400 }, { x: 300, y: 250 }, { x: 520, y: 400 }, 21),
      laneWidth: 50
    },
    {
      id: 'stay-inside-lvl-10',
      name: 'Camino ondulado largo',
      description: 'Recorre el largo camino lleno de olas.',
      difficulty: 'medium',
      path: 'M 50 400 Q 130 250, 210 400 Q 290 550, 370 400 Q 450 250, 530 400',
      guidePoints: [
        ...sampleQuadBezier({ x: 50, y: 400 }, { x: 130, y: 250 }, { x: 210, y: 400 }, 11),
        ...sampleQuadBezier({ x: 210, y: 400 }, { x: 290, y: 550 }, { x: 370, y: 400 }, 11).slice(1),
        ...sampleQuadBezier({ x: 370, y: 400 }, { x: 450, y: 250 }, { x: 530, y: 400 }, 11).slice(1)
      ],
      laneWidth: 70
    },

    // === DIFÍCIL ===
    {
      id: 'stay-inside-lvl-11',
      name: 'Espiral dentro de carril',
      description: 'Gira concéntricamente hacia el centro en espiral.',
      difficulty: 'hard',
      path: spiralData.path,
      guidePoints: spiralData.guidePoints,
      laneWidth: 50
    },
    {
      id: 'stay-inside-lvl-12',
      name: 'Carril muy estrecho',
      description: '¡Máxima concentración! Mantente en la delgada vía.',
      difficulty: 'hard',
      path: 'M 50 300 Q 300 500, 550 300',
      guidePoints: sampleQuadBezier({ x: 50, y: 300 }, { x: 300, y: 500 }, { x: 550, y: 300 }, 21),
      laneWidth: 35
    },
    {
      id: 'stay-inside-lvl-13',
      name: 'Curvas cerradas consecutivas',
      description: 'Controla el giro en curvas muy pronunciadas.',
      difficulty: 'hard',
      path: 'M 100 200 C 50 400, 250 400, 200 600 C 150 800, 450 800, 400 400',
      guidePoints: [
        ...sampleCubicBezier({ x: 100, y: 200 }, { x: 50, y: 400 }, { x: 250, y: 400 }, { x: 200, y: 600 }, 16),
        ...sampleCubicBezier({ x: 200, y: 600 }, { x: 150, y: 800 }, { x: 450, y: 800 }, { x: 400, y: 400 }, 16).slice(1)
      ],
      laneWidth: 50
    },
    {
      id: 'stay-inside-lvl-14',
      name: 'Trayectoria tipo laberinto abierta',
      description: 'Navega por los giros rectos del laberinto abierto.',
      difficulty: 'hard',
      path: 'M 100 150 L 500 150 L 500 650 L 180 650 L 180 280 L 420 280 L 420 520 L 260 520',
      guidePoints: [
        ...sampleLine({ x: 100, y: 150 }, { x: 500, y: 150 }, 9),
        ...sampleLine({ x: 500, y: 150 }, { x: 500, y: 650 }, 11).slice(1),
        ...sampleLine({ x: 500, y: 650 }, { x: 180, y: 650 }, 8).slice(1),
        ...sampleLine({ x: 180, y: 650 }, { x: 180, y: 280 }, 8).slice(1),
        ...sampleLine({ x: 180, y: 280 }, { x: 420, y: 280 }, 6).slice(1),
        ...sampleLine({ x: 420, y: 280 }, { x: 420, y: 520 }, 6).slice(1),
        ...sampleLine({ x: 420, y: 520 }, { x: 260, y: 520 }, 4).slice(1)
      ],
      laneWidth: 50
    },
    {
      id: 'stay-inside-lvl-15',
      name: 'Circuito completo',
      description: 'Completa la vuelta a la pista de carreras.',
      difficulty: 'hard',
      path: 'M 300 150 C 500 150, 500 650, 300 650 C 100 650, 100 150, 300 150 Z',
      guidePoints: [
        ...sampleCubicBezier({ x: 300, y: 150 }, { x: 500, y: 150 }, { x: 500, y: 650 }, { x: 300, y: 650 }, 21),
        ...sampleCubicBezier({ x: 300, y: 650 }, { x: 100, y: 650 }, { x: 100, y: 150 }, { x: 300, y: 150 }, 21).slice(1)
      ],
      laneWidth: 50
    }
  ],

  // Activity ID '6' is "El laberinto" (stay_inside type, but with forks/walls)
  '6': [
    // === FÁCIL ===
    {
      id: 'maze-lvl-1',
      name: 'Laberinto con desvío',
      description: 'Cruza hacia el otro lado eligiendo el camino correcto y evitando el callejón sin salida.',
      difficulty: 'easy',
      path: 'M 100 425 L 180 425 L 180 310 L 350 310 L 350 425 L 500 425',
      guidePoints: [
        ...sampleLine({ x: 100, y: 425 }, { x: 180, y: 425 }, 4),
        ...sampleLine({ x: 180, y: 425 }, { x: 180, y: 310 }, 5).slice(1),
        ...sampleLine({ x: 180, y: 310 }, { x: 350, y: 310 }, 8).slice(1),
        ...sampleLine({ x: 350, y: 310 }, { x: 350, y: 425 }, 5).slice(1),
        ...sampleLine({ x: 350, y: 425 }, { x: 500, y: 425 }, 7).slice(1)
      ],
      laneWidth: 60,
      backgroundPaths: [
        'M 180 380 L 310 380',
        'M 180 425 L 180 540 L 350 540 L 350 480',
        'M 180 540 L 180 610 L 400 610 L 400 540',
        'M 180 480 L 260 480'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-2',
      name: 'Laberinto en L',
      description: 'Gira en la esquina para llegar al final del camino.',
      difficulty: 'easy',
      path: 'M 150 200 L 150 600 L 450 600',
      guidePoints: [
        ...sampleLine({ x: 150, y: 200 }, { x: 150, y: 600 }, 11),
        ...sampleLine({ x: 150, y: 600 }, { x: 450, y: 600 }, 11).slice(1)
      ],
      laneWidth: 80,
      backgroundPaths: [
        'M 150 350 L 300 350'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-3',
      name: 'Laberinto en U',
      description: 'Recorre el pasillo con forma de U.',
      difficulty: 'easy',
      path: 'M 150 200 L 150 600 L 450 600 L 450 200',
      guidePoints: [
        ...sampleLine({ x: 150, y: 200 }, { x: 150, y: 600 }, 11),
        ...sampleLine({ x: 150, y: 600 }, { x: 450, y: 600 }, 11).slice(1),
        ...sampleLine({ x: 450, y: 600 }, { x: 450, y: 200 }, 11).slice(1)
      ],
      laneWidth: 80,
      backgroundPaths: [
        'M 150 400 L 280 400',
        'M 450 400 L 320 400'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-4',
      name: 'Laberinto de 3 giros',
      description: 'Encuentra tu camino haciendo los 3 giros correctos.',
      difficulty: 'easy',
      path: 'M 100 200 L 500 200 L 500 450 L 100 450 L 100 700',
      guidePoints: [
        ...sampleLine({ x: 100, y: 200 }, { x: 500, y: 200 }, 11),
        ...sampleLine({ x: 500, y: 200 }, { x: 500, y: 450 }, 8).slice(1),
        ...sampleLine({ x: 500, y: 450 }, { x: 100, y: 450 }, 11).slice(1),
        ...sampleLine({ x: 100, y: 450 }, { x: 100, y: 700 }, 8).slice(1)
      ],
      laneWidth: 75,
      backgroundPaths: [
        'M 500 320 L 300 320',
        'M 100 580 L 300 580'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-5',
      name: 'Camino único corto',
      description: 'Dibuja una curva a través de la vía mágica.',
      difficulty: 'easy',
      path: 'M 100 500 Q 300 200, 500 500',
      guidePoints: sampleQuadBezier({ x: 100, y: 500 }, { x: 300, y: 200 }, { x: 500, y: 500 }, 21),
      laneWidth: 80,
      backgroundPaths: [
        'M 300 350 L 300 550'
      ],
      showDashedLine: false
    },

    // === MEDIO ===
    {
      id: 'maze-lvl-6',
      name: 'Laberinto con bifurcaciones falsas',
      description: '¡Cuidado! Toma el camino de la izquierda, el de la derecha está cerrado.',
      difficulty: 'medium',
      path: 'M 300 150 L 300 400 L 150 400 L 150 650',
      guidePoints: [
        ...sampleLine({ x: 300, y: 150 }, { x: 300, y: 400 }, 9),
        ...sampleLine({ x: 300, y: 400 }, { x: 150, y: 400 }, 6).slice(1),
        ...sampleLine({ x: 150, y: 400 }, { x: 150, y: 650 }, 9).slice(1)
      ],
      laneWidth: 70,
      backgroundPaths: ['M 300 400 L 450 400 L 450 600'],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-7',
      name: 'Laberinto circular',
      description: 'Recorre el anillo exterior izquierdo. La derecha y el centro son callejones sin salida.',
      difficulty: 'medium',
      path: 'M 300 150 A 200 200 0 0 0 300 550 L 300 700',
      guidePoints: [
        ...sampleCircle(300, 350, 200, 32).slice(16, 33), // left arc
        ...sampleLine({ x: 300, y: 550 }, { x: 300, y: 700 }, 6).slice(1)
      ],
      laneWidth: 70,
      backgroundPaths: [
        'M 300 150 A 200 200 0 0 1 300 550', // right arc (blocked at bottom)
        'M 300 350 L 300 450' // central fork (dead end)
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-8',
      name: 'Laberinto cuadrado',
      description: 'Sigue el contorno del cuadrado hacia el centro para escapar.',
      difficulty: 'medium',
      path: 'M 150 200 L 450 200 L 450 600 L 150 600 L 150 450',
      guidePoints: [
        ...sampleLine({ x: 150, y: 200 }, { x: 450, y: 200 }, 11),
        ...sampleLine({ x: 450, y: 200 }, { x: 450, y: 600 }, 13).slice(1),
        ...sampleLine({ x: 450, y: 600 }, { x: 150, y: 600 }, 11).slice(1),
        ...sampleLine({ x: 150, y: 600 }, { x: 150, y: 450 }, 6).slice(1)
      ],
      laneWidth: 70,
      backgroundPaths: [
        'M 450 200 L 450 100',
        'M 150 600 L 150 700'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-9',
      name: 'Laberinto con callejón sin salida',
      description: 'El camino de la izquierda está bloqueado más adelante. Ve por la derecha.',
      difficulty: 'medium',
      path: 'M 100 200 L 250 200 L 250 600 L 500 600 L 500 400',
      guidePoints: [
        ...sampleLine({ x: 100, y: 200 }, { x: 250, y: 200 }, 6),
        ...sampleLine({ x: 250, y: 200 }, { x: 250, y: 600 }, 13).slice(1),
        ...sampleLine({ x: 250, y: 600 }, { x: 500, y: 600 }, 9).slice(1),
        ...sampleLine({ x: 500, y: 600 }, { x: 500, y: 400 }, 6).slice(1)
      ],
      laneWidth: 70,
      backgroundPaths: ['M 100 200 L 100 600 L 250 600'],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-10',
      name: 'Laberinto en espiral',
      description: 'Entra por la espiral cuadrada y sal del laberinto.',
      difficulty: 'medium',
      path: 'M 300 150 L 300 300 L 450 300 L 450 550 L 150 550 L 150 400 L 300 400',
      guidePoints: [
        ...sampleLine({ x: 300, y: 150 }, { x: 300, y: 300 }, 6),
        ...sampleLine({ x: 300, y: 300 }, { x: 450, y: 300 }, 6).slice(1),
        ...sampleLine({ x: 450, y: 300 }, { x: 450, y: 550 }, 9).slice(1),
        ...sampleLine({ x: 450, y: 550 }, { x: 150, y: 550 }, 11).slice(1),
        ...sampleLine({ x: 150, y: 550 }, { x: 150, y: 400 }, 6).slice(1),
        ...sampleLine({ x: 150, y: 400 }, { x: 300, y: 400 }, 6).slice(1)
      ],
      laneWidth: 70,
      backgroundPaths: ['M 150 400 L 150 300'],
      showDashedLine: false
    },

    // === DIFÍCIL ===
    {
      id: 'maze-lvl-11',
      name: 'Laberinto multicamino',
      description: 'Elige el camino correcto que cruza por el centro.',
      difficulty: 'hard',
      path: 'M 100 150 L 100 400 L 300 400 L 300 650 L 500 650',
      guidePoints: [
        ...sampleLine({ x: 100, y: 150 }, { x: 100, y: 400 }, 9),
        ...sampleLine({ x: 100, y: 400 }, { x: 300, y: 400 }, 7).slice(1),
        ...sampleLine({ x: 300, y: 400 }, { x: 300, y: 650 }, 9).slice(1),
        ...sampleLine({ x: 300, y: 650 }, { x: 500, y: 650 }, 7).slice(1)
      ],
      laneWidth: 55,
      backgroundPaths: [
        'M 100 150 L 500 150 L 500 400 L 300 400',
        'M 100 400 L 100 650 L 300 650'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-12',
      name: 'Laberinto radial',
      description: 'Navega la gran curva exterior y dobla hacia el centro.',
      difficulty: 'hard',
      path: 'M 300 150 A 200 200 0 0 1 500 350 L 500 550 L 300 550',
      guidePoints: [
        ...sampleCircle(300, 350, 200, 32).slice(0, 9), // upper right quadrant
        ...sampleLine({ x: 500, y: 350 }, { x: 500, y: 550 }, 7).slice(1),
        ...sampleLine({ x: 500, y: 550 }, { x: 300, y: 550 }, 7).slice(1)
      ],
      laneWidth: 55,
      backgroundPaths: [
        'M 300 150 L 300 350',
        'M 300 350 L 100 350',
        'M 300 350 L 500 350',
        'M 300 350 L 300 550'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-13',
      name: 'Laberinto de alta densidad',
      description: 'Múltiples giros cerrados a través de las bifurcaciones.',
      difficulty: 'hard',
      path: 'M 100 150 L 200 150 L 200 300 L 100 300 L 100 500 L 300 500 L 300 650 L 500 650',
      guidePoints: [
        ...sampleLine({ x: 100, y: 150 }, { x: 200, y: 150 }, 4),
        ...sampleLine({ x: 200, y: 150 }, { x: 200, y: 300 }, 5).slice(1),
        ...sampleLine({ x: 200, y: 300 }, { x: 100, y: 300 }, 4).slice(1),
        ...sampleLine({ x: 100, y: 300 }, { x: 100, y: 500 }, 7).slice(1),
        ...sampleLine({ x: 100, y: 500 }, { x: 300, y: 500 }, 6).slice(1),
        ...sampleLine({ x: 300, y: 500 }, { x: 300, y: 650 }, 5).slice(1),
        ...sampleLine({ x: 300, y: 650 }, { x: 500, y: 650 }, 6).slice(1)
      ],
      laneWidth: 50,
      backgroundPaths: [
        'M 100 150 L 100 300',
        'M 200 150 L 500 150 L 500 300 L 300 300 L 300 500',
        'M 100 500 L 100 650 L 300 650'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-14',
      name: 'Laberinto con retrocesos obligatorios',
      description: 'Sigue el camino serpenteante de ida y vuelta.',
      difficulty: 'hard',
      path: 'M 100 150 L 500 150 L 500 300 L 100 300 L 100 500 L 500 500 L 500 650 L 100 650',
      guidePoints: [
        ...sampleLine({ x: 100, y: 150 }, { x: 500, y: 150 }, 11),
        ...sampleLine({ x: 500, y: 150 }, { x: 500, y: 300 }, 5).slice(1),
        ...sampleLine({ x: 500, y: 300 }, { x: 100, y: 300 }, 11).slice(1),
        ...sampleLine({ x: 100, y: 300 }, { x: 100, y: 500 }, 6).slice(1),
        ...sampleLine({ x: 100, y: 500 }, { x: 500, y: 500 }, 11).slice(1),
        ...sampleLine({ x: 500, y: 500 }, { x: 500, y: 650 }, 5).slice(1),
        ...sampleLine({ x: 500, y: 650 }, { x: 100, y: 650 }, 11).slice(1)
      ],
      laneWidth: 50,
      backgroundPaths: [
        'M 300 300 L 300 400',
        'M 300 500 L 300 600'
      ],
      showDashedLine: false
    },
    {
      id: 'maze-lvl-15',
      name: 'Laberinto complejo completo',
      description: 'El desafío final del laberinto. ¡Evita todos los desvíos y llega al final!',
      difficulty: 'hard',
      path: 'M 100 150 L 300 150 L 300 300 L 500 300 L 500 450 L 300 450 L 300 600 L 100 600 L 100 700 L 500 700',
      guidePoints: [
        ...sampleLine({ x: 100, y: 150 }, { x: 300, y: 150 }, 6),
        ...sampleLine({ x: 300, y: 150 }, { x: 300, y: 300 }, 5).slice(1),
        ...sampleLine({ x: 300, y: 300 }, { x: 500, y: 300 }, 6).slice(1),
        ...sampleLine({ x: 500, y: 300 }, { x: 500, y: 450 }, 5).slice(1),
        ...sampleLine({ x: 500, y: 450 }, { x: 300, y: 450 }, 6).slice(1),
        ...sampleLine({ x: 300, y: 450 }, { x: 300, y: 600 }, 5).slice(1),
        ...sampleLine({ x: 300, y: 600 }, { x: 100, y: 600 }, 6).slice(1),
        ...sampleLine({ x: 100, y: 600 }, { x: 100, y: 700 }, 4).slice(1),
        ...sampleLine({ x: 100, y: 700 }, { x: 500, y: 700 }, 11).slice(1)
      ],
      laneWidth: 50,
      backgroundPaths: [
        'M 100 150 L 100 300 L 300 300',
        'M 500 300 L 500 150',
        'M 300 450 L 100 450 L 100 600',
        'M 300 600 L 500 600 L 500 700'
      ],
      showDashedLine: false
    }
  ],

  // Activity ID '4' is "Copia la forma"
  '4': [
    // === FÁCIL ===
    {
      id: 'copy-shape-lvl-1',
      name: 'Línea recta',
      description: 'Dibuja una línea recta de izquierda a derecha.',
      difficulty: 'easy',
      path: 'M 150 400 L 450 400',
      guidePoints: sampleLine({ x: 150, y: 400 }, { x: 450, y: 400 }, 15)
    },
    {
      id: 'copy-shape-lvl-2',
      name: 'Círculo',
      description: 'Dibuja un círculo redondo como una pelota.',
      difficulty: 'easy',
      path: 'M 300 250 A 150 150 0 1 1 299.9 250 Z',
      guidePoints: sampleCircle(300, 400, 150, 36)
    },
    {
      id: 'copy-shape-lvl-3',
      name: 'Cuadrado',
      description: 'Dibuja un cuadrado con cuatro lados iguales.',
      difficulty: 'easy',
      path: 'M 150 250 L 450 250 L 450 550 L 150 550 Z',
      guidePoints: [
        ...sampleLine({ x: 150, y: 250 }, { x: 450, y: 250 }, 10),
        ...sampleLine({ x: 450, y: 250 }, { x: 450, y: 550 }, 10).slice(1),
        ...sampleLine({ x: 450, y: 550 }, { x: 150, y: 550 }, 10).slice(1),
        ...sampleLine({ x: 150, y: 550 }, { x: 150, y: 250 }, 10).slice(1)
      ]
    },
    {
      id: 'copy-shape-lvl-4',
      name: 'Triángulo',
      description: 'Dibuja un triángulo con tres puntas.',
      difficulty: 'easy',
      path: 'M 300 200 L 150 550 L 450 550 Z',
      guidePoints: [
        ...sampleLine({ x: 300, y: 200 }, { x: 150, y: 550 }, 12),
        ...sampleLine({ x: 150, y: 550 }, { x: 450, y: 550 }, 12).slice(1),
        ...sampleLine({ x: 450, y: 550 }, { x: 300, y: 200 }, 12).slice(1)
      ]
    },
    {
      id: 'copy-shape-lvl-5',
      name: 'Rectángulo',
      description: 'Dibuja un rectángulo largo y acostado.',
      difficulty: 'easy',
      path: 'M 100 300 L 500 300 L 500 500 L 100 500 Z',
      guidePoints: [
        ...sampleLine({ x: 100, y: 300 }, { x: 500, y: 300 }, 12),
        ...sampleLine({ x: 500, y: 300 }, { x: 500, y: 500 }, 8).slice(1),
        ...sampleLine({ x: 500, y: 500 }, { x: 100, y: 500 }, 12).slice(1),
        ...sampleLine({ x: 100, y: 500 }, { x: 100, y: 300 }, 8).slice(1)
      ]
    },

    // === MEDIO ===
    {
      id: 'copy-shape-lvl-6',
      name: 'Estrella simple',
      description: 'Copia la brillante estrella de cinco puntas.',
      difficulty: 'medium',
      path: generateStar(300, 400, 160, 65, 6).path,
      guidePoints: generateStar(300, 400, 160, 65, 6).guidePoints
    },
    {
      id: 'copy-shape-lvl-7',
      name: 'Corazón',
      description: 'Dibuja el corazón con trazos curvos y suaves.',
      difficulty: 'medium',
      path: 'M 300 300 C 300 200, 150 200, 150 350 C 150 480, 250 580, 300 650 C 350 580, 450 480, 450 350 C 450 200, 300 200, 300 300 Z',
      guidePoints: [
        ...sampleCubicBezier({ x: 300, y: 300 }, { x: 300, y: 200 }, { x: 150, y: 200 }, { x: 150, y: 350 }, 12),
        ...sampleCubicBezier({ x: 150, y: 350 }, { x: 150, y: 480 }, { x: 250, y: 580 }, { x: 300, y: 650 }, 12).slice(1),
        ...sampleCubicBezier({ x: 300, y: 650 }, { x: 350, y: 580 }, { x: 450, y: 480 }, { x: 450, y: 350 }, 12).slice(1),
        ...sampleCubicBezier({ x: 450, y: 350 }, { x: 450, y: 200 }, { x: 300, y: 200 }, { x: 300, y: 300 }, 12).slice(1)
      ]
    },
    {
      id: 'copy-shape-lvl-8',
      name: 'Casa',
      description: 'Dibuja una linda casita con su techo y paredes.',
      difficulty: 'medium',
      path: 'M 150 350 L 300 200 L 450 350 L 450 600 L 150 600 Z',
      guidePoints: [
        ...sampleLine({ x: 150, y: 350 }, { x: 300, y: 200 }, 10),
        ...sampleLine({ x: 300, y: 200 }, { x: 450, y: 350 }, 10).slice(1),
        ...sampleLine({ x: 450, y: 350 }, { x: 450, y: 600 }, 10).slice(1),
        ...sampleLine({ x: 450, y: 600 }, { x: 150, y: 600 }, 12).slice(1),
        ...sampleLine({ x: 150, y: 600 }, { x: 150, y: 350 }, 10).slice(1)
      ]
    },
    {
      id: 'copy-shape-lvl-9',
      name: 'Nube',
      description: 'Dibuja una esponjosa nube que flota en el cielo.',
      difficulty: 'medium',
      path: 'M 150 500 L 450 500 Q 520 460, 480 390 Q 500 290, 400 310 Q 300 230, 200 310 Q 100 290, 120 390 Q 80 460, 150 500 Z',
      guidePoints: [
        ...sampleLine({ x: 150, y: 500 }, { x: 450, y: 500 }, 12),
        ...sampleQuadBezier({ x: 450, y: 500 }, { x: 520, y: 460 }, { x: 480, y: 390 }, 8).slice(1),
        ...sampleQuadBezier({ x: 480, y: 390 }, { x: 500, y: 290 }, { x: 400, y: 310 }, 8).slice(1),
        ...sampleQuadBezier({ x: 400, y: 310 }, { x: 300, y: 230 }, { x: 200, y: 310 }, 10).slice(1),
        ...sampleQuadBezier({ x: 200, y: 310 }, { x: 100, y: 290 }, { x: 120, y: 390 }, 8).slice(1),
        ...sampleQuadBezier({ x: 120, y: 390 }, { x: 80, y: 460 }, { x: 150, y: 500 }, 8).slice(1)
      ]
    },
    {
      id: 'copy-shape-lvl-10',
      name: 'Sol',
      description: 'Dibuja un sol brillante con sus rayos de luz.',
      difficulty: 'medium',
      path: 'M 300 300 A 100 100 0 1 1 299.9 300 M 300 280 L 300 220 M 300 520 L 300 580 M 200 400 L 140 400 M 400 400 L 460 400 M 229 329 L 187 287 M 371 329 L 413 287 M 229 471 L 187 513 M 371 471 L 413 513',
      guidePoints: [
        ...sampleCircle(300, 400, 100, 24),
        ...sampleLine({ x: 300, y: 280 }, { x: 300, y: 220 }, 4),
        ...sampleLine({ x: 300, y: 520 }, { x: 300, y: 580 }, 4),
        ...sampleLine({ x: 200, y: 400 }, { x: 140, y: 400 }, 4),
        ...sampleLine({ x: 400, y: 400 }, { x: 460, y: 400 }, 4),
        ...sampleLine({ x: 229, y: 329 }, { x: 187, y: 287 }, 4),
        ...sampleLine({ x: 371, y: 329 }, { x: 413, y: 287 }, 4),
        ...sampleLine({ x: 229, y: 471 }, { x: 187, y: 513 }, 4),
        ...sampleLine({ x: 371, y: 471 }, { x: 413, y: 513 }, 4)
      ]
    },

    // === DIFÍCIL ===
    {
      id: 'copy-shape-lvl-11',
      name: 'Mariposa',
      description: 'Dibuja una mariposa con sus alas abiertas y antenas.',
      difficulty: 'hard',
      path: 'M 300 250 L 300 550 M 300 350 C 300 250, 150 200, 150 350 C 150 420, 250 430, 300 450 C 250 470, 180 480, 200 550 C 220 600, 280 550, 300 480 M 300 350 C 300 250, 450 200, 450 350 C 450 420, 350 430, 300 450 C 350 470, 420 480, 400 550 C 380 600, 320 550, 300 480 M 300 250 Q 280 200, 260 210 M 300 250 Q 320 200, 340 210',
      guidePoints: [
        ...sampleLine({ x: 300, y: 250 }, { x: 300, y: 550 }, 10),
        ...sampleCubicBezier({ x: 300, y: 350 }, { x: 300, y: 250 }, { x: 150, y: 200 }, { x: 150, y: 350 }, 10),
        ...sampleCubicBezier({ x: 150, y: 350 }, { x: 150, y: 420 }, { x: 250, y: 430 }, { x: 300, y: 450 }, 10).slice(1),
        ...sampleCubicBezier({ x: 300, y: 450 }, { x: 250, y: 470 }, { x: 180, y: 480 }, { x: 200, y: 550 }, 10).slice(1),
        ...sampleCubicBezier({ x: 200, y: 550 }, { x: 220, y: 600 }, { x: 280, y: 550 }, { x: 300, y: 480 }, 10).slice(1),
        ...sampleCubicBezier({ x: 300, y: 350 }, { x: 300, y: 250 }, { x: 450, y: 200 }, { x: 450, y: 350 }, 10),
        ...sampleCubicBezier({ x: 450, y: 350 }, { x: 450, y: 420 }, { x: 350, y: 430 }, { x: 300, y: 450 }, 10).slice(1),
        ...sampleCubicBezier({ x: 300, y: 450 }, { x: 350, y: 470 }, { x: 420, y: 480 }, { x: 400, y: 550 }, 10).slice(1),
        ...sampleCubicBezier({ x: 400, y: 550 }, { x: 380, y: 600 }, { x: 320, y: 550 }, { x: 300, y: 480 }, 10).slice(1),
        ...sampleQuadBezier({ x: 300, y: 250 }, { x: 280, y: 200 }, { x: 260, y: 210 }, 4),
        ...sampleQuadBezier({ x: 300, y: 250 }, { x: 320, y: 200 }, { x: 340, y: 210 }, 4)
      ]
    },
    {
      id: 'copy-shape-lvl-12',
      name: 'Flor',
      description: 'Dibuja una linda flor con su tallo y hoja.',
      difficulty: 'hard',
      path: 'M 300 290 A 60 60 0 1 1 299.9 290 M 300 290 Q 300 170, 300 290 M 351 315 Q 470 265, 351 315 M 351 385 Q 450 485, 351 385 M 249 385 Q 150 485, 249 385 M 249 315 Q 130 265, 249 315 M 300 410 L 300 600 M 300 500 Q 360 470, 300 550',
      guidePoints: [
        ...sampleCircle(300, 350, 60, 24),
        ...sampleQuadBezier({ x: 300, y: 290 }, { x: 300, y: 170 }, { x: 300, y: 290 }, 8),
        ...sampleQuadBezier({ x: 351, y: 315 }, { x: 470, y: 265 }, { x: 351, y: 315 }, 8),
        ...sampleQuadBezier({ x: 351, y: 385 }, { x: 450, y: 485 }, { x: 351, y: 385 }, 8),
        ...sampleQuadBezier({ x: 249, y: 385 }, { x: 150, y: 485 }, { x: 249, y: 385 }, 8),
        ...sampleQuadBezier({ x: 249, y: 315 }, { x: 130, y: 265 }, { x: 249, y: 315 }, 8),
        ...sampleLine({ x: 300, y: 410 }, { x: 300, y: 600 }, 10),
        ...sampleQuadBezier({ x: 300, y: 500 }, { x: 360, y: 470 }, { x: 300, y: 550 }, 8)
      ]
    },
    {
      id: 'copy-shape-lvl-13',
      name: 'Árbol',
      description: 'Dibuja un pino con su tronco y follaje triangular.',
      difficulty: 'hard',
      path: 'M 270 600 L 270 480 L 330 480 L 330 600 Z M 150 480 L 450 480 L 300 350 Z M 180 370 L 420 370 L 300 250 Z M 200 260 L 400 260 L 300 150 Z',
      guidePoints: [
        ...sampleLine({ x: 270, y: 600 }, { x: 270, y: 480 }, 5),
        ...sampleLine({ x: 270, y: 480 }, { x: 330, y: 480 }, 3).slice(1),
        ...sampleLine({ x: 330, y: 480 }, { x: 330, y: 600 }, 5).slice(1),
        ...sampleLine({ x: 330, y: 600 }, { x: 270, y: 600 }, 3).slice(1),
        ...sampleLine({ x: 150, y: 480 }, { x: 450, y: 480 }, 10),
        ...sampleLine({ x: 450, y: 480 }, { x: 300, y: 350 }, 10).slice(1),
        ...sampleLine({ x: 300, y: 350 }, { x: 150, y: 480 }, 10).slice(1),
        ...sampleLine({ x: 180, y: 370 }, { x: 420, y: 370 }, 8),
        ...sampleLine({ x: 420, y: 370 }, { x: 300, y: 250 }, 8).slice(1),
        ...sampleLine({ x: 300, y: 250 }, { x: 180, y: 370 }, 8).slice(1),
        ...sampleLine({ x: 200, y: 260 }, { x: 400, y: 260 }, 8),
        ...sampleLine({ x: 400, y: 260 }, { x: 300, y: 150 }, 8).slice(1),
        ...sampleLine({ x: 300, y: 150 }, { x: 200, y: 260 }, 8).slice(1)
      ]
    },
    {
      id: 'copy-shape-lvl-14',
      name: 'Pez',
      description: 'Dibuja un lindo pececito con su cola y ojito.',
      difficulty: 'hard',
      path: 'M 150 400 C 220 280, 380 280, 450 400 L 520 320 L 500 400 L 520 480 L 450 400 C 380 520, 220 520, 150 400 Z M 220 375 A 10 10 0 1 1 219.9 375 Z',
      guidePoints: [
        ...sampleCubicBezier({ x: 150, y: 400 }, { x: 220, y: 280 }, { x: 380, y: 280 }, { x: 450, y: 400 }, 15),
        ...sampleLine({ x: 450, y: 400 }, { x: 520, y: 320 }, 6).slice(1),
        ...sampleLine({ x: 520, y: 320 }, { x: 500, y: 400 }, 4).slice(1),
        ...sampleLine({ x: 500, y: 400 }, { x: 520, y: 480 }, 4).slice(1),
        ...sampleLine({ x: 520, y: 480 }, { x: 450, y: 400 }, 6).slice(1),
        ...sampleCubicBezier({ x: 450, y: 400 }, { x: 380, y: 520 }, { x: 220, y: 520 }, { x: 150, y: 400 }, 15).slice(1),
        ...sampleCircle(220, 375, 10, 8)
      ]
    },
    {
      id: 'copy-shape-lvl-15',
      name: 'Robot simple',
      description: 'Dibuja un robot amistoso usando formas cuadradas.',
      difficulty: 'hard',
      path: 'M 220 200 L 380 200 L 380 320 L 220 320 Z M 180 350 L 420 350 L 420 550 L 180 550 Z M 280 320 L 280 350 M 320 320 L 320 350 M 250 550 L 250 650 M 350 550 L 350 650 M 180 400 L 120 450 M 420 400 L 480 450 M 270 285 L 330 285 M 300 200 L 300 160 M 265 245 A 12 12 0 1 1 264.9 245 M 335 245 A 12 12 0 1 1 334.9 245',
      guidePoints: [
        ...sampleLine({ x: 220, y: 200 }, { x: 380, y: 200 }, 8),
        ...sampleLine({ x: 380, y: 200 }, { x: 380, y: 320 }, 8).slice(1),
        ...sampleLine({ x: 380, y: 320 }, { x: 220, y: 320 }, 8).slice(1),
        ...sampleLine({ x: 220, y: 320 }, { x: 220, y: 200 }, 8).slice(1),
        ...sampleLine({ x: 180, y: 350 }, { x: 420, y: 350 }, 10),
        ...sampleLine({ x: 420, y: 350 }, { x: 420, y: 550 }, 10).slice(1),
        ...sampleLine({ x: 420, y: 550 }, { x: 180, y: 550 }, 10).slice(1),
        ...sampleLine({ x: 180, y: 550 }, { x: 180, y: 350 }, 10).slice(1),
        ...sampleLine({ x: 280, y: 320 }, { x: 280, y: 350 }, 3),
        ...sampleLine({ x: 320, y: 320 }, { x: 320, y: 350 }, 3),
        ...sampleLine({ x: 250, y: 550 }, { x: 250, y: 650 }, 5),
        ...sampleLine({ x: 350, y: 550 }, { x: 350, y: 650 }, 5),
        ...sampleLine({ x: 180, y: 400 }, { x: 120, y: 450 }, 5),
        ...sampleLine({ x: 420, y: 400 }, { x: 480, y: 450 }, 5),
        ...sampleLine({ x: 270, y: 285 }, { x: 330, y: 285 }, 4),
        ...sampleLine({ x: 300, y: 200 }, { x: 300, y: 160 }, 3),
        ...sampleCircle(265, 245, 12, 8),
        ...sampleCircle(335, 245, 12, 8)
      ]
    }
  ]
};
