import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function pickImageFromLibrary(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Please allow access to your photo library to select a photo.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Please allow access to your camera to take a photo.');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

export function showImagePickerAlert(onCamera: () => void, onLibrary: () => void): void {
  Alert.alert(
    'Add Photo',
    'Choose a photo source',
    [
      { text: 'Take Photo', onPress: onCamera },
      { text: 'Choose from Library', onPress: onLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
}
