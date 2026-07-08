import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withSequence,
  withTiming,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface FeedbackOverlayProps {
  message: string;
  isVisible: boolean;
  onFinished: () => void;
}

export default function FeedbackOverlay({ message, isVisible, onFinished }: FeedbackOverlayProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSequence(
        withSpring(1, { damping: 10 }),
        withDelay(1000, withSpring(0))
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(1000, withTiming(0, { duration: 300 }))
      );
      
      const timer = setTimeout(onFinished, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onFinished, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.badge, animatedStyle]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  badge: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 40,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: Colors.primary.peach,
  },
  text: {
    fontSize: Typography.sizes.title1,
    fontWeight: 'bold',
    color: Colors.text.dark,
    textAlign: 'center',
  }
});
