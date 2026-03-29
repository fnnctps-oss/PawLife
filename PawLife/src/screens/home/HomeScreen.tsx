import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Card, Avatar, Badge, ScreenContainer } from '../../components';
import { colors, spacing, typography, borderRadius, shadows, gradients, useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import { getGreeting, getAge, getActivityIcon, getActivityColor } from '../../utils/helpers';

// ---------------------------------------------------------------------------
// Mock data so the dashboard looks populated out of the box
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: 'u1',
  displayName: 'Sarah',
  email: 'sarah@example.com',
  photoURL: '',
  subscription: { plan: 'premium' as const },
  createdAt: '2025-06-01T00:00:00Z',
};

const MOCK_DOGS = [
  {
    id: 'd1',
    name: 'Luna',
    breed: 'Golden Retriever',
    photo: '',
    dateOfBirth: '2023-04-15',
    weight: 28,
    gender: 'female' as const,
    color: 'Golden',
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'd2',
    name: 'Max',
    breed: 'German Shepherd',
    photo: '',
    dateOfBirth: '2022-08-20',
    weight: 35,
    gender: 'male' as const,
    color: 'Black & Tan',
    createdAt: '2025-07-10T00:00:00Z',
  },
  {
    id: 'd3',
    name: 'Milo',
    breed: 'Beagle',
    photo: '',
    dateOfBirth: '2024-11-02',
    weight: 12,
    gender: 'male' as const,
    color: 'Tricolor',
    createdAt: '2025-12-01T00:00:00Z',
  },
];

const MOCK_SCHEDULE = [
  {
    id: 's1',
    type: 'walk' as const,
    title: 'Morning Walk',
    time: '7:30 AM',
    status: 'done' as const,
  },
  {
    id: 's2',
    type: 'food' as const,
    title: 'Breakfast',
    time: '8:00 AM',
    status: 'done' as const,
  },
  {
    id: 's3',
    type: 'medicine' as const,
    title: 'Joint Supplement',
    time: '8:15 AM',
    status: 'done' as const,
  },
  {
    id: 's4',
    type: 'walk' as const,
    title: 'Afternoon Walk',
    time: '1:00 PM',
    status: 'upcoming' as const,
  },
  {
    id: 's5',
    type: 'food' as const,
    title: 'Dinner',
    time: '6:00 PM',
    status: 'upcoming' as const,
  },
  {
    id: 's6',
    type: 'grooming' as const,
    title: 'Brush Coat',
    time: '7:00 PM',
    status: 'upcoming' as const,
  },
];

const MOCK_WEEKLY_ACTIVITY = [
  { day: 'Mon', count: 5 },
  { day: 'Tue', count: 7 },
  { day: 'Wed', count: 4 },
  { day: 'Thu', count: 8 },
  { day: 'Fri', count: 6 },
  { day: 'Sat', count: 9 },
  { day: 'Sun', count: 3 },
];

