import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../../theme';
import { ScreenContainer, Button, Card } from '../../components';
import { useStore } from '../../store/useStore';

interface MilestoneData {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  achieved: boolean;
  progress?: string;
  date?: string;
}

const MILESTONES: MilestoneData[] = [
  { id: '1', title: 'First Walk!', icon: 'footsteps', gradient: ['#6BCB77', '#4FB85A'], achieved: true, date: 'Mar 1, 2026' },
  { id: '2', title: '10 Walks', icon: 'walk', gradient: ['#6BCB77', '#34A853'], achieved: true, date: 'Mar 10, 2026' },
  { id: '3', title: '50 Walks', icon: 'trophy', gradient: ['#FFB347', '#FF8C42'], achieved: false, progress: '32/50' },
  { id: '4', title: '100 Walks', icon: 'medal', gradient: ['#FF8C42', '#E07030'], achieved: false, progress: '32/100' },
  { id: '5', title: '7-Day Streak', icon: 'flame', gradient: ['#FF6B6B', '#FF4D4D'], achieved: true, date: 'Mar 15, 2026' },
  { id: '6', title: '30-Day Streak', icon: 'bonfire', gradient: ['#FF4D4D', '#CC0000'], achieved: false, progress: '12/30' },
  { id: '7', title: '1 Month Together', icon: 'heart', gradient: ['#E91E63', '#C2185B'], achieved: true, date: 'Mar 1, 2026' },
  { id: '8', title: '6 Months Together', icon: 'heart-circle', gradient: ['#9B59B6', '#8E44AD'], achieved: false },
  { id: '9', title: '1 Year Together', icon: 'star', gradient: ['#FFD700', '#FFA000'], achieved: false },
  { id: '10', title: 'Vaccinations Complete', icon: 'shield-checkmark', gradient: ['#00BCD4', '#0097A7'], achieved: false },
  { id: '11', title: '100 Activities', icon: 'ribbon', gradient: ['#4A90D9', '#3570B0'], achieved: false, progress: '47/100' },
  { id: '12', title: 'First Vet Visit', icon: 'medical', gradient: ['#00BCD4', '#00838F'], achieved: true, date: 'Mar 5, 2026' },
  { id: '13', title: 'Birthday!', icon: 'gift', gradient: ['#FF8C42', '#FFB347'], achieved: false },
];

export const MilestonesScreen: React.FC = () => {
  const { dogs, selectedDogId } = useStore();
  const [shareModal, setShareModal] = useState<MilestoneData | null>(null);
  const dog = dogs.find((d) => d.id === selectedDogId);

  const achieved = MILESTONES.filter((m) => m.achieved);
  const upcoming = MILESTONES.filter((m) => !m.achieved);

  const renderMilestoneCard = (milestone: MilestoneData) => (
    <TouchableOpacity
      key={milestone.id}
      style={styles.milestoneCard}
      activeOpacity={milestone.achieved ? 0.8 : 1}
      onPress={() => milestone.achieved && setShareModal(milestone)}
    >
      {milestone.achieved ? (
        <LinearGradient
          colors={milestone.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={milestone.icon} size={28} color={colors.white} />
          </View>
          <Text style={styles.cardTitle}>{milestone.title}</Text>
          <Text style={styles.cardDate}>{milestone.date}</Text>
          <View style={styles.shareHint}>
            <Ionicons name="share-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.shareHintText}>Share</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.lockedCard}>
          <View style={styles.lockedIcon}>
            <Ionicons name={milestone.icon} size={28} color={colors.border} />
          </View>
          <Text style={styles.lockedTitle}>{milestone.title}</Text>
          {milestone.progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(parseInt(milestone.progress.split('/')[0]) / parseInt(milestone.progress.split('/')[1])) * 100}%`,
                      backgroundColor: milestone.gradient[0],
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{milestone.progress}</Text>
            </View>
          )}
          {!milestone.progress && (
            <Ionicons name="lock-closed-outline" size={16} color={colors.lightText} style={{ marginTop: 4 }} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Milestones</Text>
        <Text style={styles.subtitle}>{dog?.name || 'Your Dog'}'s Achievements</Text>
      </View>

      <Text style={styles.sectionTitle}>
        Achieved ({achieved.length})
      </Text>
      <View style={styles.grid}>
        {achieved.map(renderMilestoneCard)}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
        Upcoming ({upcoming.length})
      </Text>
      <View style={styles.grid}>
        {upcoming.map(renderMilestoneCard)}
      </View>

      <View style={{ height: spacing.xxxl }} />

      {/* Share Card Modal */}
      <Modal visible={!!shareModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShareModal(null)}>
              <Ionicons name="close-circle" size={32} color={colors.lightText} />
            </TouchableOpacity>

            {shareModal && (
              <LinearGradient
                colors={shareModal.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shareCard}
              >
                <View style={styles.shareAvatar}>
                  <Text style={styles.shareAvatarText}>
                    {(dog?.name || 'D')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.shareDogName}>{dog?.name || 'Your Dog'}</Text>
                <View style={styles.shareTrophyRow}>
                  <Ionicons name="trophy" size={24} color={colors.white} />
                  <Text style={styles.shareMilestoneTitle}>{shareModal.title}</Text>
                </View>
                <Text style={styles.shareQuote}>
                  "Dogs are not our whole life, but they make our lives whole."
                </Text>
                <Text style={styles.shareQuoteAuthor}>— Roger Caras</Text>
                <Text style={styles.shareDate}>{shareModal.date}</Text>
                <View style={styles.shareBranding}>
                  <Ionicons name="paw" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.shareBrandText}>
                    Track your dog's best life — pawlife.app
                  </Text>
                </View>
              </LinearGradient>
            )}

            <View style={styles.shareButtons}>
              <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Copied to clipboard!')}>
                <Ionicons name="copy-outline" size={22} color={colors.darkText} />
                <Text style={styles.shareBtnText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Saved to gallery!')}>
                <Ionicons name="download-outline" size={22} color={colors.darkText} />
                <Text style={styles.shareBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Share sheet would open!')}>
                <Ionicons name="share-outline" size={22} color={colors.darkText} />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  screenTitle: {
    ...typography.largeTitle,
    color: colors.darkText,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.lightText,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.darkText,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  milestoneCard: {
    width: '48.5%' as any,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.base,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.white,
    textAlign: 'center',
  },
  cardDate: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  shareHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  shareHintText: {
    ...typography.caption2,
    color: 'rgba(255,255,255,0.7)',
  },
  lockedCard: {
    padding: spacing.base,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  lockedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  lockedTitle: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.lightText,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption2,
    color: colors.lightText,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  shareCard: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  shareAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  shareAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  shareDogName: {
    ...typography.title2,
    color: colors.white,
    marginBottom: spacing.md,
  },
  shareTrophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  shareMilestoneTitle: {
    ...typography.title3,
    color: colors.white,
  },
  shareQuote: {
    ...typography.subhead,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  shareQuoteAuthor: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    marginBottom: spacing.base,
  },
  shareDate: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.base,
  },
  shareBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
    justifyContent: 'center',
  },
  shareBrandText: {
    ...typography.caption2,
    color: 'rgba(255,255,255,0.6)',
  },
  shareButtons: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  shareBtn: {
    alignItems: 'center',
    gap: 4,
  },
  shareBtnText: {
    ...typography.caption1,
    color: colors.darkText,
  },
});
