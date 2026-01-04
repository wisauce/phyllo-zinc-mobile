import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface DraggableItemProps {
  id: string;
  source: ImageSourcePropType;
  size?: number;
  disabled?: boolean;
  initialX?: number;
  initialY?: number;
  onDragEnd?: (id: string, x: number, y: number) => void;
  style?: object;
}

export default function DraggableItem({
  id,
  source,
  size = 80,
  disabled = false,
  initialX = 0,
  initialY = 0,
  onDragEnd,
  style,
}: DraggableItemProps) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = withSpring(1.1);
      zIndex.value = 999;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      zIndex.value = 1;
      if (onDragEnd) {
        runOnJS(onDragEnd)(id, translateX.value, translateY.value);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    opacity: disabled ? 0.4 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle, style]}>
        <Image
          source={source}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
