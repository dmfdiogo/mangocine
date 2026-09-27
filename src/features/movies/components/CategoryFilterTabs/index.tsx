import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { MovieCategory } from '@features/movies/api/types';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export interface CategoryOption {
  id: MovieCategory;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'popular', label: 'Populares', icon: '🔥' },
  { id: 'top_rated', label: 'Mejor Valoradas', icon: '⭐' },
  { id: 'now_playing', label: 'En Cartelera', icon: '🎬' },
  { id: 'upcoming', label: 'Próximamente', icon: '📅' },
];

export interface CategoryFilterTabsProps {
  selectedCategory: MovieCategory;
  onSelectCategory: (category: MovieCategory) => void;
  style?: ViewStyle;
}

export const CategoryFilterTabs: React.FC<CategoryFilterTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelectCategory(cat.id)}
            activeOpacity={0.7}
            style={[
              styles.tab,
              isSelected ? styles.tabSelected : styles.tabUnselected,
            ]}
          >
            <AppText
              variant="tag"
              color={isSelected ? 'text' : 'textSecondary'}
              style={styles.tabText}
            >
              {cat.icon} {cat.label}
            </AppText>
          </TouchableOpacity>
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
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  tabUnselected: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
