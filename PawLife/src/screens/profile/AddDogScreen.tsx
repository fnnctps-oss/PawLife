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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { generateId } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../theme';
import { pickImageFromLibrary, takePhoto } from '../../utils/imagePicker';

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

const AddDogScreen: React.FC = () => {
  const { colors: t, isDark } = useTheme();
  const navigation = useNavigation();
  const addDog = useStore((state) => state.addDog);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [showBreedSuggestions, setShowBreedSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const filteredBreeds = useMemo(() => {
    if (!breed.trim()) return [];
    const query = breed.toLowerCase();
    return COMMON_BREEDS.filter((b) =>
      b.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [breed]);

  const handleTakePhoto = useCallback(async () => {
    const uri = await takePhoto();
    if (uri) setPhotoUri(uri);
  }, []);

  const handlePickFromLibrary = useCallback(async () => {
    const uri = await pickImageFromLibrary();
    if (uri) setPhotoUri(uri);
  }, []);

  const handleAvatarPress = useCallback(() => {
    Alert.alert(
      'Add Photo',
      'Choose a photo for your dog',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [handleTakePhoto, handlePickFromLibrary]);

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
      Alert.alert('Missing Information', "Please enter your dog's name.");
      return;
    }
    if (!breed.trim()) {
      Alert.alert('Missing Information', "Please enter your dog's breed.");
      return;
    }

    const dog = {
      id: generateId(),
      name: name.trim(),
      breed: breed.trim(),
      photo: photoUri || '',
      dateOfBirth: dateOfBirth.trim(),
      weight: weight ? parseFloat(weight) : 0,
      gender: (gender || 'male') as 'male' | 'female',
      color: '',
      allergies,
      createdAt: new Date().toISOString(),
    };

    addDog(dog);
    navigation.goBack();
  }, [name, breed, dateOfBirth, weight, gender, allergies, addDog, navigation, photoUri]);

  const displayName = name.trim() || 'Dog';

  const inputStyle = (field: string) => [
    styles.input,
    {
      backgroundColor: isDark ? t.surface : '#FFFFFF',
      borderColor: focusedField === field ? '#FF8C42' : (isDark ? t.border : '#F1F5F9'),
      color: t.darkText,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.flex, { backgroundColor: isDark ? t.background : '#F8FAFC' }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Amber Gradient Header */}
        <LinearGradient
          colors={['#FF8C42', '#E07030'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add your buddy</Text>
          <Text style={styles.headerSubtitle}>{"Let's set up their profile \uD83D\uDC3E"}</Text>
        </LinearGradient>

        {/* Photo Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <View style={[styles.avatarContainer, isDark && { backgroundColor: t.surface }]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="camera" size={40} color="#CBD5E1" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Dog's Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: t.darkText }]}>
              {"Dog's Name"} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={inputStyle('name')}
              placeholder="e.g. Luna"
              placeholderTextColor={t.placeholderText}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="words"
            />
          </View>

          {/* Breed */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: t.darkText }]}>
              Breed <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={inputStyle('breed')}
              placeholder="e.g. Golden Retriever"
              placeholderTextColor={t.placeholderText}
              value={breed}
              onChangeText={(text) => {
                setBreed(text);
                setShowBreedSuggestions(true);
              }}
              onFocus={() => {
                setFocusedField('breed');
                if (breed.trim()) setShowBreedSuggestions(true);
              }}
              onBlur={() => {
                setFocusedField(null);
                setTimeout(() => setShowBreedSuggestions(false), 200);
              }}
              autoCapitalize="words"
            />
            {showBreedSuggestions && filteredBreeds.length > 0 && (
              <View style={[styles.suggestionsContainer, {
                backgroundColor: isDark ? t.surface : '#FFFFFF',
                borderColor: isDark ? t.border : '#F1F5F9',
              }]}>
                {filteredBreeds.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.suggestionItem, {
                      borderBottomColor: isDark ? t.divider : '#F1F5F9',
                    }]}
                    onPress={() => handleSelectBreed(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.suggestionText, { color: t.darkText }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Weight and Date of Birth - 2 column row */}
          <View style={styles.twoColumnRow}>
            <View style={styles.halfField}>
              <Text style={[styles.label, { color: t.darkText }]}>Weight (kg)</Text>
              <TextInput
                style={inputStyle('weight')}
                placeholder="0.0"
                placeholderTextColor={t.placeholderText}
                value={weight}
                onChangeText={setWeight}
                onFocus={() => setFocusedField('weight')}
                onBlur={() => setFocusedField(null)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={[styles.label, { color: t.darkText }]}>Date of Birth</Text>
              <TextInput
                style={inputStyle('dob')}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={t.placeholderText}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                onFocus={() => setFocusedField('dob')}
                onBlur={() => setFocusedField(null)}
                keyboardType="default"
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: t.darkText }]}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  {
                    backgroundColor: isDark ? t.surface : '#FFFFFF',
                    borderColor: gender === 'male' ? '#FF8C42' : (isDark ? t.border : '#F1F5F9'),
                  },
                  gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('male')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="male"
                  size={20}
                  color={gender === 'male' ? '#FF8C42' : t.lightText}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: gender === 'male' ? '#FF8C42' : t.lightText },
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  {
                    backgroundColor: isDark ? t.surface : '#FFFFFF',
                    borderColor: gender === 'female' ? '#FF8C42' : (isDark ? t.border : '#F1F5F9'),
                  },
                  gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('female')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="female"
                  size={20}
                  color={gender === 'female' ? '#FF8C42' : t.lightText}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: gender === 'female' ? '#FF8C42' : t.lightText },
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Allergies */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: t.darkText }]}>Allergies</Text>
            <View style={styles.allergyInputRow}>
              <TextInput
                style={[...inputStyle('allergy'), styles.allergyInput]}
                placeholder="Type allergy and press add"
                placeholderTextColor={t.placeholderText}
                value={allergyInput}
                onChangeText={setAllergyInput}
                onFocus={() => setFocusedField('allergy')}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={handleAddAllergy}
                returnKeyType="done"
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={styles.addAllergyButton}
                onPress={handleAddAllergy}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {allergies.length > 0 && (
              <View style={styles.tagsContainer}>
                {allergies.map((tag) => (
                  <View key={tag} style={[styles.tag, isDark && {
                    backgroundColor: 'rgba(255,140,66,0.15)',
                    borderColor: 'rgba(255,140,66,0.3)',
                  }]}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveAllergy(tag)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={16} color="#CC6B2E" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {`Add ${displayName} \uD83D\uDC3E`}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFECD2',
    fontWeight: '500',
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginTop: -48,
    marginBottom: 24,
    zIndex: 10,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },

  // Form
  formContainer: {
    paddingHorizontal: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  required: {
    color: '#FF4D4D',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },

  // Two column row
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },

  // Breed suggestions
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: {
    fontSize: 15,
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
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: '#FFF7ED',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
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
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFD4B0',
  },
  tagText: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: '600',
  },

  // Submit button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 18,
    marginTop: 12,
    gap: 10,
  },
  submitButtonText: {
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
