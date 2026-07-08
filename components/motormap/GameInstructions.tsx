import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface GameInstructionsProps {
  description: string;
  color?: string;
}

export default function GameInstructions({
  description,
  color = Colors.primary.sage
}: GameInstructionsProps) {
  return (
    <View style={styles.instructionContainer}>
      <Text style={[styles.instructionText, { color }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  instructionText: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
