import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
} from 'react-native-reanimated';

import { LabEquipmentImages } from '@/assets/images';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SceneHotMacerationProps {
  onComplete: () => void;
  solventMixed: boolean;
}

export default function SceneHotMaceration({ onComplete, solventMixed }: SceneHotMacerationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [placed, setPlaced] = useState(false);
  const [heating, setHeating] = useState(false);
  const [heaterLayout, setHeaterLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const heatGlow = useSharedValue(0);

  const startHeating = useCallback(() => {
    setHeating(true);
    heatGlow.value = withRepeat(
      withSequence(
        withSpring(1, { duration: 500 }),
        withSpring(0.5, { duration: 500 })
      ),
      5,
      true
    );
    setTimeout(() => {
      setHeating(false);
      onComplete();
    }, 2500);
  }, [onComplete]);

  const handleDragEnd = useCallback((x: number, y: number) => {
    if (heaterLayout.width === 0) return;
    
    const beakerCenterX = 50 + x + 55;
    const beakerCenterY = 100 + y + 65;
    
    const inX = beakerCenterX > heaterLayout.x && 
                beakerCenterX < heaterLayout.x + heaterLayout.width;
    const inY = beakerCenterY > heaterLayout.y && 
                beakerCenterY < heaterLayout.y + heaterLayout.height;
    
    if (inX && inY) {
      setPlaced(true);
      startHeating();
    }
  }, [heaterLayout, startHeating]);

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
    opacity: placed ? 0.7 : 1,
  }));

  const heatGlowStyle = useAnimatedStyle(() => ({
    opacity: heatGlow.value,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.sceneArea, { backgroundColor: '#fef3c7' + '40' }]}>
        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.text }]}>
          {heating ? 'Heating in progress... (Hot Maceration)' : 
           placed ? 'Heating complete!' : 
           'Drag the beaker to the hot plate'}
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
                Extract Solution
              </Text>
            </Animated.View>
          </GestureDetector>
        )}

        {/* Heater drop zone */}
        <View
          style={[styles.heaterZone, { borderColor: placed ? '#f59e0b' : colors.primary }]}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setHeaterLayout({ x, y, width, height });
          }}
        >
          {/* Heat glow effect */}
          {heating && (
            <Animated.View style={[styles.heatGlow, heatGlowStyle]} />
          )}
          
          <Image
            source={LabEquipmentImages.hotplate}
            style={styles.heaterImage}
            resizeMode="contain"
          />
          
          {placed && (
            <Image
              source={LabEquipmentImages.beaker}
              style={styles.placedBeaker}
              resizeMode="contain"
            />
          )}
          
          {heating && (
            <View style={styles.heatingIndicator}>
              <ActivityIndicator color="#f59e0b" size="small" />
              <Text style={[styles.heatingText, { color: '#f59e0b' }]}>Heating...</Text>
            </View>
          )}
        </View>

        {/* Temperature panel */}
        <View style={[styles.tempPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.tempTitle, { color: colors.text }]}>Temperature</Text>
          <Text style={[styles.tempValue, { color: heating ? '#f59e0b' : colors.textMuted }]}>
            {heating ? '60°C - 80°C' : placed ? '25°C (Room)' : '--°C'}
          </Text>
          <Text style={[styles.tempNote, { color: colors.textMuted }]}>
            Hot maceration enhances extraction efficiency
          </Text>
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
    width: 110,
    height: 130,
  },
  itemLabel: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  heaterZone: {
    position: 'absolute',
    right: Spacing.lg,
    top: '25%',
    width: 150,
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatGlow: {
    position: 'absolute',
    width: 160,
    height: 190,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#f59e0b',
  },
  heaterImage: {
    width: 130,
    height: 100,
  },
  placedBeaker: {
    position: 'absolute',
    width: 70,
    height: 85,
    top: 20,
  },
  heatingIndicator: {
    position: 'absolute',
    bottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  heatingText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  tempPanel: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tempTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  tempValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  tempNote: {
    fontSize: FontSizes.sm,
  },
});
