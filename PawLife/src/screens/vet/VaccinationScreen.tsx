import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Input, ScreenContainer, BottomSheet, Badge, EmptyState } from '../../components';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '../../theme';
import { useStore } from '../../store/useStore';
import { generateId, formatDate } from '../../utils/helpers';
import { Injection } from '../../types';

const VACCINE_TEMPLATES = [
  'Rabies',
  'DHPP',
  'Bordetella',
  'Leptospirosis',
  'Canine Influenza',
  'Lyme Disease',
] as const;

type DueStatus = 'up_to_date' | 'due_soon' | 'overdue';

const getDueStatus = (nextDueDate: string): DueStatus => {
  const due = new Date(nextDueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 30) return 'due_soon';
  return 'up_to_date';
};

const statusConfig: Record<DueStatus, { color: string; bgColor: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  up_to_date: {
    color: colors.success,
    bgColor: '#E5F7E8',
    label: 'Up to date',
    icon: 'checkmark-circle',
  },
  due_soon: {
    color: '#B8860B',
    bgColor: '#FFF8E0',
    label: 'Due soon',
    icon: 'alert-circle',
  },
  overdue: {
    color: colors.error,
    bgColor: colors.errorLight,
    label: 'Overdue',
    icon: 'warning',
  },
};

export const VaccinationScreen: React.FC = () => {
  const { injections, addInjection, selectedDogId } = useStore();

  const [sheetVisible, setSheetVisible] = useState(false);

  // Form state
  const [vaccineName, setVaccineName] = useState('');
  const [dateGiven, setDateGiven] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [vetName, setVetName] = useState('');
  const [notes, setNotes] = useState('');

  const dogInjections = useMemo(
    () =>
      injections
        .filter((i) => i.dogId === selectedDogId)
        .sort((a, b) => new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime()),
    [injections, selectedDogId],
  );

  const overdueInjections = useMemo(
    () => dogInjections.filter((i) => getDueStatus(i.nextDueDate) === 'overdue'),
    [dogInjections],
  );

  const nonOverdueInjections = useMemo(
    () => dogInjections.filter((i) => getDueStatus(i.nextDueDate) !== 'overdue'),
    [dogInjections],
  );

  const resetForm = () => {
    setVaccineName('');
    setDateGiven('');
    setNextDueDate('');
    setVetName('');
    setNotes('');
  };

  const handleTemplateSelect = (template: string) => {
    setVaccineName(template);
  };

  const handleSave = () => {
    if (!vaccineName.trim() || !dateGiven.trim() || !nextDueDate.trim()) return;

    const injection: Injection = {
      id: generateId(),
      dogId: selectedDogId || '',
      vaccineName: vaccineName.trim(),
      dateGiven: new Date(dateGiven.trim()).toISOString(),
      nextDueDate: new Date(nextDueDate.trim()).toISOString(),
      vetName: vetName.trim(),
      notes: notes.trim() || undefined,
    };

    addInjection(injection);
    resetForm();
    setSheetVisible(false);
  };

  const renderTimelineEntry = (injection: Injection, index: number, isLast: boolean) => {
    const status = getDueStatus(injection.nextDueDate);
    const config = statusConfig[status];

    return (
      <View key={injection.id} style={styles.timelineEntry}>
        {/* Timeline connector */}
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Card content */}
        <Card style={styles.timelineCard} variant="elevated">
          <View style={styles.cardTopRow}>
            <Text style={styles.vaccineName}>{injection.vaccineName}</Text>
            <View style={[styles.statusChip, { backgroundColor: config.bgColor }]}>
              <Ionicons name={config.icon} size={12} color={config.color} />
              <Text style={[styles.statusChipText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>

          <View style={styles.cardInfoRows}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.lightText} />
              <Text style={styles.infoLabel}>Given:</Text>
              <Text style={styles.infoValue}>{formatDate(injection.dateGiven)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color={config.color} />
              <Text style={styles.infoLabel}>Next due:</Text>
              <Text style={[styles.infoValue, { color: config.color, fontWeight: '600' }]}>
                {formatDate(injection.nextDueDate)}
              </Text>
            </View>

            {injection.vetName ? (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color={colors.lightText} />
                <Text style={styles.infoLabel}>Vet:</Text>
                <Text style={styles.infoValue}>{injection.vetName}</Text>
              </View>
            ) : null}
          </View>

          {injection.notes ? (
            <View style={styles.cardNotes}>
              <Text style={styles.cardNotesText} numberOfLines={2}>
                {injection.notes}
              </Text>
            </View>
          ) : null}
        </Card>
      </View>
    );
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Vaccinations</Text>
        <TouchableOpacity
          style={styles.addHeaderButton}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScreenContainer scrollable padded style={styles.content}>
        {dogInjections.length === 0 ? (
          <EmptyState
            icon="fitness-outline"
            title="No Vaccinations Logged"
            subtitle="Keep track of your dog's vaccination history and never miss a booster."
            actionTitle="Add Vaccination"
            onAction={() => setSheetVisible(true)}
          />
        ) : (
          <>
            {/* Overdue Section */}
            {overdueInjections.length > 0 && (
              <View style={styles.overdueSection}>
                <LinearGradient
                  colors={['#FFF0F0', '#FFE5E5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.overdueHeader}
                >
                  <View style={styles.overdueIconWrap}>
                    <Ionicons name="warning" size={20} color={colors.error} />
                  </View>
                  <View style={styles.overdueTextGroup}>
                    <Text style={styles.overdueTitle}>
                      {overdueInjections.length} Overdue Vaccination{overdueInjections.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.overdueSubtitle}>
                      Schedule a vet visit as soon as possible
                    </Text>
                  </View>
                </LinearGradient>

                {overdueInjections.map((injection, index) =>
                  renderTimelineEntry(injection, index, index === overdueInjections.length - 1 && nonOverdueInjections.length === 0),
                )}
              </View>
            )}

            {/* All Other Vaccinations Timeline */}
            {nonOverdueInjections.length > 0 && (
              <View style={styles.timelineSection}>
                {overdueInjections.length > 0 && (
                  <Text style={styles.sectionLabel}>Vaccination History</Text>
                )}
                {nonOverdueInjections.map((injection, index) =>
                  renderTimelineEntry(injection, index, index === nonOverdueInjections.length - 1),
                )}
              </View>
            )}
          </>
        )}
        <View style={styles.bottomSpacer} />
      </ScreenContainer>

      {/* Bottom Sheet - Add Vaccination */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => {
          setSheetVisible(false);
          resetForm();
        }}
        title="Add Vaccination"
      >
        {/* Quick Templates */}
        <Text style={styles.fieldLabel}>Quick Select</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.templateScroll}
          contentContainerStyle={styles.templateScrollContent}
        >
          {VACCINE_TEMPLATES.map((template) => {
            const isSelected = vaccineName === template;
            return (
              <TouchableOpacity
                key={template}
                style={[styles.templateChip, isSelected && styles.templateChipActive]}
                onPress={() => handleTemplateSelect(template)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="fitness-outline"
                  size={14}
                  color={isSelected ? colors.white : colors.secondary}
                />
                <Text style={[styles.templateChipText, isSelected && styles.templateChipTextActive]}>
                  {template}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input
          label="Vaccine Name"
          icon="fitness-outline"
          placeholder="Enter vaccine name"
          value={vaccineName}
          onChangeText={setVaccineName}
        />

        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Input
              label="Date Given"
              icon="calendar-outline"
              placeholder="Mar 15, 2026"
              value={dateGiven}
              onChangeText={setDateGiven}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Next Due Date"
              icon="time-outline"
              placeholder="Mar 15, 2027"
              value={nextDueDate}
              onChangeText={setNextDueDate}
            />
          </View>
        </View>

        <Input
          label="Vet Name"
          icon="person-outline"
          placeholder="Dr. Smith"
          value={vetName}
          onChangeText={setVetName}
        />

        {/* Notes */}
        <Text style={styles.fieldLabel}>Notes</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Batch number, reactions, etc..."
            placeholderTextColor={colors.placeholderText}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Save Vaccination"
            onPress={handleSave}
            disabled={!vaccineName.trim() || !dateGiven.trim() || !nextDueDate.trim()}
            size="lg"
          />
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  screenTitle: {
    ...typography.title2,
    color: colors.darkText,
  },
  addHeaderButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },

  // Overdue section
  overdueSection: {
    marginBottom: spacing.lg,
  },
  overdueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  overdueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  overdueTextGroup: {
    flex: 1,
  },
  overdueTitle: {
    ...typography.headline,
    color: colors.error,
    marginBottom: 2,
  },
  overdueSubtitle: {
    ...typography.footnote,
    color: colors.error,
    opacity: 0.8,
  },

  // Timeline
  timelineSection: {
    marginBottom: spacing.base,
  },
  sectionLabel: {
    ...typography.headline,
    color: colors.darkText,
    marginBottom: spacing.md,
  },
  timelineEntry: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineLeft: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.white,
    zIndex: 1,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: -2,
  },
  timelineCard: {
    flex: 1,
    marginLeft: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  vaccineName: {
    ...typography.headline,
    color: colors.darkText,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusChipText: {
    ...typography.caption2,
    fontWeight: '600',
  },
  cardInfoRows: {
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.footnote,
    color: colors.lightText,
  },
  infoValue: {
    ...typography.footnote,
    color: colors.bodyText,
    fontWeight: '500',
  },
  cardNotes: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  cardNotesText: {
    ...typography.footnote,
    color: colors.lightText,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: spacing.huge,
  },

  // Form styles
  fieldLabel: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: spacing.sm,
  },
  templateScroll: {
    marginBottom: spacing.base,
    marginHorizontal: -spacing.lg,
  },
  templateScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#E8F1FB',
    borderWidth: 1.5,
    borderColor: colors.transparent,
  },
  templateChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondaryDark,
  },
  templateChipText: {
    ...typography.footnote,
    fontWeight: '500',
    color: colors.secondary,
  },
  templateChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  textAreaContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.base,
    minHeight: 88,
  },
  textArea: {
    ...typography.body,
    color: colors.darkText,
    minHeight: 64,
  },
  saveButtonContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
});
