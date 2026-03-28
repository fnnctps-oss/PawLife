import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from './colors';
import { useStore } from '../store/useStore';

export type ThemeMode = 'system' | 'light' | 'dark';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const systemScheme = useColorScheme();
  const themeMode = useStore((s) => s.themeMode);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
