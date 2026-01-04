import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import {
    RichEditor,
    RichToolbar,
    actions,
} from 'react-native-pell-rich-editor';

import { BorderRadius, FontWeights } from '@/constants';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  minHeight = 300,
}: RichTextEditorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const richText = useRef<RichEditor>(null);

  const handleContentChange = useCallback((html: string) => {
    onChange(html);
  }, [onChange]);

  // Custom icon map for toolbar
  const iconMap = {
    [actions.setBold]: ({ tintColor }: { tintColor: string }) => (
      <Text style={[styles.toolbarIcon, { color: tintColor }]}>B</Text>
    ),
    [actions.setItalic]: ({ tintColor }: { tintColor: string }) => (
      <Text style={[styles.toolbarIcon, { color: tintColor, fontStyle: 'italic' }]}>I</Text>
    ),
    [actions.setUnderline]: ({ tintColor }: { tintColor: string }) => (
      <Text style={[styles.toolbarIcon, { color: tintColor, textDecorationLine: 'underline' }]}>U</Text>
    ),
    [actions.heading1]: ({ tintColor }: { tintColor: string }) => (
      <Text style={[styles.toolbarIcon, { color: tintColor, fontSize: 16 }]}>H1</Text>
    ),
    [actions.heading2]: ({ tintColor }: { tintColor: string }) => (
      <Text style={[styles.toolbarIcon, { color: tintColor, fontSize: 14 }]}>H2</Text>
    ),
    [actions.heading3]: ({ tintColor }: { tintColor: string }) => (
      <Text style={[styles.toolbarIcon, { color: tintColor, fontSize: 12 }]}>H3</Text>
    ),
    [actions.insertBulletsList]: ({ tintColor }: { tintColor: string }) => (
      <Ionicons name="list" size={20} color={tintColor} />
    ),
    [actions.insertOrderedList]: ({ tintColor }: { tintColor: string }) => (
      <Ionicons name="list-outline" size={20} color={tintColor} />
    ),
    [actions.insertLink]: ({ tintColor }: { tintColor: string }) => (
      <Ionicons name="link" size={20} color={tintColor} />
    ),
    [actions.setStrikethrough]: ({ tintColor }: { tintColor: string }) => (
      <Text style={[styles.toolbarIcon, { color: tintColor, textDecorationLine: 'line-through' }]}>S</Text>
    ),
    [actions.blockquote]: ({ tintColor }: { tintColor: string }) => (
      <Ionicons name="chatbox-outline" size={20} color={tintColor} />
    ),
    [actions.undo]: ({ tintColor }: { tintColor: string }) => (
      <Ionicons name="arrow-undo" size={20} color={tintColor} />
    ),
    [actions.redo]: ({ tintColor }: { tintColor: string }) => (
      <Ionicons name="arrow-redo" size={20} color={tintColor} />
    ),
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <RichToolbar
        editor={richText}
        selectedIconTint={colors.primary}
        iconTint={colors.textMuted}
        actions={[
          actions.undo,
          actions.redo,
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.blockquote,
          actions.insertLink,
        ]}
        iconMap={iconMap}
        style={[styles.toolbar, { backgroundColor: colors.input, borderColor: colors.border }]}
      />

      {/* Editor */}
      <View style={[styles.editorContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <RichEditor
          ref={richText}
          initialContentHTML={value}
          onChange={handleContentChange}
          placeholder={placeholder}
          androidLayerType="software"
          style={[styles.editor, { minHeight }]}
          editorStyle={{
            backgroundColor: colors.input,
            color: colors.text,
            placeholderColor: colors.textMuted,
            contentCSSText: `
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              padding: 12px;
            `,
          }}
          initialHeight={minHeight}
          useContainer={true}
          pasteAsPlainText={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    height: 44,
  },
  editorContainer: {
    borderWidth: 1,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  editor: {
    flex: 1,
  },
  toolbarIcon: {
    fontSize: 18,
    fontWeight: FontWeights.bold,
  },
});
