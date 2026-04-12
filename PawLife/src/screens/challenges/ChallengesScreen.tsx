import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows, useTheme } from '../../theme';
import { ScreenContainer, Button, Badge, Card } from '../../components';

interface ChallengeData {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  duration: string;
  participants: number;
  goal: number;
  progress: number;
  joined: boolean;
  status: 'active' | 'upcoming' | 'completed';
}

const INITIAL_CHALLENGES: ChallengeData[] = [
  {
    id: '1',
    title: 'Walk-tober',
    description: '30 walks in 30 days — can you and your pup do it?',
    icon: 'footsteps',
    color: '#6BCB77',
    duration: 'Mar 1 – Mar 31',
    participants: 234,
    goal: 30,
    progress: 12,
    joined: true,
    status: 'active',
  },
  {
    id: '2',
    title: 'Hydration Hero',
    description: 'Log water 5x daily for a week. Keep your pup hydrated!',
    icon: 'water',
    color: '#4A90D9',
    duration: 'Mar 15 – Mar 22',
    participants: 156,
    goal: 7,
    progress: 3,
    joined: true,
    status: 'active',
  },
  {
    id: '3',
    title: 'Training Pro',
    description: '7 training sessions in 7 days. Teach your dog something new!',
    icon: 'school',
    color: '#9B59B6',
    duration: 'Apr 1 – Apr 7',
    participants: 89,
    goal: 7,
    progress: 0,
    joined: false,
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Pawfect Week',
    description: 'Complete all daily reminders for 7 days straight.',
    icon: 'checkmark-done-circle',
    color: '#FF8C42',
    duration: 'Mar 20 – Mar 27',
    participants: 312,
    goal: 7,
    progress: 5,
    joined: true,
    status: 'active',
  },
];

const LEADERBOARD = [
  { name: 'Sarah K.', progress: 28, avatar: 'S' },
  { name: 'Mike T.', progress: 25, avatar: 'M' },
  { name: 'You', progress: 12, avatar: 'Y' },
  { name: 'Emily R.', progress: 11, avatar: 'E' },
  { name: 'James L.', progress: 9, avatar: 'J' },
];

