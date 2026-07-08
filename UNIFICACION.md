# MotorMap Unificado — Desarrollo 1 + Desarrollo 2

Proyecto único que fusiona las dos ramas del equipo, migrado al stack definido en
la documentación (**Expo / React Native con TypeScript**) y configurado para correr
**nativo en Android/iOS (sin Expo Go)** y en **web**, con generación de datos lista
para el backend (Firebase: Firestore + Storage).

## 1. Cómo correr el proyecto

```bash
npm install                 # instala dependencias (incluye react-native-web / react-dom)

# --- Nativo (development build, SIN Expo Go) ---
npx expo prebuild           # genera las carpetas nativas android/ e ios/
npm run android             # compila e instala el APK nativo (requiere Android SDK)
npm run ios                 # ídem iOS (requiere macOS + Xcode)

# --- Web ---
npm run web                 # servidor de desarrollo web
npm run web:build           # export estático de producción (dist/)
```

Notas:
- `expo run:android` compila una app nativa real con Gradle; Expo Go no participa.
  El bundle JS y las libs nativas (Reanimated, Gesture Handler, SVG) quedan
  embebidas en el APK/IPA.
- La web usa Metro + react-native-web con salida estática (`app.json → web.output: "static"`),
  compatible con expo-router.
- Antes de un build de distribución cambiar `android.package`
  (hoy `com.anonymous.motormap`).

## 2. Qué aporta cada rama en el proyecto unificado

### Base (rama Desarrollo 2 — Jhulianna)
- **Sistema de niveles** con dificultad (fácil/medio/difícil), desbloqueo progresivo
  y contador de intentos por plantilla (`constants/Levels.ts`, `app/activities/levels.tsx`,
  `context/AppStateContext.tsx`).
- Componentes de juego reutilizables: `GameHeader`, `GameInstructions`, `GameToolbar`
  (selector de color de pincel), `SuccessModal`.
- Canvas con escalado correcto de aspecto (viewBox 600×800 sin deformación),
  puntos numerados y marcadores decorativos.
- "Copia la forma" con layout dividido (modelo arriba + lienzo abajo) y puntaje
  compuesto forma + color objetivo.
- Análisis de sus 3 actividades: carril (percentInsideLane, exitCount,
  timeOutsideLaneMs, meanDistanceOutsideLane), copia de forma (similitud Chamfer
  normalizada, closureError, escala/proporción/rotación) y laberinto (colisiones,
  callejones, retrocesos) usando `backgroundPaths`.
- **Métricas cinemáticas comunes completas** del doc: pauseTotalMs, medianSpeed,
  maxSpeed, aceleración media y su variabilidad, smoothnessScore, stabilityScore.
- Registro relacional participante/sesión/intento (base del payload de backend).

### Integrado (rama Desarrollo 1 — Ignacio)
- **Motor geométrico** (`lib/geometry.ts`): distancia punto→segmento y
  punto→polilínea (más precisa que comparar contra puntos sueltos), sampling de
  Béziers y detección de zonas de curva por ángulo de giro.
- **Trazo JSON por intento** en el formato del Informe de abril 3.3
  (`formatVersion: "1.0"`, strokes → points `{i, t, x, y, phase}` con tiempo
  relativo al intento), vía `toTraceJSON`.
- Analizadores v2 con los nombres del doc "Métricas de desarrollo":
  - *Sigue el Camino*: meanDistanceToPath, maxDistanceToPath,
    percentWithinTolerance, pathCompletionPercent.
  - *Une los Puntos*: pointsReached, correctSequencePercent, sequenceErrors,
    omissions, timeBetweenPoints (registro por entrada al radio, con debounce).
  - *Montaña Rusa*: curveErrorMean, curveErrorMax, directionChangeControl,
    speedVariabilityInCurves (además de las 4 de trayectoria).
