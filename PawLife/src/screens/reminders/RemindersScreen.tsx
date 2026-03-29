import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows, useTheme } from '../../theme';
import { Button, Input, Card, ScreenContainer, BottomSheet, EmptyState } from '../../components';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/helpers';
import { ReminderType, RepeatPattern } from '../../types';

const REMINDER_TYPES: { key: ReminderType; label: string; icon: string; color: string }[] = [
  { key: 'food', label: 'Food', icon: 'restaurant-outline', color: '#FF8C42' },
  { key: 'water', label: 'Water', icon: 'water-outline', color: '#4A90D9' },
  { key: 'walk', label: 'Walk', icon: 'footsteps-outline', color: '#6BCB77' },
  { key: 'vet', label: 'Vet', icon: 'medical-outline', color: '#00BCD4' },
  { key: 'injection', label: 'Injection', icon: 'fitness-outline', color: '#FF6B6B' },
  { key: 'medicine', label: 'Medicine', icon: 'medkit-outline', color: '#FF4D4D' },
  { key: 'grooming', label: 'Grooming', icon: 'cut-outline', color: '#E91E63' },
  { key: 'custom', label: 'Custom', icon: 'add-circle-outline', color: '#8E8E93' },
];

const REPEAT_OPTIONS: { key: RepeatPattern; label: string }[] = [
  { key: 'once', label: 'Once' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const TEMPLATES = [
  { title: 'Morning Walk', type: 'walk' as ReminderType, time: '7:00 AM', repeat: 'daily' as RepeatPattern },
  { title: 'Breakfast', type: 'food' as ReminderType, time: '8:00 AM', repeat: 'daily' as RepeatPattern },
  { title: 'Evening Walk', type: 'walk' as ReminderType, time: '5:30 PM', repeat: 'daily' as RepeatPattern },
  { title: 'Dinner', type: 'food' as ReminderType, time: '6:00 PM', repeat: 'daily' as RepeatPattern },
  { title: 'Water Check', type: 'water' as ReminderType, time: 'Every 3h', repeat: 'daily' as RepeatPattern },
];

export const RemindersScreen: React.FC = () => {
  const { colors: t } = useTheme();
  const { reminders, addReminder, updateReminder, removeReminder, selectedDogId } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState<ReminderType>('food');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [repeatPattern, setRepeatPattern] = useState<RepeatPattern>('daily');

  const dogReminders = reminders.filter((r) => r.dogId === selectedDogId);

  const getTypeInfo = (type: ReminderType) =>
    REMINDER_TYPES.find((t) => t.key === type) || REMINDER_TYPES[7];

  const handleAddReminder = () => {
    if (!selectedDogId || !title.trim() || !time.trim()) return;
    addReminder({
      id: generateId(),
      dogId: selectedDogId,
      type: selectedType,
      title: title.trim(),
      time: time.trim(),
      repeatPattern,
      enabled: true,
    });
    resetForm();
    setShowAdd(false);
  };

  const handleQuickAdd = (template: typeof TEMPLATES[0]) => {
    if (!selectedDogId) return;
    addReminder({
      id: generateId(),
      dogId: selectedDogId,
      type: template.type,
      title: template.title,
      time: template.time,
      repeatPattern: template.repeat,
      enabled: true,
    });
  };

  const resetForm = () => {
    setSelectedType('food');
    setTitle('');
    setTime('');
    setRepeatPattern('daily');
  };

  const openAddSheet = () => {
    resetForm();
    setShowAdd(true);
  };

  const renderReminderItem = ({ item }: any) => {
    const typeInfo = getTypeInfo(item.type);
    return (
      <Card style={styles.reminderCard}>
        <View style={styles.reminderRow}>
          <View style={[styles.reminderIcon, { backgroundColor: typeInfo.color + '18' }]}>
            <Ionicons name={typeInfo.icon as any} size={22} color={typeInfo.color} />
          </View>
          <View style={styles.reminderInfo}>
            <Text style={[styles.reminderTitle, { color: t.darkText }]}>{item.title}</Text>
            <View style={styles.reminderMeta}>
              <Text style={[styles.reminderTime, { color: t.lightText }]}>{item.time}</Text>
              <View style={[styles.repeatBadge, { backgroundColor: typeInfo.color + '15' }]}>
                <Text style={[styles.repeatText, { color: typeInfo.color }]}>
                  {item.repeatPattern.charAt(0).toUpperCase() + item.repeatPattern.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={(val) => updateReminder(item.id, { enabled: val })}
            trackColor={{ false: t.border, true: t.primaryLight }}
            thumbColor={item.enabled ? t.primary : '#f4f3f4'}
          />
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: t.darkText }]}>Reminders</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddSheet}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {dogReminders.length === 0 ? (
        <>
          <EmptyState
            icon="notifications-outline"
            title="No Reminders Yet"
            subtitle="Set up reminders so you never miss a meal, walk, or vet visit."
            actionTitle="Add Reminder"
            onAction={openAddSheet}
          />
          <Text style={[styles.sectionTitle, { color: t.darkText }]}>Quick Add</Text>
          <View style={styles.templateGrid}>
            {TEMPLATES.map((tpl, idx) => {
              const typeInfo = getTypeInfo(tpl.type);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.templateCard, { backgroundColor: t.card }]}
                  onPress={() => handleQuickAdd(tpl)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: typeInfo.color + '18' }]}>
                    <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                  </View>
                  <Text style={[styles.templateTitle, { color: t.darkText }]}>{tpl.title}</Text>
                  <Text style={[styles.templateTime, { color: t.lightText }]}>{tpl.time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : (
        <FlatList
          data={dogReminders}
          keyExtractor={(item) => item.id}
          renderItem={renderReminderItem}
          scrollEnabled={false}
          contentContainerStyle={{ gap: spacing.sm }}
          ListFooterComponent={
            <View style={{ marginTop: spacing.xl }}>
              <Text style={[styles.sectionTitle, { color: t.darkText }]}>Quick Add</Text>
              <View style={styles.templateGrid}>
                {TEMPLATES.map((tpl, idx) => {
                  const typeInfo = getTypeInfo(tpl.type);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.templateCard, { backgroundColor: t.card }]}
                      onPress={() => handleQuickAdd(tpl)}
                    >
                      <View style={[styles.templateIcon, { backgroundColor: typeInfo.color + '18' }]}>
                        <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                      </View>
                      <Text style={[styles.templateTitle, { color: t.darkText }]}>{tpl.title}</Text>
                      <Text style={[styles.templateTime, { color: t.lightText }]}>{tpl.time}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          }
        />
      )}

      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)} title="New Reminder">
        <Text style={[styles.fieldLabel, { color: t.darkText }]}>Type</Text>
        <View style={styles.typeGrid}>
          {REMINDER_TYPES.map((rt) => (
            <TouchableOpacity
              key={rt.key}
              style={[
                styles.typeChip,
                { backgroundColor: t.card, borderColor: t.border },
                selectedType === rt.key && { backgroundColor: rt.color, borderColor: rt.color },
              ]}
              onPress={() => {
                setSelectedType(rt.key);
                if (!title) setTitle(rt.label + ' Reminder');
              }}
            >
              <Ionicons
                name={rt.icon as any}
                size={16}
                color={selectedType === rt.key ? colors.white : rt.color}
              />
              <Text
                style={[
                  styles.typeChipText,
                  { color: t.darkText },
                  selectedType === rt.key && { color: colors.white },
                ]}
              >
                {rt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Title"
          placeholder="Reminder title"
          value={title}
          onChangeText={setTitle}
          icon="create-outline"
        />
        <Input
          label="Time"
          placeholder="e.g., 8:00 AM"
          value={time}
          onChangeText={setTime}
          icon="time-outline"
        />

        <Text style={[styles.fieldLabel, { color: t.darkText }]}>Repeat</Text>
        <View style={styles.repeatRow}>
          {REPEAT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.repeatPill,
                { backgroundColor: t.card, borderColor: t.border },
                repeatPattern === opt.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setRepeatPattern(opt.key)}
            >
              <Text
                style={[
                  styles.repeatPillText,
                  { color: t.darkText },
                  repeatPattern === opt.key && { color: colors.white },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Save Reminder"
          onPress={handleAddReminder}
          style={{ marginTop: spacing.lg }}
        />
      </BottomSheet>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  screenTitle: {
    ...typography.largeTitle,
    color: colors.darkText,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.darkText,
    marginBottom: spacing.md,
  },
  reminderCard: {
    padding: spacing.base,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    ...typography.headline,
    color: colors.darkText,
    marginBottom: 2,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reminderTime: {
    ...typography.subhead,
    color: colors.lightText,
  },
  repeatBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  repeatText: {
    ...typography.caption2,
    fontWeight: '600',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  templateCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '48%' as any,
    ...shadows.sm,
  },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  templateTitle: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.darkText,
  },
  templateTime: {
    ...typography.caption1,
    color: colors.lightText,
    marginTop: 2,
  },
  fieldLabel: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  typeChipText: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.darkText,
  },
  repeatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  repeatPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  repeatPillText: {
    ...typography.caption1,
    fontWeight: '500',
    color: colors.darkText,
  },
});
