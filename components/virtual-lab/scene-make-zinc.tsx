import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { BackgroundImages, LabEquipmentImages } from '@/assets/images';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SceneMakeZincProps {
  onComplete: () => void;
  extractFiltered: boolean;
}

export default function SceneMakeZinc({ onComplete, extractFiltered }: SceneMakeZincProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [placed, setPlaced] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [mixerLayout, setMixerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const startSynthesis = useCallback(() => {
    setSynthesizing(true);
    setTimeout(() => {
      setSynthesizing(false);
      onComplete();
    }, 2500);
  }, [onComplete]);

  const handleDragEnd = useCallback((x: number, y: number) => {
    if (mixerLayout.width === 0) return;
    
    const zincCenterX = 50 + x + 45;
    const zincCenterY = 100 + y + 55;
    
    const inX = zincCenterX > mixerLayout.x && 
                zincCenterX < mixerLayout.x + mixerLayout.width;
    const inY = zincCenterY > mixerLayout.y && 
                zincCenterY < mixerLayout.y + mixerLayout.height;
    
    if (inX && inY) {
      setPlaced(true);
      startSynthesis();
    }
  }, [mixerLayout, startSynthesis]);

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

  const zincStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: placed ? 0.4 : 1,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.sceneArea, { backgroundColor: '#dbeafe' + '40' }]}>
        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.text }]}>
          {synthesizing ? 'Synthesizing Zinc Nanoparticles...' : 
           placed ? 'Zinc NP synthesis complete!' : 
           'Drag the zinc reagent to the mixer'}
        </Text>

        {/* Draggable zinc bottle */}
        {!placed && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.zincDraggable, zincStyle]}>
              <Image
                source={BackgroundImages.zinc}
                style={styles.zincImage}
                resizeMode="contain"
              />
              <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                Zinc Acetate
              </Text>
            </Animated.View>
          </GestureDetector>
        )}

        {/* Mixer drop zone */}
        <View
          style={[styles.mixerZone, { borderColor: placed ? colors.success : colors.primary }]}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setMixerLayout({ x, y, width, height });
          }}
        >
          <Image
            source={LabEquipmentImages.beaker}
            style={styles.mixerImage}
            resizeMode="contain"
          />
          <Text style={[styles.mixerLabel, { color: colors.textMuted }]}>Mixer</Text>
          
          {synthesizing && (
            <View style={styles.synthesisIndicator}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={[styles.synthesisText, { color: colors.primary }]}>
                Synthesizing...
              </Text>
            </View>
          )}
          
          {placed && !synthesizing && (
            <View style={[styles.completeIndicator, { backgroundColor: colors.success + '30' }]}>
              <Text style={[styles.completeText, { color: colors.success }]}>
                NP Ready ✓
              </Text>
            </View>
          )}
        </View>

        {/* Info panel */}
        <View style={[styles.infoPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Green Synthesis</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            The plant extract reduces zinc ions to form ZnO nanoparticles through a green synthesis process at ambient temperature.
          </Text>
          <View style={styles.reactionRow}>
            <Text style={[styles.reactionText, { color: colors.primary }]}>
              Zn²⁺ + Plant Extract → ZnO NP
            </Text>
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
    marginBottom: Spacing.lg,
  },
  zincDraggable: {
    position: 'absolute',
    left: 50,
    top: 100,
    alignItems: 'center',
    zIndex: 10,
  },
  zincImage: {
    width: 90,
    height: 110,
  },
  itemLabel: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  mixerZone: {
    position: 'absolute',
    right: Spacing.lg,
    top: '25%',
    width: 150,
    height: 170,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixerImage: {
    width: 100,
    height: 120,
  },
  mixerLabel: {
    position: 'absolute',
    bottom: Spacing.xs,
    fontSize: FontSizes.xs,
  },
  synthesisIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  synthesisText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  completeIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  completeText: {
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
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  reactionRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  reactionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    fontStyle: 'italic',
  },
});