- **27 niveles nuevos** para las actividades 1, 3 y 5 (9 por actividad, 3 por
  dificultad), con lo que las 6 actividades quedan con separación por niveles:
  1 (9) · 2 (15) · 3 (9) · 4 (15) · 5 (9) · 6 (15) = **72 niveles**.
- Limpieza de migración: sin restos de Vite/AI Studio, assets en `assets/`,
  tsconfig estándar Expo.

## 3. Generación de datos para el backend

`lib/BackendExport.ts` construye por cada intento un `BackendAttemptPayload` con
la estructura de las colecciones definidas en los documentos:

| Bloque | Colección destino (Informe abril 3.2) | Contenido |
| --- | --- | --- |
| `participant` | `participants` | código anonimizado, edad en meses, sexo, mano dominante, grupo |
| `session` | `sessions` | sesión con dispositivo, inicio/fin, número de sesión |
| `attempt` | `sessions/{id}/attempts` | actividad, plantilla/nivel, número de intento, duración, completed, qualityFlag |
| `metrics` | `.../metrics` | las **16 métricas generales** del doc + `activitySpecific` con las de la actividad |
| `traceData` | `.../trace_data` | trazo JSON `formatVersion 1.0` (o a Storage si es muy pesado) |

Hoy el payload se registra por consola (`logAttemptPayload`); en la Fase 4
(Semana 4) basta reemplazar ese log por las escrituras del SDK de Firebase.

## 4. Validación realizada

El núcleo de análisis (TypeScript puro) fue compilado con `tsc` y probado con
intentos simulados sobre niveles reales:
- Camino recto calcado → precisión 100, completitud 100, smoothness 100.
- Estrella (nivel medio de Une los Puntos) conectada 1→5 → 5/5, 0 errores, 0 omisiones.
- Montaña rusa de 5 colinas con desvíos puntuales → curveErrorMean 2 px,
  curveErrorMax 14 px, control de dirección 100.
- Carril con salida simulada → percentInsideLane 55, 1 salida, 250 ms fuera.
- Payload de backend generado con 17 campos generales + específicas + trazo JSON
  con fases down/move/up.

Pendiente de validar en dispositivo/web real (requiere `npm install`):
arranque nativo con prebuild, gestos en navegador, y sensación de tolerancias
(30–45 px del viewBox) con dedo de niño en tablet.

## 5. Revisión de UI y funcionalidad (iteración post-fusión)

- **Safe area en toda la app**: se agregó `SafeAreaProvider` al layout raíz y todos
  los encabezados (home, actividades, niveles, juego, progreso, ajustes, colección)
  usan `useSafeAreaInsets`, de modo que la bienvenida y el botón de ajustes ya no
  quedan bajo el dynamic island / notch en ningún dispositivo.
- **Tutorial por nivel**: al iniciar cualquier nivel aparece un tutorial breve con
  la instrucción del juego (según el tipo de actividad), el aviso de que se puede
  cambiar el color del pincel en la barra inferior, cómo reiniciar y cómo terminar.
  El botón «?» del lienzo (antes decorativo) ahora reabre este tutorial.
- **Estadísticas al finalizar cada nivel**: el modal de éxito muestra estrellas
  (1★ ≥50 %, 2★ ≥75 %, 3★ ≥90 %), precisión, completitud y tiempo, más el detalle
  específico de la actividad (error medio y camino cubierto; % dentro del carril y
  salidas; puntos en orden y errores de secuencia; similitud y error de cierre;
  error en curvas y control de dirección; choques y retrocesos) y las comunes
  (trazos, pausas, fluidez).
- **Colección**: el botón de la pantalla inicial (antes sin acción) abre la nueva
  pantalla `app/collection.tsx` con el total de estrellas, y por actividad la barra
  de progreso de niveles y las estrellas obtenidas nivel por nivel.
- **Contadores reales**: la píldora del juego muestra niveles completados de la
  actividad actual (p. ej. 3/9) y el «Progreso semanal» del inicio calcula niveles
  completados sobre 72, estrellas acumuladas y precisión promedio reales (antes
  había valores fijos 15 y 85 %).
