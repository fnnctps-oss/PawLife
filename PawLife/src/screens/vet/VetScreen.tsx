import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Input, ScreenContainer, BottomSheet, Badge, EmptyState } from '../../components';
import { colors, gradients, spacing, typography, borderRadius, shadows, useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import { generateId, formatDate } from '../../utils/helpers';
import { VetAppointment } from '../../types';

type AppointmentReason = 'Checkup' | 'Vaccination' | 'Illness' | 'Surgery' | 'Dental' | 'Other';
type TabType = 'upcoming' | 'past';

const reasonBadgeVariant: Record<AppointmentReason, 'primary' | 'secondary' | 'accent' | 'error' | 'warning' | 'muted'> = {
  Checkup: 'accent',
  Vaccination: 'secondary',
  Illness: 'error',
  Surgery: 'warning',
  Dental: 'primary',
  Other: 'muted',
};

const reasonIcons: Record<AppointmentReason, keyof typeof Ionicons.glyphMap> = {
  Checkup: 'checkmark-circle-outline',
  Vaccination: 'fitness-outline',
  Illness: 'thermometer-outline',
  Surgery: 'cut-outline',
  Dental: 'happy-outline',
  Other: 'ellipsis-horizontal-circle-outline',
};

const REASONS: AppointmentReason[] = ['Checkup', 'Vaccination', 'Illness', 'Surgery', 'Dental', 'Other'];

export const VetScreen: React.FC = () => {
  const { colors: t } = useTheme();
  const { vetAppointments, addVetAppointment, selectedDogId } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [sheetVisible, setSheetVisible] = useState(false);

  // Form state
  const [vetName, setVetName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [selectedReason, setSelectedReason] = useState<AppointmentReason>('Checkup');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const dogAppointments = useMemo(
    () => vetAppointments.filter((a) => a.dogId === selectedDogId),
    [vetAppointments, selectedDogId],
  );

  const now = new Date();

  const upcomingAppointments = useMemo(
    () =>
      dogAppointments
        .filter((a) => new Date(a.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [dogAppointments],
  );

  const pastAppointments = useMemo(
    () =>
      dogAppointments
        .filter((a) => new Date(a.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [dogAppointments],
  );

  const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  const resetForm = () => {
    setVetName('');
    setClinicName('');
    setDateText('');
    setTimeText('');
    setSelectedReason('Checkup');
    setNotes('');
    setReminderEnabled(true);
  };

  const handleSave = () => {
    if (!vetName.trim() || !clinicName.trim() || !dateText.trim()) return;

    const dateString = timeText.trim()
      ? `${dateText.trim()} ${timeText.trim()}`
      : dateText.trim();

    const appointment: VetAppointment = {
      id: generateId(),
      dogId: selectedDogId || '',
      vetName: vetName.trim(),
      clinicName: clinicName.trim(),
      date: new Date(dateString).toISOString(),
      reason: selectedReason,
      notes: notes.trim() || undefined,
      reminderSet: reminderEnabled,
    };

    addVetAppointment(appointment);
    resetForm();
    setSheetVisible(false);
  };

  const formatAppointmentTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRelativeDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      return 'Today';
    }
    if (
      d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate()
    ) {
      return 'Tomorrow';
    }
    return formatDate(date);
  };

  const renderAppointmentCard = (appointment: VetAppointment) => {
    const isUpcoming = new Date(appointment.date) >= now;
    const reason = appointment.reason as AppointmentReason;
    const variant = reasonBadgeVariant[reason] || 'muted';
    const icon = reasonIcons[reason] || 'ellipsis-horizontal-circle-outline';

    return (
      <Card key={appointment.id} style={styles.appointmentCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.statusDot, { backgroundColor: isUpcoming ? colors.secondary : colors.placeholderText }]} />
            <View style={styles.cardTitleGroup}>
              <Text style={[styles.vetName, { color: t.darkText }]} numberOfLines={1}>
                {appointment.vetName}
              </Text>
              <Text style={[styles.clinicName, { color: t.lightText }]} numberOfLines={1}>
                {appointment.clinicName}
              </Text>
            </View>
          </View>
          <Badge label={reason} variant={variant} size="sm" />
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={t.lightText} />
            <Text style={[styles.detailText, { color: t.bodyText }]}>{getRelativeDate(appointment.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={t.lightText} />
            <Text style={[styles.detailText, { color: t.bodyText }]}>{formatAppointmentTime(appointment.date)}</Text>
          </View>
        </View>

        {appointment.notes && (
          <View style={styles.notesRow}>
            <Ionicons name="document-text-outline" size={14} color={t.lightText} />
            <Text style={[styles.notesText, { color: t.lightText }]} numberOfLines={2}>
              {appointment.notes}
            </Text>
          </View>
        )}

        {appointment.reminderSet && isUpcoming && (
          <View style={styles.reminderIndicator}>
            <Ionicons name="notifications-outline" size={13} color={colors.primary} />
            <Text style={styles.reminderText}>Reminder set</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScreenContainer scrollable={false} padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: t.darkText }]}>Vet Appointments</Text>
        <TouchableOpacity
          style={styles.addHeaderButton}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Segment Control */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentControl, { backgroundColor: t.divider }]}>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'upcoming' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.7}
          >
            {activeTab === 'upcoming' ? (
              <LinearGradient
                colors={gradients.warm as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.segmentGradient}
              >
                <Text style={styles.segmentTextActive}>Upcoming</Text>
              </LinearGradient>
            ) : (
              <Text style={[styles.segmentText, { color: t.lightText }]}>Upcoming</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'past' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('past')}
            activeOpacity={0.7}
          >
            {activeTab === 'past' ? (
              <LinearGradient
                colors={gradients.warm as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.segmentGradient}
              >
                <Text style={styles.segmentTextActive}>Past</Text>
              </LinearGradient>
            ) : (
              <Text style={[styles.segmentText, { color: t.lightText }]}>Past</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScreenContainer scrollable padded style={styles.listContent}>
        {displayedAppointments.length === 0 ? (
          <EmptyState
            icon="medical-outline"
            title={activeTab === 'upcoming' ? 'No Upcoming Appointments' : 'No Past Appointments'}
            subtitle={
              activeTab === 'upcoming'
                ? 'Schedule a vet visit to keep your pup healthy and happy.'
                : 'Your past vet visits will appear here.'
            }
            actionTitle={activeTab === 'upcoming' ? 'Add Appointment' : undefined}
            onAction={activeTab === 'upcoming' ? () => setSheetVisible(true) : undefined}
          />
        ) : (
          displayedAppointments.map(renderAppointmentCard)
        )}
        <View style={styles.bottomSpacer} />
      </ScreenContainer>

      {/* Bottom Sheet - Add Appointment */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => {
          setSheetVisible(false);
          resetForm();
        }}
        title="New Appointment"
      >
        <Input
          label="Vet Name"
          icon="person-outline"
          placeholder="Dr. Smith"
          value={vetName}
          onChangeText={setVetName}
        />

        <Input
          label="Clinic Name"
          icon="business-outline"
          placeholder="Happy Paws Veterinary"
          value={clinicName}
          onChangeText={setClinicName}
        />

        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Input
              label="Date"
              icon="calendar-outline"
              placeholder="Mar 15, 2026"
              value={dateText}
              onChangeText={setDateText}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Time"
              icon="time-outline"
              placeholder="2:30 PM"
              value={timeText}
              onChangeText={setTimeText}
            />
          </View>
        </View>

        {/* Reason Selector Pills */}
        <Text style={[styles.fieldLabel, { color: t.darkText }]}>Reason</Text>
        <View style={styles.reasonPills}>
          {REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            const icon = reasonIcons[reason];
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonPill, { backgroundColor: t.divider }, isSelected && styles.reasonPillActive]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={icon}
                  size={14}
                  color={isSelected ? colors.white : t.bodyText}
                />
                <Text style={[styles.reasonPillText, { color: t.bodyText }, isSelected && styles.reasonPillTextActive]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes */}
        <Text style={[styles.fieldLabel, { color: t.darkText }]}>Notes</Text>
        <View style={[styles.textAreaContainer, { backgroundColor: t.card, borderColor: t.border }]}>
          <TextInput
            style={[styles.textArea, { color: t.darkText }]}
            placeholder="Any details or concerns..."
            placeholderTextColor={colors.placeholderText}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Reminder Toggle */}
        <View style={[styles.reminderToggleRow, { backgroundColor: t.divider }]}>
          <View style={styles.reminderToggleLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={[styles.reminderToggleLabel, { color: t.darkText }]}>Set Reminder</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={reminderEnabled ? colors.primary : colors.placeholderText}
          />
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Save Appointment"
            onPress={handleSave}
            disabled={!vetName.trim() || !clinicName.trim() || !dateText.trim()}
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
  },
  addHeaderButton: {
    padding: spacing.xs,
  },
  segmentContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  segmentControl: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  segmentButtonActive: {
    overflow: 'hidden',
  },
  segmentGradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  segmentText: {
    ...typography.subhead,
    fontWeight: '500',
  },
  segmentTextActive: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.white,
  },
  listContent: {
    flex: 1,
    paddingTop: 0,
  },
  appointmentCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
    marginTop: 3,
  },
  cardTitleGroup: {
    flex: 1,
  },
  vetName: {
    ...typography.headline,
    marginBottom: 2,
  },
  clinicName: {
    ...typography.footnote,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginLeft: spacing.xl + spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.subhead,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginLeft: spacing.xl + spacing.xs,
  },
  notesText: {
    ...typography.footnote,
    flex: 1,
  },
  reminderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    marginLeft: spacing.xl + spacing.xs,
  },
  reminderText: {
    ...typography.caption2,
    color: colors.primary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: spacing.huge,
  },
  // Form styles
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.subhead,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  reasonPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.transparent,
  },
  reasonPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  reasonPillText: {
    ...typography.footnote,
    fontWeight: '500',
  },
  reasonPillTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  textAreaContainer: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.base,
    minHeight: 88,
  },
  textArea: {
    ...typography.body,
    minHeight: 64,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  reminderToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reminderToggleLabel: {
    ...typography.callout,
    fontWeight: '500',
  },
  saveButtonContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
});
