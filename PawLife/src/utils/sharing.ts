import { RefObject } from 'react';
import { View, Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { ShareCardType } from '../components/ShareCard';

/**
 * Captures the referenced view as a PNG and opens the native share sheet.
 */
export async function captureAndShare(viewRef: RefObject<View>): Promise<void> {
  try {
    if (!viewRef.current) {
      throw new Error('View ref not available');
    }

    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your PawLife card',
      UTI: 'public.png',
    });
  } catch (error: any) {
    if (error?.message?.includes('User did not share')) return;
    Alert.alert('Share Failed', 'Something went wrong while sharing. Please try again.');
  }
}

/**
 * Captures the referenced view as a PNG and saves it to the device gallery.
 */
export async function captureAndSave(viewRef: RefObject<View>): Promise<boolean> {
  try {
    if (!viewRef.current) {
      throw new Error('View ref not available');
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to save images.',
      );
      return false;
    }

    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved!', 'Your PawLife card has been saved to your gallery.');
    return true;
  } catch (error) {
    Alert.alert('Save Failed', 'Something went wrong while saving. Please try again.');
    return false;
  }
}

/**
 * Returns a share text message for the given card type.
 */
export function getShareMessage(
  type: ShareCardType,
  dogName: string,
  title: string,
): string {
  const messages: Record<ShareCardType, string> = {
    milestone: `Check out ${dogName}'s milestone on PawLife! ${title} 🐾`,
    activity: `${dogName} just logged an activity on PawLife! ${title} 🐕`,
    report: `${dogName}'s weekly report is in on PawLife! ${title} 📊`,
    profile: `Meet ${dogName} on PawLife! ${title} 🐾`,
  };

  return messages[type];
}
