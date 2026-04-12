import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Dog,
  Activity,
  Reminder,
  VetAppointment,
  Injection,
  Milestone,
  Challenge,
  Quote,
} from '../types';

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function userPath(userId: string) {
  return `users/${userId}`;
}

function dogsCol(userId: string) {
  return collection(db, userPath(userId), 'dogs');
}

function activitiesCol(userId: string, dogId: string) {
  return collection(db, userPath(userId), 'dogs', dogId, 'activities');
}

function remindersCol(userId: string, dogId: string) {
  return collection(db, userPath(userId), 'dogs', dogId, 'reminders');
}

function vetCol(userId: string, dogId: string) {
  return collection(db, userPath(userId), 'dogs', dogId, 'vetAppointments');
}

function injectionsCol(userId: string, dogId: string) {
  return collection(db, userPath(userId), 'dogs', dogId, 'injections');
}

function milestonesCol(userId: string, dogId: string) {
  return collection(db, userPath(userId), 'dogs', dogId, 'milestones');
}

// Strip `id` before writing so it's not duplicated inside the doc
function stripId<T extends { id: string }>(data: T): Omit<T, 'id'> {
  const { id, ...rest } = data;
  return rest;
}

// ---------------------------------------------------------------------------
// Dogs
// ---------------------------------------------------------------------------

export async function addDog(userId: string, dog: Dog): Promise<string> {
  const ref = doc(dogsCol(userId), dog.id);
  await setDoc(ref, { ...stripId(dog), createdAt: serverTimestamp() });
  return dog.id;
}

export async function updateDog(userId: string, dogId: string, data: Partial<Dog>): Promise<void> {
  const ref = doc(dogsCol(userId), dogId);
  await updateDoc(ref, data as Record<string, unknown>);
}

export async function deleteDog(userId: string, dogId: string): Promise<void> {
  await deleteDoc(doc(dogsCol(userId), dogId));
}

export async function getDogs(userId: string): Promise<Dog[]> {
  const snap = await getDocs(dogsCol(userId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Dog));
}

export function onDogsSnapshot(userId: string, callback: (dogs: Dog[]) => void): Unsubscribe {
  return onSnapshot(dogsCol(userId), (snap) => {
    const dogs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Dog));
    callback(dogs);
  });
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export async function addActivity(userId: string, dogId: string, activity: Activity): Promise<string> {
  const ref = doc(activitiesCol(userId, dogId), activity.id);
  await setDoc(ref, { ...stripId(activity), timestamp: serverTimestamp() });
  return activity.id;
}

export async function getActivities(
  userId: string,
  dogId: string,
  max: number = 50,
): Promise<Activity[]> {
  const q = query(activitiesCol(userId, dogId), orderBy('timestamp', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Activity));
}

export function onActivitiesSnapshot(
  userId: string,
  dogId: string,
  callback: (activities: Activity[]) => void,
): Unsubscribe {
  const q = query(activitiesCol(userId, dogId), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Activity));
    callback(items);
  });
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export async function addReminder(userId: string, dogId: string, reminder: Reminder): Promise<string> {
  const ref = doc(remindersCol(userId, dogId), reminder.id);
  await setDoc(ref, stripId(reminder));
  return reminder.id;
}

export async function updateReminder(
  userId: string,
  dogId: string,
  reminderId: string,
  data: Partial<Reminder>,
): Promise<void> {
  await updateDoc(doc(remindersCol(userId, dogId), reminderId), data as Record<string, unknown>);
}

export async function deleteReminder(userId: string, dogId: string, reminderId: string): Promise<void> {
  await deleteDoc(doc(remindersCol(userId, dogId), reminderId));
}

export async function getReminders(userId: string, dogId: string): Promise<Reminder[]> {
  const snap = await getDocs(remindersCol(userId, dogId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reminder));
}

export function onRemindersSnapshot(
  userId: string,
  dogId: string,
  callback: (reminders: Reminder[]) => void,
): Unsubscribe {
  return onSnapshot(remindersCol(userId, dogId), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reminder));
    callback(items);
  });
}

// ---------------------------------------------------------------------------
// Vet Appointments
// ---------------------------------------------------------------------------

export async function addVetAppointment(
  userId: string,
  dogId: string,
  appointment: VetAppointment,
): Promise<string> {
  const ref = doc(vetCol(userId, dogId), appointment.id);
  await setDoc(ref, stripId(appointment));
  return appointment.id;
}

export async function getVetAppointments(userId: string, dogId: string): Promise<VetAppointment[]> {
  const q = query(vetCol(userId, dogId), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VetAppointment));
}

export function onVetSnapshot(
  userId: string,
  dogId: string,
  callback: (appointments: VetAppointment[]) => void,
): Unsubscribe {
  return onSnapshot(vetCol(userId, dogId), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VetAppointment));
    callback(items);
  });
}

// ---------------------------------------------------------------------------
// Injections
// ---------------------------------------------------------------------------

export async function addInjection(
  userId: string,
  dogId: string,
  injection: Injection,
): Promise<string> {
  const ref = doc(injectionsCol(userId, dogId), injection.id);
  await setDoc(ref, stripId(injection));
  return injection.id;
}

export async function getInjections(userId: string, dogId: string): Promise<Injection[]> {
  const q = query(injectionsCol(userId, dogId), orderBy('dateGiven', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Injection));
}

export function onInjectionsSnapshot(
  userId: string,
  dogId: string,
  callback: (injections: Injection[]) => void,
): Unsubscribe {
  return onSnapshot(injectionsCol(userId, dogId), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Injection));
    callback(items);
  });
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export async function addMilestone(
  userId: string,
  dogId: string,
  milestone: Milestone,
): Promise<string> {
  const ref = doc(milestonesCol(userId, dogId), milestone.id);
  await setDoc(ref, stripId(milestone));
  return milestone.id;
}

export async function getMilestones(userId: string, dogId: string): Promise<Milestone[]> {
  const snap = await getDocs(milestonesCol(userId, dogId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Milestone));
}

// ---------------------------------------------------------------------------
// Challenges (global collection)
// ---------------------------------------------------------------------------

export async function getChallenges(): Promise<Challenge[]> {
  const snap = await getDocs(collection(db, 'challenges'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge));
}

export function onChallengesSnapshot(callback: (challenges: Challenge[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'challenges'), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge));
    callback(items);
  });
}

// ---------------------------------------------------------------------------
// Quotes (global collection)
// ---------------------------------------------------------------------------

export async function getQuotes(): Promise<Quote[]> {
  const snap = await getDocs(collection(db, 'quotes'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quote));
}

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

export async function updateUserProfile(
  userId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), data);
}
