import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { onAuthChanged } from '../services/auth';

/**
 * Listens to Firebase Auth state and syncs it to the Zustand store.
 * Returns `loading` while the initial auth check is in progress.
 */
export function useAuthListener() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChanged((user) => {
      if (user) {
        useStore.setState({ user, isAuthenticated: true });
      } else {
        useStore.setState({ user: null, isAuthenticated: false });
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  return { loading };
}
