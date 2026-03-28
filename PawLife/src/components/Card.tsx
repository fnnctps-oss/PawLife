import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius, spacing, shadows, useTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = spacing.base,
  variant = 'default',
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        { backgroundColor: colors.card, borderRadius: borderRadius.lg, overflow: 'hidden' as const },
        variant === 'elevated' && shadows.lg,
        variant === 'outlined' && { borderWidth: 1, borderColor: colors.border },
        variant === 'default' && shadows.md,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
};
