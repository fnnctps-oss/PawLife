import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { spacing, borderRadius, typography, shadows } from '../theme';
import type { Insight, InsightType } from '../utils/insights';

// ---------------------------------------------------------------------------
// Color mapping per insight type
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  InsightType,
  {
    accentLight: string;
    accentDark: string;
    gradientLight: [string, string];
    gradientDark: [string, string];
    barColor: string;
    iconBgLight: string;
    iconBgDark: string;
  }
> = {
  info: {
    accentLight: '#FF8C42',
    accentDark: '#FFB07A',
    gradientLight: ['#FFF8F0', '#FFF2E6'],
    gradientDark: ['#2E2418', '#2A2015'],
    barColor: '#FF8C42',
    iconBgLight: '#FFF0E5',
    iconBgDark: '#3D2A18',
  },
  warning: {
    accentLight: '#FF4D4D',
    accentDark: '#FF6B6B',
    gradientLight: ['#FFF8F8', '#FFE8E8'],
    gradientDark: ['#2E1A1A', '#2A1515'],
    barColor: '#FF4D4D',
    iconBgLight: '#FFE5E5',
    iconBgDark: '#3D1818',
  },
  celebration: {
    accentLight: '#4FB85A',
    accentDark: '#6BCB77',
    gradientLight: ['#F8FFF8', '#E8F7EA'],
    gradientDark: ['#1A2E1C', '#152A17'],
    barColor: '#4FB85A',
    iconBgLight: '#E5F7E8',
    iconBgDark: '#1A3D1E',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (id: string) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onDismiss }) => {
  const { colors: t, isDark } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const config = TYPE_CONFIG[insight.type];
  const accentColor = isDark ? config.accentDark : config.accentLight;
  const gradient = isDark ? config.gradientDark : config.gradientLight;
  const iconBg = isDark ? config.iconBgDark : config.iconBgLight;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.(insight.id);
  };

  return (
    <View style={[styles.wrapper, shadows.md as object]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        {/* Colored left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: config.barColor }]} />

        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons
            name={insight.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={accentColor}
          />
        </View>

        {/* Text content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: t.darkText }]} numberOfLines={1}>
            {insight.title}
          </Text>
          <Text style={[styles.message, { color: t.bodyText }]} numberOfLines={3}>
            {insight.message}
          </Text>
        </View>

        {/* Dismiss button */}
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          style={styles.dismissBtn}
          activeOpacity={0.5}
        >
          <Ionicons name="close" size={16} color={t.lightText} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingRight: spacing.base,
    paddingLeft: 0,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.subhead,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    ...typography.footnote,
    lineHeight: 18,
  },
  dismissBtn: {
    padding: spacing.xs,
    alignSelf: 'flex-start',
  },
});

export default InsightCard;
