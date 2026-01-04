import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DropZoneProps {
  id: string;
  source?: ImageSourcePropType;
  width?: number;
  height?: number;
  label?: string;
  isActive?: boolean;
  hasItem?: boolean;
  children?: React.ReactNode;
}

export default function DropZone({
  id,
  source,
  width = 120,
  height = 140,
  label,
  isActive = false,
  hasItem = false,
  children,
}: DropZoneProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: colors.card,
          borderColor: isActive ? colors.primary : colors.border,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      {source && (
        <Image
          source={source}
          style={styles.image}
          resizeMode="contain"
        />
      )}
      {children}
      {hasItem && (
        <View style={[styles.checkmark, { backgroundColor: colors.success }]}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
      {label && (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  image: {
    width: '80%',
    height: '80%',
  },
  label: {
    position: 'absolute',
    bottom: Spacing.xs,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});
