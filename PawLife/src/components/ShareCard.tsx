import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type ShareCardType = 'milestone' | 'activity' | 'report' | 'profile';

export interface ShareCardProps {
  type: ShareCardType;
  dogName: string;
  dogBreed: string;
  title: string;
  subtitle?: string;
  quote?: string;
  stat?: string;
  date: string;
}

const typeConfig: Record<ShareCardType, {
  gradient: [string, string, ...string[]];
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  milestone: {
    gradient: ['#FF8C42', '#FF6B4A', '#FF4D6A'],
    icon: 'trophy',
  },
  activity: {
    gradient: ['#FF8C42', '#FFB07A', '#FF8C42'],
    icon: 'paw',
  },
  report: {
    gradient: ['#FF8C42', '#E07030', '#C05020'],
    icon: 'stats-chart',
  },
  profile: {
    gradient: ['#FFB07A', '#FF8C42', '#FF6B4A'],
    icon: 'heart',
  },
};

export const ShareCard = forwardRef<View, ShareCardProps>(
  ({ type, dogName, dogBreed, title, subtitle, quote, stat, date }, ref) => {
    const config = typeConfig[type];

    return (
      <View ref={ref} style={styles.cardOuter} collapsable={false}>
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Top decorative circles */}
          <View style={styles.decorCircleTopRight} />
          <View style={styles.decorCircleBottomLeft} />

          {/* Header — dog info */}
          <View style={styles.header}>
            <View style={styles.breedBadge}>
              <Ionicons name="paw" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.breedText}>{dogBreed}</Text>
            </View>
          </View>

          {/* Dog name */}
          <Text style={styles.dogName}>{dogName}</Text>

          {/* Type icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={config.icon} size={44} color="#FF8C42" />
            </View>
          </View>

          {/* Main title */}
          <Text style={styles.title}>{title}</Text>

          {/* Stat */}
          {stat ? <Text style={styles.stat}>{stat}</Text> : null}

          {/* Subtitle */}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          {/* Quote */}
          {quote ? (
            <View style={styles.quoteContainer}>
              <View style={styles.quoteLine} />
              <Text style={styles.quote}>{`"${quote}"`}</Text>
            </View>
          ) : null}

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Date */}
          <Text style={styles.date}>{date}</Text>

          {/* Branding footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <View style={styles.brandRow}>
              <Ionicons name="paw" size={18} color="rgba(255,255,255,0.85)" />
              <Text style={styles.brandName}> PawLife</Text>
            </View>
            <Text style={styles.brandTagline}>
              Track your dog's best life — pawlife.app
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  cardOuter: {
    width: 360,
    aspectRatio: 1080 / 1920,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 36,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircleTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircleBottomLeft: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  breedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  breedText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dogName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  stat: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteContainer: {
    marginTop: 16,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  quoteLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  quote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  spacer: {
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  footerDivider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.3,
  },
});
