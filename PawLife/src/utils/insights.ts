import { Dog, Activity, Reminder, VetAppointment, Injection } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InsightType = 'info' | 'warning' | 'celebration';

export interface Insight {
  id: string;
  icon: string; // Ionicons name
  title: string;
  message: string;
  type: InsightType;
}

// ---------------------------------------------------------------------------
// Breed-specific health tips
// ---------------------------------------------------------------------------

const BREED_TIPS: Record<string, { tip: string; icon: string }> = {
  'golden retriever': {
    tip: 'Golden Retrievers are prone to hip dysplasia — regular walks and a healthy weight help protect their joints.',
    icon: 'fitness-outline',
  },
  'german shepherd': {
    tip: 'German Shepherds can develop degenerative myelopathy. Keep them active and watch for hind-leg weakness.',
    icon: 'fitness-outline',
  },
  'labrador retriever': {
    tip: 'Labs love food a little too much! Monitor portions to prevent obesity-related joint issues.',
    icon: 'restaurant-outline',
  },
  'french bulldog': {
    tip: 'Frenchies are brachycephalic — avoid strenuous exercise in hot weather and watch for breathing issues.',
    icon: 'thermometer-outline',
  },
  bulldog: {
    tip: 'Bulldogs overheat easily. Keep walks short on warm days and ensure plenty of fresh water.',
    icon: 'thermometer-outline',
  },
  poodle: {
    tip: 'Poodles need regular grooming to prevent matting. A professional groom every 6-8 weeks is ideal.',
    icon: 'cut-outline',
  },
  beagle: {
    tip: 'Beagles follow their noses everywhere — keep them leashed outdoors and check ears regularly for infections.',
    icon: 'ear-outline',
  },
  rottweiler: {
    tip: 'Rottweilers can be prone to heart conditions. Regular vet checkups and moderate exercise are key.',
    icon: 'heart-outline',
  },
  'yorkshire terrier': {
    tip: 'Yorkies have delicate teeth — daily dental care and regular cleanings are important.',
    icon: 'happy-outline',
  },
  dachshund: {
    tip: 'Dachshunds are prone to back problems. Avoid jumping from furniture and maintain a healthy weight.',
    icon: 'body-outline',
  },
  boxer: {
    tip: 'Boxers are energetic and prone to allergies. Watch for skin irritation and keep them mentally stimulated.',
    icon: 'leaf-outline',
  },
  'shih tzu': {
    tip: 'Shih Tzus are prone to eye issues — keep facial hair trimmed and watch for signs of irritation.',
    icon: 'eye-outline',
  },
  husky: {
    tip: 'Huskies need lots of exercise and shed heavily. Regular brushing keeps their double coat healthy.',
    icon: 'snow-outline',
  },
  'siberian husky': {
    tip: 'Huskies need lots of exercise and shed heavily. Regular brushing keeps their double coat healthy.',
    icon: 'snow-outline',
  },
  pug: {
    tip: 'Pugs are brachycephalic — keep an eye on breathing during exercise and avoid extreme temperatures.',
    icon: 'thermometer-outline',
  },
  chihuahua: {
    tip: 'Chihuahuas can develop dental problems and are sensitive to cold. Keep them warm and brush their teeth often.',
    icon: 'happy-outline',
  },
  'great dane': {
    tip: 'Great Danes are prone to bloat — feed smaller, frequent meals and avoid exercise right after eating.',
    icon: 'restaurant-outline',
  },
  'cocker spaniel': {
    tip: 'Cocker Spaniels are prone to ear infections. Clean and dry their ears regularly, especially after baths.',
    icon: 'ear-outline',
  },
  corgi: {
    tip: 'Corgis can develop back issues due to their long spine. Keep them at a healthy weight and limit jumping.',
    icon: 'body-outline',
  },
  'pembroke welsh corgi': {
    tip: 'Corgis can develop back issues due to their long spine. Keep them at a healthy weight and limit jumping.',
    icon: 'body-outline',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getWeekRange(weeksAgo: number, now: Date): { start: Date; end: Date } {
  const end = startOfDay(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { start, end };
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateInsights(
  dog: Dog,
  activities: Activity[],
  _reminders: Reminder[],
  vetAppointments: VetAppointment[],
  injections: Injection[],
): Insight[] {
  const now = new Date();
  const dogActivities = activities.filter((a) => a.dogId === dog.id);
  const dogVetAppts = vetAppointments.filter((a) => a.dogId === dog.id);
  const dogInjections = injections.filter((i) => i.dogId === dog.id);

  const all: Insight[] = [];

  // -----------------------------------------------------------------------
  // 1. Walk frequency comparison (this week vs last week)
  // -----------------------------------------------------------------------
  const thisWeek = getWeekRange(0, now);
  const lastWeek = getWeekRange(1, now);

  const walksThisWeek = dogActivities.filter(
    (a) =>
      a.type === 'walk' &&
      new Date(a.timestamp) >= thisWeek.start &&
      new Date(a.timestamp) < thisWeek.end,
  ).length;

  const walksLastWeek = dogActivities.filter(
    (a) =>
      a.type === 'walk' &&
      new Date(a.timestamp) >= lastWeek.start &&
      new Date(a.timestamp) < lastWeek.end,
  ).length;

  if (walksLastWeek > 0) {
    const changePercent = ((walksThisWeek - walksLastWeek) / walksLastWeek) * 100;

    if (changePercent <= -20) {
      all.push({
        id: 'walk-frequency-down',
        icon: 'trending-down-outline',
        title: 'Walk Frequency Dipped',
        message: `${dog.name}'s walks are down ${Math.abs(Math.round(changePercent))}% compared to last week. A short stroll can brighten both your days!`,
        type: 'warning',
      });
    } else if (changePercent >= 20) {
      all.push({
        id: 'walk-frequency-up',
        icon: 'trending-up-outline',
        title: 'Walk Frequency Up!',
        message: `${dog.name}'s walks are up ${Math.round(changePercent)}% this week. Keep up the great work!`,
        type: 'celebration',
      });
    }
  }

  // -----------------------------------------------------------------------
  // 2. Meal consistency this month (>90% = celebration)
  // -----------------------------------------------------------------------
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysThisMonth = daysBetween(monthStart, now) || 1;
  const mealsThisMonth = dogActivities.filter(
    (a) => a.type === 'food' && new Date(a.timestamp) >= monthStart,
  ).length;
  // Assume 2 meals per day as a baseline
  const expectedMeals = daysThisMonth * 2;
  const mealConsistency = expectedMeals > 0 ? mealsThisMonth / expectedMeals : 0;

  if (mealConsistency >= 0.9 && mealsThisMonth >= 4) {
    all.push({
      id: 'meal-consistency',
      icon: 'restaurant-outline',
      title: 'Meal Consistency On Point',
      message: `${dog.name} has been eating consistently this month — ${Math.round(mealConsistency * 100)}% of expected meals logged. Great routine!`,
      type: 'celebration',
    });
  }

  // -----------------------------------------------------------------------
  // 3. No vet visit in 6+ months
  // -----------------------------------------------------------------------
  const sortedVetDates = dogVetAppts
    .map((a) => new Date(a.date).getTime())
    .sort((a, b) => b - a);
  const lastVetVisit = sortedVetDates.length > 0 ? new Date(sortedVetDates[0]) : null;

  if (!lastVetVisit || daysBetween(lastVetVisit, now) > 180) {
    const months = lastVetVisit
      ? Math.round(daysBetween(lastVetVisit, now) / 30)
      : null;
    all.push({
      id: 'vet-visit-due',
      icon: 'medkit-outline',
      title: 'Vet Checkup Reminder',
      message: months
        ? `It's been about ${months} months since ${dog.name}'s last vet visit. Time for a wellness check?`
        : `No vet visits recorded for ${dog.name} yet. Regular checkups help catch issues early.`,
      type: 'info',
    });
  }

  // -----------------------------------------------------------------------
  // 4. Water logs below 3 per day average (last 7 days)
  // -----------------------------------------------------------------------
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const waterLogsLast7 = dogActivities.filter(
    (a) => a.type === 'water' && new Date(a.timestamp) >= sevenDaysAgo,
  ).length;
  const avgWaterPerDay = waterLogsLast7 / 7;

  if (avgWaterPerDay < 3 && dogActivities.some((a) => a.type === 'water')) {
    all.push({
      id: 'low-water',
      icon: 'water-outline',
      title: 'Hydration Check',
      message: `${dog.name}'s water intake is averaging ${avgWaterPerDay.toFixed(1)} logs per day this week. Try to aim for at least 3.`,
      type: 'warning',
    });
  }

  // -----------------------------------------------------------------------
  // 5. Vaccination overdue
  // -----------------------------------------------------------------------
  const overdueVax = dogInjections.filter(
    (inj) => new Date(inj.nextDueDate) < now,
  );

  if (overdueVax.length > 0) {
    const names = overdueVax
      .slice(0, 2)
      .map((v) => v.vaccineName)
      .join(', ');
    all.push({
      id: 'vaccination-overdue',
      icon: 'alert-circle-outline',
      title: 'Vaccination Overdue',
      message: `${dog.name} is overdue for: ${names}${overdueVax.length > 2 ? ` and ${overdueVax.length - 2} more` : ''}. Schedule a vet appointment soon.`,
      type: 'warning',
    });
  }

  // -----------------------------------------------------------------------
  // 6. Walk streak
  // -----------------------------------------------------------------------
  let streakDays = 0;
  const today = startOfDay(now);
  for (let d = 0; d < 365; d++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - d);
    const hasWalk = dogActivities.some((a) => {
      if (a.type !== 'walk') return false;
      const aDate = startOfDay(new Date(a.timestamp));
      return aDate.getTime() === checkDate.getTime();
    });
    if (hasWalk) {
      streakDays++;
    } else {
      break;
    }
  }

  if (streakDays >= 3) {
    all.push({
      id: 'walk-streak',
      icon: 'flame-outline',
      title: `${streakDays}-Day Walk Streak!`,
      message: `${dog.name} has walked every day for ${streakDays} days straight. Amazing dedication!`,
      type: 'celebration',
    });
  }

  // -----------------------------------------------------------------------
  // 7. Low activity day
  // -----------------------------------------------------------------------
  const todayActivities = dogActivities.filter(
    (a) => startOfDay(new Date(a.timestamp)).getTime() === today.getTime(),
  );

  const hour = now.getHours();
  if (hour >= 14 && todayActivities.length < 2) {
    all.push({
      id: 'low-activity-today',
      icon: 'paw-outline',
      title: 'Quiet Day So Far',
      message: `${dog.name} has only ${todayActivities.length} activit${todayActivities.length === 1 ? 'y' : 'ies'} logged today. A quick walk or play session might do you both good!`,
      type: 'info',
    });
  }

  // -----------------------------------------------------------------------
  // 8. Breed-specific tip
  // -----------------------------------------------------------------------
  const breedKey = dog.breed.toLowerCase().trim();
  const breedTip = BREED_TIPS[breedKey];

  if (breedTip) {
    all.push({
      id: 'breed-tip',
      icon: breedTip.icon,
      title: `${dog.breed} Health Tip`,
      message: breedTip.tip,
      type: 'info',
    });
  }

  // -----------------------------------------------------------------------
  // 9. Weight tracking suggestion
  // -----------------------------------------------------------------------
  const weightActivities = dogActivities.filter((a) => a.notes?.toLowerCase().includes('weight'));
  const lastWeightLog = weightActivities.length > 0
    ? new Date(weightActivities[weightActivities.length - 1].timestamp)
    : null;

  if (!lastWeightLog || daysBetween(lastWeightLog, now) > 30) {
    all.push({
      id: 'weight-tracking',
      icon: 'scale-outline',
      title: 'Time for a Weigh-In?',
      message: `Tracking ${dog.name}'s weight monthly helps spot health changes early. Hop on the scale together!`,
      type: 'info',
    });
  }

  // -----------------------------------------------------------------------
  // 10. Birthday approaching
  // -----------------------------------------------------------------------
  if (dog.dateOfBirth) {
    const dob = new Date(dog.dateOfBirth);
    const nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBirthday < now) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntil = daysBetween(now, nextBirthday);

    if (daysUntil <= 30 && daysUntil > 0) {
      const age = nextBirthday.getFullYear() - dob.getFullYear();
      all.push({
        id: 'birthday-approaching',
        icon: 'gift-outline',
        title: 'Birthday Coming Up!',
        message: `${dog.name} turns ${age} in ${daysUntil} day${daysUntil === 1 ? '' : 's'}! Time to plan something special.`,
        type: 'celebration',
      });
    } else if (daysUntil === 0) {
      const age = now.getFullYear() - dob.getFullYear();
      all.push({
        id: 'birthday-today',
        icon: 'gift-outline',
        title: 'Happy Birthday!',
        message: `${dog.name} turns ${age} today! Give them an extra treat to celebrate.`,
        type: 'celebration',
      });
    }
  }

  // -----------------------------------------------------------------------
  // 11. Upcoming vaccination (within 14 days)
  // -----------------------------------------------------------------------
  const upcomingVax = dogInjections.filter((inj) => {
    const due = new Date(inj.nextDueDate);
    return due >= now && daysBetween(now, due) <= 14;
  });

  if (upcomingVax.length > 0) {
    const nextVax = upcomingVax[0];
    const daysUntil = daysBetween(now, new Date(nextVax.nextDueDate));
    all.push({
      id: 'vaccination-upcoming',
      icon: 'calendar-outline',
      title: 'Vaccination Due Soon',
      message: `${nextVax.vaccineName} is due in ${daysUntil} day${daysUntil === 1 ? '' : 's'} for ${dog.name}. Don't forget to schedule it!`,
      type: 'info',
    });
  }

  // -----------------------------------------------------------------------
  // Sort by priority: warnings first, then celebrations, then info
  // Return max 3
  // -----------------------------------------------------------------------
  const priority: Record<InsightType, number> = {
    warning: 0,
    celebration: 1,
    info: 2,
  };

  all.sort((a, b) => priority[a.type] - priority[b.type]);

  return all.slice(0, 3);
}
