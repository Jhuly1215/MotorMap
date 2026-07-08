import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AttemptMetrics } from '../../types/drawing';
import { starsForAccuracy } from '../../lib/utils';

interface SuccessModalProps {
  isVisible: boolean;
  metrics: AttemptMetrics | null;
  activityType: string;
  activityId?: string;
}

const fmtSeconds = (ms?: number) =>
  typeof ms === 'number' && ms > 0 ? `${Math.round(ms / 100) / 10}s` : '—';

/** Filas de detalle específicas por actividad (doc "Métricas de desarrollo") */
const getSpecificRows = (activityId: string | undefined, m: AttemptMetrics): [string, string][] => {
  switch (activityId) {
    case '1': // Sigue el Camino
      return [
        ['Dentro de tolerancia', `${m.percentWithinTolerance ?? m.accuracy}%`],
        ['Error medio', `${m.meanDistanceToPath ?? 0}px`],
        ['Camino cubierto', `${m.pathCompletionPercent ?? 0}%`],
      ];
    case '2': // Dentro del Carril
      return [
        ['Dentro del carril', `${m.percentInsideLane ?? 0}%`],
        ['Salidas', `${m.exitCount ?? m.departures ?? 0}`],
        ['Tiempo fuera', fmtSeconds(m.timeOutsideLaneMs)],
      ];
    case '3': // Une los Puntos
      return [
        ['En orden', `${m.correctSequencePercent ?? 0}%`],
        ['Puntos alcanzados', `${m.pointsReached ?? 0}`],
        ['Errores de orden', `${m.sequenceErrors ?? 0}`],
      ];
    case '4': // Copia la Forma
      return [
        ['Similitud', `${m.shapeSimilarityScore ?? m.accuracy}%`],
        ['Error de cierre', `${m.closureError ?? 0}px`],
      ];
    case '5': // Montaña Rusa
      return [
        ['Error en curvas', `${m.curveErrorMean ?? 0}px`],
        ['Control de curvas', `${m.directionChangeControl ?? 0}%`],
      ];
    case '6': // Laberinto
      return [
        ['Choques', `${m.collisionCount ?? 0}`],
        ['Retrocesos', `${m.backtrackCount ?? 0}`],
        ['Completado', `${m.mazeCompletionPercent ?? m.completionScore ?? 0}%`],
      ];
    default:
      return [];
  }
};

export default function SuccessModal({
  isVisible,
  metrics,
  activityType,
  activityId,
}: SuccessModalProps) {
  if (!isVisible) return null;

  const stars = metrics ? starsForAccuracy(metrics.accuracy) : 0;
  const specific = metrics ? getSpecificRows(activityId, metrics) : [];

  return (
    <Animated.View entering={FadeIn} style={styles.successOverlay}>
      <Animated.View entering={FadeInUp} style={styles.successModal}>
        <CheckCircle2 size={80} color={Colors.primary.sage} />
        <Text style={styles.successText}>
          {stars >= 3 ? '¡Perfecto!' : stars >= 2 ? '¡Muy bien!' : stars >= 1 ? '¡Buen trabajo!' : '¡Sigue intentando!'}
        </Text>

        <Text style={styles.starsText}>
          {'★'.repeat(stars)}
          <Text style={styles.starsOff}>{'★'.repeat(3 - stars)}</Text>
        </Text>

        {metrics && (
          <>
            {/* Métricas principales */}
            <View style={styles.mainRow}>
              <View style={styles.mainStat}>
                <Text style={styles.mainValue}>{metrics.accuracy}%</Text>
                <Text style={styles.mainLabel}>Precisión</Text>
              </View>
              <View style={styles.mainDivider} />
              <View style={styles.mainStat}>
                <Text style={styles.mainValue}>{metrics.completionScore ?? 0}%</Text>
                <Text style={styles.mainLabel}>Completado</Text>
              </View>
              <View style={styles.mainDivider} />
              <View style={styles.mainStat}>
                <Text style={styles.mainValue}>{fmtSeconds(metrics.totalTimeMs ?? metrics.duration)}</Text>
                <Text style={styles.mainLabel}>Tiempo</Text>
              </View>
            </View>

            {/* Detalle por actividad + comunes */}
            <View style={styles.detailBox}>
              {specific.map(([label, value]) => (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trazos</Text>
                <Text style={styles.detailValue}>{metrics.strokeCount}</Text>
              </View>
              {typeof metrics.pauseCount === 'number' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pausas</Text>
                  <Text style={styles.detailValue}>{metrics.pauseCount}</Text>
                </View>
              )}
              {typeof metrics.smoothnessScore === 'number' && (
                <View style={[styles.detailRow, styles.detailRowLast]}>
                  <Text style={styles.detailLabel}>Fluidez</Text>
                  <Text style={styles.detailValue}>{metrics.smoothnessScore}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 251, 247, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  successModal: {
    backgroundColor: 'white',
    paddingVertical: 28,
    paddingHorizontal: 28,
    borderRadius: 36,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  successText: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginTop: 12,
  },
  starsText: {
    fontSize: 30,
    color: Colors.primary.mustard,
    marginTop: 4,
    letterSpacing: 4,
  },
  starsOff: {
    color: Colors.ui.border,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginTop: 16,
    paddingHorizontal: 6,
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
  },
  mainValue: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.primary.sage,
  },
  mainLabel: {
    fontSize: Typography.sizes.small,
    color: Colors.text.medium,
    marginTop: 2,
  },
  mainDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.ui.border,
  },
  detailBox: {
    alignSelf: 'stretch',
    marginTop: 16,
    backgroundColor: Colors.background.soft,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
  },
  detailValue: {
    fontSize: Typography.sizes.caption,
    fontWeight: '700',
    color: Colors.text.dark,
  },
});
