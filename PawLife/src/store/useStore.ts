import { create } from 'zustand';
import { User, Dog, Activity, Reminder, VetAppointment, Injection, Milestone, Challenge, Quote } from '../types';
import * as firestoreService from '../services/firestore';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;

  // Dogs
  dogs: Dog[];
  selectedDogId: string | null;

  // Activities
  activities: Activity[];

  // Reminders
  reminders: Reminder[];

  // Vet
  vetAppointments: VetAppointment[];
  injections: Injection[];

  // Milestones
  milestones: Milestone[];

  // Challenges
  challenges: Challenge[];

  // Quotes
  quotes: Quote[];

  // Notifications
  pushToken: string | null;

  // UI
  themeMode: 'system' | 'light' | 'dark';
  unitSystem: 'metric' | 'imperial';

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  addDog: (dog: Dog) => void;
  updateDog: (id: string, dog: Partial<Dog>) => void;
  removeDog: (id: string) => void;
  setSelectedDog: (id: string | null) => void;
  addActivity: (activity: Activity) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
  addVetAppointment: (appointment: VetAppointment) => void;
  addInjection: (injection: Injection) => void;
  addMilestone: (milestone: Milestone) => void;
  addChallenge: (challenge: Challenge) => void;
  setQuotes: (quotes: Quote[]) => void;
  setPushToken: (token: string | null) => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  setUnitSystem: (system: 'metric' | 'imperial') => void;
}

// Helper to get current userId without circular deps
function uid(): string | null {
  return useStore.getState().user?.id ?? null;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  dogs: [],
  selectedDogId: null,
  activities: [],
  reminders: [],
  vetAppointments: [],
  injections: [],
  milestones: [],
  challenges: [],
  quotes: [],
  pushToken: null,
  themeMode: 'system',
  unitSystem: 'metric',

  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingComplete: (value) => set({ hasCompletedOnboarding: value }),

  addDog: (dog) => {
    set((state) => ({ dogs: [...state.dogs, dog], selectedDogId: state.selectedDogId || dog.id }));
    const userId = uid();
    if (userId) firestoreService.addDog(userId, dog).catch(console.error);
  },

  updateDog: (id, updates) => {
    set((state) => ({ dogs: state.dogs.map((d) => (d.id === id ? { ...d, ...updates } : d)) }));
    const userId = uid();
    if (userId) firestoreService.updateDog(userId, id, updates).catch(console.error);
  },

  removeDog: (id) => {
    set((state) => ({
      dogs: state.dogs.filter((d) => d.id !== id),
      selectedDogId: state.selectedDogId === id ? state.dogs[0]?.id || null : state.selectedDogId,
    }));
    const userId = uid();
    if (userId) firestoreService.deleteDog(userId, id).catch(console.error);
  },

  setSelectedDog: (id) => set({ selectedDogId: id }),

  addActivity: (activity) => {
    set((state) => ({ activities: [activity, ...state.activities] }));
    const userId = uid();
    if (userId && activity.dogId) {
      firestoreService.addActivity(userId, activity.dogId, activity).catch(console.error);
    }
  },

  addReminder: (reminder) => {
    set((state) => ({ reminders: [...state.reminders, reminder] }));
    const userId = uid();
    if (userId && reminder.dogId) {
      firestoreService.addReminder(userId, reminder.dogId, reminder).catch(console.error);
    }
  },

  updateReminder: (id, updates) => {
    set((state) => ({ reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)) }));
    const userId = uid();
    const reminder = get().reminders.find((r) => r.id === id);
    if (userId && reminder?.dogId) {
      firestoreService.updateReminder(userId, reminder.dogId, id, updates).catch(console.error);
    }
  },

  removeReminder: (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
    const userId = uid();
    if (userId && reminder?.dogId) {
      firestoreService.deleteReminder(userId, reminder.dogId, id).catch(console.error);
    }
  },

  addVetAppointment: (appointment) => {
    set((state) => ({ vetAppointments: [...state.vetAppointments, appointment] }));
    const userId = uid();
    if (userId && appointment.dogId) {
      firestoreService.addVetAppointment(userId, appointment.dogId, appointment).catch(console.error);
    }
  },

  addInjection: (injection) => {
    set((state) => ({ injections: [...state.injections, injection] }));
    const userId = uid();
    if (userId && injection.dogId) {
      firestoreService.addInjection(userId, injection.dogId, injection).catch(console.error);
    }
  },

  addMilestone: (milestone) => {
    set((state) => ({ milestones: [...state.milestones, milestone] }));
    const userId = uid();
    if (userId && milestone.dogId) {
      firestoreService.addMilestone(userId, milestone.dogId, milestone).catch(console.error);
    }
  },

  addChallenge: (challenge) => set((state) => ({ challenges: [...state.challenges, challenge] })),
  setQuotes: (quotes) => set({ quotes }),
  setPushToken: (token) => set({ pushToken: token }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setUnitSystem: (system) => set({ unitSystem: system }),
}));
