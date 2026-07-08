import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Star, Lock, Trophy } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { useAppState } from '../context/AppStateContext';
import { ACTIVITIES } from '../constants/Activities';
import { LEVELS } from '../constants/Levels';
import { starsForAccuracy } from '../lib/utils';
import { Card } from '../components/ui/Card';

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useAppState();

  type LevelStat = { accuracy: number; unlocked: boolean };
  const levelStats = state.completedLevels as Record<string, LevelStat>;
  const totalStars = (Object.values(levelStats) as LevelStat[])
    .filter(v => v && v.accuracy > 0)
    .reduce((acc: number, v: LevelStat) => acc + starsForAccuracy(v.accuracy), 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={32} color={Colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Colección</Text>
        <View style={styles.totalPill}>
          <Star size={16} color={Colors.primary.mustard} fill={Colors.primary.mustard} />
          <Text style={styles.totalText}>{totalStars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Gana estrellas completando niveles: ⭐ desde 50%, ⭐⭐ desde 75% y ⭐⭐⭐ desde 90% de precisión.
        </Text>

        {ACTIVITIES.map(activity => {
          const levels = LEVELS[activity.id] || [];
          const activityStars = levels.reduce((acc, lvl) => {
            const rec = levelStats[lvl.id];
            return acc + (rec && rec.accuracy > 0 ? starsForAccuracy(rec.accuracy) : 0);
          }, 0);
          const maxStars = levels.length * 3;
          const doneCount = levels.filter(lvl => {
            const rec = levelStats[lvl.id];
            return rec && rec.accuracy > 0;
          }).length;
          const started = doneCount > 0;
          const allDone = levels.length > 0 && doneCount === levels.length;

          return (
            <Card key={activity.id} style={styles.activityCard}>
              <View style={styles.cardRow}>
                <View style={[styles.trophyWrap, { backgroundColor: activity.color + (started ? '33' : '15') }]}>
                  {started
                    ? <Trophy size={32} color={allDone ? Colors.primary.mustard : activity.color} />
                    : <Lock size={28} color={Colors.text.light} />}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{activity.title}</Text>
                  <Text style={styles.cardMeta}>
                    {doneCount}/{levels.length} niveles · {activityStars}/{maxStars} ⭐
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: activity.color,
                          width: `${levels.length > 0 ? Math.round((doneCount / levels.length) * 100) : 0}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Estrellas por nivel */}
              <View style={styles.levelDotsRow}>
                {levels.map(lvl => {
                  const rec = levelStats[lvl.id];
                  const s = rec && rec.accuracy > 0 ? starsForAccuracy(rec.accuracy) : -1;
                  return (
                    <View
                      key={lvl.id}
                      style={[
                        styles.levelDot,
                        s >= 0
                          ? { backgroundColor: activity.color }
                          : { backgroundColor: Colors.ui.border },
                      ]}
                    >
                      <Text style={styles.levelDotText}>{s >= 1 ? '★'.repeat(s) : s === 0 ? '·' : ''}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          );
        })}
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
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  totalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
  },
  totalText: {
    fontWeight: 'bold',
    color: Colors.text.dark,
    fontSize: 14,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 8,
    paddingBottom: 60,
    gap: 16,
  },
  subtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
    lineHeight: 20,
    marginBottom: 4,
  },
  activityCard: {
    padding: 20,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trophyWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: '700',
    color: Colors.text.dark,
  },
  cardMeta: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
    marginTop: 2,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ui.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  levelDotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  levelDot: {
    minWidth: 30,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelDotText: {
    fontSize: 9,
    color: 'white',
    fontWeight: 'bold',
  },
});
