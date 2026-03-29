import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ViewToken,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, useTheme } from '../../theme';
import { Button } from '../../components/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingPage {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconGradient: [string, string];
  title: string;
  subtitle: string;
  isFinal?: boolean;
}

const PAGES: OnboardingPage[] = [
  {
    id: 'welcome',
    icon: 'paw',
    iconGradient: [colors.primary, colors.primaryDark],
    title: 'Welcome to PawLife',
    subtitle: 'Every wag, walk, and woof — beautifully tracked.',
  },
  {
    id: 'track',
    icon: 'clipboard',
    iconGradient: [colors.secondary, colors.secondaryDark],
    title: 'Track Every Moment',
    subtitle:
      'Walks, meals, water, vet visits, injections — all in one place.',
  },
  {
    id: 'reminders',
    icon: 'notifications',
    iconGradient: [colors.accent, colors.accentDark],
    title: 'Never Miss a Thing',
    subtitle:
      'Smart reminders with heartwarming quotes that make caring for your dog a joy.',
  },
  {
    id: 'share',
    icon: 'share-social',
    iconGradient: ['#FF8C42', '#FF4D4D'],
    title: 'Celebrate & Share',
    subtitle:
      "Beautiful milestone cards and weekly reports you'll actually want to share.",
  },
  {
    id: 'trial',
    icon: 'star',
    iconGradient: ['#FFB07A', '#FF8C42'],
    title: 'Start Your Free\n10-Day Trial',
    subtitle: '',
    isFinal: true,
  },
];

const TRIAL_FEATURES = [
  'Unlimited activity tracking',
  'Smart reminders & notifications',
  'Beautiful milestone cards',
  'Weekly health reports',
  'Multi-dog support',
];

const DOT_SIZE = 8;
const DOT_SPACING = 8;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { colors: t } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = useCallback(() => {
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  }, [currentIndex, onComplete]);

  const handleSkip = useCallback(() => {
    flatListRef.current?.scrollToIndex({
      index: PAGES.length - 1,
      animated: true,
    });
  }, []);

  const renderIcon = (page: OnboardingPage) => {
    const iconScale = new Animated.Value(0);
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <LinearGradient
          colors={page.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons name={page.icon} size={64} color={colors.white} />
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderTrialFeature = (feature: string, index: number) => (
    <View key={index} style={styles.featureRow}>
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={16} color={colors.white} />
      </View>
      <Text style={[styles.featureText, { color: t.darkText }]}>{feature}</Text>
    </View>
  );

  const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.page, { width: SCREEN_WIDTH }]}>
        <Animated.View
          style={[
            styles.pageContent,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          {renderIcon(item)}

          <Text style={[styles.title, { color: t.darkText }]}>{item.title}</Text>

          {item.isFinal ? (
            <View style={styles.featuresContainer}>
              {TRIAL_FEATURES.map(renderTrialFeature)}
            </View>
          ) : (
            <Text style={[styles.subtitle, { color: t.bodyText }]}>{item.subtitle}</Text>
          )}
        </Animated.View>
      </View>
    );
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {PAGES.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [DOT_SIZE, DOT_SIZE * 3, DOT_SIZE],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        const dotColor = scrollX.interpolate({
          inputRange,
          outputRange: [colors.placeholderText, colors.primary, colors.placeholderText],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
                backgroundColor: dotColor,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const isLastPage = currentIndex === PAGES.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: t.background }]}>
      {/* Skip button */}
      {!isLastPage && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + spacing.md }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.lg }]}>
        {renderDots()}

        <View style={styles.buttonContainer}>
          {isLastPage ? (
            <>
              <Button
                title="Start Free Trial"
                onPress={onComplete}
                variant="primary"
                size="lg"
              />
              <TouchableOpacity
                style={styles.freeLink}
                onPress={onComplete}
                activeOpacity={0.7}
              >
                <Text style={styles.freeLinkText}>Continue with Free Plan</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
              variant="primary"
              size="lg"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  skipText: {
    ...typography.headline,
    color: colors.lightText,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  pageContent: {
    alignItems: 'center',
    maxWidth: 340,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    ...typography.largeTitle,
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  subtitle: {
    ...typography.body,
    color: colors.bodyText,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.sm,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    gap: spacing.base,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    ...typography.body,
    color: colors.darkText,
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DOT_SPACING,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: spacing.base,
  },
  freeLink: {
    paddingVertical: spacing.sm,
  },
  freeLinkText: {
    ...typography.headline,
    color: colors.lightText,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
