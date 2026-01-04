import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE_URL } from '@/store';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  image?: string;
  category: string;
  categoryName?: string;
  author: string;
  authorName?: string;
  readTime?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
      if (!response.ok) throw new Error('Article not found');
      const data = await response.json();
      setArticle(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        title: article.title,
        message: `Check out this article: ${article.title}`,
        url: `${API_BASE_URL}/articles/${article.id}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tagsStyles = {
    body: {
      color: colors.text,
      fontSize: FontSizes.md,
      lineHeight: 26,
    },
    p: {
      marginBottom: Spacing.md,
    },
    h1: {
      color: colors.text,
      fontSize: FontSizes.xxl,
      fontWeight: FontWeights.bold as any,
      marginBottom: Spacing.md,
    },
    h2: {
      color: colors.text,
      fontSize: FontSizes.xl,
      fontWeight: FontWeights.semibold as any,
      marginBottom: Spacing.md,
      marginTop: Spacing.lg,
    },
    h3: {
      color: colors.text,
      fontSize: FontSizes.lg,
      fontWeight: FontWeights.semibold as any,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },
    a: {
      color: colors.primary,
      textDecorationLine: 'underline' as const,
    },
    ul: {
      marginBottom: Spacing.md,
    },
    ol: {
      marginBottom: Spacing.md,
    },
    li: {
      marginBottom: Spacing.xs,
    },
    img: {
      borderRadius: BorderRadius.md,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: Spacing.md,
      marginVertical: Spacing.md,
      fontStyle: 'italic' as const,
    },
    code: {
      backgroundColor: colors.card,
      padding: 4,
      borderRadius: BorderRadius.sm,
      fontFamily: 'monospace',
    },
    pre: {
      backgroundColor: colors.card,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      overflow: 'hidden' as const,
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading article...</Text>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Article Not Found</Text>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>{error || 'Unable to load article'}</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Image */}
        {(article.coverImage || article.image) && (
          <Image
            source={{ uri: article.coverImage || article.image }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        {/* Article Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {article.categoryName || article.category}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {article.title}
          </Text>

          {/* Meta Info */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {article.authorName || article.author}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {formatDate(article.createdAt)}
              </Text>
            </View>
            {article.readTime && (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {article.readTime}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Excerpt */}
          {article.excerpt && (
            <Text style={[styles.excerpt, { color: colors.textMuted }]}>
              {article.excerpt}
            </Text>
          )}

          {/* Article Body */}
          <RenderHtml
            contentWidth={width - Spacing.lg * 2}
            source={{ html: article.content }}
            tagsStyles={tagsStyles}
          />
        </View>

        {/* Related Articles Section Placeholder */}
        <View style={styles.relatedSection}>
          <Text style={[styles.relatedTitle, { color: colors.text }]}>
            Continue Reading
          </Text>
          <TouchableOpacity
            style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/articles')}
          >
            <Text style={styles.viewAllButtonText}>View All Articles</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },

  // Loading & Error
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  backButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },

  // Cover Image
  coverImage: {
    width: '100%',
    height: 280,
  },

  // Content
  content: {
    padding: Spacing.lg,
  },

  // Category
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },

  // Title
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    lineHeight: 36,
    marginBottom: Spacing.md,
  },

  // Meta
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.sm,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginHorizontal: Spacing.md,
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },

  // Excerpt
  excerpt: {
    fontSize: FontSizes.lg,
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },

  // Related Section
  relatedSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
  relatedTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
});
