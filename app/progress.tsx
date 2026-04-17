import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { useAppState } from '../context/AppStateContext';
import { Card } from '../components/ui/Card';
import {
  ChevronLeft,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react-native';

export default function ProgressScreen() {
  const router = useRouter();
  const { state } = useAppState();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={32} color={Colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Progreso</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Calendar size={24} color={Colors.text.medium} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{state.currentChildName[0]}</Text>
          </View>
          <Text style={styles.profileName}>{state.currentChildName}</Text>
          <Text style={styles.profileLevel}>Nivel 3: Pequeño Maestro</Text>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard} variant="outline">
            <Award size={24} color={Colors.primary.mustard} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Logros</Text>
          </Card>
          <Card style={styles.statCard} variant="outline">
            <Clock size={24} color={Colors.primary.sky} />
            <Text style={styles.statValue}>45m</Text>
            <Text style={styles.statLabel}>Tiempo</Text>
          </Card>
          <Card style={styles.statCard} variant="outline">
            <CheckCircle2 size={24} color={Colors.primary.sage} />
            <Text style={styles.statValue}>{state.completedActivities.length}</Text>
            <Text style={styles.statLabel}>Listas</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Últimas actividades</Text>

        {state.completedActivities.length > 0 ? (
          state.completedActivities.map((id, index) => (
            <View key={id + index}>
              <Card style={styles.activityItem} variant="elevated">
                <View style={styles.activityItemInner}>
                  <View style={[styles.activityIcon, { backgroundColor: Colors.primary.sage + '20' }]}>
                    <CheckCircle2 size={24} color={Colors.primary.sage} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>Actividad #{id}</Text>
                    <Text style={styles.activityDate}>Completado hoy a las 10:30 AM</Text>
                  </View>
                  <View style={styles.activityScore}>
                    <Text style={styles.scoreText}>92%</Text>
                  </View>
                </View>
              </Card>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>¡Aún no has empezado ninguna aventura!</Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/activities')}>
              <Text style={styles.startBtnText}>Empezar ahora</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Habilidades mejoradas</Text>
        <Card style={styles.skillsCard}>
          <View style={styles.skillRow}>
            <Text style={styles.skillName}>Precisión</Text>
            <View style={styles.skillBar}>
              <View style={[styles.skillFill, { width: '80%', backgroundColor: Colors.primary.sky }]} />
            </View>
          </View>
          <View style={styles.skillRow}>
            <Text style={styles.skillName}>Estabilidad</Text>
            <View style={styles.skillBar}>
              <View style={[styles.skillFill, { width: '65%', backgroundColor: Colors.primary.mustard }]} />
            </View>
          </View>
          <View style={styles.skillRow}>
            <Text style={styles.skillName}>Velocidad</Text>
            <View style={styles.skillBar}>
              <View style={[styles.skillFill, { width: '90%', backgroundColor: Colors.primary.coral }]} />
            </View>
          </View>
        </Card>
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
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.soft,
    borderRadius: 24,
  },
  title: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: Typography.sizes.hero,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: Typography.sizes.title1,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: Typography.sizes.body,
    color: Colors.text.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
  },
  sectionTitle: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 16,
  },
  activityItem: {
    marginBottom: 12,
    padding: 0,
  },
  activityItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: Typography.sizes.body,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  activityDate: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.light,
    marginTop: 2,
  },
  activityScore: {
    backgroundColor: Colors.primary.sage,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: Typography.sizes.small,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.light,
    fontSize: Typography.sizes.body,
    marginBottom: 20,
  },
  startBtn: {
    backgroundColor: Colors.primary.sky,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  skillsCard: {
    marginTop: 8,
  },
  skillRow: {
    marginBottom: 16,
  },
  skillName: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
    fontWeight: '600',
    marginBottom: 8,
  },
  skillBar: {
    height: 8,
    backgroundColor: Colors.ui.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 4,
  }
});
