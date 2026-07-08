import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Activity, AttemptMetrics, Participant, Session } from '../types/drawing';
import { Level, LEVELS } from '../constants/Levels';

export type ActivityType = 'follow_line' | 'connect_dots' | 'copy_shape' | 'stay_inside';

interface AppState {
  currentChildName: string;
  selectedActivity: Activity | null;
  selectedLevel: Level | null;
  completedActivities: string[];
  completedLevels: Record<string, { accuracy: number; unlocked: boolean; metrics?: AttemptMetrics }>;
  tutorialSeenByTemplate: Record<string, boolean>;
  lastAttempt: {
    activityId: string;
    levelId?: string;
    metrics: AttemptMetrics;
  } | null;
  settings: {
    soundEnabled: boolean;
    language: 'es' | 'en';
  };
  participant: Participant;
  session: Session;
  attemptNumberCounter: Record<string, number>;
}

interface AppStateContextType {
  state: AppState;
  selectActivity: (activity: Activity) => void;
  selectLevel: (level: Level | null) => void;
  completeActivity: (id: string, metrics: AttemptMetrics) => void;
  completeLevel: (activityId: string, levelId: string, metrics: AttemptMetrics) => void;
  markTutorialSeen: (templateId: string) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  updateParticipant: (participant: Partial<Participant>) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    currentChildName: 'Pequeño explorador',
    selectedActivity: null,
    selectedLevel: null,
    completedActivities: [],
    completedLevels: {},
    tutorialSeenByTemplate: {},
    lastAttempt: null,
    settings: {
      soundEnabled: true,
      language: 'es',
    },
    participant: {
      participantId: 'PARTICIPANT_01',
      ageMonths: 72,
      sex: 'M',
      dominantHand: 'right',
      groupId: 'GROUP_A'
    },
    session: {
      sessionId: `session-${Date.now()}`,
      participantId: 'PARTICIPANT_01',
      deviceId: 'device-expo-tablet',
      startedAt: new Date().toISOString(),
      sessionNumber: 1
    },
    attemptNumberCounter: {},
  });

  const selectActivity = (activity: Activity) => {
    setState(prev => ({ 
      ...prev, 
      selectedActivity: activity, 
      selectedLevel: null, // Clear level when switching activities
      lastAttempt: null 
    }));
  };

  const selectLevel = (level: Level | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedLevel: level, 
      lastAttempt: null 
    }));
  };

  const completeActivity = (id: string, metrics: AttemptMetrics) => {
    setState(prev => {
      const nextAttemptNumberCounter = { ...prev.attemptNumberCounter };
      nextAttemptNumberCounter[id] = (nextAttemptNumberCounter[id] || 0) + 1;
      return {
        ...prev,
        completedActivities: [...new Set([...prev.completedActivities, id])],
        lastAttempt: { activityId: id, metrics },
        attemptNumberCounter: nextAttemptNumberCounter
      };
    });
  };

  const completeLevel = (activityId: string, levelId: string, metrics: AttemptMetrics) => {
    setState(prev => {
      const nextCompletedLevels = { ...prev.completedLevels };
      const nextAttemptNumberCounter = { ...prev.attemptNumberCounter };
      nextAttemptNumberCounter[levelId] = (nextAttemptNumberCounter[levelId] || 0) + 1;
      
      // Update stats for the completed level (save best accuracy and metrics)
      const currentStats = nextCompletedLevels[levelId] || { accuracy: 0, unlocked: true };
      nextCompletedLevels[levelId] = {
        accuracy: Math.max(currentStats.accuracy, metrics.accuracy),
        unlocked: true,
        metrics: metrics
      };

      // Unlock the next level automatically
      const activityLevels = LEVELS[activityId] || [];
      const currentLevelIdx = activityLevels.findIndex(l => l.id === levelId);
      if (currentLevelIdx !== -1 && currentLevelIdx < activityLevels.length - 1) {
        const nextLevel = activityLevels[currentLevelIdx + 1];
        if (!nextCompletedLevels[nextLevel.id]) {
          nextCompletedLevels[nextLevel.id] = {
            accuracy: 0,
            unlocked: true
          };
        }
      }

      // Check if all levels in the activity are completed
      const allCompleted = activityLevels.every(l => nextCompletedLevels[l.id] && nextCompletedLevels[l.id].accuracy > 0);
      const nextCompletedActivities = allCompleted 
        ? [...new Set([...prev.completedActivities, activityId])] 
        : prev.completedActivities;

      return {
        ...prev,
        completedLevels: nextCompletedLevels,
        completedActivities: nextCompletedActivities,
        lastAttempt: { activityId, levelId, metrics },
        attemptNumberCounter: nextAttemptNumberCounter
      };
    });
  };

  const markTutorialSeen = (templateId: string) => {
    setState(prev => ({
      ...prev,
      tutorialSeenByTemplate: {
        ...prev.tutorialSeenByTemplate,
        [templateId]: true,
      },
    }));
  };

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const updateParticipant = (newParticipant: Partial<Participant>) => {
    setState(prev => ({
      ...prev,
      participant: { ...prev.participant, ...newParticipant }
    }));
  };

  return (
    <AppStateContext.Provider value={{ 
      state, 
      selectActivity, 
      selectLevel, 
      completeActivity, 
      completeLevel, 
      markTutorialSeen,
      updateSettings,
      updateParticipant
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
