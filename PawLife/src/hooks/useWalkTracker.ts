import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';

export interface WalkState {
  isTracking: boolean;
  isPaused: boolean;
  duration: number; // seconds
  distance: number; // meters
  route: { latitude: number; longitude: number }[];
  startTime: Date | null;
}

interface WalkResult {
  duration: number;
  distance: number;
  route: { latitude: number; longitude: number }[];
}

/**
 * Haversine formula to calculate distance between two GPS coordinates in meters.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useWalkTracker() {
  const [state, setState] = useState<WalkState>({
    isTracking: false,
    isPaused: false,
    duration: 0,
    distance: 0,
    route: [],
    startTime: null,
  });

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeRef = useRef<{ latitude: number; longitude: number }[]>([]);
  const distanceRef = useRef(0);
  const isPausedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearLocationWatcher = useCallback(async () => {
    if (locationSubscription.current !== null) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }
    }, 1000);
  }, [clearTimer]);

  const startLocationWatcher = useCallback(async () => {
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 5000,
      },
      (location) => {
        if (isPausedRef.current) return;

        const point = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        const prevRoute = routeRef.current;
        if (prevRoute.length > 0) {
          const last = prevRoute[prevRoute.length - 1];
          const segmentDistance = haversineDistance(
            last.latitude,
            last.longitude,
            point.latitude,
            point.longitude
          );
          distanceRef.current += segmentDistance;
        }

        routeRef.current = [...prevRoute, point];

        setState((prev) => ({
          ...prev,
          route: routeRef.current,
          distance: distanceRef.current,
        }));
      }
    );
    locationSubscription.current = sub;
  }, []);

  const startWalk = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    routeRef.current = [];
    distanceRef.current = 0;
    isPausedRef.current = false;

    setState({
      isTracking: true,
      isPaused: false,
      duration: 0,
      distance: 0,
      route: [],
      startTime: new Date(),
    });

    await startLocationWatcher();
    startTimer();
  }, [startLocationWatcher, startTimer]);

  const pauseWalk = useCallback(async () => {
    isPausedRef.current = true;
    await clearLocationWatcher();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [clearLocationWatcher]);

  const resumeWalk = useCallback(async () => {
    isPausedRef.current = false;
    await startLocationWatcher();
    setState((prev) => ({ ...prev, isPaused: false }));
  }, [startLocationWatcher]);

  const stopWalk = useCallback(async (): Promise<WalkResult> => {
    clearTimer();
    await clearLocationWatcher();

    const result: WalkResult = {
      duration: 0,
      distance: distanceRef.current,
      route: routeRef.current,
    };

    // Capture the final duration from state via a promise
    await new Promise<void>((resolve) => {
      setState((prev) => {
        result.duration = prev.duration;
        return {
          ...prev,
          isTracking: false,
          isPaused: false,
        };
      });
      resolve();
    });

    return result;
  }, [clearTimer, clearLocationWatcher]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (locationSubscription.current !== null) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [clearTimer]);

  return {
    ...state,
    startWalk,
    pauseWalk,
    resumeWalk,
    stopWalk,
  };
}
