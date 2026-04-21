import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { AppStateProvider } from '../context/AppStateContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Slot } from 'expo-router';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const TABLET_WIDTH = 600;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStateProvider>
        <StatusBar style="auto" />
        <View style={styles.outerContainer}>
          <View style={[
            styles.innerContainer,
            isWeb && width > TABLET_WIDTH && styles.webTabletWrapper
          ]}>
            <Slot />
          </View>
        </View>
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

