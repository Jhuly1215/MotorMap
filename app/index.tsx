import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Motion } from '../constants/Motion';
import { Fingerprint } from 'lucide-react-native';

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    logoScale.value = withSpring(1, Motion.spring.bouncy);
    logoOpacity.value = withTiming(1, { duration: Motion.durations.normal });

    textOpacity.value = withDelay(
      Motion.durations.normal,
      withTiming(1, { duration: Motion.durations.normal })
    );
    textTranslateY.value = withDelay(
      Motion.durations.normal,
      withTiming(0, { duration: Motion.durations.normal, easing: Easing.out(Easing.back(1)) })
    );

    const timer = setTimeout(() => {
      router.replace('/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        {/* Placeholder for actual logo */}
        <View style={styles.logoCircle}>
          <Fingerprint size={120} color={Colors.primary.coral} strokeWidth={1.5} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title}>MotorMap</Text>
        <Text style={styles.subtitle}>Aprender jugando es crecer</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Plataforma Digital para el Desarrollo Motor Fino</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.hero,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.text.medium,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.light,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});
