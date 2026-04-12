import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, ScreenContainer } from '../../components';
import { colors, spacing, typography, borderRadius, useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import { signUpWithEmail } from '../../services/auth';

export const SignUpScreen: React.FC = () => {
  const { colors: t } = useTheme();
  const navigation = useNavigation<any>();
  const { setAuthenticated, setUser } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await signUpWithEmail(email.trim(), password, name.trim());
      setUser(user);
      setAuthenticated(true);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered' });
      } else if (code === 'auth/weak-password') {
        setErrors({ password: 'Password is too weak' });
      } else {
        setErrors({ email: err?.message ?? 'Sign up failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    setUser({
      id: '1',
      email: `user@${provider}.com`,
      displayName: `${provider} User`,
      photoURL: '',
      subscription: { plan: 'free' },
      createdAt: new Date().toISOString(),
    });
    setAuthenticated(true);
  };

  return (
    <ScreenContainer backgroundColor={t.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: t.card }]}>
            <Ionicons name="paw" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: t.darkText }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: t.lightText }]}>Join PawLife and start tracking</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            icon="person-outline"
            placeholder="Full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              clearError('name');
            }}
            autoCapitalize="words"
            autoCorrect={false}
            error={errors.name}
          />

          <Input
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError('email');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError('password');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearError('confirmPassword');
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />

          <View style={styles.buttonSpacing}>
            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              size="lg"
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
          <Text style={[styles.dividerText, { color: t.lightText }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
        </View>

        {/* Social Sign Up */}
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialButton, { borderColor: t.border, backgroundColor: t.card }]}
            onPress={() => handleSocialSignUp('google')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-google" size={22} color={t.darkText} />
            <Text style={[styles.socialButtonText, { color: t.darkText }]}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { borderColor: t.border, backgroundColor: t.card }]}
            onPress={() => handleSocialSignUp('apple')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-apple" size={22} color={t.darkText} />
            <Text style={[styles.socialButtonText, { color: t.darkText }]}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={styles.bottomLink}>
          <Text style={[styles.bottomLinkText, { color: t.lightText }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.bottomLinkAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoCircle: {
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
    marginBottom: spacing.base,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
  },
  form: {
    marginBottom: spacing.xl,
  },
  buttonSpacing: {
    marginTop: spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...typography.footnote,
    marginHorizontal: spacing.base,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  socialButtonText: {
    ...typography.callout,
    fontWeight: '600',
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  bottomLinkText: {
    ...typography.subhead,
  },
  bottomLinkAction: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: '700',
  },
});
