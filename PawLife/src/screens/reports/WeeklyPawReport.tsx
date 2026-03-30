import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Card, Avatar, Button, ScreenContainer } from '../../components';
import { colors, spacing, typography, borderRadius, shadows, gradients, useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import { Activity } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;

const RING_SIZE = 140;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOTIVATIONAL_FALLBACK = {
  text: 'Every walk is a step toward a healthier, happier pup.',
  author: 'PawLife',
};

/** Returns the Monday-to-Sunday range for the week containing `date`. */
function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function formatWeekLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} \u2013 ${endStr}`;
}

function filterWeekActivities(
  activities: Activity[],
  dogId: string,
  start: Date,
  end: Date,
): Activity[] {
  return activities.filter((a) => {
    if (a.dogId !== dogId) return false;
    const ts = new Date(a.timestamp);
    return ts >= start && ts <= end;
  });
}

function getPreviousWeekRange(start: Date): { start: Date; end: Date } {
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - 6);
  prevStart.setHours(0, 0, 0, 0);
  return { start: prevStart, end: prevEnd };
}

// ---------------------------------------------------------------------------
// Mock data so the report looks populated when there is no real data
// ---------------------------------------------------------------------------

const MOCK_DOG = {
  id: 'mock-d1',
  name: 'Luna',
  breed: 'Golden Retriever',
  photo: '',
  dateOfBirth: '2023-04-15',
  weight: 28,
  gender: 'female' as const,
  color: 'Golden',
  createdAt: '2025-06-01T00:00:00Z',
};

function buildMockActivities(): Activity[] {
  const now = new Date();
  const { start } = getWeekRange(now);
  const items: Activity[] = [];
  const base: Omit<Activity, 'id' | 'type' | 'timestamp' | 'duration' | 'distance' | 'mealType' | 'waterAmount'> = {
    dogId: 'mock-d1',
    sharedToSocial: false,
  };

  for (let d = 0; d < 7; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    if (day > now) break;

    // 2 walks per day
    items.push({
      ...base,
      id: `mw-${d}-1`,
      type: 'walk',
      timestamp: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 7, 30).toISOString(),
      duration: 35,
      distance: 2.1,
    });
    items.push({
      ...base,
      id: `mw-${d}-2`,
      type: 'walk',
      timestamp: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 17, 0).toISOString(),
      duration: 25,
      distance: 1.5,
    });

    // 2 meals
    items.push({
      ...base,
      id: `mf-${d}-1`,
      type: 'food',
      timestamp: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 8, 0).toISOString(),
      mealType: 'breakfast',
    });
    items.push({
      ...base,
      id: `mf-${d}-2`,
      type: 'food',
      timestamp: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 18, 0).toISOString(),
      mealType: 'dinner',
    });

    // 1 water
    items.push({
      ...base,
      id: `mwa-${d}`,
      type: 'water',
      timestamp: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0).toISOString(),
      waterAmount: 'medium',
    });

    // 1 play every other day
    if (d % 2 === 0) {
      items.push({
        ...base,
        id: `mp-${d}`,
        type: 'play',
        timestamp: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 15, 0).toISOString(),
        duration: 20,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Animated ring component
// ---------------------------------------------------------------------------

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing: React.FC<{ score: number; colors: any }> = ({ score, colors: t }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score / 100,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [score]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.ringContainer}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF8C42" />
            <Stop offset="100%" stopColor="#FFB07A" />
          </SvgGradient>
        </Defs>
        {/* Background ring */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={t.border}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Animated progress ring */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="url(#ringGrad)"
          strokeWidth={RING_STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.ringLabelWrap}>
        <Text style={[styles.ringScore, { color: t.darkText }]}>{score}%</Text>
        <Text style={[styles.ringCaption, { color: t.lightText }]}>Health Score</Text>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const WeeklyPawReport: React.FC = () => {
  const { colors: t } = useTheme();
  const navigation = useNavigation();

  // Store data
  const storeDogs = useStore((s) => s.dogs);
  const selectedDogId = useStore((s) => s.selectedDogId);
  const storeActivities = useStore((s) => s.activities);
  const storeQuotes = useStore((s) => s.quotes);

  // Resolve dog (fall back to mock)
  const dogs = storeDogs.length > 0 ? storeDogs : [MOCK_DOG];
  const dogId = selectedDogId ?? dogs[0]?.id;
  const dog = dogs.find((d) => d.id === dogId) ?? dogs[0];

  // Resolve activities (fall back to mock)
  const allActivities = storeActivities.length > 0 ? storeActivities : buildMockActivities();

  // Week boundaries
  const now = new Date();
  const { start: weekStart, end: weekEnd } = getWeekRange(now);
  const weekLabel = formatWeekLabel(weekStart, weekEnd);

  // Current & previous week activities for this dog
  const weekActivities = useMemo(
    () => filterWeekActivities(allActivities, dog.id, weekStart, weekEnd),
    [allActivities, dog.id, weekStart.getTime(), weekEnd.getTime()],
  );

  const { start: prevStart, end: prevEnd } = getPreviousWeekRange(weekStart);
  const prevWeekActivities = useMemo(
    () => filterWeekActivities(allActivities, dog.id, prevStart, prevEnd),
    [allActivities, dog.id, prevStart.getTime(), prevEnd.getTime()],
  );

  // ------ Computed stats ------

  const walks = weekActivities.filter((a) => a.type === 'walk');
  const prevWalks = prevWeekActivities.filter((a) => a.type === 'walk');
  const totalWalks = walks.length;
  const prevTotalWalks = prevWalks.length;
  const walkTrend = totalWalks - prevTotalWalks;

  const totalDistanceKm = walks.reduce((sum, a) => sum + (a.distance ?? 0), 0);
  const totalWalkMinutes = walks.reduce((sum, a) => sum + (a.duration ?? 0), 0);
  const totalWalkHours = totalWalkMinutes / 60;

  const meals = weekActivities.filter((a) => a.type === 'food');
  const mealTarget = 14; // 2 meals/day * 7 days
  const totalMeals = meals.length;

  const waterLogs = weekActivities.filter((a) => a.type === 'water').length;

  const otherActivities = weekActivities.filter(
    (a) => a.type !== 'walk' && a.type !== 'food' && a.type !== 'water',
  );
  const totalActivities = otherActivities.length;

  // Health Consistency Score (simple heuristic)
  const healthScore = useMemo(() => {
    const daysInWeek = 7;
    const daysBuckets: Record<string, Set<string>> = {};
    weekActivities.forEach((a) => {
      const dayKey = new Date(a.timestamp).toDateString();
      if (!daysBuckets[dayKey]) daysBuckets[dayKey] = new Set();
      daysBuckets[dayKey].add(a.type);
    });
    const activeDays = Object.keys(daysBuckets).length;
    const walkDays = Object.values(daysBuckets).filter((s) => s.has('walk')).length;
    const mealDays = Object.values(daysBuckets).filter((s) => s.has('food')).length;

    const dayScore = (activeDays / daysInWeek) * 40;
    const walkScore = (walkDays / daysInWeek) * 35;
    const mealScore = (mealDays / daysInWeek) * 25;
    return Math.min(100, Math.round(dayScore + walkScore + mealScore));
  }, [weekActivities]);

  // Walk streak (consecutive days with at least one walk, counting back from today)
  const walkStreak = useMemo(() => {
    let streak = 0;
    const d = new Date(now);
    for (let i = 0; i < 365; i++) {
      const dayStr = d.toDateString();
      const hasWalk = allActivities.some(
        (a) => a.dogId === dog.id && a.type === 'walk' && new Date(a.timestamp).toDateString() === dayStr,
      );
      if (hasWalk) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [allActivities, dog.id]);

  // Best day of the week
  const bestDay = useMemo(() => {
    const counts: Record<number, number> = {};
    weekActivities.forEach((a) => {
      const day = new Date(a.timestamp).getDay();
      counts[day] = (counts[day] || 0) + 1;
    });
    let maxDay = 0;
    let maxCount = 0;
    Object.entries(counts).forEach(([d, c]) => {
      if (c > maxCount) {
        maxDay = Number(d);
        maxCount = c;
      }
    });
    return { day: DAYS[maxDay], count: maxCount };
  }, [weekActivities]);

  // Motivational quote
  const quote = useMemo(() => {
    if (storeQuotes.length > 0) {
      const idx = Math.floor(Math.random() * storeQuotes.length);
      return { text: storeQuotes[idx].text, author: storeQuotes[idx].author };
    }
    return MOTIVATIONAL_FALLBACK;
  }, [storeQuotes]);

  // ------ Handlers ------

  const handleShare = () => {
    Alert.alert(
      'Share Report',
      `Share ${dog.name}'s Weekly Paw Report for ${weekLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => Alert.alert('Coming Soon', 'Sharing will be available in a future update.') },
      ],
    );
  };

  // ------ Stat card helper ------

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    iconColor: string,
    label: string,
    value: string,
    extra?: string,
  ) => (
    <View style={[styles.statCard, { backgroundColor: t.card }, shadows.md as object]}>
      <View style={[styles.statIconCircle, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.statCardValue, { color: t.darkText }]}>{value}</Text>
      <Text style={[styles.statCardLabel, { color: t.lightText }]}>{label}</Text>
      {extra ? <Text style={[styles.statCardExtra, { color: t.lightText }]}>{extra}</Text> : null}
    </View>
  );

  const trendIcon = walkTrend > 0 ? '\u2191' : walkTrend < 0 ? '\u2193' : '';
  const trendText = walkTrend !== 0 ? `${trendIcon}${Math.abs(walkTrend)} vs last week` : 'Same as last week';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ScreenContainer scrollable backgroundColor={t.background}>
      {/* Back button */}
      <View style={styles.headerRow}>
        <Ionicons
          name="chevron-back"
          size={28}
          color={t.darkText}
          onPress={() => navigation.goBack()}
          suppressHighlighting
        />
        <Text style={[styles.headerTitle, { color: t.darkText }]}>Weekly Paw Report</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Dog header */}
      <View style={styles.dogHeader}>
        <Avatar uri={dog.photo || undefined} name={dog.name} size={60} />
        <View style={styles.dogHeaderText}>
          <Text style={[styles.dogName, { color: t.darkText }]}>{dog.name}</Text>
          <Text style={[styles.weekRange, { color: t.lightText }]}>{weekLabel}</Text>
        </View>
      </View>

      {/* Walk Streak banner */}
      {walkStreak > 0 && (
        <LinearGradient
          colors={gradients.warm as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.streakBanner}
        >
          <Text style={styles.streakText}>
            {walkStreak}-day walk streak! {'\uD83D\uDD25'}
          </Text>
        </LinearGradient>
      )}

      {/* Stats grid 2x3 */}
      <View style={styles.statsGrid}>
        {renderStatCard('footsteps-outline', colors.accent, 'Total Walks', String(totalWalks), trendText)}
        {renderStatCard('map-outline', colors.secondary, 'Walk Distance', `${totalDistanceKm.toFixed(1)} km`, undefined)}
        {renderStatCard('time-outline', colors.primaryDark, 'Walk Time', `${totalWalkHours.toFixed(1)} hrs`, undefined)}
        {renderStatCard('restaurant-outline', colors.primary, 'Meals Logged', `${totalMeals}/${mealTarget}`, undefined)}
        {renderStatCard('water-outline', colors.secondary, 'Water Logs', String(waterLogs), undefined)}
        {renderStatCard('game-controller-outline', colors.accentDark, 'Activities', String(totalActivities), undefined)}
      </View>

      {/* Health Consistency Score */}
      <Card variant="elevated" style={styles.healthCard}>
        <Text style={[styles.sectionTitle, { color: t.darkText }]}>Health Consistency</Text>
        <ProgressRing score={healthScore} colors={t} />
      </Card>

      {/* Best Day of the Week */}
      <Card variant="default" style={styles.bestDayCard}>
        <View style={styles.bestDayInner}>
          <View style={[styles.bestDayIconWrap, { backgroundColor: colors.accent + '18' }]}>
            <Ionicons name="star" size={22} color={colors.accent} />
          </View>
          <View style={styles.bestDayTextWrap}>
            <Text style={[styles.bestDayTitle, { color: t.darkText }]}>Best Day</Text>
            <Text style={[styles.bestDayValue, { color: t.bodyText }]}>
              {bestDay.day} \u2014 {bestDay.count} activit{bestDay.count === 1 ? 'y' : 'ies'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Motivational quote */}
      <Card variant="default" style={styles.quoteCard}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={t.lightText} style={styles.quoteIcon} />
        <Text style={[styles.quoteText, { color: t.bodyText }]}>"{quote.text}"</Text>
        <Text style={[styles.quoteAuthor, { color: t.lightText }]}>\u2014 {quote.author}</Text>
      </Card>

      {/* Share button */}
      <Button title="Share Report" onPress={handleShare} variant="primary" fullWidth icon={<Ionicons name="share-outline" size={18} color={colors.white} />} />

      {/* PawLife branding footer */}
      <View style={styles.footer}>
        <Ionicons name="paw" size={16} color={t.lightText} />
        <Text style={[styles.footerText, { color: t.lightText }]}>pawlife.app</Text>
      </View>

      {/* Bottom spacer */}
      <View style={{ height: spacing.massive }} />
    </ScreenContainer>
  );
};

