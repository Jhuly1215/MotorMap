import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RotateCcw, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface GameToolbarProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onReset: () => void;
  onFinish: () => void;
  hasStrokes: boolean;
  colors?: string[];
}

export default function GameToolbar({
  selectedColor,
  onColorSelect,
  onReset,
  onFinish,
  hasStrokes,
  colors = [Colors.primary.sky, Colors.primary.mustard, Colors.primary.coral, Colors.primary.sage]
}: GameToolbarProps) {
  return (
    <View style={styles.toolbar}>
      {/* Active Brush Tool Indicator */}
      <View style={[styles.tool, styles.toolActive]}>
        <View style={[styles.toolIcon, { backgroundColor: selectedColor }]} />
      </View>

      {/* Reset/Undo Button */}
      <TouchableOpacity style={styles.tool} onPress={onReset} activeOpacity={0.7}>
        <RotateCcw size={24} color={Colors.text.dark} />
      </TouchableOpacity>

      <View style={{ width: 16 }} />

      {/* Interactive Color Palette */}
      <View style={styles.paletteRow}>
        {colors.map((color, idx) => {
          const isSelected = color === selectedColor;
          return (
            <TouchableOpacity
              key={color}
              onPress={() => onColorSelect(color)}
              activeOpacity={0.8}
              style={[
                styles.colorPicker,
                { 
                  backgroundColor: color, 
                  marginLeft: idx === 0 ? 0 : -20, 
                  zIndex: isSelected ? 10 : idx + 1,
                  borderColor: 'white',
                  borderWidth: isSelected ? 4 : 2,
                  transform: [{ scale: isSelected ? 1.15 : 1.0 }]
                }
              ]}
            />
          );
        })}
      </View>

      <View style={{ width: 16 }} />

      {/* Done/Complete Button */}
      <TouchableOpacity
        style={styles.doneBtn}
        onPress={onFinish}
        disabled={!hasStrokes}
        activeOpacity={0.7}
      >
        <CheckCircle2 
          size={48} 
          color={hasStrokes ? Colors.primary.coral : Colors.text.light} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    padding: 32,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.cream,
  },
  tool: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  toolActive: {
    borderColor: Colors.primary.peach,
    backgroundColor: '#FFF8F4',
  },
  toolIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPicker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  doneBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
