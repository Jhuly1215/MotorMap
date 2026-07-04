import React, { useState, useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Svg, Path, G, Circle, Text as SvgText, Image as SvgImage } from 'react-native-svg';
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
  laneWidth?: number;
  dots?: { x: number; y: number; label?: string }[] | null;
  backgroundPaths?: string[];
  showDashedLine?: boolean;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  isMaze?: boolean;
}

export default function DrawingCanvas({ 
  templatePath, 
  onStrokeComplete, 
  strokeColor = Colors.primary.sage,
  strokeWidth = 10,
  initialStrokes = [],
  laneWidth,
  dots,
  backgroundPaths,
  showDashedLine = true,
  startPoint,
  endPoint,
  isMaze = false
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
      const cw = canvasSize.width;
      const ch = canvasSize.height;
      if (cw === 0 || ch === 0) return;

      const containerRatio = cw / ch;
      const viewBoxRatio = 600 / 800;

      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;

      if (containerRatio > viewBoxRatio) {
        scale = 800 / ch;
        offsetX = (cw - 600 / scale) / 2;
      } else {
        scale = 600 / cw;
        offsetY = (ch - 800 / scale) / 2;
      }

      const x = (g.x - offsetX) * scale;
      const y = (g.y - offsetY) * scale;

      const now = Date.now();
      startTime.value = now;
      const startPoint = { x, y, t: 0 };
      activePoints.value = [startPoint];
      activePath.value = `M ${x} ${y}`;
    })
    .onUpdate((g) => {
      const cw = canvasSize.width;
      const ch = canvasSize.height;
      if (cw === 0 || ch === 0) return;

      const containerRatio = cw / ch;
      const viewBoxRatio = 600 / 800;

      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;

      if (containerRatio > viewBoxRatio) {
        scale = 800 / ch;
        offsetX = (cw - 600 / scale) / 2;
      } else {
        scale = 600 / cw;
        offsetY = (ch - 800 / scale) / 2;
      }

      const x = (g.x - offsetX) * scale;
      const y = (g.y - offsetY) * scale;

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

  const getEndImage = () => {
    if (!endPoint) return require('../../public/flower_blue.png');
    const sum = Math.round(endPoint.x + endPoint.y);
    return sum % 2 === 0 
      ? require('../../public/flower_blue.png') 
      : require('../../public/flower_pink.png');
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.svgContainer}>
          {canvasSize.width > 0 && (
            <Svg viewBox="0 0 600 800" style={StyleSheet.absoluteFill}>
              {/* Maze Corridors and Walls Rendering (Composite Stroke Technique) */}
              {isMaze ? (
                <G>
                  {/* Step 1: Draw the outer wall silhouettes (Grey lines, slightly wider) */}
                  {templatePath && (
                    <Path
                      d={templatePath}
                      stroke="#CCCCCC"
                      strokeWidth={(laneWidth || 60) + 8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  )}
                  {backgroundPaths && backgroundPaths.map((bgPath, idx) => (
                    <Path
                      key={`bg-wall-${idx}`}
                      d={bgPath}
                      stroke="#CCCCCC"
                      strokeWidth={(laneWidth || 60) + 8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ))}

                  {/* Step 2: Draw the inner corridor channels (White lines, matching laneWidth) */}
                  {templatePath && (
                    <Path
                      d={templatePath}
                      stroke="white"
                      strokeWidth={laneWidth || 60}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  )}
                  {backgroundPaths && backgroundPaths.map((bgPath, idx) => (
                    <Path
                      key={`bg-corridor-${idx}`}
                      d={bgPath}
                      stroke="white"
                      strokeWidth={laneWidth || 60}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ))}

                  {/* Step 3: Optional center dashed guide line */}
                  {templatePath && showDashedLine && (
                    <Path
                      d={templatePath}
                      stroke={Colors.primary.sky}
                      strokeWidth={2}
                      strokeDasharray="10, 10"
                      strokeLinecap="round"
                      fill="none"
                      opacity={0.4}
                    />
                  )}
                </G>
              ) : (
                // Regular non-maze paths rendering
                <G>
                  {backgroundPaths && backgroundPaths.map((bgPath, idx) => (
                    <Path
                      key={`bg-path-${idx}`}
                      d={bgPath}
                      stroke="#F0F0F0"
                      strokeWidth={laneWidth || strokeWidth * 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ))}
                  {templatePath && (
                    <G>
                      <Path
                        d={templatePath}
                        stroke="#F0F0F0"
                        strokeWidth={laneWidth || strokeWidth * 4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      {showDashedLine && (
                        <Path
                          d={templatePath}
                          stroke={Colors.primary.sky}
                          strokeWidth={2}
                          strokeDasharray="10, 10"
                          strokeLinecap="round"
                          fill="none"
                          opacity={0.5}
                        />
                      )}
                    </G>
                  )}
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

              {/* Dots for connect_dots activities */}
              {dots && dots.map((dot, index) => (
                <G key={`dot-${index}`}>
                  <Circle
                    cx={dot.x}
                    cy={dot.y}
                    r={18}
                    fill="white"
                    stroke={strokeColor}
                    strokeWidth={3}
                  />
                  <SvgText
                    x={dot.x}
                    y={dot.y + 5}
                    fontSize={14}
                    fontWeight="bold"
                    fill={Colors.text.dark}
                    textAnchor="middle"
                  >
                    {dot.label || (index + 1).toString()}
                  </SvgText>
                </G>
              ))}

              {/* Start and End Markers */}
              {startPoint && (
                <G key="start-marker">
                  {isMaze ? (
                    <SvgImage
                      x={startPoint.x - 30}
                      y={startPoint.y - 30}
                      width={60}
                      height={60}
                      href={require('../../public/butterfly.png')}
                    />
                  ) : (
                    <G>
                      <Circle
                        cx={startPoint.x}
                        cy={startPoint.y}
                        r={24}
                        fill="white"
                        stroke="#4CAF50"
                        strokeWidth={4}
                      />
                      <SvgText
                        x={startPoint.x}
                        y={startPoint.y + 4}
                        fontSize={9}
                        fontWeight="bold"
                        fill="#4CAF50"
                        textAnchor="middle"
                      >
                        INICIO
                      </SvgText>
                    </G>
                  )}
                </G>
              )}

              {endPoint && (
                <G key="end-marker">
                  {isMaze ? (
                    <SvgImage
                      x={endPoint.x - 30}
                      y={endPoint.y - 30}
                      width={60}
                      height={60}
                      href={getEndImage()}
                    />
                  ) : (
                    <G>
                      <Circle
                        cx={endPoint.x}
                        cy={endPoint.y}
                        r={24}
                        fill="white"
                        stroke="#FF5722"
                        strokeWidth={4}
                      />
                      <SvgText
                        x={endPoint.x}
                        y={endPoint.y + 4}
                        fontSize={9}
                        fontWeight="bold"
                        fill="#FF5722"
                        textAnchor="middle"
                      >
                        META
                      </SvgText>
                    </G>
                  )}
                </G>
              )}
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
