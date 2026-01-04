import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

interface SceneFinalMixProps {
  onComplete: () => void;
  zincPrepared: boolean;
}

export default function SceneFinalMix({ onComplete, zincPrepared }: SceneFinalMixProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [mixed, setMixed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [beakerLayout, setBeakerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const celebrationScale = useSharedValue(1);

  const completeLab = useCallback(() => {
    setComplete(true);
    celebrationScale.value = withRepeat(
      withSequence(
        withSpring(1.1),
        withSpring(1)
      ),
      3,
      false
    );
  }, []);

  const handleDragEnd = useCallback((x: number, y: number) => {
    if (beakerLayout.width === 0) return;
    
    const npCenterX = 50 + x + 40;
    const npCenterY = 100 + y + 40;
    
    const inX = npCenterX > beakerLayout.x && 
                npCenterX < beakerLayout.x + beakerLayout.width;
    const inY = npCenterY > beakerLayout.y && 
                npCenterY < beakerLayout.y + beakerLayout.height;
    
    if (inX && inY) {
      setMixed(true);
      setTimeout(() => completeLab(), 1000);
    }
  }, [beakerLayout, completeLab]);

  const panGesture = Gesture.Pan()
    .enabled(!mixed && zincPrepared)
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
      if (!mixed) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const npStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: mixed ? 0 : 1,
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  if (!zincPrepared) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.card }]}>
        <Ionicons name="warning-outline" size={64} color={colors.warning} />
        <Text style={[styles.warningTitle, { color: colors.text }]}>
          Zinc NP Not Ready
        </Text>
        <Text style={[styles.warningText, { color: colors.textMuted }]}>
          Please complete the previous step first to prepare the zinc nanoparticles.
        </Text>
      </View>
    );
  }

  if (complete) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={[styles.sceneArea, styles.center, { backgroundColor: colors.primaryLight + '40' }]}>
          <Animated.View style={[styles.celebrationContainer, celebrationStyle]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
              <Ionicons name="checkmark" size={48} color="#fff" />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>
              Congratulations! 🎉
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>
              Lab Simulation Complete
            </Text>
            
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image
                source={LabEquipmentImages.finalproduct}
                style={styles.finalProductImage}
                resizeMode="contain"
              />
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                PhylloZinc Feed Additive
              </Text>
              <Text style={[styles.resultDesc, { color: colors.textMuted }]}>
                ZnO nanoparticles synthesized using Phyllanthus niruri extract
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.finishButton, { backgroundColor: colors.primary }]}
              onPress={onComplete}
            >
              <Text style={styles.finishButtonText}>Finish Lab</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.sceneArea, { backgroundColor: colors.primaryLight + '30' }]}>
        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.text }]}>
          {mixed ? 'Final product synthesized!' : 'Drag the nanoparticles to the extract beaker'}
        </Text>

        {/* Draggable NP */}
        {!mixed && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.npDraggable, npStyle]}>
              <View style={[styles.npIcon, { backgroundColor: colors.primary }]}>
                <Text style={styles.npIconText}>NP</Text>
              </View>
              <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                Zinc Nanoparticles
              </Text>
            </Animated.View>
          </GestureDetector>
        )}

        {/* Final beaker drop zone */}
        <View
          style={[styles.beakerZone, { borderColor: mixed ? colors.success : colors.primary }]}
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
          <Text style={[styles.beakerLabel, { color: colors.textMuted }]}>
            Plant Extract
          </Text>
        </View>

        {/* Info panel */}
        <View style={[styles.infoPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Final Step</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Combine the synthesized ZnO nanoparticles with the plant extract to create the final PhylloZinc feed additive product.
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
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
  warningTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.md,
  },
  warningText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  npDraggable: {
    position: 'absolute',
    left: 50,
    top: 100,
    alignItems: 'center',
    zIndex: 10,
  },
  npIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  npIconText: {
    color: '#fff',
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  itemLabel: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  beakerZone: {
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
  beakerImage: {
    width: 100,
    height: 120,
  },
  beakerLabel: {
    position: 'absolute',
    bottom: Spacing.xs,
    fontSize: FontSizes.xs,
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
  },
  // Celebration styles
  celebrationContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.lg,
  },
  resultCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  finalProductImage: {
    width: 100,
    height: 100,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  resultDesc: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});
