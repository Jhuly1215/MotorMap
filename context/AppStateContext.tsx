import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ActivityType = 'follow_line' | 'connect_dots' | 'copy_shape' | 'stay_inside';

import { Activity, AttemptMetrics } from '../types/drawing';

interface AppState {
  currentChildName: string;
  selectedActivity: Activity | null;
  completedActivities: string[];
  lastAttempt: {
    activityId: string;
    metrics: AttemptMetrics;
  } | null;
  settings: {
    soundEnabled: boolean;
    language: 'es' | 'en';
  };
}

interface AppStateContextType {
  state: AppState;
  selectActivity: (activity: Activity) => void;
  completeActivity: (id: string, metrics: AttemptMetrics) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    currentChildName: 'Pequeño explorador',
    selectedActivity: null,
    completedActivities: [],
    lastAttempt: null,
    settings: {
      soundEnabled: true,
      language: 'es',
    },
  });

  const selectActivity = (activity: Activity) => {
    setState(prev => ({ ...prev, selectedActivity: activity, lastAttempt: null }));
  };

  const completeActivity = (id: string, metrics: AttemptMetrics) => {
    setState(prev => ({
      ...prev,
      completedActivities: [...new Set([...prev.completedActivities, id])],
      lastAttempt: { activityId: id, metrics }
    }));
  };

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  return (
    <AppStateContext.Provider value={{ state, selectActivity, completeActivity, updateSettings }}>
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
