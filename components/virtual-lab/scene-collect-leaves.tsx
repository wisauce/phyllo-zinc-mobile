import React, { useCallback, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SceneCollectLeavesProps {
  onComplete: () => void;
}

// Single draggable leaf component - wrapped in its own GestureHandlerRootView
function DraggableLeaf({
  id,
  initialX,
  initialY,
  collected,
  onCollected,
  beakerPosition,
  colors,
}: {
  id: string;
  initialX: number;
  initialY: number;
  collected: boolean;
  onCollected: (id: string) => void;
  beakerPosition: { x: number; y: number; width: number; height: number };
  colors: typeof Colors.light;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isCollected = useSharedValue(false);

  const handleDragEnd = useCallback((translationX: number, translationY: number) => {
    if (beakerPosition.width === 0) return false;
    
    const leafCenterX = initialX + translationX + 40;
    const leafCenterY = initialY + translationY + 40;
    
    const inX = leafCenterX > beakerPosition.x && 
                leafCenterX < beakerPosition.x + beakerPosition.width;
    const inY = leafCenterY > beakerPosition.y && 
                leafCenterY < beakerPosition.y + beakerPosition.height;
    
    if (inX && inY) {
      onCollected(id);
      return true;
    }
    return false;
  }, [initialX, initialY, beakerPosition, id, onCollected]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      if (isCollected.value) return;
      scale.value = withSpring(1.15);
    })
    .onUpdate((event) => {
      'worklet';
      if (isCollected.value) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      'worklet';
      if (isCollected.value) return;
      scale.value = withSpring(1);
      
      // Call JS function to check collision
      runOnJS(handleDragEnd)(event.translationX, event.translationY);
    })
    .onFinalize((event) => {
      'worklet';
      // Reset position if not collected after a short delay
      if (!isCollected.value) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Update isCollected when collected prop changes
  React.useEffect(() => {
    if (collected) {
      isCollected.value = true;
      scale.value = withSpring(0);
    }
  }, [collected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  if (collected) return null;

  return (
    <Animated.View
      style={[
        styles.leaf,
        { left: initialX, top: initialY },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.leafTouchable}>
          <Image
            source={LabEquipmentImages.meniranleaves}
            style={styles.leafImage}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function SceneCollectLeaves({ onComplete }: SceneCollectLeavesProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [collected, setCollected] = useState<string[]>([]);
  const [beakerLayout, setBeakerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const leaves = [
    { id: 'leaf-1', x: 20, y: 20 },
    { id: 'leaf-2', x: 100, y: 50 },
    { id: 'leaf-3', x: 30, y: 120 },
    { id: 'leaf-4', x: 120, y: 140 },
    { id: 'leaf-5', x: 70, y: 200 },
  ];

  const handleCollected = useCallback((id: string) => {
    setCollected(prev => {
      const newCollected = [...prev, id];
      if (newCollected.length >= 5) {
        setTimeout(() => onComplete(), 500);
      }
      return newCollected;
    });
  }, [onComplete]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.sceneArea, { backgroundColor: colors.primaryLight + '30' }]}>
        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.text }]}>
          Drag 5 leaves into the beaker
        </Text>

        {/* Progress indicator */}
        <View style={styles.progressRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i < collected.length ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        {/* Draggable leaves */}
        <View style={styles.leavesArea}>
          {leaves.map((leaf) => (
            <DraggableLeaf
              key={leaf.id}
              id={leaf.id}
              initialX={leaf.x}
              initialY={leaf.y}
              collected={collected.includes(leaf.id)}
              onCollected={handleCollected}
              beakerPosition={beakerLayout}
              colors={colors}
            />
          ))}
        </View>

        {/* Beaker drop zone */}
        <View
          style={[styles.beakerZone, { borderColor: colors.primary }]}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setBeakerLayout({ x, y, width, height });
          }}
        >
          <Image
            source={LabEquipmentImages.beaker}
            style={styles.beakerImage}
            resizeMode="contain"
          />
          <View style={[styles.collectedBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.collectedText}>{collected.length}/5</Text>
          </View>
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
    marginBottom: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  leavesArea: {
    flex: 1,
    position: 'relative',
  },
  leaf: {
    position: 'absolute',
    width: 80,
    height: 80,
    zIndex: 10,
  },
  leafTouchable: {
    width: 80,
    height: 80,
  },
  leafImage: {
    width: '100%',
    height: '100%',
  },
  beakerZone: {
    position: 'absolute',
    right: Spacing.lg,
    top: '40%',
    width: 120,
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beakerImage: {
    width: 100,
    height: 120,
  },
  collectedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  collectedText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});
