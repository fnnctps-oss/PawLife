export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  subscription: {
    plan: 'free' | 'premium' | 'lifetime';
    trialStartDate?: string;
    expiryDate?: string;
  };
  createdAt: string;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  photo: string;
  dateOfBirth: string;
  weight: number;
  gender: 'male' | 'female';
  color: string;
  microchipId?: string;
  allergies?: string[];
  createdAt: string;
}

export type ActivityType =
  | 'walk'
  | 'food'
  | 'water'
  | 'play'
  | 'training'
  | 'grooming'
  | 'medicine'
  | 'vet_visit'
  | 'injection'
  | 'custom';

export interface Activity {
  id: string;
  dogId: string;
  type: ActivityType;
  timestamp: string;
  duration?: number;
  distance?: number;
  notes?: string;
  photo?: string;
  sharedToSocial: boolean;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodBrand?: string;
  portion?: 'small' | 'medium' | 'large';
  waterAmount?: 'small' | 'medium' | 'full';
  medicineName?: string;
  dosage?: string;
  administeredBy?: 'self' | 'vet';
  nextDueDate?: string;
}

export type ReminderType =
  | 'food'
  | 'water'
  | 'walk'
  | 'vet'
  | 'injection'
  | 'medicine'
  | 'grooming'
  | 'custom';

export type RepeatPattern = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Reminder {
  id: string;
  dogId: string;
  type: ReminderType;
  title: string;
  time: string;
  repeatPattern: RepeatPattern;
  enabled: boolean;
  quoteCategory?: string;
}

export interface VetAppointment {
  id: string;
  dogId: string;
  vetName: string;
  clinicName: string;
  date: string;
  reason: string;
  notes?: string;
  reminderSet: boolean;
}

export interface Injection {
  id: string;
  dogId: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate: string;
  vetName: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  dogId: string;
  type: string;
  achievedAt: string;
  shared: boolean;
  cardImageURL?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'walk' | 'hydration' | 'training' | 'community';
  startDate: string;
  endDate: string;
  goal: number;
  participants: { userId: string; progress: number }[];
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'love' | 'health' | 'funny' | 'wisdom' | 'walk' | 'meal';
}