export default WeeklyPawReport;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  headerTitle: {
    ...typography.headline,
  },

  /* Dog header */
  dogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dogHeaderText: {
    marginLeft: spacing.base,
    flex: 1,
  },
  dogName: {
    ...typography.title2,
  },
  weekRange: {
    ...typography.subhead,
    marginTop: 2,
  },

  /* Streak banner */
  streakBanner: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  streakText: {
    ...typography.headline,
    color: '#FFFFFF',
  },

  /* Stats grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statCardValue: {
    ...typography.title2,
  },
  statCardLabel: {
    ...typography.caption1,
  },
  statCardExtra: {
    ...typography.caption2,
    marginTop: 2,
  },

  /* Section title (reusable) */
  sectionTitle: {
    ...typography.title3,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  /* Health card */
  healthCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },

  /* Progress ring */
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabelWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringScore: {
    ...typography.title1,
  },
  ringCaption: {
    ...typography.caption2,
    marginTop: 2,
  },

  /* Best day card */
  bestDayCard: {
    marginBottom: spacing.lg,
  },
  bestDayInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestDayIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestDayTextWrap: {
    marginLeft: spacing.base,
    flex: 1,
  },
  bestDayTitle: {
    ...typography.headline,
  },
  bestDayValue: {
    ...typography.subhead,
    marginTop: 2,
  },

  /* Quote card */
  quoteCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quoteIcon: {
    marginBottom: spacing.sm,
  },
  quoteText: {
    ...typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  quoteAuthor: {
    ...typography.footnote,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.caption1,
    fontWeight: '500',
  },
});
