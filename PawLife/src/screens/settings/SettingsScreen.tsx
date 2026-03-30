import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows, useTheme } from '../../theme';
import type { ThemeMode } from '../../theme';
import { ScreenContainer, Avatar, Card } from '../../components';
import { useStore } from '../../store/useStore';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor = colors.darkText,
  label,
  value,
  onPress,
  rightElement,
  danger = false,
}) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={onPress ? 0.6 : 1}
    disabled={!onPress && !rightElement}
  >
    <View style={[styles.rowIcon, { backgroundColor: (danger ? colors.error : iconColor) + '15' }]}>
      <Ionicons name={icon} size={18} color={danger ? colors.error : iconColor} />
    </View>
    <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
    {value && <Text style={styles.rowValue}>{value}</Text>}
    {rightElement}
    {onPress && !rightElement && (
      <Ionicons name="chevron-forward" size={18} color={colors.lightText} />
    )}
  </TouchableOpacity>
);

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, dogs, themeMode, unitSystem, setThemeMode, setUnitSystem, setAuthenticated, setUser } = useStore();
  const { colors: t, isDark } = useTheme();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          setAuthenticated(false);
          setUser(null);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAuthenticated(false);
            setUser(null);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer backgroundColor={t.background}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar name={user?.displayName || 'User'} size={80} />
        <Text style={styles.userName}>{user?.displayName || 'Dog Lover'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        <TouchableOpacity style={styles.editProfileBtn}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* My Dogs */}
      <Text style={styles.sectionHeader}>MY DOGS</Text>
      <Card style={styles.section}>
        {dogs.length > 0 ? (
          dogs.map((dog, idx) => (
            <React.Fragment key={dog.id}>
              <SettingsRow
                icon="paw"
                iconColor={colors.primary}
                label={dog.name}
                value={dog.breed}
                onPress={() => Alert.alert(dog.name, `${dog.breed}\n${dog.gender}`)}
              />
              {idx < dogs.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        ) : null}
        <View style={dogs.length > 0 ? styles.divider : undefined} />
        <SettingsRow
          icon="add-circle"
          iconColor={colors.accent}
          label="Add Dog"
          onPress={() => navigation.navigate('AddDog')}
        />
      </Card>

      {/* Subscription */}
      <Text style={styles.sectionHeader}>SUBSCRIPTION</Text>
      <Card style={styles.section}>
        <SettingsRow
          icon="diamond"
          iconColor={colors.primary}
          label="Current Plan"
          value={user?.subscription?.plan === 'premium' ? 'Premium' : 'Free'}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="arrow-up-circle"
          iconColor={colors.secondary}
          label="Upgrade to Premium"
          onPress={() => navigation.navigate('Paywall')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="refresh-circle"
          iconColor={colors.lightText}
          label="Restore Purchases"
          onPress={() => Alert.alert('Restored', 'No previous purchases found.')}
        />
      </Card>

      {/* Preferences */}
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <Card style={styles.section}>
        <SettingsRow
          icon="notifications"
          iconColor="#FF9500"
          label="Notifications"
          rightElement={<Switch value={true} trackColor={{ false: colors.border, true: colors.primaryLight }} thumbColor={colors.primary} />}
        />
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: '#5856D6' + '15' }]}>
            <Ionicons name="moon" size={18} color="#5856D6" />
          </View>
          <Text style={[styles.rowLabel, { color: t.darkText }]}>Appearance</Text>
        </View>
        <View style={styles.themeSelector}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.themePill,
                { borderColor: t.border, backgroundColor: t.surface },
                themeMode === opt.key && { borderColor: t.primary, backgroundColor: t.primary + '15' },
              ]}
              onPress={() => setThemeMode(opt.key)}
            >
              <Ionicons
                name={opt.icon}
                size={16}
                color={themeMode === opt.key ? t.primary : t.lightText}
              />
              <Text
                style={[
                  styles.themePillText,
                  { color: t.lightText },
                  themeMode === opt.key && { color: t.primary, fontWeight: '600' },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider} />
        <SettingsRow
          icon="scale"
          iconColor={colors.accent}
          label="Weight Units"
          value={unitSystem === 'metric' ? 'kg' : 'lbs'}
          onPress={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="speedometer"
          iconColor={colors.secondary}
          label="Distance Units"
          value={unitSystem === 'metric' ? 'km' : 'mi'}
          onPress={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
        />
      </Card>

      {/* Health & Data */}
      <Text style={styles.sectionHeader}>HEALTH & DATA</Text>
      <Card style={styles.section}>
        <SettingsRow
          icon="download"
          iconColor="#34C759"
          label="Export Data"
          onPress={() => Alert.alert('Export', 'Data export would start.')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="document-text"
          iconColor="#007AFF"
          label="Health Passport"
          onPress={() => navigation.navigate('HealthPassport')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="people"
          iconColor="#AF52DE"
          label="Breed Buddy"
          onPress={() => navigation.navigate('BreedBuddy')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="bar-chart"
          iconColor="#FF9500"
          label="Weekly Report"
          onPress={() => navigation.navigate('WeeklyPawReport')}
        />
      </Card>

      {/* Support */}
      <Text style={styles.sectionHeader}>SUPPORT</Text>
      <Card style={styles.section}>
        <SettingsRow
          icon="help-circle"
          iconColor="#FF9500"
          label="Help & FAQ"
          onPress={() => Alert.alert('Help', 'FAQ page would open.')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="mail"
          iconColor="#4A90D9"
          label="Contact Us"
          onPress={() => Alert.alert('Contact', 'Email compose would open.')}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="star"
          iconColor="#FFD60A"
          label="Rate the App"
          onPress={() => Alert.alert('Thanks!', 'App Store rating would open.')}
        />
      </Card>

      {/* Danger Zone */}
      <Text style={styles.sectionHeader}>ACCOUNT</Text>
      <Card style={styles.section}>
        <SettingsRow
          icon="log-out"
          label="Sign Out"
          danger
          onPress={handleSignOut}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="trash"
          label="Delete Account"
          danger
          onPress={handleDeleteAccount}
        />
      </Card>

      <Text style={styles.version}>PawLife v1.0.0</Text>
      <View style={{ height: spacing.xxxl }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.sm,
  },
  userName: {
    ...typography.title2,
    color: colors.darkText,
    marginTop: spacing.md,
  },
  userEmail: {
    ...typography.subhead,
    color: colors.lightText,
    marginTop: 2,
  },
  editProfileBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '12',
  },
  editProfileText: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionHeader: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.lightText,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: spacing.xs,
  },
  section: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.base,
    minHeight: 52,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    color: colors.darkText,
    flex: 1,
  },
  rowValue: {
    ...typography.subhead,
    color: colors.lightText,
    marginRight: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 56,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.base,
    paddingBottom: 14,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  themePillText: {
    ...typography.caption1,
    fontWeight: '500',
  },
  version: {
    ...typography.caption1,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
