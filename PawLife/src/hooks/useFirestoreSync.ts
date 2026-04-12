import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import {
  onDogsSnapshot,
  onActivitiesSnapshot,
  onRemindersSnapshot,
  onVetSnapshot,
  onInjectionsSnapshot,
} from '../services/firestore';

/**
 * Sets up real-time Firestore listeners that keep the Zustand store in sync.
 * Call this once at the app root when the user is authenticated.
 */
export function useFirestoreSync() {
  const user = useStore((s) => s.user);
  const selectedDogId = useStore((s) => s.selectedDogId);
  const unsubs = useRef<(() => void)[]>([]);

  // Listen to dogs collection
  useEffect(() => {
    if (!user?.id) return;

    const unsub = onDogsSnapshot(user.id, (dogs) => {
      useStore.setState({ dogs });
      // Auto-select first dog if none selected
      const current = useStore.getState().selectedDogId;
      if (!current && dogs.length > 0) {
        useStore.setState({ selectedDogId: dogs[0].id });
      }
    });

    return () => unsub();
  }, [user?.id]);

  // Listen to data for the selected dog
  useEffect(() => {
    if (!user?.id || !selectedDogId) return;

    const uid = user.id;
    const dogId = selectedDogId;

    const subs = [
      onActivitiesSnapshot(uid, dogId, (activities) => {
        useStore.setState({ activities });
      }),
      onRemindersSnapshot(uid, dogId, (reminders) => {
        useStore.setState({ reminders });
      }),
      onVetSnapshot(uid, dogId, (vetAppointments) => {
        useStore.setState({ vetAppointments });
      }),
      onInjectionsSnapshot(uid, dogId, (injections) => {
        useStore.setState({ injections });
      }),
    ];

    unsubs.current = subs;

    return () => {
      subs.forEach((fn) => fn());
      unsubs.current = [];
    };
  }, [user?.id, selectedDogId]);
}
