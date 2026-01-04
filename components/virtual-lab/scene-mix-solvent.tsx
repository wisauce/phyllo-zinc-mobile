import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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

interface SceneMixSolventProps {
  onComplete: () => void;
  isGrounded: boolean;
}

export default function SceneMixSolvent({ onComplete, isGrounded }: SceneMixSolventProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [poured, setPoured] = useState(false);
  const [beakerLayout, setBeakerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handleDragEnd = useCallback((x: number, y: number) => {
    if (beakerLayout.width === 0) return;
    
    const solventCenterX = 50 + x + 50;
    const solventCenterY = 120 + y + 50;
    
    const inX = solventCenterX > beakerLayout.x && 
                solventCenterX < beakerLayout.x + beakerLayout.width;
    const inY = solventCenterY > beakerLayout.y && 
                solventCenterY < beakerLayout.y + beakerLayout.height;
    
    if (inX && inY) {
      setPoured(true);
      setTimeout(() => onComplete(), 1000);
    }
  }, [beakerLayout, onComplete]);

  const panGesture = Gesture.Pan()
    .enabled(!poured)
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
      if (!poured) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const solventStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.sceneArea, { backgroundColor: colors.primaryLight + '20' }]}>
        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.text }]}>
          {poured ? 'Solvent mixed! Extraction starting...' : 'Drag the solvent bottle to the beaker'}
        </Text>

        {/* Draggable solvent bottle */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.solventDraggable, solventStyle]}>
            <Image
              source={LabEquipmentImages.solvent}
              style={styles.solventImage}
              resizeMode="contain"
            />
            <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
              Aquadest Solvent
            </Text>
          </Animated.View>
        </GestureDetector>

        {/* Beaker drop zone */}
        <View
          style={[styles.beakerZone, { borderColor: poured ? colors.success : colors.primary }]}
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
          {poured && (
            <View style={[styles.mixedIndicator, { backgroundColor: '#3b82f6' + '40' }]}>
              <Text style={[styles.mixedText, { color: '#3b82f6' }]}>Mixed ✓</Text>
            </View>
          )}
        </View>

        {/* Info panel */}
        <View style={[styles.infoPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.infoPanelTitle, { color: colors.text }]}>Extraction Process</Text>
          <Text style={[styles.infoPanelText, { color: colors.textMuted }]}>
            The aquadest solvent will extract phytochemicals from the ground leaf powder.
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
  solventDraggable: {
    position: 'absolute',
    left: 50,
    top: 120,
    alignItems: 'center',
    zIndex: 10,
  },
  solventImage: {
    width: 100,
    height: 100,
  },
  itemLabel: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  beakerZone: {
    position: 'absolute',
    right: Spacing.xl,
    top: '30%',
    width: 130,
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beakerImage: {
    width: 110,
    height: 130,
  },
  mixedIndicator: {
    position: 'absolute',
    bottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  mixedText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  infoPanel: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  infoPanelTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  infoPanelText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
