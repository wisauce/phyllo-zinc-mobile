import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RichTextEditor from '@/components/rich-text-editor';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE_URL, Article, useArticlesStore, useAuthStore } from '@/store';

type AdminTab = 'articles' | 'whitelist';

interface WhitelistEntry {
  id: number;
  email: string;
  createdAt: string;
}

// Categories for articles (matching web version)
const ARTICLE_CATEGORIES = [
  'Research',
  'News',
  'Tutorial',
  'Case Study',
  'Opinion',
];

// Article form data interface
interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  readTime: string;
  status: string;
}

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { session, isAdmin } = useAuthStore();
  const { articles, fetchArticles, deleteArticle, isLoading: articlesLoading } = useArticlesStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('articles');
  const [refreshing, setRefreshing] = useState(false);
  
  // Whitelist state
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);

  // Article modal state
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: '',
    category: 'Research',
    readTime: '5 min read',
    status: 'published',
  });

  const { createArticle, updateArticle } = useArticlesStore();

  useEffect(() => {
    if (!session || !isAdmin) {
      Alert.alert('Access Denied', 'You must be an admin to access this page.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
    
    loadData();
  }, [session, isAdmin]);

  const loadData = async () => {
    await fetchArticles();
    await fetchWhitelist();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const fetchWhitelist = async () => {
    try {
      setWhitelistLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/whitelist`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWhitelist(data);
      }
    } catch (err) {
      console.error('Failed to fetch whitelist:', err);
    } finally {
      setWhitelistLoading(false);
    }
  };

  const handleAddWhitelist = async () => {
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      setAddingEmail(true);
      const response = await fetch(`${API_BASE_URL}/api/whitelist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (response.ok) {
        setNewEmail('');
        await fetchWhitelist();
        Alert.alert('Success', 'Email added to whitelist.');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add email.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add email to whitelist.');
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveWhitelist = (id: number, email: string) => {
    Alert.alert(
      'Remove from Whitelist',
      `Are you sure you want to remove ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/whitelist?id=${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${session?.token}`,
                },
              });
              if (response.ok) {
                await fetchWhitelist();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to remove email.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteArticle = (id: string, title: string) => {
    Alert.alert(
      'Delete Article',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteArticle(id),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Article modal handlers
  const resetFormData = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      image: '',
      author: '',
      category: 'Research',
      readTime: '5 min read',
      status: 'published',
    });
  };

  const handleOpenArticleModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        image: article.image || '',
        author: article.author || '',
        category: article.category || 'Research',
        readTime: article.readTime || '5 min read',
        status: article.status || 'published',
      });
    } else {
      setEditingArticle(null);
      resetFormData();
    }
    setArticleModalVisible(true);
  };

  const handleCloseArticleModal = () => {
    setArticleModalVisible(false);
    setEditingArticle(null);
    resetFormData();
  };

  const handleInputChange = (field: keyof ArticleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveArticle = async () => {
    // Validation (similar to web version)
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }
    if (!formData.excerpt.trim()) {
      Alert.alert('Validation Error', 'Please enter an excerpt.');
      return;
    }
    if (!formData.content.trim()) {
      Alert.alert('Validation Error', 'Please enter the article content.');
      return;
    }
    if (!formData.author.trim()) {
      Alert.alert('Validation Error', 'Please enter an author name.');
      return;
    }

    setIsSaving(true);

    try {
      let result;
      if (editingArticle) {
        // Update existing article
        result = await updateArticle(editingArticle.id, {
          ...formData,
          date: editingArticle.date || new Date().toISOString().split('T')[0],
        });
      } else {
        // Create new article
        result = await createArticle({
          ...formData,
          date: new Date().toISOString().split('T')[0],
        });
      }

      if (result.success) {
        Alert.alert(
          'Success',
          `Article ${editingArticle ? 'updated' : 'created'} successfully!`
        );
        handleCloseArticleModal();
      } else {
        Alert.alert('Error', result.error || 'Failed to save article.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Save article error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session || !isAdmin) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'articles' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('articles')}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={activeTab === 'articles' ? colors.primary : colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'articles' ? colors.primary : colors.textMuted }
          ]}>
            Articles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'whitelist' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('whitelist')}
        >
          <Ionicons 
            name="shield-checkmark-outline" 
            size={20} 
            color={activeTab === 'whitelist' ? colors.primary : colors.textMuted} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'whitelist' ? colors.primary : colors.textMuted }
          ]}>
            Whitelist
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'articles' ? (
          <>
            {/* Articles Header */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Manage Articles ({articles.length})
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => handleOpenArticleModal()}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>New</Text>
              </TouchableOpacity>
            </View>

            {/* Articles List */}
            {articlesLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : articles.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                  No articles found
                </Text>
              </View>
            ) : (
              articles.map((article) => (
                <View 
                  key={article.id} 
                  style={[styles.articleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.articleInfo}>
                    <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <View style={styles.articleMeta}>
                      <View style={[styles.categoryChip, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.categoryChipText, { color: colors.primary }]}>
                          {article.categoryName || article.category}
                        </Text>
                      </View>
                      <Text style={[styles.articleDate, { color: colors.textMuted }]}>
                        {formatDate(article.createdAt || article.date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.articleActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.input }]}
                      onPress={() => router.push(`/article/${article.id}` as any)}
                    >
                      <Ionicons name="eye-outline" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.input }]}
                      onPress={() => handleOpenArticleModal(article)}
                    >
                      <Ionicons name="pencil-outline" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                      onPress={() => handleDeleteArticle(article.id, article.title)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            {/* Whitelist Header */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Admin Whitelist ({whitelist.length})
              </Text>
            </View>

            {/* Add Email Form */}
            <View style={[styles.addEmailForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.emailInput, { 
                  backgroundColor: colors.input, 
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter email address"
                placeholderTextColor={colors.textMuted}
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.addEmailButton, { backgroundColor: colors.primary }]}
                onPress={handleAddWhitelist}
                disabled={addingEmail}
              >
                {addingEmail ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addEmailButtonText}>Add</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Whitelist */}
            {whitelistLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : whitelist.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Ionicons name="shield-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                  No emails in whitelist
                </Text>
              </View>
            ) : (
              whitelist.map((entry) => (
                <View 
                  key={entry.id} 
                  style={[styles.whitelistCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.whitelistInfo}>
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                    <View style={styles.whitelistText}>
                      <Text style={[styles.whitelistEmail, { color: colors.text }]}>
                        {entry.email}
                      </Text>
                      <Text style={[styles.whitelistDate, { color: colors.textMuted }]}>
                        Added {formatDate(entry.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: colors.error + '20' }]}
                    onPress={() => handleRemoveWhitelist(entry.id, entry.email)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Article Create/Edit Modal */}
      <Modal
        visible={articleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseArticleModal}
      >
        <KeyboardAvoidingView 
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={handleCloseArticleModal}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingArticle ? 'Edit Article' : 'New Article'}
            </Text>
            <TouchableOpacity
              onPress={handleSaveArticle}
              disabled={isSaving}
              style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalSaveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Modal Form */}
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: colors.input, 
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter article title"
                placeholderTextColor={colors.textMuted}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
              />
            </View>

            {/* Author */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Author *</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: colors.input, 
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Enter author name"
                placeholderTextColor={colors.textMuted}
                value={formData.author}
                onChangeText={(value) => handleInputChange('author', value)}
              />
            </View>

            {/* Category Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Category</Text>
              <View style={styles.categoryPicker}>
                {ARTICLE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      { 
                        backgroundColor: formData.category === cat ? colors.primary : colors.input,
                        borderColor: formData.category === cat ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleInputChange('category', cat)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      { color: formData.category === cat ? '#fff' : colors.text }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Excerpt */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Excerpt *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { 
                  backgroundColor: colors.input, 
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Brief summary of the article"
                placeholderTextColor={colors.textMuted}
                value={formData.excerpt}
                onChangeText={(value) => handleInputChange('excerpt', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Content - Rich Text Editor */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Content *</Text>
              <RichTextEditor
                value={formData.content}
                onChange={(html) => handleInputChange('content', html)}
                placeholder="Write the full article content here..."
                minHeight={250}
              />
            </View>

            {/* Image URL */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Image URL</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: colors.input, 
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={colors.textMuted}
                value={formData.image}
                onChangeText={(value) => handleInputChange('image', value)}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Read Time */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Read Time</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: colors.input, 
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="e.g., 5 min read"
                placeholderTextColor={colors.textMuted}
                value={formData.readTime}
                onChangeText={(value) => handleInputChange('readTime', value)}
              />
            </View>

            {/* Status Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Status</Text>
              <View style={styles.statusPicker}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    { 
                      backgroundColor: formData.status === 'published' ? colors.success : colors.input,
                      borderColor: formData.status === 'published' ? colors.success : colors.border,
                    },
                  ]}
                  onPress={() => handleInputChange('status', 'published')}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={formData.status === 'published' ? '#fff' : colors.textMuted} 
                  />
                  <Text style={[
                    styles.statusOptionText,
                    { color: formData.status === 'published' ? '#fff' : colors.text }
                  ]}>
                    Published
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    { 
                      backgroundColor: formData.status === 'draft' ? colors.warning : colors.input,
                      borderColor: formData.status === 'draft' ? colors.warning : colors.border,
                    },
                  ]}
                  onPress={() => handleInputChange('status', 'draft')}
                >
                  <Ionicons 
                    name="create" 
                    size={16} 
                    color={formData.status === 'draft' ? '#fff' : colors.textMuted} 
                  />
                  <Text style={[
                    styles.statusOptionText,
                    { color: formData.status === 'draft' ? '#fff' : colors.text }
                  ]}>
                    Draft
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Spacer for keyboard */}
            <View style={{ height: Spacing.xxxl }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },

  // Content
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },

  // Loading & Empty
  loader: {
    marginTop: Spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    marginTop: Spacing.md,
  },

  // Article Card
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  articleDate: {
    fontSize: FontSizes.xs,
  },
  articleActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Whitelist
  addEmailForm: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  emailInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: FontSizes.md,
  },
  addEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addEmailButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },

  // Whitelist Card
  whitelistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  whitelistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  whitelistText: {
    flex: 1,
  },
  whitelistEmail: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  whitelistDate: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Article Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  modalSaveButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
  },

  // Form Styles
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  formInput: {
    height: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: FontSizes.md,
  },
  formTextArea: {
    height: 100,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  formContentArea: {
    height: 200,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  statusPicker: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  statusOptionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
});
