import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  backgroundColor?: string;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  style,
  backgroundColor,
  padded = true,
  edges = ['top'],
}) => {
  const { colors, isDark } = useTheme();
  const bg = backgroundColor ?? colors.background;

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        padded && styles.padded,
        style,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, padded && styles.padded, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={edges}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
