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

  const renderHeader = () => (
    <LinearGradient
      colors={['#FF8C42', '#E07030']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      {/* Top row: greeting + avatar */}
      <View style={styles.headerTopRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerGreeting}>
            {greetingEmoji} {greeting}, {user.displayName}
          </Text>
          <Text style={styles.headerDashboard}>Your Dashboard</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert('Profile', 'Navigate to profile.')}>
          <Avatar uri={user.photoURL || undefined} name={user.displayName} size={44} />
        </TouchableOpacity>
      </View>

      {/* Dog selector carousel inside header */}
      {dogs.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.headerDogSelectorContent}
          style={styles.headerDogSelectorScroll}
        >
          {dogs.map((dog) => {
            const isSelected = dog.id === selectedDogId;
            return (
              <TouchableOpacity
                key={dog.id}
                onPress={() => handleDogSwitch(dog.id)}
                activeOpacity={0.7}
                style={styles.headerDogItem}
              >
                <View
                  style={[
                    styles.headerDogAvatarRing,
                    isSelected && styles.headerDogAvatarRingActive,
                  ]}
                >
                  <Avatar uri={dog.photo || undefined} name={dog.name} size={48} />
                </View>
                <Text
                  style={[
                    styles.headerDogName,
                    isSelected && styles.headerDogNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {dog.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </LinearGradient>
  );

  const renderCurrentDogCard = () => {
    if (!currentDog) return null;
    return (
      <View style={[styles.featuredCard, { backgroundColor: t.card }, ...([shadows.xl] as object[])]}>
        <View style={styles.featuredTop}>
          {/* Dog photo with health score badge */}
          <View style={styles.featuredPhotoWrap}>
            <View style={styles.featuredPhotoBorder}>
              <Avatar
                uri={currentDog.photo || undefined}
                name={currentDog.name}
                size={96}
              />
            </View>
            {/* Health score badge */}
            <View style={styles.healthScoreBadge}>
              <Text style={styles.healthScoreText}>{'\uD83C\uDF1F'} 92%</Text>
            </View>
          </View>
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
            <Text style={[styles.statLabel, { color: t.lightText }]}>WALKS</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: t.darkText }]}>2</Text>
            <Text style={[styles.statLabel, { color: t.lightText }]}>MEALS</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={18} color={colors.secondary} />
            <Text style={[styles.statValue, { color: t.darkText }]}>3</Text>
            <Text style={[styles.statLabel, { color: t.lightText }]}>WATER</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSchedule = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: t.darkText }]}>Today's Schedule</Text>
      {MOCK_SCHEDULE.length === 0 ? (
        <View style={[styles.emptyScheduleCard, { backgroundColor: t.card }]}>
          <Ionicons name="calendar-outline" size={32} color={t.placeholderText} />
          <Text style={[styles.emptyScheduleText, { color: t.lightText }]}>No activities yet today</Text>
        </View>
      ) : (
        <View style={styles.scheduleList}>
          {MOCK_SCHEDULE.map((item) => {
            const status = STATUS_STYLES[item.status];
            const activityColor = getActivityColor(item.type);
            const iconName = getActivityIcon(item.type) as keyof typeof Ionicons.glyphMap;
            const isDone = item.status === 'done';
            return (
              <View
                key={item.id}
                style={[
                  styles.scheduleItemCard,
                  { backgroundColor: t.card, borderColor: t.border },
                  ...([shadows.sm] as object[]),
                ]}
              >
                <View style={styles.scheduleLeft}>
                  <View style={[styles.scheduleIconWrap, { backgroundColor: activityColor + '1A' }]}>
                    <Ionicons name={iconName} size={22} color={activityColor} />
                  </View>
                  <View style={styles.scheduleMeta}>
                    <Text style={[styles.scheduleTitle, { color: t.darkText }]}>{item.title}</Text>
                    <Text style={[styles.scheduleTime, { color: t.lightText }]}>{item.time}</Text>
                  </View>
                </View>
                <View style={styles.scheduleRight}>
                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusPillText, { color: status.text }]}>
                      {status.label}
                    </Text>
                  </View>
                  {isDone && (
                    <View style={styles.checkmarkCircle}>
                      <Ionicons name="checkmark-circle" size={22} color="#34C759" />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
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
            <View
              style={[
                styles.actionCard,
                { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
                ...([shadows.sm] as object[]),
              ]}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: action.accent + '20' }]}>
                <Ionicons
                  name={action.icon as keyof typeof Ionicons.glyphMap}
                  size={32}
                  color={action.accent}
                />
              </View>
              <Text style={[styles.actionLabel, { color: t.darkText }]}>{action.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWeeklyChart = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: t.darkText, marginBottom: 0 }]}>Weekly Activity</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('WeeklyPawReport')}>
          <Text style={[styles.viewReportLink, { color: t.primary }]}>View Report</Text>
        </TouchableOpacity>
      </View>
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
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.milestoneCard}
      >
        {/* Decorative blurred circle top-right */}
        <View style={styles.milestoneDecorCircle} />

        <View style={styles.milestoneInner}>
          {/* Frosted glass trophy container */}
          <View style={styles.milestoneTrophyWrap}>
            <Ionicons name="trophy" size={28} color={colors.white} />
          </View>
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
    <ScreenContainer scrollable padded={false} backgroundColor={t.background}>
      {/* Amber gradient header */}
      {renderHeader()}

      {/* Content area with padding */}
      <View style={styles.contentPadded}>
        {/* Featured dog card overlapping header */}
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
      </View>
    </ScreenContainer>
  );
};

export default HomeScreen;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  /* ---- Content wrapper (replaces ScreenContainer padding) ---- */
  contentPadded: {
    paddingHorizontal: 20,
  },

  /* ---- Amber Gradient Header ---- */
  headerGradient: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextWrap: {
    flex: 1,
    marginRight: spacing.base,
  },
  headerGreeting: {
    ...typography.subhead,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  headerDashboard: {
    ...typography.title2,
    color: '#FFFFFF',
  },

  /* Dog selector inside header */
  headerDogSelectorScroll: {
    marginTop: spacing.lg,
    marginHorizontal: -20,
  },
  headerDogSelectorContent: {
    paddingHorizontal: 20,
    gap: spacing.base,
  },
  headerDogItem: {
    alignItems: 'center',
    width: 68,
  },
  headerDogAvatarRing: {
    borderRadius: 28,
    padding: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerDogAvatarRingActive: {
    borderColor: '#FFFFFF',
  },
  headerDogName: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  headerDogNameActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* ---- Featured Card (overlapping header) ---- */
  featuredCard: {
    marginTop: -20,
    borderRadius: 32,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  featuredPhotoWrap: {
    position: 'relative',
  },
  featuredPhotoBorder: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 52,
    ...((shadows.md as object) ?? {}),
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

  /* Health score badge on photo */
  healthScoreBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  healthScoreText: {
    ...typography.caption2,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
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
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
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

  /* ---- Schedule (standalone cards) ---- */
  scheduleList: {
    gap: spacing.sm,
  },
  scheduleItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: 24,
    borderWidth: 1,
  },
  emptyScheduleCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    borderRadius: 24,
    gap: spacing.sm,
  },
  emptyScheduleText: {
    ...typography.subhead,
    color: colors.lightText,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
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
  scheduleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkmarkCircle: {
    marginLeft: 2,
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
    width: (SCREEN_WIDTH - 40 - spacing.md * 2) / 3,
  },
  actionCard: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    borderWidth: 2,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...typography.caption1,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ---- Section header with link ---- */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewReportLink: {
    ...typography.subhead,
    fontWeight: '600',
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

  /* ---- Milestone Teaser (purple gradient) ---- */
  milestoneCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    ...((shadows.lg as object) ?? {}),
  },
  milestoneDecorCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  milestoneInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneTrophyWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
