import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppState } from '../context/AppStateContext';
import { 
  Play, 
  Settings, 
  BarChart2, 
  Star, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAppState();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, explorador!</Text>
          <Text style={styles.childName}>{state.currentChildName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Settings color={Colors.text.medium} size={32} />
        </TouchableOpacity>
      </View>

      <Card style={styles.progressCard} variant="elevated">
        <View style={styles.progressHeader}>
          <TrendingUp size={24} color={Colors.primary.sage} />
          <Text style={styles.progressTitle}>Progreso semanal</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{state.completedActivities.length}</Text>
            <Text style={styles.statLabel}>Actividades</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Estrellas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Continuar jugando</Text>
        <TouchableOpacity onPress={() => router.push('/activities')}>
          <Text style={styles.seeAll}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.heroCard}
        onPress={() => router.push('/activities')}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Sigamos trazando</Text>
            <Text style={styles.heroSubtitle}>Sigue las líneas curvas</Text>
            <Button 
              title="¡Comenzar!" 
              onPress={() => router.push('/activities')} 
              style={styles.heroBtn}
              icon={<Play fill="white" size={20} />}
            />
          </View>
          <View style={styles.heroImageContainer}>
             <Award size={80} color="white" />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.menuGrid}>
         <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: Colors.primary.sky }]}
          onPress={() => router.push('/progress')}
        >
          <BarChart2 color="white" size={40} />
          <Text style={styles.menuText}>Mi Trazado</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: Colors.primary.mustard }]}
          onPress={() => {}}
        >
          <Star color="white" size={40} />
          <Text style={styles.menuText}>Colección</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: Typography.sizes.body,
    color: Colors.text.medium,
  },
  childName: {
    fontSize: Typography.sizes.hero,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  settingsBtn: {
    padding: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressCard: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    color: Colors.text.dark,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Typography.sizes.title1,
    fontWeight: 'bold',
    color: Colors.primary.sage,
  },
  statLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.ui.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  seeAll: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.sky,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: Colors.primary.coral,
    borderRadius: Spacing.radius_xl,
    padding: Spacing.xl,
    marginBottom: 32,
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: Typography.sizes.title1,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  heroImageContainer: {
    marginLeft: 20,
    opacity: 0.3,
  },
  menuGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  menuItem: {
    flex: 1,
    height: 160,
    borderRadius: Spacing.radius_xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuText: {
    marginTop: 12,
    color: 'white',
    fontWeight: 'bold',
    fontSize: Typography.sizes.body,
  }
});
