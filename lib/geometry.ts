/**
 * MotorMap — lib/geometry.ts
 * Helpers geométricos del motor de medición (Desarrollo 1).
 * Espacio de coordenadas: viewBox 600x800 del DrawingCanvas.
 */

export interface XY {
  x: number;
  y: number;
}

/** Distancia euclidiana entre dos puntos */
export const dist = (a: XY, b: XY): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Distancia mínima de un punto P al segmento AB.
 * Más precisa que comparar contra puntos sueltos de la plantilla:
 * evita "huecos" entre puntos guía separados.
 */
export const distPointToSegment = (p: XY, a: XY, b: XY): number => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq === 0) return dist(p, a);
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return dist(p, { x: a.x + t * abx, y: a.y + t * aby });
};

/** Distancia mínima de un punto a una polilínea (trayectoria guía) */
export const distToPolyline = (p: XY, poly: XY[]): number => {
  if (poly.length === 0) return Infinity;
  if (poly.length === 1) return dist(p, poly[0]);
  let min = Infinity;
  for (let i = 1; i < poly.length; i++) {
    const d = distPointToSegment(p, poly[i - 1], poly[i]);
    if (d < min) min = d;
  }
  return min;
};

/** Longitud total de una polilínea */
export const polylineLength = (points: XY[]): number => {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += dist(points[i - 1], points[i]);
  }
  return len;
};

/** Muestrea una Bézier cuadrática P0-P1-P2 en n puntos (incluye extremos) */
export const sampleQuadratic = (p0: XY, p1: XY, p2: XY, n: number = 20): XY[] => {
  const out: XY[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    out.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    });
  }
  return out;
};

/** Muestrea una Bézier cúbica P0-P1-P2-P3 en n puntos (incluye extremos) */
export const sampleCubic = (p0: XY, p1: XY, p2: XY, p3: XY, n: number = 24): XY[] => {
  const out: XY[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    out.push({
      x:
        mt * mt * mt * p0.x +
        3 * mt * mt * t * p1.x +
        3 * mt * t * t * p2.x +
        t * t * t * p3.x,
      y:
        mt * mt * mt * p0.y +
        3 * mt * mt * t * p1.y +
        3 * mt * t * t * p2.y +
        t * t * t * p3.y,
    });
  }
  return out;
};

/**
 * Muestrea una cadena de Béziers cúbicas: [P0, c1, c2, P1, c1, c2, P2, ...]
 * (el punto final de cada tramo es el inicial del siguiente).
 * Deduplica los puntos de unión.
 */
export const sampleCubicChain = (anchors: XY[], perSegment: number = 24): XY[] => {
  const out: XY[] = [];
  for (let i = 0; i + 3 < anchors.length; i += 3) {
    const seg = sampleCubic(anchors[i], anchors[i + 1], anchors[i + 2], anchors[i + 3], perSegment);
    if (out.length > 0) seg.shift(); // evita duplicar el punto de unión
    out.push(...seg);
  }
  return out;
};

/**
 * Ángulo de giro (en grados, 0-180) en el punto i de una polilínea.
 * 0 = recto; valores altos = curva cerrada. Sirve para detectar "zonas de curva".
 */
export const turnAngleAt = (poly: XY[], i: number): number => {
  if (i <= 0 || i >= poly.length - 1) return 0;
  const a = poly[i - 1];
  const b = poly[i];
  const c = poly[i + 1];
  const v1x = b.x - a.x;
  const v1y = b.y - a.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const l1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const l2 = Math.sqrt(v2x * v2x + v2y * v2y);
  if (l1 === 0 || l2 === 0) return 0;
  let cos = (v1x * v2x + v1y * v2y) / (l1 * l2);
  cos = Math.max(-1, Math.min(1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
};
