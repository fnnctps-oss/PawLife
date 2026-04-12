import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows, useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/helpers';
import { ActivityType } from '../../types';
import { useWalkTracker } from '../../hooks/useWalkTracker';
import { pickImageFromLibrary, takePhoto, showImagePickerAlert } from '../../utils/imagePicker';

interface LogActivitySheetProps {
  activityType: ActivityType;
  onClose: () => void;
  onSave: () => void;
}

interface ActivityTypeOption {
  type: ActivityType;
  label: string;
  icon: string;
  color: string;
  tint: string;
}

const ACTIVITY_TYPES: ActivityTypeOption[] = [
  { type: 'walk', label: 'Walk', icon: 'footsteps', color: '#F59E0B', tint: '#FEF3C7' },
  { type: 'food', label: 'Food', icon: 'restaurant', color: '#F97316', tint: '#FFF7ED' },
  { type: 'water', label: 'Water', icon: 'water', color: '#3B82F6', tint: '#EFF6FF' },
  { type: 'play', label: 'Play', icon: 'game-controller', color: '#8B5CF6', tint: '#F5F3FF' },
  { type: 'medicine', label: 'Medicine', icon: 'medkit', color: '#F43F5E', tint: '#FFF1F2' },
];

const QUOTES = [
  '"The world would be a nicer place if everyone had the ability to love as unconditionally as a dog." — M.K. Clinton',
  '"Dogs are not our whole life, but they make our lives whole." — Roger Caras',
  '"The bond with a true dog is as lasting as the ties of this earth will ever be." — Konrad Lorenz',
  '"Happiness is a warm puppy." — Charles M. Schulz',
  '"Dogs do speak, but only to those who know how to listen." — Orhan Pamuk',
];

