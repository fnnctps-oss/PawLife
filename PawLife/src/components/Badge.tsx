import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'error' | 'warning' | 'muted';
  size?: 'sm' | 'md';
}

const variantColors = {
  primary: { bg: '#FFF0E5', text: colors.primary },
  secondary: { bg: '#E8F1FB', text: colors.secondary },
  accent: { bg: '#E5F7E8', text: colors.accentDark },
  error: { bg: colors.errorLight, text: colors.error },
  warning: { bg: '#FFF8E0', text: '#B8860B' },
  muted: { bg: colors.divider, text: colors.lightText },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
}) => {
  const colorSet = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorSet.bg },
        size === 'md' && styles.md,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: colorSet.text },
          size === 'md' && styles.mdText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.caption2,
    fontWeight: '600',
  },
  mdText: {
    ...typography.caption1,
    fontWeight: '600',
  },
});
