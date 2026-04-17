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
          {[1, 2, 3].map(i => (
            <Animated.View key={i} entering={ZoomIn.delay(800 + i * 200)}>
              <Star
                size={48}
                fill={Colors.primary.mustard}
                color={Colors.primary.mustard}
                style={styles.star}
              />
            </Animated.View>
          ))}
        </View>

        <Text style={styles.praise}>¡Tus manos se mueven cada vez mejor! Sigue así para convertirte en un maestro del trazado.</Text>
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
