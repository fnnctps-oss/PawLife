import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Button, Input, Card } from '../../components';
import { useStore } from '../../store/useStore';
import { generateId, getActivityColor, getActivityIcon } from '../../utils/helpers';
import { ActivityType } from '../../types';

interface LogActivitySheetProps {
  activityType: ActivityType;
  onClose: () => void;
  onSave: () => void;
}

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
  const { addActivity, selectedDogId } = useStore();
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  // Walk state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [distance, setDistance] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Food state
  const [mealType, setMealType] = useState<string>('breakfast');
  const [foodBrand, setFoodBrand] = useState('');
  const [portion, setPortion] = useState<string>('medium');

  // Water state
  const [waterAmount, setWaterAmount] = useState<string>('medium');

  // Play/Training/Grooming state
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  // Medicine state
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [administeredBy, setAdministeredBy] = useState<string>('self');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleTimer = () => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerRunning(false);
    } else {
      timerRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
      setIsTimerRunning(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!selectedDogId) {
      Alert.alert('No dog selected', 'Please add a dog first.');
      return;
    }

    const activity = {
      id: generateId(),
      dogId: selectedDogId,
      type: activityType,
      timestamp: new Date().toISOString(),
      notes,
      sharedToSocial: false,
      duration: activityType === 'walk' ? Math.floor(timerSeconds / 60) : duration ? parseInt(duration) : undefined,
      distance: distance ? parseFloat(distance) : undefined,
      mealType: activityType === 'food' ? mealType as any : undefined,
      foodBrand: activityType === 'food' ? foodBrand : undefined,
      portion: activityType === 'food' ? portion as any : undefined,
      waterAmount: activityType === 'water' ? waterAmount as any : undefined,
      medicineName: activityType === 'medicine' || activityType === 'injection' ? medicineName : undefined,
      dosage: activityType === 'medicine' || activityType === 'injection' ? dosage : undefined,
      administeredBy: activityType === 'medicine' || activityType === 'injection' ? administeredBy as any : undefined,
    };

    addActivity(activity);
    setSaved(true);
  };

  const accentColor = getActivityColor(activityType);
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  if (saved) {
    return (
      <View style={styles.savedContainer}>
        <View style={[styles.savedIconBg, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name="checkmark-circle" size={56} color={accentColor} />
        </View>
        <Text style={styles.savedTitle}>Activity Logged!</Text>
        <Text style={styles.savedQuote}>{randomQuote}</Text>
        <Button title="Done" onPress={onSave} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  const renderPillSelector = (
    options: { key: string; label: string }[],
    selected: string,
    onSelect: (key: string) => void
  ) => (
    <View style={styles.pillRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[
            styles.pill,
            selected === opt.key && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
          onPress={() => onSelect(opt.key)}
        >
          <Text
            style={[
              styles.pillText,
              selected === opt.key && { color: colors.white },
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWalkForm = () => (
    <>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTimer(timerSeconds)}</Text>
        <TouchableOpacity
          style={[styles.timerButton, { backgroundColor: isTimerRunning ? colors.error : accentColor }]}
          onPress={toggleTimer}
        >
          <Ionicons
            name={isTimerRunning ? 'pause' : 'play'}
            size={28}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
      <Input
        label="Distance (km)"
        placeholder="0.0"
        value={distance}
        onChangeText={setDistance}
        keyboardType="decimal-pad"
        icon="navigate-outline"
      />
    </>
  );

  const renderFoodForm = () => (
    <>
      <Text style={styles.fieldLabel}>Meal Type</Text>
      {renderPillSelector(
        [
          { key: 'breakfast', label: 'Breakfast' },
          { key: 'lunch', label: 'Lunch' },
          { key: 'dinner', label: 'Dinner' },
          { key: 'snack', label: 'Snack' },
        ],
        mealType,
        setMealType
      )}
      <Input
        label="Food Brand / Type"
        placeholder="e.g., Royal Canin"
        value={foodBrand}
        onChangeText={setFoodBrand}
        icon="restaurant-outline"
      />
      <Text style={styles.fieldLabel}>Portion</Text>
      {renderPillSelector(
        [
          { key: 'small', label: 'Small' },
          { key: 'medium', label: 'Medium' },
          { key: 'large', label: 'Large' },
        ],
        portion,
        setPortion
      )}
    </>
  );

  const renderWaterForm = () => (
    <>
      <Text style={styles.fieldLabel}>Amount</Text>
      <View style={styles.waterRow}>
        {(['small', 'medium', 'full'] as const).map((amt) => (
          <TouchableOpacity
            key={amt}
            style={[
              styles.waterOption,
              waterAmount === amt && { borderColor: colors.secondary, backgroundColor: '#E8F1FB' },
            ]}
            onPress={() => setWaterAmount(amt)}
          >
            <Ionicons
              name="water"
              size={amt === 'small' ? 24 : amt === 'medium' ? 32 : 40}
              color={waterAmount === amt ? colors.secondary : colors.lightText}
            />
            <Text
              style={[
                styles.waterLabel,
                waterAmount === amt && { color: colors.secondary, fontWeight: '600' },
              ]}
            >
              {amt.charAt(0).toUpperCase() + amt.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderGenericForm = () => (
    <>
      <Input
        label="Duration (minutes)"
        placeholder="30"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        icon="time-outline"
      />
      <Input
        label="Description"
        placeholder="What did you do?"
        value={description}
        onChangeText={setDescription}
        icon="create-outline"
      />
    </>
  );

  const renderMedicineForm = () => (
    <>
      <Input
        label="Medicine / Vaccine Name"
        placeholder="e.g., Rimadyl"
        value={medicineName}
        onChangeText={setMedicineName}
        icon="medkit-outline"
      />
      <Input
        label="Dosage"
        placeholder="e.g., 25mg"
        value={dosage}
        onChangeText={setDosage}
        icon="flask-outline"
      />
      <Text style={styles.fieldLabel}>Administered By</Text>
      {renderPillSelector(
        [
          { key: 'self', label: 'Self' },
          { key: 'vet', label: 'Vet' },
        ],
        administeredBy,
        setAdministeredBy
      )}
    </>
  );

  const titles: Record<string, string> = {
    walk: 'Log Walk',
    food: 'Log Food',
    water: 'Log Water',
    play: 'Log Play',
    training: 'Log Training',
    grooming: 'Log Grooming',
    medicine: 'Log Medicine',
    injection: 'Log Injection',
    vet_visit: 'Log Vet Visit',
    custom: 'Log Activity',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name={getActivityIcon(activityType) as any} size={24} color={accentColor} />
        </View>
        <Text style={styles.title}>{titles[activityType] || 'Log Activity'}</Text>
      </View>

      {activityType === 'walk' && renderWalkForm()}
      {activityType === 'food' && renderFoodForm()}
      {activityType === 'water' && renderWaterForm()}
      {(activityType === 'play' || activityType === 'training' || activityType === 'grooming') && renderGenericForm()}
      {(activityType === 'medicine' || activityType === 'injection') && renderMedicineForm()}
      {activityType === 'vet_visit' && renderGenericForm()}
      {activityType === 'custom' && renderGenericForm()}

      <Input
        label="Notes"
        placeholder="Add any notes..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        icon="document-text-outline"
      />

      <Button title="Save" onPress={handleSave} style={{ marginTop: spacing.md }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.darkText,
  },
  fieldLabel: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  pill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pillText: {
    ...typography.subhead,
    fontWeight: '500',
    color: colors.darkText,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '200',
    color: colors.darkText,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.base,
  },
  timerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.base,
  },
  waterOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    width: 100,
    height: 100,
  },
  waterLabel: {
    ...typography.caption1,
    color: colors.lightText,
    marginTop: spacing.xs,
  },
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
    color: colors.darkText,
    marginBottom: spacing.base,
  },
  savedQuote: {
    ...typography.subhead,
    color: colors.lightText,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
});
