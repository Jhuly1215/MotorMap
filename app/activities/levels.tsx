import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useAppState } from '../../context/AppStateContext';
import { LEVELS, Level } from '../../constants/Levels';
import { ChevronLeft, Lock, Play, Award } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function LevelsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams();
  const activityId = (searchParams.activityId as string) || '2';
  
  const { state, selectLevel } = useAppState();
  const [activeTab, setActiveTab] = useState<Difficulty>('easy');

  const activity = state.selectedActivity;
  const levels = LEVELS[activityId] || [];

  const filteredLevels = levels.filter(lvl => lvl.difficulty === activeTab);

  const isLevelUnlocked = (lvl: Level, index: number) => {
    // Level 1 is always unlocked
    if (lvl.id === levels[0].id) return true;
    
    // Check if progress exists in completedLevels
    const progress = state.completedLevels[lvl.id];
    if (progress?.unlocked) return true;

    // Alternatively, if the previous level has a completed score (accuracy > 0)
    const currentIdx = levels.findIndex(l => l.id === lvl.id);
    if (currentIdx > 0) {
      const prevLvl = levels[currentIdx - 1];
      const prevProgress = state.completedLevels[prevLvl.id];
      if (prevProgress && prevProgress.accuracy > 0) {
        return true;
      }
    }
    
    return false;
  };

  const handleSelectLevel = (lvl: Level, unlocked: boolean) => {
    if (!unlocked) return;
    selectLevel(lvl);
    router.push('/activities/drawing');
  };

  if (!activity) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={28} color={Colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activity.title}</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
          <TouchableOpacity
            key={diff}
            onPress={() => setActiveTab(diff)}
            style={[
              styles.tab,
              activeTab === diff && {
                backgroundColor: activity.color,
                borderColor: activity.color,
              }
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === diff && styles.tabTextActive
              ]}
            >
              {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Medio' : 'Difícil'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Levels list */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {filteredLevels.map((lvl, index) => {
            const unlocked = isLevelUnlocked(lvl, index);
            const progress = state.completedLevels[lvl.id];
            const isCompleted = progress && progress.accuracy > 0;

            return (
              <TouchableOpacity
                key={lvl.id}
                onPress={() => handleSelectLevel(lvl, unlocked)}
                disabled={!unlocked}
                activeOpacity={0.9}
                style={[
                  styles.cardWrapper,
                  !unlocked && { opacity: 0.6 }
                ]}
              >
                <Card 
                  style={StyleSheet.flatten([
                    styles.levelCard,
                    isCompleted && { borderColor: Colors.primary.sage, borderWidth: 2 }
                  ])}
                  variant={unlocked ? 'elevated' : 'flat'}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.levelNumber}>
                      NIVEL {levels.findIndex(l => l.id === lvl.id) + 1}
                    </Text>
                    
                    {isCompleted ? (
                      <View style={[styles.badge, { backgroundColor: Colors.primary.sage + '20' }]}>
                        <Award size={18} color={Colors.primary.sage} />
                        <Text style={[styles.badgeText, { color: Colors.primary.sage }]}>
                          {progress.accuracy}%
                        </Text>
                      </View>
                    ) : unlocked ? (
                      <View style={[styles.badge, { backgroundColor: Colors.primary.peach + '20' }]}>
                        <Play size={14} color={Colors.primary.peach} fill={Colors.primary.peach} />
                        <Text style={[styles.badgeText, { color: Colors.primary.peach }]}>Jugar</Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, { backgroundColor: Colors.text.light + '20' }]}>
                        <Lock size={14} color={Colors.text.medium} />
                      </View>
                    )}
                  </View>

                  <Text style={styles.levelName}>{lvl.name}</Text>
                  <Text style={styles.levelDesc}>{lvl.description}</Text>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    height: 100,
    backgroundColor: Colors.background.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.sizes.body,
    fontWeight: 'bold',
    color: Colors.text.medium,
  },
  tabTextActive: {
    color: 'white',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  grid: {
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
  levelCard: {
    padding: Spacing.xl,
    minHeight: 110,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: Typography.sizes.caption,
    fontWeight: '800',
    color: Colors.text.medium,
    letterSpacing: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    fontSize: Typography.sizes.caption,
    fontWeight: 'bold',
  },
  levelName: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  levelDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
    lineHeight: 18,
  },
});
