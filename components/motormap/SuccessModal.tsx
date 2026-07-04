import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { AttemptMetrics } from '../../types/drawing';

interface SuccessModalProps {
  isVisible: boolean;
  metrics: AttemptMetrics | null;
  activityType: string;
}

export default function SuccessModal({
  isVisible,
  metrics,
  activityType
}: SuccessModalProps) {
  if (!isVisible) return null;

  return (
    <Animated.View entering={FadeIn} style={styles.successOverlay}>
      <Animated.View entering={FadeInUp} style={styles.successModal}>
        <CheckCircle2 size={100} color={Colors.primary.sage} />
        <Text style={styles.successText}>¡Increíble trazo!</Text>
        
        {metrics && (
          <View style={styles.metricsRow}>
            <Text style={styles.accuracyText}>{metrics.accuracy}% precisión</Text>
            
            {activityType === 'stay_inside' && metrics.departures !== undefined && metrics.departures > 0 && (
              <Text style={styles.departuresText}>{metrics.departures} salidas</Text>
            )}
          </View>
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
  },
  successModal: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  successText: {
    fontSize: Typography.sizes.title1,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginTop: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.sage,
    fontWeight: '700',
  },
  departuresText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.coral,
    fontWeight: '700',
  },
});
