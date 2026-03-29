import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input, ScreenContainer, Avatar, Card } from '../../components';
import { generateId } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme';

const COMMON_BREEDS = [
  'Labrador Retriever',
  'German Shepherd',
  'Golden Retriever',
  'French Bulldog',
  'Bulldog',
  'Poodle',
  'Beagle',
  'Rottweiler',
  'Dachshund',
  'Yorkshire Terrier',
  'Boxer',
  'Siberian Husky',
  'Great Dane',
  'Doberman Pinscher',
  'Shih Tzu',
  'Boston Terrier',
  'Bernese Mountain Dog',
  'Pomeranian',
  'Havanese',
  'Cavalier King Charles Spaniel',
  'Border Collie',
  'Australian Shepherd',
  'Chihuahua',
  'Maltese',
  'Cocker Spaniel',
  'Mixed Breed',
];

import { colors } from '../../theme/colors';
const PRIMARY_COLOR = colors.primary;
const BACKGROUND_COLOR = colors.background;

const AddDogScreen: React.FC = () => {
  const { colors: t } = useTheme();
  const navigation = useNavigation();
  const addDog = useStore((state) => state.addDog);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [color, setColor] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false);

  const filteredBreeds = useMemo(() => {
    if (!breed.trim()) return [];
    const query = breed.toLowerCase();
    return COMMON_BREEDS.filter((b) =>
      b.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [breed]);

  const handleAvatarPress = useCallback(() => {
    Alert.alert(
      'Add Photo',
      'Choose a photo for your dog',
      [
        { text: 'Take Photo', onPress: () => {} },
        { text: 'Choose from Library', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleAddAllergy = useCallback(() => {
    const trimmed = allergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies((prev) => [...prev, trimmed]);
    }
    setAllergyInput('');
  }, [allergyInput, allergies]);

  const handleRemoveAllergy = useCallback((tag: string) => {
    setAllergies((prev) => prev.filter((a) => a !== tag));
  }, []);

  const handleSelectBreed = useCallback((selected: string) => {
    setBreed(selected);
    setShowBreedSuggestions(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your dog\'s name.');
      return;
    }

    const dog = {
      id: generateId(),
      name: name.trim(),
      breed: breed.trim(),
      photo: '',
      dateOfBirth: dateOfBirth.trim(),
      weight: weight ? parseFloat(weight) : 0,
      gender: gender || 'male' as const,
      color: color.trim(),
      microchipId: microchipId.trim() || undefined,
      allergies,
      createdAt: new Date().toISOString(),
    };

    addDog(dog);
    navigation.goBack();
  }, [
    name, breed, dateOfBirth, weight, weightUnit,
    gender, color, microchipId, allergies, addDog, navigation,
  ]);

  const displayName = name.trim() || 'Dog';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: t.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>🐕</Text>
              </View>
              <View style={styles.cameraIconOverlay}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to add a photo</Text>
        </View>

        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="What's your dog's name?"
              placeholderTextColor="#C4B5A4"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Breed */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="Start typing to search breeds..."
              placeholderTextColor="#C4B5A4"
              value={breed}
              onChangeText={(text) => {
                setBreed(text);
                setShowBreedSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowBreedSuggestions(false), 200);
              }}
              autoCapitalize="words"
            />
            {showBreedSuggestions && filteredBreeds.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredBreeds.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectBreed(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#C4B5A4"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              keyboardType="default"
            />
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('male')}
                activeOpacity={0.7}
              >
                <Text style={styles.genderIcon}>♂</Text>
                <Text
                  style={[
                    styles.genderText,
                    gender === 'male' && styles.genderTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('female')}
                activeOpacity={0.7}
              >
                <Text style={styles.genderIcon}>♀</Text>
                <Text
                  style={[
                    styles.genderText,
                    gender === 'female' && styles.genderTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Physical Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Physical Details</Text>

          {/* Weight */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Weight</Text>
            <View style={styles.weightRow}>
              <TextInput
                style={[styles.input, styles.weightInput]}
                placeholder="0.0"
                placeholderTextColor="#C4B5A4"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    weightUnit === 'kg' && styles.unitButtonActive,
                  ]}
                  onPress={() => setWeightUnit('kg')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.unitText,
                      weightUnit === 'kg' && styles.unitTextActive,
                    ]}
                  >
                    kg
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    weightUnit === 'lbs' && styles.unitButtonActive,
                  ]}
                  onPress={() => setWeightUnit('lbs')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.unitText,
                      weightUnit === 'lbs' && styles.unitTextActive,
                    ]}
                  >
                    lbs
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Color */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Golden, Black & Tan"
              placeholderTextColor="#C4B5A4"
              value={color}
              onChangeText={setColor}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Additional Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          {/* Microchip ID */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Microchip ID</Text>
            <Text style={styles.optionalBadge}>Optional</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter microchip number"
              placeholderTextColor="#C4B5A4"
              value={microchipId}
              onChangeText={setMicrochipId}
              autoCapitalize="none"
            />
          </View>

          {/* Allergies */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Allergies</Text>
            <View style={styles.allergyInputRow}>
              <TextInput
                style={[styles.input, styles.allergyInput]}
                placeholder="Type allergy and press enter"
                placeholderTextColor="#C4B5A4"
                value={allergyInput}
                onChangeText={setAllergyInput}
                onSubmitEditing={handleAddAllergy}
                returnKeyType="done"
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={styles.addAllergyButton}
                onPress={handleAddAllergy}
                activeOpacity={0.7}
              >
                <Text style={styles.addAllergyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            {allergies.length > 0 && (
              <View style={styles.tagsContainer}>
                {allergies.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveAllergy(tag)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.tagRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FF8C42', '#FF6B1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.pawIcon}>🐾</Text>
            <Text style={styles.saveButtonText}>Add {displayName}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 18,
  },
  avatarHint: {
    marginTop: 10,
    fontSize: 14,
    color: '#A89580',
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D2C1E',
    marginBottom: 16,
  },

  // Fields
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B5744',
    marginBottom: 8,
  },
  optionalBadge: {
    fontSize: 12,
    color: '#A89580',
    fontWeight: '500',
    marginTop: -6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAFAF7',
    borderWidth: 1,
    borderColor: '#E8E0D8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#3D2C1E',
  },

  // Breed suggestions
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E8E0D8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0E8E0',
  },
  suggestionText: {
    fontSize: 15,
    color: '#3D2C1E',
  },

  // Gender
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E0D8',
    backgroundColor: '#FAFAF7',
    gap: 8,
  },
  genderButtonActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#FFF3EB',
  },
  genderIcon: {
    fontSize: 20,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A89580',
  },
  genderTextActive: {
    color: PRIMARY_COLOR,
  },

  // Weight
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightInput: {
    flex: 1,
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E0D8',
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FAFAF7',
  },
  unitButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A89580',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },

  // Allergies
  allergyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allergyInput: {
    flex: 1,
  },
  addAllergyButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAllergyButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: -2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFD4B0',
  },
  tagText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  tagRemove: {
    fontSize: 12,
    color: '#CC6B2E',
    fontWeight: '700',
  },

  // Save button
  saveButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  pawIcon: {
    fontSize: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 20,
  },
});

export { AddDogScreen };
