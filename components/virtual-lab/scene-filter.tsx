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

interface SceneFilterProps {
  onComplete: () => void;
  macerationDone: boolean;
}

export default function SceneFilter({ onComplete, macerationDone }: SceneFilterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [filtered, setFiltered] = useState(false);
  const [filterLayout, setFilterLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleDragEnd = useCallback((x: number, y: number) => {
    if (filterLayout.width === 0) return;
    
    const beakerCenterX = 50 + x + 55;
    const beakerCenterY = 100 + y + 65;
    
    const inX = beakerCenterX > filterLayout.x && 
                beakerCenterX < filterLayout.x + filterLayout.width;
    const inY = beakerCenterY > filterLayout.y && 
                beakerCenterY < filterLayout.y + filterLayout.height;
    
    if (inX && inY) {
      setFiltered(true);
      setTimeout(() => onComplete(), 1500);
    }
  }, [filterLayout, onComplete]);

  const panGesture = Gesture.Pan()
    .enabled(!filtered)
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
      if (!filtered) {
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
    opacity: filtered ? 0.4 : 1,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.sceneArea, { backgroundColor: colors.card }]}>
        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.text }]}>
          {filtered ? 'Filtration complete! Solids separated.' : 'Drag the beaker to the filter paper'}
        </Text>

        {/* Draggable beaker */}
        {!filtered && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.beakerDraggable, beakerStyle]}>
              <Image
                source={LabEquipmentImages.beaker}
                style={styles.beakerImage}
                resizeMode="contain"
              />
              <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                Heated Extract
              </Text>
            </Animated.View>
          </GestureDetector>
        )}

        {/* Filter drop zone */}
        <View
          style={[styles.filterZone, { borderColor: filtered ? colors.success : colors.primary }]}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setFilterLayout({ x, y, width, height });
          }}
        >
          <Image
            source={LabEquipmentImages.filterpaper}
            style={styles.filterImage}
            resizeMode="contain"
          />
          {filtered && (
            <View style={[styles.filteredIndicator, { backgroundColor: colors.success + '30' }]}>
              <Text style={[styles.filteredText, { color: colors.success }]}>Filtered ✓</Text>
            </View>
          )}
        </View>

        {/* Result panel */}
        <View style={[styles.resultPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Filtration Result</Text>
          <View style={styles.resultRow}>
            <View style={styles.resultItem}>
              <View style={[styles.resultDot, { backgroundColor: '#a3e635' }]} />
              <Text style={[styles.resultLabel, { color: colors.textMuted }]}>
                Filtrate (liquid)
              </Text>
            </View>
            <View style={styles.resultItem}>
              <View style={[styles.resultDot, { backgroundColor: '#78716c' }]} />
              <Text style={[styles.resultLabel, { color: colors.textMuted }]}>
                Residue (solids)
              </Text>
            </View>
          </View>
          <Text style={[styles.resultNote, { color: colors.textMuted }]}>
            The filtrate contains the extracted phytochemicals
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
  filterZone: {
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
  filterImage: {
    width: 120,
    height: 140,
  },
  filteredIndicator: {
    position: 'absolute',
    bottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  filteredText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  resultPanel: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resultDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resultLabel: {
    fontSize: FontSizes.sm,
  },
  resultNote: {
    fontSize: FontSizes.xs,
    fontStyle: 'italic',
  },
});
