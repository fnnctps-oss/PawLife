import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { storage } from './firebase';

// ---------------------------------------------------------------------------
// Image compression
// ---------------------------------------------------------------------------

async function compressImage(uri: string, maxWidth = 800): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: 0.7, format: SaveFormat.JPEG },
  );
  return result.uri;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

// ---------------------------------------------------------------------------
// Upload helpers
// ---------------------------------------------------------------------------

export async function uploadDogPhoto(
  userId: string,
  dogId: string,
  localUri: string,
): Promise<string> {
  const compressed = await compressImage(localUri);
  const blob = await uriToBlob(compressed);
  const storageRef = ref(storage, `users/${userId}/dogs/${dogId}/photo.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function uploadActivityPhoto(
  userId: string,
  dogId: string,
  activityId: string,
  localUri: string,
): Promise<string> {
  const compressed = await compressImage(localUri);
  const blob = await uriToBlob(compressed);
  const storageRef = ref(
    storage,
    `users/${userId}/dogs/${dogId}/activities/${activityId}.jpg`,
  );
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function uploadUserAvatar(
  userId: string,
  localUri: string,
): Promise<string> {
  const compressed = await compressImage(localUri, 400);
  const blob = await uriToBlob(compressed);
  const storageRef = ref(storage, `users/${userId}/avatar.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
