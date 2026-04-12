import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Reminder, ReminderType } from '../types';

// ---------------------------------------------------------------------------
// Foreground notification handler – show alert + play sound even when app is
// in the foreground so the user never misses a reminder.
// ---------------------------------------------------------------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_NOTIFICATIONS_PER_DAY = 6;
const QUIET_HOURS_START = 22; // 10 PM
const QUIET_HOURS_END = 7; // 7 AM

// ---------------------------------------------------------------------------
// Notification content templates keyed by reminder type
// ---------------------------------------------------------------------------
const NOTIFICATION_TEMPLATES: Record<ReminderType, { title: (dog: string) => string; icon: string }> = {
  food: { title: (dog) => `Time for ${dog}'s meal!`, icon: '\uD83C\uDF56' },
  water: { title: (dog) => `${dog} might be thirsty!`, icon: '\uD83D\uDCA7' },
  walk: { title: (dog) => `Time for ${dog}'s walk!`, icon: '\uD83D\uDEB6' },
  vet: { title: (dog) => `${dog} has a vet appointment!`, icon: '\uD83C\uDFE5' },
  injection: { title: (dog) => `${dog}'s vaccine is due!`, icon: '\uD83D\uDC89' },
  medicine: { title: (dog) => `Time for ${dog}'s medicine`, icon: '\uD83D\uDC8A' },
  grooming: { title: (dog) => `Time for ${dog}'s grooming!`, icon: '\u2728' },
  custom: { title: () => '', icon: '' },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Check whether the given hour falls inside quiet hours. */
function isQuietHour(hour: number): boolean {
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

/**
 * Count how many notifications are already scheduled for a given date so we
 * can enforce the daily cap.
 */
async function countScheduledForDate(date: Date): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter((n) => {
    const trigger = n.trigger as { dateComponents?: { month?: number; day?: number } } | null;
    if (!trigger?.dateComponents) return false;
    return (
      trigger.dateComponents.month === date.getMonth() + 1 &&
      trigger.dateComponents.day === date.getDate()
    );
  }).length;
}

/**
 * Return true when we can still schedule a notification for `date` without
 * exceeding the daily cap.
 */
async function canSchedule(date: Date): Promise<boolean> {
  const count = await countScheduledForDate(date);
  return count < MAX_NOTIFICATIONS_PER_DAY;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Request push-notification permissions and return the Expo push token.
 * Returns `null` when running on the simulator or when permissions are denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Constants.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'PawLife Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF8C42',
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

/**
 * Build the notification content object for a given reminder.
 */
export function buildNotificationContent(
  reminder: Reminder,
  dogName: string,
  quote?: string,
): Notifications.NotificationContentInput {
  const template = NOTIFICATION_TEMPLATES[reminder.type];

  const title =
    reminder.type === 'custom'
      ? reminder.title
      : `${template.title(dogName)} ${template.icon}`;

  const body = quote ?? `Don't forget to take care of ${dogName}!`;

  return {
    title,
    body,
    sound: 'default',
    data: {
      reminderId: reminder.id,
      dogId: reminder.dogId,
      type: reminder.type,
    },
  };
}

/**
 * Map a RepeatPattern to an `expo-notifications` trigger configuration.
 */
function buildTrigger(
  time: Date,
  repeatPattern: Reminder['repeatPattern'],
): Notifications.NotificationTriggerInput {
  const hour = time.getHours();
  const minute = time.getMinutes();

  switch (repeatPattern) {
    case 'daily':
      return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute };
    case 'weekly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: time.getDay() + 1, // expo uses 1-7 (Sun=1)
        hour,
        minute,
      };
    case 'monthly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: time.getDate(),
        hour,
        minute,
      };
    case 'yearly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        month: time.getMonth(),
        day: time.getDate(),
        hour,
        minute,
      };
    case 'once':
    default:
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: time };
  }
}

/**
 * Schedule a local notification for a reminder. Respects quiet hours and the
 * daily cap. Returns the notification identifier.
 */
export async function scheduleReminderNotification(
  reminder: Reminder,
  dogName: string,
  quote?: string,
): Promise<string> {
  const time = new Date(reminder.time);

  // Quiet-hours guard: push to 7 AM if the reminder falls in the quiet window
  if (isQuietHour(time.getHours())) {
    time.setHours(QUIET_HOURS_END, 0, 0, 0);
    if (time <= new Date()) {
      time.setDate(time.getDate() + 1);
    }
  }

  // Daily cap guard
  if (!(await canSchedule(time))) {
    console.warn(`Daily notification cap (${MAX_NOTIFICATIONS_PER_DAY}) reached – skipping.`);
    return '';
  }

  const content = buildNotificationContent(reminder, dogName, quote);
  const trigger = buildTrigger(time, reminder.repeatPattern);

  const id = await Notifications.scheduleNotificationAsync({ content, trigger });
  return id;
}

/**
 * Cancel a single scheduled notification by its identifier.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel every scheduled notification for this app.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule the weekly Paw Report notification for every Sunday at 10 AM.
 */
export async function scheduleWeeklyReportNotification(dogName: string): Promise<string> {
  const content: Notifications.NotificationContentInput = {
    title: `${dogName}'s Weekly Paw Report is ready! \uD83D\uDC3E`,
    body: 'Check out this week\'s activity summary, health insights, and achievements.',
    sound: 'default',
    data: { type: 'weekly_report' },
  };

  const trigger: Notifications.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: 1, // Sunday
    hour: 10,
    minute: 0,
  };

  const id = await Notifications.scheduleNotificationAsync({ content, trigger });
  return id;
}
