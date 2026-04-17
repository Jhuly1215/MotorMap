import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, BackHandler } from 'react-native';
import { Colors } from '../constants/Colors';
import { AppStateProvider } from '../context/AppStateContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

// Screens
import SplashScreen from './index';
import HomeScreen from './home';
import ActivitySelectionScreen from './activities/index';
import DrawingActivityScreen from './activities/drawing';
import ResultsScreen from './results';
import ProgressScreen from './progress';
import SettingsScreen from './settings';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const TABLET_WIDTH = 600;

// Simple Router implementation for the prototype environment
export type RoutePath = 'index' | 'home' | 'activities' | 'activities/drawing' | 'results' | 'progress' | 'settings';

export const RouterContext = React.createContext<{
  path: RoutePath;
  push: (path: RoutePath) => void;
  replace: (path: RoutePath) => void;
  back: () => void;
}>({
  path: 'index',
  push: () => {},
  replace: () => {},
  back: () => {},
});

export default function RootLayout() {
  const [path, setPath] = useState<RoutePath>('index');
  const [history, setHistory] = useState<RoutePath[]>(['index']);

  const push = (newPath: RoutePath) => {
    setPath(newPath);
    setHistory([...history, newPath]);
  };

  const replace = (newPath: RoutePath) => {
    setPath(newPath);
    setHistory([...history.slice(0, -1), newPath]);
  };

  const back = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setPath(newHistory[newHistory.length - 1]);
      setHistory(newHistory);
    }
  };

  const renderScreen = () => {
    switch (path) {
      case 'index': return <SplashScreen />;
      case 'home': return <HomeScreen />;
      case 'activities': return <ActivitySelectionScreen />;
      case 'activities/drawing': return <DrawingActivityScreen />;
      case 'results': return <ResultsScreen />;
      case 'progress': return <ProgressScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <SplashScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }} {...({} as any)}>
      <AppStateProvider>
        <RouterContext.Provider value={{ path, push, replace, back }}>
          <StatusBar style="auto" />
          <View style={styles.outerContainer}>
            <View style={[
              styles.innerContainer,
              isWeb && width > TABLET_WIDTH && styles.webTabletWrapper
            ]}>
              {renderScreen()}
            </View>
          </View>
        </RouterContext.Provider>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.background.frame,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.background.cream,
  },
  webTabletWrapper: {
    width: 600,
    height: 800,
    borderRadius: 48,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.2,
    shadowRadius: 50,
    elevation: 20,
    borderWidth: 12,
    borderColor: '#2A2A2A',
  }
});