export const ChallengesScreen: React.FC = () => {
  const { colors: t } = useTheme();
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [detailChallenge, setDetailChallenge] = useState<ChallengeData | null>(null);
  const [challenges, setChallenges] = useState<ChallengeData[]>(INITIAL_CHALLENGES);

  const filtered = challenges.filter((c) => c.status === filter);

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? { ...c, joined: !c.joined, participants: c.joined ? c.participants - 1 : c.participants + 1 }
          : c
      )
    );
    const challenge = challenges.find((c) => c.id === challengeId);
    if (challenge && !challenge.joined) {
      Alert.alert('Joined!', `You have joined the "${challenge.title}" challenge.`);
    }
  };

  const handleShareProgress = async (challenge: ChallengeData) => {
    const pct = Math.round((challenge.progress / challenge.goal) * 100);
    const message = `I'm ${pct}% through the "${challenge.title}" challenge on PawLife! (${challenge.progress}/${challenge.goal})\n\nJoin me and track your dog's best life at pawlife.app \uD83D\uDC3E`;
    try {
      await Share.share({ message });
    } catch {
      // user cancelled
    }
  };

  const renderChallenge = ({ item }: { item: ChallengeData }) => {
    const pct = Math.round((item.progress / item.goal) * 100);
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => setDetailChallenge(item)}>
        <Card style={styles.challengeCard}>
          <View style={styles.challengeRow}>
            <View style={[styles.accentBar, { backgroundColor: item.color }]} />
            <View style={styles.challengeBody}>
              <View style={styles.challengeHeader}>
                <View style={[styles.challengeIcon, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.challengeTitle, { color: t.darkText }]}>{item.title}</Text>
                  <Text style={[styles.challengeDesc, { color: t.lightText }]} numberOfLines={2}>{item.description}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={t.lightText} />
                  <Text style={[styles.metaText, { color: t.lightText }]}>{item.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color={t.lightText} />
                  <Text style={[styles.metaText, { color: t.lightText }]}>{item.participants}</Text>
                </View>
              </View>

              {item.joined ? (
                <View style={styles.progressSection}>
                  <View style={[styles.progressBarBg, { backgroundColor: t.divider }]}>
                    <View
                      style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: item.color }]}
                    />
                  </View>
                  <Text style={[styles.progressLabel, { color: item.color }]}>
                    {item.progress}/{item.goal} · {pct}%
                  </Text>
                </View>
              ) : (
                <Button
                  title="Join Challenge"
                  onPress={() => handleJoinChallenge(item.id)}
                  size="sm"
                  variant="outline"
                  fullWidth={false}
                  style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
                />
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Challenges</Text>
        <Badge label="Premium" variant="primary" size="md" />
      </View>

      <View style={styles.filterRow}>
        {(['active', 'upcoming', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderChallenge}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.md }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No {filter} challenges</Text>
          </View>
        }
      />

      {/* Challenge Detail Modal */}
      <Modal visible={!!detailChallenge} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setDetailChallenge(null)}>
              <Ionicons name="close-circle" size={32} color={colors.lightText} />
            </TouchableOpacity>

            {detailChallenge && (
              <>
                <View style={[styles.detailIcon, { backgroundColor: detailChallenge.color + '18' }]}>
                  <Ionicons name={detailChallenge.icon} size={36} color={detailChallenge.color} />
                </View>
                <Text style={styles.detailTitle}>{detailChallenge.title}</Text>
                <Text style={styles.detailDesc}>{detailChallenge.description}</Text>

                <View style={styles.detailProgressSection}>
                  <Text style={styles.detailProgressPct}>
                    {Math.round((detailChallenge.progress / detailChallenge.goal) * 100)}%
                  </Text>
                  <View style={styles.detailProgressBarBg}>
                    <View
                      style={[
                        styles.detailProgressBarFill,
                        {
                          width: `${(detailChallenge.progress / detailChallenge.goal) * 100}%`,
                          backgroundColor: detailChallenge.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.detailProgressText}>
                    {detailChallenge.progress} of {detailChallenge.goal} completed
                  </Text>
                </View>

                <View style={styles.daysRemaining}>
                  <Ionicons name="time-outline" size={16} color={colors.lightText} />
                  <Text style={styles.daysText}>5 days remaining</Text>
                </View>

                <Text style={styles.leaderboardTitle}>Leaderboard</Text>
                {LEADERBOARD.map((user, idx) => (
                  <View key={idx} style={styles.leaderRow}>
                    <Text style={styles.leaderRank}>#{idx + 1}</Text>
                    <View style={[styles.leaderAvatar, user.name === 'You' && { backgroundColor: colors.primary }]}>
                      <Text style={styles.leaderAvatarText}>{user.avatar}</Text>
                    </View>
                    <Text style={[styles.leaderName, user.name === 'You' && { fontWeight: '700' }]}>
                      {user.name}
                    </Text>
                    <Text style={styles.leaderProgress}>{user.progress}/{detailChallenge.goal}</Text>
                  </View>
                ))}

                <Button
                  title="Share Progress"
                  onPress={() => handleShareProgress(detailChallenge)}
                  style={{ marginTop: spacing.xl }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  screenTitle: {
    ...typography.largeTitle,
    color: colors.darkText,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterPill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.subhead,
    fontWeight: '500',
    color: colors.darkText,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  challengeCard: {
    padding: 0,
    overflow: 'hidden',
  },
  challengeRow: {
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
  },
  challengeBody: {
    flex: 1,
    padding: spacing.base,
  },
  challengeHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeTitle: {
    ...typography.headline,
    color: colors.darkText,
  },
  challengeDesc: {
    ...typography.subhead,
    color: colors.lightText,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption1,
    color: colors.lightText,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    ...typography.caption1,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.subhead,
    color: colors.lightText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  detailTitle: {
    ...typography.title2,
    color: colors.darkText,
    textAlign: 'center',
  },
  detailDesc: {
    ...typography.subhead,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  detailProgressSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailProgressPct: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: spacing.sm,
  },
  detailProgressBarBg: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  detailProgressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  detailProgressText: {
    ...typography.subhead,
    color: colors.lightText,
    marginTop: spacing.sm,
  },
  daysRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  daysText: {
    ...typography.subhead,
    color: colors.lightText,
  },
  leaderboardTitle: {
    ...typography.headline,
    color: colors.darkText,
    marginBottom: spacing.md,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  leaderRank: {
    ...typography.subhead,
    fontWeight: '700',
    color: colors.lightText,
    width: 30,
  },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  leaderAvatarText: {
    ...typography.caption1,
    fontWeight: '700',
    color: colors.white,
  },
  leaderName: {
    ...typography.subhead,
    color: colors.darkText,
    flex: 1,
  },
  leaderProgress: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.lightText,
  },
});
