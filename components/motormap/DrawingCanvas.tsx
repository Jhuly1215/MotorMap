import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Svg, Path, Circle, G } from 'react-native-svg';
import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  templatePath: string;
  onComplete: (accuracy: number) => void;
  strokeColor?: string;
}

export default function DrawingCanvas({ 
  templatePath, 
  onComplete, 
  strokeColor = Colors.primary.sage 
}: DrawingCanvasProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Points for accuracy calculation
  const pointsRef = useRef<Point[]>([]);

  const panGesture = Gesture.Pan()
    .onStart((g) => {
      setIsDrawing(true);
      const newPath = `M ${g.x} ${g.y}`;
      setCurrentPath(newPath);
      pointsRef.current = [{ x: g.x, y: g.y }];
    })
    .onUpdate((g) => {
      setCurrentPath((prev) => `${prev} L ${g.x} ${g.y}`);
      pointsRef.current.push({ x: g.x, y: g.y });
    })
    .onEnd(() => {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath('');
      setIsDrawing(false);
      
      // Basic simulation of completion after one long stroke for now
      if (pointsRef.current.length > 20) {
        setTimeout(() => onComplete(92), 500);
      }
    });

  const clear = () => {
    setPaths([]);
    setCurrentPath('');
    pointsRef.current = [];
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.svgContainer}>
          <Svg style={StyleSheet.absoluteFill}>
            {/* Template Path - Hint Path from HTML */}
            <Path
              d={templatePath}
              stroke="#F0F0F0"
              strokeWidth={40}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Inner guide line - Dot Path from HTML */}
            <Path
              d={templatePath}
              stroke={Colors.primary.sky}
              strokeWidth={4}
              strokeDasharray="8, 12"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* User Paths - User Trace from HTML */}
            {paths.map((p, i) => (
              <G key={`path-${i}`}>
                <Path
                  d={p}
                  stroke={strokeColor}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.9}
                />
              </G>
            ))}
            
            {/* Active Path */}
            {currentPath ? (
              <Path
                d={currentPath}
                stroke={strokeColor}
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.9}
              />
            ) : null}
          </Svg>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#EEEEEE',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 5,
  },
  svgContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  }
});
