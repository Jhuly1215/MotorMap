import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAppState } from '../../context/AppStateContext';
import DrawingCanvas from '../../components/motormap/DrawingCanvas';
import FeedbackOverlay from '../../components/motormap/FeedbackOverlay';
import GameHeader from '../../components/motormap/GameHeader';
import GameInstructions from '../../components/motormap/GameInstructions';
import GameToolbar from '../../components/motormap/GameToolbar';
import SuccessModal from '../../components/motormap/SuccessModal';
import { Svg, Path } from 'react-native-svg';
import { HelpCircle } from 'lucide-react-native';
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
  const { state, completeActivity, completeLevel } = useAppState();
  const level = state.selectedLevel;
  const [isFinished, setIsFinished] = useState(false);
  const [attemptStrokes, setAttemptStrokes] = useState<Stroke[]>([]);
  const [metrics, setMetrics] = useState<AttemptMetrics | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const activity = state.selectedActivity;

  // Initialize brush color using the activity theme color
  const [brushColor, setBrushColor] = useState(activity?.color || Colors.primary.sage);

  // Map each of the 6 activities to their templates
  const template = useMemo(() => {
    if (level) return level;
    if (!activity) return null;
    if (activity.id === '1') return TEMPLATES['line-simple'];
    if (activity.id === '2') return TEMPLATES['lane-s'];
    if (activity.id === '3') return TEMPLATES['connect-dots-triangle'];
    if (activity.id === '4') return TEMPLATES['copy-circle'];
    if (activity.id === '5') return TEMPLATES['curve-rollercoaster'];
    if (activity.id === '6') return TEMPLATES['lane-maze'];
    return null;
  }, [activity, level]);

  // Pick a deterministic target color for copy_shape activities when the level starts
  const targetColor = useMemo(() => {
    const PALETTE_COLORS = [
      Colors.primary.sky,
      Colors.primary.mustard,
      Colors.primary.coral,
      Colors.primary.sage
    ];
    const key = level?.id || activity?.id || '1';
    let sum = 0;
    for (let i = 0; i < key.length; i++) {
      sum += key.charCodeAt(i);
    }
    return PALETTE_COLORS[sum % PALETTE_COLORS.length];
  }, [level, activity]);

  const getColorName = useCallback((color: string | null) => {
    if (!color) return '';
    const c = color.toLowerCase();
    if (c === Colors.primary.sky.toLowerCase()) return 'Azul';
    if (c === Colors.primary.mustard.toLowerCase()) return 'Amarillo';
    if (c === Colors.primary.coral.toLowerCase()) return 'Rojo';
    if (c === Colors.primary.sage.toLowerCase()) return 'Verde';
    return '';
  }, []);

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
      setIsFinished(true);
      return;
    }

    const result = analyzeAttempt(
      attemptStrokes, 
      template.guidePoints, 
      activity?.type || 'follow_line',
      30, // threshold
      template.laneWidth || 60,
      template.dots,
      template.backgroundPaths
    );

    // Apply color matching logic for copy_shape
    let finalMetrics = { ...result };
    if (activity.type === 'copy_shape' && targetColor) {
      let correctColorPoints = 0;
      let totalPoints = 0;
      attemptStrokes.forEach(s => {
        const isCorrectColor = s.color.toLowerCase() === targetColor.toLowerCase();
        s.points.forEach(() => {
          totalPoints++;
          if (isCorrectColor) correctColorPoints++;
        });
      });
      const colorMultiplier = totalPoints > 0 ? (correctColorPoints / totalPoints) : 0;
      // 50% of the score is shape similarity, 50% is color matching
      finalMetrics.accuracy = Math.round(result.accuracy * (0.5 + 0.5 * colorMultiplier));
      finalMetrics.precisionScore = finalMetrics.accuracy;
      finalMetrics.completionScore = finalMetrics.accuracy;
    }

    setMetrics(finalMetrics);
    setIsFinished(true);
    
    // Define relational DB records for study export
    const qualityFlag = (attemptStrokes.length === 0 || (finalMetrics.pointCount || 0) === 0)
      ? 'empty'
      : (attemptStrokes.length > 15 && (finalMetrics.totalTimeMs || 0) < 3000)
        ? 'noisy'
        : 'good';

    const participantRecord = {
      participantId: state.participant?.participantId || 'PARTICIPANT_01',
      ageMonths: state.participant?.ageMonths || 72,
      sex: state.participant?.sex || 'M',
      dominantHand: state.participant?.dominantHand || 'right',
      groupId: state.participant?.groupId || 'GROUP_A'
    };

    const sessionRecord = {
      sessionId: state.session?.sessionId || `session-${Date.now()}`,
      participantId: participantRecord.participantId,
      deviceId: state.session?.deviceId || 'device-expo-tablet',
      startedAt: state.session?.startedAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      sessionNumber: state.session?.sessionNumber || 1
    };

    const templateId = level ? level.id : activity.id;
    const attemptNumber = (state.attemptNumberCounter[templateId] || 0) + 1;

    const attemptRecord = {
      attemptId: finalMetrics.attemptId || `attempt-${Date.now()}`,
      sessionId: sessionRecord.sessionId,
      activityId: activity.id,
      templateId: templateId,
      attemptNumber: attemptNumber,
      durationMs: finalMetrics.totalTimeMs || finalMetrics.duration || 0,
      completed: finalMetrics.accuracy >= 70,
      qualityFlag: qualityFlag
    };

    const traceDataRecord = {
      attemptId: attemptRecord.attemptId,
      traceJson: JSON.stringify(attemptStrokes)
    };

    const metricsRecord = {
      attemptId: attemptRecord.attemptId,
      strokeCount: finalMetrics.strokeCount,
      pointCount: finalMetrics.pointCount || 0,
      traceLength: finalMetrics.traceLength || 0,
      meanSpeed: finalMetrics.meanSpeed || 0,
      speedVariability: finalMetrics.speedVariability || 0,
      pauseCount: finalMetrics.pauseCount || 0,
      precisionScore: finalMetrics.precisionScore || 0,
      completionScore: finalMetrics.completionScore || 0,
      smoothnessScore: finalMetrics.smoothnessScore || 100
    };

    // Print relational logs to console matching requested variables
    console.log("==================================================");
    console.log("📊 REPORT: CLÍNICA DE DESARROLLO MOTOR - MOTOR MAP");
    console.log(`Fecha: ${new Date().toISOString()}`);
    console.log("==================================================");
    console.log("👤 [PARTICIPANTS]");
    console.log(JSON.stringify(participantRecord, null, 2));
    console.log("--------------------------------------------------");
    console.log("📅 [SESSIONS]");
    console.log(JSON.stringify(sessionRecord, null, 2));
    console.log("--------------------------------------------------");
    console.log("✏️ [ATTEMPTS]");
    console.log(JSON.stringify(attemptRecord, null, 2));
    console.log("--------------------------------------------------");
    console.log("📈 [METRICS]");
    console.log(JSON.stringify(metricsRecord, null, 2));
    console.log("--------------------------------------------------");
    console.log("🖌️ [TRACE_DATA]");
    console.log(JSON.stringify(traceDataRecord, null, 2));
    console.log("==================================================");

    if (level && activity) {
      completeLevel(activity.id, level.id, finalMetrics);
    } else if (activity) {
      completeActivity(activity.id, finalMetrics);
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

      <GameHeader
        title={level ? level.name : activity.title}
        onBack={() => router.back()}
        completedCount={state.completedActivities.length}
      />

      <GameInstructions
        description={level ? level.description : activity.description}
        color={activity.color}
      />

      <View style={[styles.canvasWrapper, activity.type === 'copy_shape' && styles.splitCanvasWrapper]}>
        {activity.type === 'copy_shape' && template ? (
          <View style={styles.copyLayout}>
            {/* Top: Reference card */}
            <View style={styles.copyReferenceContainer}>
              <View style={styles.copyReferenceHeader}>
                <Text style={styles.copyReferenceLabel}>Modelo a copiar</Text>
                <View style={[styles.copyReferenceColorIndicator, { backgroundColor: targetColor }]} />
                <Text style={styles.copyColorName}>({getColorName(targetColor)})</Text>
              </View>
              <View style={styles.copyReferenceBody}>
                <Svg viewBox="0 0 600 800" style={StyleSheet.absoluteFill}>
                  <Path
                    d={template.path}
                    stroke={targetColor}
                    strokeWidth={20}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </View>
            </View>

            {/* Bottom: Drawing area */}
            <View style={styles.copyCanvasContainer}>
              <DrawingCanvas
                templatePath={undefined}
                onStrokeComplete={handleStrokeComplete}
                strokeColor={brushColor}
                initialStrokes={attemptStrokes}
                laneWidth={template?.laneWidth}
                dots={template?.dots}
                backgroundPaths={template?.backgroundPaths}
                showDashedLine={template?.showDashedLine}
                isMaze={activity?.id === '6'}
                key={isFinished ? 'finished' : 'drawing'} 
              />
            </View>
          </View>
        ) : (
          <DrawingCanvas
            templatePath={template?.path}
            onStrokeComplete={handleStrokeComplete}
            strokeColor={brushColor}
            initialStrokes={attemptStrokes}
            laneWidth={template?.laneWidth}
            dots={template?.dots}
            backgroundPaths={template?.backgroundPaths}
            showDashedLine={template?.showDashedLine}
            startPoint={template?.guidePoints && template.guidePoints.length > 0 ? template.guidePoints[0] : undefined}
            endPoint={template?.guidePoints && template.guidePoints.length > 0 ? template.guidePoints[template.guidePoints.length - 1] : undefined}
            isMaze={activity?.id === '6'}
            key={isFinished ? 'finished' : 'drawing'} 
          />
        )}

        <TouchableOpacity style={styles.fabBtn} activeOpacity={0.8}>
          <HelpCircle size={32} color="white" />
        </TouchableOpacity>

        <SuccessModal
          isVisible={isFinished}
          metrics={metrics}
          activityType={activity.type}
        />
      </View>

      <GameToolbar
        selectedColor={brushColor}
        onColorSelect={setBrushColor}
        onReset={resetActivity}
        onFinish={handleFinish}
        hasStrokes={attemptStrokes.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  canvasWrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginVertical: 10,
    position: 'relative',
  },
  splitCanvasWrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  copyLayout: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },
  copyReferenceContainer: {
    height: 180,
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    overflow: 'hidden',
    padding: 12,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  copyReferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    width: '100%',
    gap: 8,
  },
  copyReferenceLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.text.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyReferenceColorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  copyColorName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.medium,
  },
  copyReferenceBody: {
    flex: 1,
    width: '100%',
    position: 'relative',
    marginTop: 4,
  },
  copyCanvasContainer: {
    flex: 1,
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
    zIndex: 10,
  },
});
