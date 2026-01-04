import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSizes, FontWeights, Spacing } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVirtualLabStore } from '@/store';

// Import interactive scene components
import {
  SCENE_DESCRIPTIONS,
  SCENE_ORDER,
  SCENE_TITLES,
  SceneCollectLeaves,
  SceneFilter,
  SceneFinalMix,
  SceneGrind,
  SceneHotMaceration,
  SceneMakeZinc,
  SceneMixSolvent,
} from '@/components/virtual-lab';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SCENES = SCENE_ORDER.length;

export default function VirtualLabScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sceneIndex?: string }>();
  
  const { 
    currentScene, 
    globalState, 
    setCurrentScene,
    completeScene,
    resetLab 
  } = useVirtualLabStore();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const progress = ((currentScene + 1) / TOTAL_SCENES) * 100;

  useEffect(() => {
    // If scene index passed in params, jump to that scene
    if (params.sceneIndex) {
      const index = parseInt(params.sceneIndex, 10);
      if (index >= 0 && index < TOTAL_SCENES) {
        setCurrentScene(index);
      }
    }
  }, [params.sceneIndex]);

  const handleSceneComplete = useCallback((sceneIndex: number) => {
    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Complete current scene and move to next
    completeScene(sceneIndex);
  }, [completeScene, fadeAnim]);

  const handleLabComplete = useCallback(() => {
    Alert.alert(
      'Lab Complete! 🎉',
      'Congratulations! You have successfully synthesized PhylloZinc feed additive.',
      [
        {
          text: 'Return to Lab',
          onPress: () => {
            resetLab();
            router.replace('/(tabs)/lab');
          },
        },
      ]
    );
  }, [resetLab, router]);

  const handleExit = useCallback(() => {
    Alert.alert(
      'Exit Lab?',
      'Your progress will be reset if you exit now.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            resetLab();
            router.back();
          },
        },
      ]
    );
  }, [resetLab, router]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Lab?',
      'This will restart the entire lab simulation from the beginning.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetLab,
        },
      ]
    );
  }, [resetLab]);

  // Render the current scene component
  const renderCurrentScene = () => {
    const props = {
      onComplete: () => handleSceneComplete(currentScene),
    };

    switch (currentScene) {
      case 0:
        return <SceneCollectLeaves {...props} />;
      case 1:
        return <SceneGrind {...props} leavesCollected={globalState.leavesCollected} />;
      case 2:
        return <SceneMixSolvent {...props} isGrounded={globalState.isGrounded} />;
      case 3:
        return <SceneHotMaceration {...props} solventMixed={globalState.solventMixed} />;
      case 4:
        return <SceneFilter {...props} macerationDone={globalState.macerationDone} />;
      case 5:
        return <SceneMakeZinc {...props} extractFiltered={globalState.extractFiltered} />;
      case 6:
        return (
          <SceneFinalMix 
            onComplete={handleLabComplete} 
            zincPrepared={globalState.zincPrepared} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.card }]}
          onPress={handleExit}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.sceneCounter, { color: colors.textMuted }]}>
            {currentScene + 1} / {TOTAL_SCENES}
          </Text>
          <Text style={[styles.sceneTitle, { color: colors.text }]}>
            {SCENE_TITLES[SCENE_ORDER[currentScene]]}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.card }]}
          onPress={handleReset}
        >
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: colors.primary,
              width: `${progress}%`,
            }
          ]} 
        />
      </View>

      {/* Scene Description */}
      <View style={styles.descriptionContainer}>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {SCENE_DESCRIPTIONS[SCENE_ORDER[currentScene]]}
        </Text>
      </View>

      {/* Interactive Scene Content */}
      <Animated.View 
        style={[
          styles.sceneContainer,
          { opacity: fadeAnim }
        ]}
      >
        {renderCurrentScene()}
      </Animated.View>

      {/* Scene Indicators */}
      <View style={[styles.indicators, { paddingBottom: insets.bottom + Spacing.md }]}>
        {SCENE_ORDER.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: 
                  index < currentScene 
                    ? colors.success 
                    : index === currentScene 
                      ? colors.primary 
                      : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  sceneCounter: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  sceneTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginTop: 2,
  },

  // Progress
  progressContainer: {
    height: 4,
    marginHorizontal: Spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },

  // Description
  descriptionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },

  // Scene Content
  sceneContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },

  // Scene Indicators
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
