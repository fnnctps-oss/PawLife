import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, EmptyState, ScreenContainer } from '../../components';
import { colors, spacing, borderRadius, typography, shadows, gradients, useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import {
  getActivityIcon,
  getActivityColor,
  formatDuration,
  formatTime,
  formatDistance,
  isToday,
} from '../../utils/helpers';
import { Activity, ActivityType } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

type FilterTab = 'all' | 'walk' | 'food' | 'water' | 'play' | 'medicine';

const FILTER_TABS: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'walk', label: 'Walks', icon: 'footsteps-outline' },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' },
  { key: 'water', label: 'Water', icon: 'water-outline' },
  { key: 'play', label: 'Play', icon: 'game-controller-outline' },
  { key: 'medicine', label: 'Medicine', icon: 'medkit-outline' },
];

const isYesterday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  );
};

const getDateGroupLabel = (dateStr: string): string => {
  if (isToday(dateStr)) return 'Today';
  if (isYesterday(dateStr)) return 'Yesterday';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const getDateKey = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

interface DateGroup {
  label: string;
  activities: Activity[];
}

interface ActivityHistoryScreenProps {
  onOpenLogSheet?: (type?: ActivityType) => void;
}

export const ActivityHistoryScreen: React.FC<ActivityHistoryScreenProps> = ({
  onOpenLogSheet,
}) => {
  const { colors: t } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { activities, selectedDogId, unitSystem } = useStore();

  const filteredActivities = useMemo(() => {
    let filtered = activities.filter((a) => a.dogId === selectedDogId);
    if (activeFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === activeFilter);
    }
    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activities, selectedDogId, activeFilter]);

  const groupedActivities = useMemo((): DateGroup[] => {
    const groups: Map<string, DateGroup> = new Map();
    filteredActivities.forEach((activity) => {
      const key = getDateKey(activity.timestamp);
      if (!groups.has(key)) {
        groups.set(key, {
          label: getDateGroupLabel(activity.timestamp),
          activities: [],
        });
      }
      groups.get(key)!.activities.push(activity);
    });
    return Array.from(groups.values());
  }, [filteredActivities]);

  const getActivityDetails = (activity: Activity): string => {
    const parts: string[] = [];
    if (activity.duration) parts.push(formatDuration(activity.duration));
    if (activity.distance) parts.push(formatDistance(activity.distance, unitSystem === 'imperial'));
    if (activity.mealType) {
      parts.push(activity.mealType.charAt(0).toUpperCase() + activity.mealType.slice(1));
    }
    if (activity.portion) {
      parts.push(activity.portion.charAt(0).toUpperCase() + activity.portion.slice(1));
    }
    if (activity.waterAmount) {
      const labels = { small: 'Small cup', medium: 'Medium bowl', full: 'Full bowl' };
      parts.push(labels[activity.waterAmount]);
    }
    if (activity.medicineName) parts.push(activity.medicineName);
    if (activity.foodBrand) parts.push(activity.foodBrand);
    return parts.join(' \u00B7 ');
  };

  const getActivityTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      walk: 'Walk',
      food: 'Meal',
      water: 'Water',
      play: 'Play',
      training: 'Training',
      grooming: 'Grooming',
      medicine: 'Medicine',
      vet_visit: 'Vet Visit',
      injection: 'Injection',
      custom: 'Activity',
    };
    return labels[type] || 'Activity';
  };

  const handleActivityPress = (activity: Activity) => {
    const details = getActivityDetails(activity);
    const time = formatTime(activity.timestamp);
    const lines = [`Type: ${getActivityTypeLabel(activity.type)}`, `Time: ${time}`];
    if (details) lines.push(`Details: ${details}`);
    if (activity.notes) lines.push(`Notes: ${activity.notes}`);
    if (activity.administeredBy) {
      lines.push(`Administered by: ${activity.administeredBy === 'self' ? 'Self' : 'Veterinarian'}`);
    }
    if (activity.dosage) lines.push(`Dosage: ${activity.dosage}`);
    if (activity.nextDueDate) {
      lines.push(`Next due: ${new Date(activity.nextDueDate).toLocaleDateString()}`);
    }

    Alert.alert(getActivityTypeLabel(activity.type), lines.join('\n'));
  };

  const renderFilterTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveFilter(tab.key)}
            activeOpacity={0.7}
          >
            {isActive ? (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.filterTab}
              >
                <Ionicons name={tab.icon} size={16} color={colors.white} />
                <Text style={[styles.filterLabel, styles.filterLabelActive]}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.filterTab, styles.filterTabInactive, { backgroundColor: t.card, borderColor: t.border }]}>
                <Ionicons name={tab.icon} size={16} color={t.lightText} />
                <Text style={[styles.filterLabel, { color: t.lightText }]}>{tab.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderActivityItem = (activity: Activity) => {
    const iconName = getActivityIcon(activity.type) as keyof typeof Ionicons.glyphMap;
    const activityColor = getActivityColor(activity.type);
    const details = getActivityDetails(activity);

    return (
      <TouchableOpacity
        key={activity.id}
        onPress={() => handleActivityPress(activity)}
        activeOpacity={0.7}
      >
        <Card style={styles.activityCard} variant="default">
          <View style={styles.activityRow}>
            <View style={[styles.iconContainer, { backgroundColor: activityColor + '18' }]}>
              <Ionicons name={iconName} size={22} color={activityColor} />
            </View>
            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <Text style={[styles.activityType, { color: t.darkText }]}>
                  {getActivityTypeLabel(activity.type)}
                </Text>
                <Text style={[styles.activityTime, { color: t.lightText }]}>{formatTime(activity.timestamp)}</Text>
              </View>
              {details ? (
                <Text style={[styles.activityDetails, { color: t.bodyText }]} numberOfLines={1}>
                  {details}
                </Text>
              ) : null}
              {activity.notes ? (
                <Text style={[styles.activityNotes, { color: t.lightText }]} numberOfLines={1}>
                  {activity.notes}
                </Text>
              ) : null}
            </View>
            {activity.photo ? (
              <Image source={{ uri: activity.photo }} style={styles.photoThumb} />
            ) : null}
            <Ionicons
              name="chevron-forward"
              size={16}
              color={t.placeholderText}
              style={styles.chevron}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      <View style={styles.screenHeader}>
        <Text style={[styles.screenTitle, { color: t.darkText }]}>Activity History</Text>
      </View>

      {renderFilterTabs()}

      {filteredActivities.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          title="No activities yet"
          subtitle="Start logging your pup's daily activities to keep track of their health and routines."
          actionTitle="Log Activity"
          onAction={() => onOpenLogSheet?.()}
        />
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedActivities.map((group) => (
            <View key={group.label} style={styles.dateGroup}>
              <Text style={[styles.dateLabel, { color: t.darkText }]}>{group.label}</Text>
              {group.activities.map(renderActivityItem)}
            </View>
          ))}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => onOpenLogSheet?.()}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  screenTitle: {
    ...typography.largeTitle,
    color: colors.darkText,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterTabInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterLabel: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.lightText,
  },
  filterLabelActive: {
    color: colors.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateLabel: {
    ...typography.headline,
    color: colors.darkText,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  activityCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityType: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.darkText,
  },
  activityTime: {
    ...typography.caption1,
    color: colors.lightText,
  },
  activityDetails: {
    ...typography.footnote,
    color: colors.bodyText,
    marginTop: 2,
  },
  activityNotes: {
    ...typography.caption1,
    color: colors.lightText,
    marginTop: 2,
    fontStyle: 'italic',
  },
  photoThumb: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.lg,
    ...shadows.lg,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ActivityHistoryScreen;
