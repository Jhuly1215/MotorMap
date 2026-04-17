import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useAppState, Activity } from '../../context/AppStateContext';
import {
  ChevronLeft,
  Map,
  Orbit,
  Shapes,
  Route,
  Activity as ActivityIcon
} from 'lucide-react-native';
import { Card } from '../../components/ui/Card';

const ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'follow_line',
    title: 'Sigue el camino',
    description: 'Sigue la línea punteada sin salirte.',
    color: Colors.primary.sage,
    difficulty: 1,
  },
  {
    id: '2',
    type: 'stay_inside',
    title: 'Dentro del carril',
    description: 'Traza por el medio del túnel mágico.',
    color: Colors.primary.sky,
    difficulty: 2,
  },
  {
    id: '3',
    type: 'connect_dots',
    title: 'Une los puntos',
    description: 'Descubre qué forma se esconde aquí.',
    color: Colors.primary.coral,
    difficulty: 1,
  },
  {
    id: '4',
    type: 'copy_shape',
    title: 'Copia la forma',
    description: 'Intenta dibujar el mismo dibujo.',
    color: Colors.primary.peach,
    difficulty: 3,
  },
  {
    id: '5',
    type: 'follow_line',
    title: 'Montaña rusa',
    description: 'Un camino con muchas curvas divertidas.',
    color: Colors.primary.lilac,
    difficulty: 2,
  },
  {
    id: '6',
    type: 'stay_inside',
    title: 'El laberinto',
    description: 'Llega al final sin tocar las paredes.',
    color: Colors.primary.mustard,
    difficulty: 3,
  }
];

export default function ActivitySelectionScreen() {
  const router = useRouter();
  const { selectActivity } = useAppState();

  const handleSelect = (activity: Activity) => {
    selectActivity(activity);
    router.push('/activities/drawing');
  };

  const getIcon = (type: string, color: string) => {
    switch (type) {
      case 'follow_line': return <Route size={40} color={color} />;
      case 'stay_inside': return <Map size={40} color={color} />;
      case 'connect_dots': return <Orbit size={40} color={color} />;
      case 'copy_shape': return <Shapes size={40} color={color} />;
      default: return <ActivityIcon size={40} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={32} color={Colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Actividades</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.instructions}>¿Qué quieres aprender hoy?</Text>

        <View style={styles.grid}>
          {ACTIVITIES.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.cardContainer}
              onPress={() => handleSelect(activity)}
              activeOpacity={0.9}
            >
              <Card style={styles.card}>
                <View style={[styles.iconWrapper, { backgroundColor: activity.color + '20' }]}>
                  {getIcon(activity.type, activity.color)}
                </View>
                <Text style={styles.cardTitle}>{activity.title}</Text>
                <Text style={styles.cardDesc}>{activity.description}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.difficultyContainer}>
                    {[1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.difficultyDot,
                          i <= activity.difficulty && { backgroundColor: activity.color }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.difficultyText}>
                    {activity.difficulty === 1 ? 'Fácil' : activity.difficulty === 2 ? 'Medio' : 'Reto'}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
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
  title: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  instructions: {
    fontSize: Typography.sizes.title1,
    fontWeight: '600',
    color: Colors.text.dark,
    marginBottom: 32,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  cardContainer: {
    width: '47%', // Approx 2 columns on tablet
    flexGrow: 1,
  },
  card: {
    height: 240,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.medium,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EBEBEB',
  },
  difficultyText: {
    fontSize: Typography.sizes.small,
    color: Colors.text.light,
    fontWeight: '600',
    textTransform: 'uppercase',
  }
});