const QUICK_ACTIONS = [
  { key: 'walk', label: 'Log Walk', icon: 'footsteps-outline' as const, bg: '#E5F7E8', accent: '#6BCB77' },
  { key: 'food', label: 'Log Food', icon: 'restaurant-outline' as const, bg: '#FFF0E5', accent: '#FF8C42' },
  { key: 'water', label: 'Log Water', icon: 'water-outline' as const, bg: '#E8F1FB', accent: '#4A90D9' },
  { key: 'play', label: 'Log Play', icon: 'game-controller-outline' as const, bg: '#FFF8E0', accent: '#F5A623' },
  { key: 'medicine', label: 'Log Medicine', icon: 'medkit-outline' as const, bg: '#FFE5E5', accent: '#FF4D4D' },
  { key: 'custom', label: 'Custom', icon: 'add-circle-outline' as const, bg: '#F2F2F7', accent: '#8E8E93' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  done: { bg: '#E5F7E8', text: '#4FB85A', label: 'Done' },
  upcoming: { bg: '#E8F1FB', text: '#4A90D9', label: 'Upcoming' },
  missed: { bg: '#FFE5E5', text: '#FF4D4D', label: 'Missed' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const HomeScreen: React.FC = () => {
  const { colors: t } = useTheme();
  const navigation = useNavigation();

  // Pull from store, falling back to mock data for a populated look
  const storeUser = useStore((s) => s.user);
  const storeDogs = useStore((s) => s.dogs);
  const storeSelectedDogId = useStore((s) => s.selectedDogId);
  const setSelectedDog = useStore((s) => s.setSelectedDog);

  const user = storeUser ?? MOCK_USER;
  const dogs = storeDogs.length > 0 ? storeDogs : MOCK_DOGS;
  const selectedDogId = storeSelectedDogId ?? dogs[0]?.id;
  const currentDog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];

  const greeting = getGreeting();
  const hour = new Date().getHours();
  const greetingEmoji = hour >= 6 && hour < 18 ? '\u2600\uFE0F' : '\uD83C\uDF19';

  // Weekly chart helpers
  const maxCount = useMemo(
    () => Math.max(...MOCK_WEEKLY_ACTIVITY.map((d) => d.count), 1),
    [],
  );

  // ------ handlers ------
  const handleQuickAction = (key: string) => {
    Alert.alert('Log Activity', `Logging "${key}" for ${currentDog?.name ?? 'your dog'}.`);
  };

  const handleDogSwitch = (id: string) => {
    setSelectedDog(id);
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderDogSelector = () => {
    if (dogs.length <= 1) return null;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dogSelectorContent}
        style={styles.dogSelectorScroll}
      >
        {dogs.map((dog) => {
          const isSelected = dog.id === selectedDogId;
          return (
            <TouchableOpacity
              key={dog.id}
              onPress={() => handleDogSwitch(dog.id)}
              activeOpacity={0.7}
              style={styles.dogSelectorItem}
            >
              <View style={[styles.dogAvatarRing, { borderColor: t.transparent }, isSelected && styles.dogAvatarRingActive]}>
                <Avatar uri={dog.photo || undefined} name={dog.name} size={52} />
              </View>
              <Text
                style={[
                  styles.dogSelectorName,
                  { color: t.bodyText },
                  isSelected && [styles.dogSelectorNameActive, { color: colors.primary }],
                ]}
                numberOfLines={1}
              >
                {dog.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderCurrentDogCard = () => {
    if (!currentDog) return null;
    return (
      <Card variant="elevated" style={styles.featuredCard}>
        <View style={styles.featuredTop}>
          <Avatar
            uri={currentDog.photo || undefined}
            name={currentDog.name}
            size={72}
          />
          <View style={styles.featuredInfo}>
            <Text style={[styles.featuredName, { color: t.darkText }]}>{currentDog.name}</Text>
            <Text style={[styles.featuredBreed, { color: t.bodyText }]}>{currentDog.breed}</Text>
            <Text style={[styles.featuredAge, { color: t.lightText }]}>{getAge(currentDog.dateOfBirth)}</Text>
          </View>
        </View>

        {/* Quick stats row */}
        <View style={[styles.statsRow, { backgroundColor: t.background }]}>
          <View style={styles.statItem}>
            <Ionicons name="footsteps-outline" size={18} color={colors.accent} />
            <Text style={[styles.statValue, { color: t.darkText }]}>5</Text>
            <Text style={[styles.statLabel, { color: t.lightText }]}>Walks</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: t.darkText }]}>2</Text>
            <Text style={[styles.statLabel, { color: t.lightText }]}>Meals</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={18} color={colors.secondary} />
            <Text style={[styles.statValue, { color: t.darkText }]}>3</Text>
            <Text style={[styles.statLabel, { color: t.lightText }]}>Water</Text>
          </View>
        </View>

        {/* Health score badge */}
        <View style={styles.healthBadgeRow}>
          <LinearGradient
            colors={['#E5F7E8', '#D0F0D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.healthBadge}
          >
            <Ionicons name="heart-circle" size={18} color={colors.accentDark} />
            <Text style={styles.healthBadgeText}>92% — Great Week!</Text>
          </LinearGradient>
        </View>
      </Card>
    );
  };

  const renderSchedule = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: t.darkText }]}>Today's Schedule</Text>
      {MOCK_SCHEDULE.length === 0 ? (
        <Card style={styles.emptyScheduleCard}>
          <Ionicons name="calendar-outline" size={32} color={t.placeholderText} />
          <Text style={[styles.emptyScheduleText, { color: t.lightText }]}>No activities yet today</Text>
        </Card>
      ) : (
        <Card variant="default" style={styles.scheduleCard}>
          {MOCK_SCHEDULE.map((item, idx) => {
            const status = STATUS_STYLES[item.status];
            const activityColor = getActivityColor(item.type);
            const iconName = getActivityIcon(item.type) as keyof typeof Ionicons.glyphMap;
            const isLast = idx === MOCK_SCHEDULE.length - 1;
            return (
              <View key={item.id} style={styles.scheduleRow}>
                {/* Timeline connector */}
                <View style={styles.timelineCol}>
                  <View style={[styles.timelineDot, { backgroundColor: activityColor }]} />
                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: t.border }]} />}
                </View>

                {/* Content */}
                <View style={[styles.scheduleContent, !isLast && [styles.scheduleContentBorder, { borderBottomColor: t.divider }]]}>
                  <View style={styles.scheduleLeft}>
                    <View style={[styles.scheduleIconWrap, { backgroundColor: activityColor + '1A' }]}>
                      <Ionicons name={iconName} size={16} color={activityColor} />
                    </View>
                    <View style={styles.scheduleMeta}>
                      <Text style={[styles.scheduleTitle, { color: t.darkText }]}>{item.title}</Text>
                      <Text style={[styles.scheduleTime, { color: t.lightText }]}>{item.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusPillText, { color: status.text }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: t.darkText }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            activeOpacity={0.7}
            onPress={() => handleQuickAction(action.key)}
            style={styles.actionCardTouch}
          >
            <View style={[styles.actionCard, shadows.md, { backgroundColor: action.bg }]}>
              <View style={[styles.actionIconCircle, { backgroundColor: action.accent + '25' }]}>
                <Ionicons
                  name={action.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={action.accent}
                />
              </View>
              <Text style={[styles.actionLabel, { color: action.accent }]}>{action.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWeeklyChart = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: t.darkText }]}>Weekly Activity</Text>
      <Card variant="default" style={styles.chartCard}>
        <View style={styles.chartBars}>
          {MOCK_WEEKLY_ACTIVITY.map((entry) => {
            const barHeight = Math.max((entry.count / maxCount) * 110, 8);
            const isToday = entry.day === ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
            return (
              <View key={entry.day} style={styles.chartBarCol}>
                <Text style={[styles.chartBarValue, { color: t.lightText }]}>{entry.count}</Text>
                <LinearGradient
                  colors={isToday ? (gradients.primary as [string, string]) : [colors.primaryLight, colors.primaryLight]}
                  style={[styles.chartBar, { height: barHeight }]}
                />
                <Text style={[styles.chartBarLabel, { color: t.lightText }, isToday && styles.chartBarLabelToday]}>
                  {entry.day}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>
    </View>
  );

  const renderMilestoneTeaser = () => (
    <View style={styles.section}>
      <LinearGradient
        colors={gradients.warm as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.milestoneCard}
      >
        <View style={styles.milestoneInner}>
          <Ionicons name="trophy" size={28} color={colors.white} style={styles.milestoneIcon} />
          <View style={styles.milestoneTextWrap}>
            <Text style={styles.milestoneTitle}>Almost there!</Text>
            <Text style={styles.milestoneBody}>
              {currentDog?.name ?? 'Your pup'} is 3 walks away from her 100th walk!
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <ScreenContainer scrollable backgroundColor={t.background}>
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={[styles.greeting, { color: t.darkText }]}>
            {greetingEmoji} {greeting}, {user.displayName}
          </Text>
          <Text style={[styles.subtitle, { color: t.lightText }]}>Here's how your pups are doing</Text>
        </View>
        <TouchableOpacity
          style={[styles.notificationBtn, { backgroundColor: t.surface }]}
          activeOpacity={0.7}
          onPress={() => Alert.alert('Notifications', 'No new notifications.')}
        >
          <Ionicons name="notifications-outline" size={24} color={t.darkText} />
        </TouchableOpacity>
      </View>

      {/* Dog selector */}
      {renderDogSelector()}

      {/* Featured dog card */}
      {renderCurrentDogCard()}

      {/* Today's Schedule */}
      {renderSchedule()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Weekly Activity Chart */}
      {renderWeeklyChart()}

      {/* Milestone Teaser */}
      {renderMilestoneTeaser()}

      {/* Bottom spacer */}
      <View style={{ height: spacing.massive }} />
    </ScreenContainer>
  );
};

export default HomeScreen;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  /* ---- Greeting ---- */
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.title2,
    color: colors.darkText,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.lightText,
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...((shadows.sm as object) ?? {}),
  },

  /* ---- Dog Selector ---- */
  dogSelectorScroll: {
    marginBottom: spacing.lg,
    marginHorizontal: -20, // extend to screen edges
  },
  dogSelectorContent: {
    paddingHorizontal: 20,
    gap: spacing.base,
  },
  dogSelectorItem: {
    alignItems: 'center',
    width: 68,
  },
  dogAvatarRing: {
    borderRadius: 30,
    padding: 3,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  dogAvatarRingActive: {
    borderColor: colors.primary,
  },
  dogSelectorName: {
    ...typography.caption1,
    color: colors.bodyText,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  dogSelectorNameActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  /* ---- Featured Card ---- */
  featuredCard: {
    marginBottom: spacing.lg,
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  featuredInfo: {
    marginLeft: spacing.base,
    flex: 1,
  },
  featuredName: {
    ...typography.title3,
    color: colors.darkText,
  },
  featuredBreed: {
    ...typography.subhead,
    color: colors.bodyText,
    marginTop: 2,
  },
  featuredAge: {
    ...typography.caption1,
    color: colors.lightText,
    marginTop: 2,
  },

  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.headline,
    color: colors.darkText,
  },
  statLabel: {
    ...typography.caption2,
    color: colors.lightText,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  /* Health badge */
  healthBadgeRow: {
    alignItems: 'center',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  healthBadgeText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.accentDark,
  },

  /* ---- Section ---- */
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.darkText,
    marginBottom: spacing.md,
  },

  /* ---- Schedule ---- */
  scheduleCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  emptyScheduleCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyScheduleText: {
    ...typography.subhead,
    color: colors.lightText,
  },
  scheduleRow: {
    flexDirection: 'row',
  },

  /* Timeline */
  timelineCol: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 14,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },

  /* Schedule content */
  scheduleContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
  },
  scheduleContentBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleMeta: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  scheduleTitle: {
    ...typography.subhead,
    fontWeight: '500',
    color: colors.darkText,
  },
  scheduleTime: {
    ...typography.caption1,
    color: colors.lightText,
    marginTop: 1,
  },

  /* Status pill */
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusPillText: {
    ...typography.caption2,
    fontWeight: '600',
  },

  /* ---- Quick Actions ---- */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCardTouch: {
    width: (SCREEN_WIDTH - 40 - spacing.md * 2) / 3, // 3 columns accounting for container padding + gap
  },
  actionCard: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...typography.caption1,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ---- Weekly Chart ---- */
  chartCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBarValue: {
    ...typography.caption2,
    color: colors.lightText,
    marginBottom: spacing.xs,
  },
  chartBar: {
    width: 24,
    borderRadius: borderRadius.sm,
  },
  chartBarLabel: {
    ...typography.caption2,
    color: colors.lightText,
    marginTop: spacing.sm,
  },
  chartBarLabelToday: {
    color: colors.primary,
    fontWeight: '600',
  },

  /* ---- Milestone Teaser ---- */
  milestoneCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...((shadows.lg as object) ?? {}),
  },
  milestoneInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    marginRight: spacing.md,
  },
  milestoneTextWrap: {
    flex: 1,
  },
  milestoneTitle: {
    ...typography.headline,
    color: colors.white,
    marginBottom: 2,
  },
  milestoneBody: {
    ...typography.subhead,
    color: 'rgba(255,255,255,0.9)',
  },
});
