import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, useTheme } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionTitle,
  onAction,
}) => {
  const { colors: t } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: t.primary + '18' }]}>
        <Ionicons name={icon} size={48} color={t.primaryLight} />
      </View>
      <Text style={[styles.title, { color: t.darkText }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: t.lightText }]}>{subtitle}</Text>}
      {actionTitle && onAction && (
        <View style={styles.button}>
          <Button title={actionTitle} onPress={onAction} size="sm" fullWidth={false} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.subhead,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.lg,
  },
});