export const LogActivitySheet: React.FC<LogActivitySheetProps> = ({
  activityType,
  onClose,
  onSave,
}) => {
  const { colors: t } = useTheme();
  const { addActivity, selectedDogId } = useStore();

  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState<'small' | 'medium' | 'large'>('medium');
  const [walkDistance, setWalkDistance] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const walkTracker = useWalkTracker();

  const currentType = selectedType;

  const getCurrentTypeOption = (): ActivityTypeOption | undefined => {
    return ACTIVITY_TYPES.find((a) => a.type === currentType);
  };

  const handleAddPhoto = () => {
    showImagePickerAlert(
      async () => {
        const uri = await takePhoto();
        if (uri) setPhotoUri(uri);
      },
      async () => {
        const uri = await pickImageFromLibrary();
        if (uri) setPhotoUri(uri);
      },
    );
  };

  const handleSave = () => {
    if (!selectedDogId) {
      Alert.alert('No dog selected', 'Please add a dog first.');
      return;
    }
    if (!currentType) return;

    const activity = {
      id: generateId(),
      dogId: selectedDogId,
      type: currentType,
      timestamp: new Date().toISOString(),
      notes: notes || undefined,
      sharedToSocial: false,
      duration: duration ? parseInt(duration, 10) : undefined,
      waterAmount:
        currentType === 'water'
          ? (amount as 'small' | 'medium' | 'full')
          : undefined,
      portion:
        currentType === 'food'
          ? (amount as 'small' | 'medium' | 'large')
          : undefined,
      photo: photoUri || undefined,
    };

    addActivity(activity);
    setSaved(true);
  };

  const typeOption = getCurrentTypeOption();
  const accentColor = typeOption?.color ?? '#F59E0B';

  // --- Saved confirmation ---
  if (saved) {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return (
      <View style={styles.savedContainer}>
        <View style={[styles.savedIconBg, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name="checkmark-circle" size={56} color={accentColor} />
        </View>
        <Text style={[styles.savedTitle, { color: t.darkText }]}>Activity Logged!</Text>
        <Text style={[styles.savedQuote, { color: t.lightText }]}>{randomQuote}</Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: t.darkText, marginTop: spacing.xl }]}
          onPress={onSave}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveButtonText, { color: t.surface }]}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Activity type grid (step 1) ---
  if (selectedType === null) {
    return (
      <View style={styles.container}>
        <Text style={[styles.headerTitle, { color: t.darkText }]}>Log Activity</Text>

        <View style={styles.grid}>
          {ACTIVITY_TYPES.map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.gridCard,
                {
                  backgroundColor: item.tint,
                  borderColor: t.border,
                },
              ]}
              onPress={() => setSelectedType(item.type)}
              activeOpacity={0.7}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={32} color={item.color} />
              </View>
              <Text style={[styles.gridLabel, { color: t.darkText }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // --- Form (step 2) ---
  const renderDurationInput = () => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: t.darkText }]}>Duration (minutes)</Text>
      <View style={[styles.inputRow, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Ionicons name="time-outline" size={20} color={t.lightText} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, { color: t.darkText }]}
          placeholder="30"
          placeholderTextColor={t.placeholderText}
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
        />
      </View>
    </View>
  );

  const renderAmountSelector = () => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: t.darkText }]}>Amount</Text>
      <View style={styles.amountRow}>
        {(['small', 'medium', 'large'] as const).map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.amountButton,
              {
                backgroundColor: amount === size ? accentColor : t.surface,
                borderColor: amount === size ? accentColor : t.border,
              },
            ]}
            onPress={() => setAmount(size)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.amountButtonText,
                {
                  color: amount === size ? '#FFFFFF' : t.darkText,
                  fontWeight: amount === size ? '700' : '500',
                },
              ]}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWalk = async () => {
    try {
      await walkTracker.startWalk();
    } catch {
      Alert.alert('Permission Denied', 'Location permission is required to track walks.');
    }
  };

  const handlePauseResumeWalk = async () => {
    if (walkTracker.isPaused) {
      await walkTracker.resumeWalk();
    } else {
      await walkTracker.pauseWalk();
    }
  };

  const handleStopWalk = async () => {
    const result = await walkTracker.stopWalk();
    const durationMinutes = Math.ceil(result.duration / 60);
    setDuration(durationMinutes.toString());
    setWalkDistance(result.distance);
  };

  const renderWalkTracker = () => (
    <View style={styles.walkTrackerContainer}>
      {/* Circular timer display */}
      <View style={[styles.timerCircle, { borderColor: accentColor + '40' }]}>
        <Text style={[styles.timerText, { color: t.darkText }]}>
          {walkTracker.isTracking
            ? formatTime(walkTracker.duration)
            : duration
              ? formatTime(parseInt(duration, 10) * 60)
              : '00:00'}
        </Text>
        <Text style={[styles.timerLabel, { color: t.lightText }]}>
          {walkTracker.isTracking
            ? walkTracker.isPaused
              ? 'Paused'
              : 'Walking'
            : duration
              ? 'Completed'
              : 'Ready'}
        </Text>
      </View>

      {/* Distance display */}
      <Text style={[styles.distanceText, { color: t.darkText }]}>
        {walkTracker.isTracking
          ? (walkTracker.distance / 1000).toFixed(2)
          : (walkDistance / 1000).toFixed(2)}{' '}
        km
      </Text>

      {/* Control buttons */}
      <View style={styles.walkButtonRow}>
        {!walkTracker.isTracking && !duration ? (
          <TouchableOpacity
            style={[styles.walkButton, { backgroundColor: '#22C55E' }]}
            onPress={handleStartWalk}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={22} color="#FFFFFF" />
            <Text style={styles.walkButtonText}>Start</Text>
          </TouchableOpacity>
        ) : walkTracker.isTracking ? (
          <>
            <TouchableOpacity
              style={[styles.walkButton, { backgroundColor: '#F59E0B' }]}
              onPress={handlePauseResumeWalk}
              activeOpacity={0.8}
            >
              <Ionicons
                name={walkTracker.isPaused ? 'play' : 'pause'}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.walkButtonText}>
                {walkTracker.isPaused ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.walkButton, { backgroundColor: '#EF4444' }]}
              onPress={handleStopWalk}
              activeOpacity={0.8}
            >
              <Ionicons name="stop" size={22} color="#FFFFFF" />
              <Text style={styles.walkButtonText}>Stop</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Show duration field if walk was completed for manual adjustment */}
      {!walkTracker.isTracking && duration ? (
        <View style={[styles.fieldGroup, { marginTop: spacing.base }]}>
          <Text style={[styles.fieldLabel, { color: t.darkText }]}>Duration (minutes)</Text>
          <View style={[styles.inputRow, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Ionicons name="time-outline" size={20} color={t.lightText} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: t.darkText }]}
              placeholder="30"
              placeholderTextColor={t.placeholderText}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />
          </View>
        </View>
      ) : null}
    </View>
  );

  const renderFormFields = () => {
    switch (currentType) {
      case 'walk':
        return renderWalkTracker();
      case 'play':
        return renderDurationInput();
      case 'food':
      case 'water':
        return renderAmountSelector();
      case 'medicine':
      default:
        return null;
    }
  };

  const typeLabel = typeOption?.label ?? 'Activity';

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.formHeader}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: t.surface }]}
          onPress={() => {
            setSelectedType(null);
            setNotes('');
            setDuration('');
            setAmount('medium');
            setPhotoUri(null);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={t.darkText} />
        </TouchableOpacity>
        <View style={[styles.formHeaderIcon, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name={typeOption?.icon as any} size={24} color={accentColor} />
        </View>
        <Text style={[styles.headerTitle, { color: t.darkText }]}>Log {typeLabel}</Text>
      </View>

      {/* Context-specific fields */}
      {renderFormFields()}

      {/* Notes */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: t.darkText }]}>Notes (optional)</Text>
        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: t.surface,
              borderColor: t.border,
              color: t.darkText,
            },
          ]}
          placeholder="Add any notes..."
          placeholderTextColor={t.placeholderText}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Add Photo */}
      <TouchableOpacity
        style={[styles.addPhotoButton, { borderColor: t.border }]}
        activeOpacity={0.7}
        onPress={handleAddPhoto}
      >
        {photoUri ? (
          <View style={styles.photoPreviewRow}>
            <Image source={{ uri: photoUri }} style={styles.photoThumbnail} />
            <Text style={[styles.addPhotoText, { color: t.darkText }]}>Photo added</Text>
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          </View>
        ) : (
          <>
            <Ionicons name="camera-outline" size={24} color={t.lightText} />
            <Text style={[styles.addPhotoText, { color: t.lightText }]}>Add Photo</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: '#1E293B' }]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save Activity</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },

  // --- Header ---
  headerTitle: {
    ...typography.title3,
    fontWeight: '700',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Grid ---
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  gridCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  gridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gridLabel: {
    ...typography.subhead,
    fontWeight: '700',
  },

  // --- Walk tracker ---
  walkTrackerContainer: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...typography.subhead,
    marginTop: 4,
  },
  distanceText: {
    ...typography.title3,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  walkButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  walkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    minWidth: 120,
  },
  walkButtonText: {
    ...typography.headline,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // --- Form fields ---
  fieldGroup: {
    marginBottom: spacing.base,
  },
  fieldLabel: {
    ...typography.subhead,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    ...typography.body,
  },

  // --- Amount selector ---
  amountRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amountButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountButtonText: {
    ...typography.subhead,
  },

  // --- Notes ---
  notesInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 88,
    ...typography.body,
  },

  // --- Add photo ---
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.base,
    marginBottom: spacing.lg,
  },
  addPhotoText: {
    ...typography.subhead,
    fontWeight: '500',
  },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoThumbnail: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
  },

  // --- Save button ---
  saveButton: {
    width: '100%',
    paddingVertical: spacing.base,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...typography.headline,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // --- Saved state ---
  savedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  savedIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  savedTitle: {
    ...typography.title2,
    marginBottom: spacing.base,
  },
  savedQuote: {
    ...typography.subhead,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
});
