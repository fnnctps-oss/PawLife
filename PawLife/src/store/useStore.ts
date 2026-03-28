import { create } from 'zustand';
import { User, Dog, Activity, Reminder, VetAppointment, Injection, Milestone, Challenge, Quote } from '../types';

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
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  setUnitSystem: (system: 'metric' | 'imperial') => void;
}

export const useStore = create<AppState>((set) => ({
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
  themeMode: 'system',
  unitSystem: 'metric',

  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingComplete: (value) => set({ hasCompletedOnboarding: value }),
  addDog: (dog) => set((state) => ({ dogs: [...state.dogs, dog], selectedDogId: state.selectedDogId || dog.id })),
  updateDog: (id, updates) =>
    set((state) => ({
      dogs: state.dogs.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDog: (id) =>
    set((state) => ({
      dogs: state.dogs.filter((d) => d.id !== id),
      selectedDogId: state.selectedDogId === id ? state.dogs[0]?.id || null : state.selectedDogId,
    })),
  setSelectedDog: (id) => set({ selectedDogId: id }),
  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities] })),
  addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  removeReminder: (id) => set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) })),
  addVetAppointment: (appointment) =>
    set((state) => ({ vetAppointments: [...state.vetAppointments, appointment] })),
  addInjection: (injection) => set((state) => ({ injections: [...state.injections, injection] })),
  addMilestone: (milestone) => set((state) => ({ milestones: [...state.milestones, milestone] })),
  addChallenge: (challenge) => set((state) => ({ challenges: [...state.challenges, challenge] })),
  setQuotes: (quotes) => set({ quotes }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setUnitSystem: (system) => set({ unitSystem: system }),
}));
