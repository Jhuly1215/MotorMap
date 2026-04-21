import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import { 
  Gesture, 
  GestureDetector 
} from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  runOnJS 
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Stroke, Point } from '../../types/drawing';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface DrawingCanvasProps {
  templatePath?: string;
  onStrokeComplete?: (stroke: Stroke) => void;
  strokeColor?: string;
  strokeWidth?: number;
  initialStrokes?: Stroke[];
}

export default function DrawingCanvas({ 
  templatePath, 
  onStrokeComplete, 
  strokeColor = Colors.primary.sage,
  strokeWidth = 10,
  initialStrokes = []
}: DrawingCanvasProps) {
  const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Active drawing state in Shared Values for performance
  const activePath = useSharedValue('');
  const activePoints = useSharedValue<Point[]>([]);
  const startTime = useSharedValue(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  const finalizeStroke = (id: string, points: Point[], start: number) => {
    const newStroke: Stroke = {
      id,
      points,
      startTime: start,
      endTime: Date.now(),
      color: strokeColor,
      width: strokeWidth,
    };
    
    setStrokes(prev => [...prev, newStroke]);
    if (onStrokeComplete) {
      onStrokeComplete(newStroke);
    }
    
    // Clear active path
    activePath.value = '';
    activePoints.value = [];
  };

  const panGesture = Gesture.Pan()
    .onStart((g) => {
      const scaleX = 600 / canvasSize.width;
      const scaleY = 800 / canvasSize.height;
      const x = g.x * scaleX;
      const y = g.y * scaleY;

      const now = Date.now();
      startTime.value = now;
      const startPoint = { x, y, t: 0 };
      activePoints.value = [startPoint];
      activePath.value = `M ${x} ${y}`;
    })
    .onUpdate((g) => {
      const scaleX = 600 / canvasSize.width;
      const scaleY = 800 / canvasSize.height;
      const x = g.x * scaleX;
      const y = g.y * scaleY;

      const t = Date.now() - startTime.value;
      const newPoint = { x, y, t };
      
      // Update shared values (Worklet thread)
      activePoints.value = [...activePoints.value, newPoint];
      activePath.value += ` L ${x} ${y}`;
    })
    .onEnd(() => {
      const id = `stroke-${Date.now()}`;
      const points = activePoints.value;
      const start = startTime.value;
      
      runOnJS(finalizeStroke)(id, points, start);
    });

  const animatedProps = useAnimatedProps(() => ({
    d: activePath.value,
  }));

  const clear = useCallback(() => {
    setStrokes([]);
    activePath.value = '';
    activePoints.value = [];
  }, [activePath, activePoints]);

  // Expose clear method via ref if needed, but for now we can just use props or internal state
  
  return (
    <View style={styles.container} onLayout={onLayout}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.svgContainer}>
          {canvasSize.width > 0 && (
            <Svg viewBox="0 0 600 800" style={StyleSheet.absoluteFill}>
              {/* Guide Template */}
              {templatePath && (
                <G>
                  <Path
                    d={templatePath}
                    stroke="#F0F0F0"
                    strokeWidth={strokeWidth * 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d={templatePath}
                    stroke={Colors.primary.sky}
                    strokeWidth={2}
                    strokeDasharray="10, 10"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.5}
                  />
                </G>
              )}
              
              {/* Completed Strokes */}
              {strokes.map((stroke) => (
                <Path
                  key={stroke.id}
                  d={stroke.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.9}
                />
              ))}
              
              {/* Active Stroke */}
              <AnimatedPath
                animatedProps={animatedProps}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.9}
              />
            </Svg>
          )}
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
