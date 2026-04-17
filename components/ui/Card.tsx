import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outline';
}

export const Card = ({ children, style, variant = 'elevated' }: CardProps) => {
  return (
    <View style={[
      styles.base,
      variant === 'elevated' && styles.elevated,
      variant === 'outline' && styles.outline,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.background.white,
    borderRadius: Spacing.radius_xl,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
  },
});
