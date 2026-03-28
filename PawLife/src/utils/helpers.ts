export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getAge = (dateOfBirth: string): string => {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;

  if (totalMonths < 1) return 'Newborn';
  if (totalMonths < 12) return `${totalMonths} month${totalMonths > 1 ? 's' : ''} old`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (m === 0) return `${y} year${y > 1 ? 's' : ''} old`;
  return `${y}y ${m}m old`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatDistance = (km: number, imperial: boolean = false): string => {
  if (imperial) {
    const miles = km * 0.621371;
    return `${miles.toFixed(1)} mi`;
  }
  return `${km.toFixed(1)} km`;
};

export const getActivityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    walk: 'footsteps-outline',
    food: 'restaurant-outline',
    water: 'water-outline',
    play: 'game-controller-outline',
    training: 'school-outline',
    grooming: 'cut-outline',
    medicine: 'medkit-outline',
    vet_visit: 'medical-outline',
    injection: 'fitness-outline',
    custom: 'add-circle-outline',
  };
  return icons[type] || 'ellipsis-horizontal-circle-outline';
};

export const getActivityColor = (type: string): string => {
  const activityColors: Record<string, string> = {
    walk: '#6BCB77',
    food: '#FF8C42',
    water: '#4A90D9',
    play: '#FFB347',
    training: '#9B59B6',
    grooming: '#E91E63',
    medicine: '#FF4D4D',
    vet_visit: '#00BCD4',
    injection: '#FF6B6B',
    custom: '#8E8E93',
  };
  return activityColors[type] || '#8E8E93';
};

export const getDayOfWeek = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const isToday = (date: string): boolean => {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

export const isThisWeek = (date: string): boolean => {
  const d = new Date(date);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
};
