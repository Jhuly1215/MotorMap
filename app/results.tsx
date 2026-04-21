import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/ui/Button';
import {
  Trophy,
  Home,
  Play,
  ChevronRight,
  Star
} from 'lucide-react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

export default function ResultsScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const activity = state.selectedActivity;

  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.delay(300)} style={styles.iconContainer}>
        <View style={[styles.glow, { backgroundColor: activity?.color || Colors.primary.sage }]} />
        <Trophy size={120} color={activity?.color || Colors.primary.sage} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600)} style={styles.textContainer}>
        <Text style={styles.title}>¡Felicidades!</Text>
        <Text style={styles.subtitle}>Has completado: {activity?.title}</Text>

        <View style={styles.starsRow}>
          {state.lastAttempt && (
            <View style={styles.resultsSummary}>
               <Text style={styles.resultValue}>{state.lastAttempt.metrics.accuracy}%</Text>
               <Text style={styles.resultLabel}>Precisión</Text>
            </View>
          )}
        </View>

        <Text style={styles.praise}>
          {state.lastAttempt?.metrics.accuracy && state.lastAttempt.metrics.accuracy > 80 
            ? "¡Tus manos se mueven increiblemente! Sigue así."
            : "¡Muy bien! Sigue practicando para mejorar tu precisión."}
        </Text>
      </Animated.View>

      <View style={styles.actions}>
        <Button
          variant="outline"
          title="Repetir"
          onPress={() => router.replace('/activities/drawing')}
          icon={<Play size={20} color={Colors.primary.sage} />}
          style={styles.btn}
        />

        <Button
          title="Siguiente"
          onPress={() => router.replace('/activities')}
          icon={<ChevronRight size={20} color="white" />}
          style={styles.btn}
        />
      </View>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace('/home')}
      >
        <Home size={24} color={Colors.text.medium} />
        <Text style={styles.homeText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: Typography.sizes.hero,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.title2,
    color: Colors.text.medium,
    marginBottom: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  resultsSummary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#F0EDE6',
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text.dark,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.medium,
    textTransform: 'uppercase',
  },
  star: {
    shadowColor: Colors.primary.mustard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  praise: {
    fontSize: Typography.sizes.body,
    color: Colors.text.medium,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    maxWidth: 500,
  },
  btn: {
    flex: 1,
  },
  homeBtn: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeText: {
    fontSize: Typography.sizes.body,
    color: Colors.text.medium,
    fontWeight: '600',
  }
});
