import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { MovieCategory } from '@features/movies/api/types';
import { useTranslation, TranslationKey } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { elevation, radius } from '@shared/theme/elevation';

export interface CategoryOption {
  id: MovieCategory;
  labelKey: TranslationKey;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'popular', labelKey: 'category.popular' },
  { id: 'top_rated', labelKey: 'category.top_rated' },
  { id: 'now_playing', labelKey: 'category.now_playing' },
  { id: 'upcoming', labelKey: 'category.upcoming' },
];

export interface CategoryFilterTabsProps {
  selectedCategory: MovieCategory;
  onSelectCategory: (category: MovieCategory) => void;
  style?: ViewStyle;
}

interface ChipLayout {
  x: number;
  width: number;
}

export const CategoryFilterTabs: React.FC<CategoryFilterTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  style,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const layouts = useRef<Partial<Record<MovieCategory, ChipLayout>>>({});
  const contentWidth = useRef(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Center the selected chip so a partially cut-off chip scrolls into view.
  const scrollChipIntoView = useCallback(
    (id: MovieCategory) => {
      const layout = layouts.current[id];
      if (!layout || viewportWidth === 0) {
        return;
      }
      const centered = layout.x + layout.width / 2 - viewportWidth / 2;
      const maxScroll = Math.max(0, contentWidth.current - viewportWidth);
      const x = Math.min(Math.max(0, centered), maxScroll);
      scrollRef.current?.scrollTo({ x, animated: true });
    },
    [viewportWidth],
  );

  useEffect(() => {
    scrollChipIntoView(selectedCategory);
  }, [selectedCategory, scrollChipIntoView]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
      onContentSizeChange={width => {
        contentWidth.current = width;
      }}
      contentContainerStyle={[styles.container, style]}
    >
      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id;

        return (
          <PressableScale
            key={cat.id}
            onPress={() => {
              onSelectCategory(cat.id);
              scrollChipIntoView(cat.id);
            }}
            onLayout={event => {
              layouts.current[cat.id] = {
                x: event.nativeEvent.layout.x,
                width: event.nativeEvent.layout.width,
              };
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            hitSlop={{ top: 8, bottom: 8 }}
            style={[
              styles.tab,
              isSelected ? styles.tabSelected : styles.tabUnselected,
            ]}
          >
            <AppText
              variant="tag"
              color={isSelected ? 'onPrimary' : 'textSecondary'}
              style={styles.tabText}
            >
              {t(cat.labelKey)}
            </AppText>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: colors.primary,
    ...elevation.sm,
  },
  tabUnselected: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
