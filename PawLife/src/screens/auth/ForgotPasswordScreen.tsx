import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, ScreenContainer } from '../../components';
import { colors, spacing, typography, borderRadius, useTheme } from '../../theme';
import { resetPassword } from '../../services/auth';

export const ForgotPasswordScreen: React.FC = () => {
  const { colors: t } = useTheme();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Checkmark animation
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sent) {
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sent, scaleAnim, opacityAnim]);

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSendReset = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else {
        setError(err?.message ?? 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ScreenContainer backgroundColor={t.background}>
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.checkCircle,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="checkmark" size={48} color={colors.white} />
          </Animated.View>

          <Text style={[styles.successTitle, { color: t.darkText }]}>Check Your Email</Text>
          <Text style={[styles.successMessage, { color: t.lightText }]}>
            We've sent a password reset link to{'\n'}
            <Text style={[styles.emailHighlight, { color: t.darkText }]}>{email}</Text>
          </Text>
          <Text style={[styles.successHint, { color: t.lightText }]}>
            Didn't receive the email? Check your spam folder or try again.
          </Text>

          <View style={styles.successActions}>
            <Button
              title="Back to Sign In"
              onPress={() => navigation.goBack()}
              size="lg"
            />

            <TouchableOpacity
              style={styles.resendLink}
              onPress={() => {
                setSent(false);
                scaleAnim.setValue(0);
                opacityAnim.setValue(0);
              }}
            >
              <Text style={styles.resendLinkText}>Try a different email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer backgroundColor={t.background}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: t.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={t.darkText} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: t.card }]}>
            <Ionicons name="key-outline" size={36} color={colors.primary} />
          </View>
        </View>

        {/* Header */}
        <Text style={[styles.title, { color: t.darkText }]}>Forgot Password?</Text>
        <Text style={[styles.description, { color: t.lightText }]}>
          No worries! Enter the email address associated with your account and
          we'll send you a link to reset your password.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Input
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(undefined);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            error={error}
          />

          <Button
            title="Send Reset Link"
            onPress={handleSendReset}
            loading={loading}
            size="lg"
          />
        </View>

        {/* Back to Sign In */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={colors.primary}
            style={styles.backLinkIcon}
          />
          <Text style={styles.backLinkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.base,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.base,
    marginBottom: spacing.xxl,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLinkIcon: {
    marginRight: spacing.xs,
  },
  backLinkText: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: '600',
  },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.massive,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    ...typography.title1,
    color: colors.darkText,
    marginBottom: spacing.md,
  },
  successMessage: {
    ...typography.body,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.base,
  },
  emailHighlight: {
    color: colors.darkText,
    fontWeight: '600',
  },
  successHint: {
    ...typography.footnote,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  successActions: {
    width: '100%',
    gap: spacing.base,
    alignItems: 'center',
  },
  resendLink: {
    paddingVertical: spacing.sm,
  },
  resendLinkText: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: '600',
  },
});
