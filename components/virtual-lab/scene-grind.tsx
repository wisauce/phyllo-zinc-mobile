import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { LabEquipmentImages } from '@/assets/images';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SceneGrindProps {
  onComplete: () => void;
  leavesCollected: boolean;
}

export default function SceneGrind({ onComplete, leavesCollected }: SceneGrindProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [placed, setPlaced] = useState(false);
  const [grinding, setGrinding] = useState(false);
  const [grinderLayout, setGrinderLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Draggable beaker
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleDragEnd = useCallback((x: number, y: number) => {
    if (grinderLayout.width === 0) return;
    
    const beakerCenterX = 50 + x + 50;
    const beakerCenterY = 100 + y + 60;
    
    const inX = beakerCenterX > grinderLayout.x && 
                beakerCenterX < grinderLayout.x + grinderLayout.width;
    const inY = beakerCenterY > grinderLayout.y && 
                beakerCenterY < grinderLayout.y + grinderLayout.height;
    
    if (inX && inY) {
      setPlaced(true);
    }
  }, [grinderLayout]);

  const panGesture = Gesture.Pan()
    .enabled(!placed)
    .onStart(() => {
      'worklet';
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      'worklet';
      scale.value = withSpring(1);
      runOnJS(handleDragEnd)(event.translationX, event.translationY);
    })
    .onFinalize(() => {
      'worklet';
      if (!placed) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const beakerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: placed ? 0.5 : 1,
  }));

  const handleStartGrind = () => {
    setGrinding(true);
    setTimeout(() => {
      setGrinding(false);
      onComplete();
    }, 2000);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.sceneArea, { backgroundColor: colors.card }]}>
        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.text }]}>
          {placed ? 'Press Start to grind the leaves' : 'Drag the beaker to the grinder'}
        </Text>

        {/* Draggable beaker */}
        {!placed && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.beakerDraggable, beakerStyle]}>
              <Image
                source={LabEquipmentImages.beaker}
                style={styles.beakerImage}
                resizeMode="contain"
              />
              <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                Beaker with leaves
              </Text>
            </Animated.View>
          </GestureDetector>
        )}

        {/* Grinder drop zone */}
        <View
          style={[styles.grinderZone, { borderColor: placed ? colors.success : colors.primary }]}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setGrinderLayout({ x, y, width, height });
          }}
        >
          <Image
            source={LabEquipmentImages.grinder}
            style={styles.grinderImage}
            resizeMode="contain"
          />
          {placed && (
            <View style={[styles.placedIndicator, { backgroundColor: colors.success + '30' }]}>
              <Text style={[styles.placedText, { color: colors.success }]}>Placed ✓</Text>
            </View>
          )}
        </View>

        {/* Control panel */}
        <View style={[styles.controlPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>Grinder Control</Text>
          <Text style={[styles.panelStatus, { color: colors.textMuted }]}>
            {grinding ? 'Grinding...' : placed ? 'Ready' : 'Awaiting beaker'}
          </Text>
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: placed && !grinding ? colors.primary : colors.border },
            ]}
            disabled={!placed || grinding}
            onPress={handleStartGrind}
          >
            {grinding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.startButtonText, { color: placed ? '#fff' : colors.textMuted }]}>
                Start
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sceneArea: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  instruction: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  beakerDraggable: {
    position: 'absolute',
    left: 50,
    top: 100,
    alignItems: 'center',
    zIndex: 10,
  },
  beakerImage: {
    width: 100,
    height: 120,
  },
  itemLabel: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  grinderZone: {
    position: 'absolute',
    right: Spacing.xl,
    top: '30%',
    width: 140,
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grinderImage: {
    width: 120,
    height: 140,
  },
  placedIndicator: {
    position: 'absolute',
    bottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  placedText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  controlPanel: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  panelTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  panelStatus: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  startButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  startButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});
