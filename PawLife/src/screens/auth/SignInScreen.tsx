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
import { useTranslation } from 'react-i18next';
import { Button, Input, ScreenContainer } from '../../components';
import { colors, spacing, typography, borderRadius, useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import { signInWithEmail } from '../../services/auth';

export const SignInScreen: React.FC = () => {
  const { t: tr } = useTranslation();
  const { colors: t } = useTheme();
  const navigation = useNavigation<any>();
  const { setAuthenticated, setUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await signInWithEmail(email.trim(), password);
      setUser(user);
      setAuthenticated(true);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrors({ password: 'Invalid email or password' });
      } else if (code === 'auth/too-many-requests') {
        setErrors({ password: 'Too many attempts. Please try again later.' });
      } else {
        setErrors({ password: err?.message ?? 'Sign in failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    // Google/Apple sign-in requires native modules — placeholder for now
    alert(`${provider} sign-in requires native configuration. Use email/password for now.`);
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
            <Ionicons name="paw" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: t.darkText }]}>PawLife</Text>
          <Text style={[styles.tagline, { color: t.lightText }]}>{tr('auth.tagline')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            icon="mail-outline"
            placeholder={tr('auth.emailAddress')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            icon="lock-closed-outline"
            placeholder={tr('auth.password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>{tr('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          <Button
            title={tr('auth.signIn')}
            onPress={handleSignIn}
            loading={loading}
            size="lg"
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
          <Text style={[styles.dividerText, { color: t.lightText }]}>{tr('auth.orContinueWith')}</Text>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
        </View>

        {/* Social Sign In */}
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialButton, { borderColor: t.border, backgroundColor: t.card }]}
            onPress={() => handleSocialSignIn('google')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-google" size={22} color={t.darkText} />
            <Text style={[styles.socialButtonText, { color: t.darkText }]}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { borderColor: t.border, backgroundColor: t.card }]}
            onPress={() => handleSocialSignIn('apple')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-apple" size={22} color={t.darkText} />
            <Text style={[styles.socialButtonText, { color: t.darkText }]}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.bottomLink}>
          <Text style={[styles.bottomLinkText, { color: t.lightText }]}>{tr('auth.noAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.bottomLinkAction}>{tr('auth.signUp')}</Text>
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
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: spacing.base,
  },
  appName: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.subhead,
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    ...typography.subhead,
    color: colors.primary,
    fontWeight: '600',
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
