import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  OAuthProvider,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? '',
    photoURL: fbUser.photoURL ?? '',
    subscription: { plan: 'free' },
    createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
  };
}

async function ensureUserDoc(fbUser: FirebaseUser): Promise<User> {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id: fbUser.uid, ...snap.data() } as User;
  }

  const newUser: Omit<User, 'id'> = {
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? '',
    photoURL: fbUser.photoURL ?? '',
    subscription: { plan: 'free' },
    createdAt: new Date().toISOString(),
  };

  await setDoc(ref, { ...newUser, createdAt: serverTimestamp() });
  return { id: fbUser.uid, ...newUser };
}

// ---------------------------------------------------------------------------
// Auth methods
// ---------------------------------------------------------------------------

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(fbUser, { displayName });
  return ensureUserDoc(fbUser);
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
  return ensureUserDoc(fbUser);
}

export async function signInWithGoogle(idToken: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken);
  const { user: fbUser } = await signInWithCredential(auth, credential);
  return ensureUserDoc(fbUser);
}

export async function signInWithApple(identityToken: string, nonce: string): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken: identityToken, rawNonce: nonce });
  const { user: fbUser } = await signInWithCredential(auth, credential);
  return ensureUserDoc(fbUser);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChanged(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const user = await ensureUserDoc(fbUser);
      callback(user);
    } else {
      callback(null);
    }
  });
}

export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}
