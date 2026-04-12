import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useStore } from '../store/useStore';
import { registerForPushNotifications } from '../services/notifications';

/**
 * Hook that bootstraps push-notification support:
 * 1. Requests permissions and stores the Expo push token.
 * 2. Listens for notification taps so the app can react (e.g. navigate).
 *
 * Call this once near the root of the component tree (e.g. in App.tsx or a
 * top-level layout component).
 */
export function useNotifications() {
  const setPushToken = useStore((s) => s.setPushToken);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // -- Register for push notifications and persist the token -----------
    registerForPushNotifications().then((token) => {
      setPushToken(token);
    });

    // -- Handle notification taps (foreground + background) ---------------
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, unknown> | undefined;
        if (!data) return;

        // Future: use data.type / data.reminderId to deep-link into the
        // relevant screen. For now we simply log it.
        console.log('Notification tapped:', data);
      },
    );

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [setPushToken]);
}
