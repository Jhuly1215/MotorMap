import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Hand, Palette, RotateCcw, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { ActivityType } from '../../types/drawing';

interface TutorialOverlayProps {
  isVisible: boolean;
  activityType: ActivityType | string;
  levelName: string;
  levelDescription: string;
  color: string;
  onDismiss: () => void;
}

/** Instrucción principal según el tipo de juego */
const getMainInstruction = (type: string): string => {
  switch (type) {
    case 'follow_line':
      return 'Pon el dedo sobre la línea punteada y recórrela de principio a fin, lo más pegado que puedas.';
    case 'stay_inside':
      return 'Traza por el medio del carril sin tocar los bordes. ¡Ve despacio en las curvas!';
    case 'connect_dots':
      return 'Une los puntos siguiendo los números en orden: del 1 al último. ¡Descubre la figura escondida!';
    case 'copy_shape':
      return 'Mira el modelo de arriba y dibuja la misma figura en tu lienzo, del mismo color.';
    default:
      return 'Dibuja siguiendo la guía de la pantalla lo mejor que puedas.';
  }
};

export default function TutorialOverlay({
  isVisible,
  activityType,
  levelName,
  levelDescription,
  color,
  onDismiss,
}: TutorialOverlayProps) {
  if (!isVisible) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
      <Animated.View entering={FadeInUp.duration(300)} style={styles.card}>
        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
          <Hand size={40} color={color} />
        </View>

        <Text style={styles.title}>{levelName}</Text>
        <Text style={styles.description}>{levelDescription}</Text>

        <View style={styles.divider} />

        <View style={styles.tipRow}>
          <Hand size={22} color={Colors.primary.sage} />
          <Text style={styles.tipText}>{getMainInstruction(String(activityType))}</Text>
        </View>

        <View style={styles.tipRow}>
          <Palette size={22} color={Colors.primary.coral} />
          <Text style={styles.tipText}>
            Puedes cambiar el color del pincel tocando los círculos de colores de la barra de abajo.
          </Text>
        </View>

        <View style={styles.tipRow}>
          <RotateCcw size={22} color={Colors.primary.sky} />
          <Text style={styles.tipText}>
            ¿Te equivocaste? Usa la flecha para borrar y empezar de nuevo.
          </Text>
        </View>

        <View style={styles.tipRow}>
          <CheckCircle2 size={22} color={Colors.primary.mustard} />
          <Text style={styles.tipText}>
            Cuando termines tu trazo, toca el círculo con el visto para ver tu puntaje.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: color }]}
          onPress={onDismiss}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>¡A jugar!</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60, 60, 60, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.body,
    color: Colors.text.medium,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.ui.border,
    marginVertical: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.sizes.caption,
    lineHeight: 20,
    color: Colors.text.dark,
  },
  startBtn: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: Typography.sizes.body,
  },
});
