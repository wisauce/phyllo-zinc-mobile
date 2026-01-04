import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BorderRadius, FontSizes, FontWeights, Spacing, Shadows, VIRTUAL_LAB_SCENES } from '@/constants';
import { LabEquipmentImages, BackgroundImages, PhyllozincLogo } from '@/assets/images';

export default function LabScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.iconContainer}>
              <Image source={LabEquipmentImages.vlab} style={styles.heroImage} resizeMode="contain" />
            </View>
            <Text style={styles.heroTitle}>Virtual Lab</Text>
            <Text style={styles.heroSubtitle}>
              Experience the ZnO nanoparticle synthesis process through our interactive 7-step simulation
            </Text>
          </View>
        </LinearGradient>

        {/* Info Cards */}
        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="school" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Educational Experience
              </Text>
              <Text style={[styles.infoDescription, { color: colors.textMuted }]}>
                Learn the step-by-step process of green synthesis through interactive drag-and-drop activities
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="time" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                7 Interactive Scenes
              </Text>
              <Text style={[styles.infoDescription, { color: colors.textMuted }]}>
                Complete all stages from leaf collection to final nanoparticle synthesis
              </Text>
            </View>
          </View>
        </View>

        {/* Scenes Overview */}
        <View style={styles.scenesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Lab Stages
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.primary }]} />
          
          {VIRTUAL_LAB_SCENES.map((scene, index) => (
            <View
              key={index}
              style={[styles.sceneCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.sceneNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.sceneNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.sceneContent}>
                <Text style={[styles.sceneName, { color: colors.text }]}>
                  {scene.name}
                </Text>
                <Text style={[styles.sceneDescription, { color: colors.textMuted }]}>
                  {scene.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }, Shadows.md]}
            onPress={() => router.push('/virtual-lab')}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Start Virtual Lab</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsCard, { backgroundColor: colors.primaryLight + '50', borderColor: colors.border }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.primary }]}>Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={[styles.tipItem, { color: colors.textMuted }]}>
              • Drag items to their target locations to progress
            </Text>
            <Text style={[styles.tipItem, { color: colors.textMuted }]}>
              • Follow the on-screen instructions for each step
            </Text>
            <Text style={[styles.tipItem, { color: colors.textMuted }]}>
              • Use the reset button to start over if needed
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Hero
  hero: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  heroImage: {
    width: 60,
    height: 60,
  },
  heroTitle: {
    color: '#fff',
    fontSize: FontSizes.hero,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Content
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  infoDescription: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },

  // Scenes
  scenesSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  divider: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sceneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  sceneNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneNumberText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  sceneContent: {
    flex: 1,
  },
  sceneName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: 2,
  },
  sceneDescription: {
    fontSize: FontSizes.xs,
    lineHeight: 16,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: '#fff',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },

  // Tips
  tipsCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  tipsList: {
    gap: Spacing.xs,
  },
  tipItem: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
