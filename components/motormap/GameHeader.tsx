import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

interface GameHeaderProps {
  title: string;
  onBack: () => void;
  completedCount: number;
  totalCount?: number;
}

export default function GameHeader({
  title,
  onBack,
  completedCount,
  totalCount = 6
}: GameHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <ChevronLeft size={24} color="#4A4A4A" strokeWidth={2.5} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.progressPill}>
        <Text style={styles.starText}>★</Text>
        <Text style={styles.progressText}>{completedCount}/{totalCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 32,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.cream,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F0EDE6',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.text.dark,
    fontWeight: '700',
    fontSize: 18,
  },
  progressPill: {
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#F0EDE6',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  starText: {
    color: Colors.primary.mustard,
    fontSize: 14,
  },
  progressText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
});
