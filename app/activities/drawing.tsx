import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useAppState } from '../../context/AppStateContext';
import DrawingCanvas from '../../components/motormap/DrawingCanvas';
import FeedbackOverlay from '../../components/motormap/FeedbackOverlay';
import {
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Stroke, AttemptMetrics } from '../../types/drawing';
import { analyzeAttempt } from '../../lib/TraceAnalysis';
import { TEMPLATES } from '../../constants/Templates';

const FEEDBACK_MESSAGES = [
  "¡Qué buen trazo!",
  "¡Muy bien!",
  "¡Sigamos!",
  "¡Lo estás haciendo genial!"
];

export default function DrawingActivityScreen() {
  const router = useRouter();
  const { state, completeActivity } = useAppState();
  const [isFinished, setIsFinished] = useState(false);
  const [attemptStrokes, setAttemptStrokes] = useState<Stroke[]>([]);
  const [metrics, setMetrics] = useState<AttemptMetrics | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const activity = state.selectedActivity;

  // Find template based on activity
  const template = useMemo(() => {
    if (activity?.id === '1') return TEMPLATES['line-simple'];
    if (activity?.id === '5') return TEMPLATES['curve-basic'];
    if (activity?.id === '2') return TEMPLATES['lane-s'];
    return null;
  }, [activity]);

  const handleStrokeComplete = useCallback((stroke: Stroke) => {
    setAttemptStrokes(prev => [...prev, stroke]);
    
    // Trigger fun feedback for good strokes
    if (stroke.points.length > 20) {
      setFeedbackMsg(FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)]);
      setShowFeedback(true);
    }
  }, []);

  const handleFinish = () => {
    if (!template) {
      // Free draw logic
      setIsFinished(true);
      return;
    }

    const result = analyzeAttempt(
      attemptStrokes, 
      template.guidePoints, 
      activity?.type || 'follow_line',
      30, // threshold
      template.laneWidth || 60
    );
    setMetrics(result);
    setIsFinished(true);
    
    if (activity) {
      completeActivity(activity.id, result);
    }

    // Navigate to results after delay
    setTimeout(() => {
      router.push('/results');
    }, 3000);
  };

  const resetActivity = () => {
    setAttemptStrokes([]);
    setMetrics(null);
    setIsFinished(false);
  };

  if (!activity) return null;

  return (
    <View style={styles.container}>
      <FeedbackOverlay 
        isVisible={showFeedback} 
        message={feedbackMsg} 
        onFinished={() => setShowFeedback(false)} 
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#4A4A4A" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{activity.title}</Text>

        <View style={styles.progressPill}>
          <Text style={styles.starText}>★</Text>
          <Text style={styles.progressText}>{state.completedActivities.length}/6</Text>
        </View>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>{activity.description}</Text>
      </View>

      <View style={styles.canvasWrapper}>
        <DrawingCanvas
          templatePath={template?.path}
          onStrokeComplete={handleStrokeComplete}
          strokeColor={activity.color}
          initialStrokes={attemptStrokes}
          key={isFinished ? 'finished' : 'drawing'} 
        />

        <TouchableOpacity style={styles.fabBtn}>
          <HelpCircle size={32} color="white" />
        </TouchableOpacity>

        {isFinished && (
          <Animated.View entering={FadeIn} style={styles.successOverlay}>
            <Animated.View entering={FadeInUp} style={styles.successModal}>
              <CheckCircle2 size={100} color={Colors.primary.sage} />
              <Text style={styles.successText}>¡Increíble trazo!</Text>
              {metrics && (
                <View style={styles.metricsRow}>
                  <Text style={styles.accuracyText}>{metrics.accuracy}% precisión</Text>
                  {metrics.departures !== undefined && metrics.departures > 0 && (
                    <Text style={styles.departuresText}>{metrics.departures} salidas</Text>
                  )}
                </View>
              )}
            </Animated.View>
          </Animated.View>
        )}
      </View>

      <View style={styles.toolbar}>
        <View style={[styles.tool, styles.toolActive]}>
          <View style={[styles.toolIcon, { backgroundColor: activity.color }]} />
        </View>

        <TouchableOpacity style={styles.tool} onPress={resetActivity}>
          <RotateCcw size={24} color={Colors.text.dark} />
        </TouchableOpacity>

        <View style={{ width: 24 }} />

        <View style={[styles.colorPicker, { backgroundColor: Colors.primary.sky }]} />
        <View style={[styles.colorPicker, { backgroundColor: Colors.primary.mustard, marginLeft: -20, zIndex: 2 }]} />
        <View style={[styles.colorPicker, { backgroundColor: activity.color, marginLeft: -20, zIndex: 3, borderColor: 'white', borderWidth: 4 }]} />

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={handleFinish}
          disabled={attemptStrokes.length === 0}
        >
          <CheckCircle2 
            size={44} 
            color={attemptStrokes.length > 0 ? Colors.primary.coral : Colors.text.light} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 32,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  instructionText: {
    color: Colors.primary.sage,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  canvasWrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginVertical: 10,
    position: 'relative',
  },
  fabBtn: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 64,
    height: 64,
    backgroundColor: Colors.primary.coral,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 251, 247, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  successModal: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  successText: {
    fontSize: Typography.sizes.title1,
    fontWeight: 'bold',
    color: Colors.text.dark,
    marginTop: 20,
  },
  accuracyText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.sage,
    fontWeight: '600',
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  departuresText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.coral,
    fontWeight: '600',
  },
  toolbar: {
    padding: 32,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowOpacity: 1,
    shadowRadius: 12,
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
  colorPicker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  doneBtn: {
    marginLeft: 16,
  }
});
