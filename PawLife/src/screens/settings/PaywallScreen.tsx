import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../../theme';
import { Button } from '../../components';

const FEATURES = [
  { label: 'Unlimited dog profiles', badge: null },
  { label: 'AI health insights', badge: 'New' },
  { label: 'Shareable milestone cards', badge: null },
  { label: 'Full weekly Paw Reports', badge: 'Popular' },
  { label: 'Community challenges', badge: null },
  { label: 'Breed Buddy matching', badge: null },
  { label: 'Vet Health Passport', badge: null },
  { label: 'GPS walk tracking', badge: null },
  { label: 'Custom quote packs', badge: null },
  { label: 'Priority support', badge: null },
];

type PlanKey = 'monthly' | 'yearly' | 'lifetime';

const PLANS: { key: PlanKey; label: string; price: string; detail: string; badge?: string }[] = [
  { key: 'monthly', label: 'Monthly', price: '$4.99', detail: '/month' },
  { key: 'yearly', label: 'Yearly', price: '$29.99', detail: '/year', badge: 'Save 50%' },
  { key: 'lifetime', label: 'Lifetime', price: '$79.99', detail: 'one-time', badge: 'Best Value' },
];

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('yearly');

  const handleSubscribe = () => {
    Alert.alert(
      'Trial Started!',
      'Your 30-day free trial has been activated. Enjoy all premium features!',
      [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.darkText} />
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#FF8C42', '#FFB07A']}
            style={styles.heroIcon}
          >
            <Ionicons name="paw" size={40} color={colors.white} />
          </LinearGradient>
          <Text style={styles.heroTitle}>Unlock PawLife Premium</Text>
          <Text style={styles.heroSubtitle}>Give your dog the best care</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresList}>
          {FEATURES.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </View>
              <Text style={styles.featureText}>{feature.label}</Text>
              {feature.badge && (
                <View style={[styles.featureBadge, feature.badge === 'New' ? styles.newBadge : styles.popularBadge]}>
                  <Text style={styles.featureBadgeText}>{feature.badge}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Pricing Cards */}
        <View style={styles.plansRow}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.key}
              style={[
                styles.planCard,
                selectedPlan === plan.key && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan.key)}
            >
              {plan.badge && (
                <View style={[styles.planBadge, selectedPlan === plan.key && styles.planBadgeSelected]}>
                  <Text style={[styles.planBadgeText, selectedPlan === plan.key && { color: colors.white }]}>
                    {plan.badge}
                  </Text>
                </View>
              )}
              <Text style={[styles.planLabel, selectedPlan === plan.key && { color: colors.primary }]}>
                {plan.label}
              </Text>
              <Text style={[styles.planPrice, selectedPlan === plan.key && { color: colors.primary }]}>
                {plan.price}
              </Text>
              <Text style={styles.planDetail}>{plan.detail}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <Button title="Start Free 30-Day Trial" onPress={handleSubscribe} size="lg" />
        <Text style={styles.ctaSubtext}>
          Then {selectedPlan === 'monthly' ? '$4.99/month' : selectedPlan === 'yearly' ? '$29.99/year' : '$79.99 one-time'}. Cancel anytime.
        </Text>

        <TouchableOpacity style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Trust badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="close-circle-outline" size={18} color={colors.lightText} />
            <Text style={styles.trustText}>Cancel anytime</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.lightText} />
            <Text style={styles.trustText}>Secure payment</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh-outline" size={18} color={colors.lightText} />
            <Text style={styles.trustText}>30-day guarantee</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.xxxl,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...shadows.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  heroTitle: {
    ...typography.title1,
    color: colors.darkText,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.subhead,
    color: colors.lightText,
    marginTop: spacing.xs,
  },
  featuresList: {
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.body,
    color: colors.darkText,
    flex: 1,
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  newBadge: {
    backgroundColor: '#E8F1FB',
  },
  popularBadge: {
    backgroundColor: '#FFF0E5',
  },
  featureBadgeText: {
    ...typography.caption2,
    fontWeight: '600',
    color: colors.primary,
  },
  plansRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFF0E5',
    marginBottom: spacing.sm,
  },
  planBadgeSelected: {
    backgroundColor: colors.primary,
  },
  planBadgeText: {
    ...typography.caption2,
    fontWeight: '700',
    color: colors.primary,
  },
  planLabel: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.lightText,
    marginBottom: 4,
  },
  planPrice: {
    ...typography.title3,
    color: colors.darkText,
  },
  planDetail: {
    ...typography.caption2,
    color: colors.lightText,
    marginTop: 2,
  },
  ctaSubtext: {
    ...typography.caption1,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  restoreBtn: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  restoreText: {
    ...typography.subhead,
    color: colors.secondary,
    fontWeight: '500',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  trustItem: {
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    ...typography.caption2,
    color: colors.lightText,
  },
});
