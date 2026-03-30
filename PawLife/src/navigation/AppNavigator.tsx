import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, useTheme } from '../theme';
import { useStore } from '../store/useStore';

// Screens
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ActivityHistoryScreen } from '../screens/activities/ActivityHistoryScreen';
import { MilestonesScreen } from '../screens/milestones/MilestonesScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AddDogScreen } from '../screens/profile/AddDogScreen';
import { PaywallScreen } from '../screens/settings/PaywallScreen';
import { RemindersScreen } from '../screens/reminders/RemindersScreen';
import { VetScreen } from '../screens/vet/VetScreen';
import { VaccinationScreen } from '../screens/vet/VaccinationScreen';
import { ChallengesScreen } from '../screens/challenges/ChallengesScreen';
import { WeeklyPawReport } from '../screens/reports/WeeklyPawReport';
import { HealthPassportScreen } from '../screens/health/HealthPassportScreen';
import { BreedBuddyScreen } from '../screens/social/BreedBuddyScreen';
import { BottomSheet } from '../components';
import { LogActivitySheet } from '../screens/activities/LogActivitySheet';
import { ActivityType } from '../types';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LogActivityPlaceholder: React.FC = () => null;

function MainTabs() {
  const { colors: themeColors, isDark } = useTheme();
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('walk');

  const openLog = (type: ActivityType) => {
    setActivityType(type);
    setShowLogSheet(true);
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: themeColors.tabBar,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
            ...shadows.lg,
          },
          tabBarActiveTintColor: themeColors.primary,
          tabBarInactiveTintColor: themeColors.lightText,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Activities') iconName = focused ? 'list-circle' : 'list-circle-outline';
            else if (route.name === 'LogTab') iconName = 'add-circle';
            else if (route.name === 'Milestones') iconName = focused ? 'trophy' : 'trophy-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
            return <Ionicons name={iconName} size={route.name === 'LogTab' ? 40 : 24} color={route.name === 'LogTab' ? themeColors.primary : color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Activities" component={ActivityHistoryScreen} />
        <Tab.Screen
          name="LogTab"
          component={LogActivityPlaceholder}
          options={{
            tabBarLabel: '',
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openLog('walk');
            },
          }}
        />
        <Tab.Screen name="Milestones" component={MilestonesScreen} />
        <Tab.Screen name="Profile" component={SettingsScreen} />
      </Tab.Navigator>

      <BottomSheet
        visible={showLogSheet}
        onClose={() => setShowLogSheet(false)}
        title="Log Activity"
      >
        <LogActivitySheet
          activityType={activityType}
          onClose={() => setShowLogSheet(false)}
          onSave={() => setShowLogSheet(false)}
        />
      </BottomSheet>
    </>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, hasCompletedOnboarding, setOnboardingComplete } = useStore();
  const { colors: themeCol, isDark } = useTheme();

  const navTheme = {
    dark: isDark,
    colors: {
      primary: themeCol.primary,
      background: themeCol.background,
      card: themeCol.card,
      text: themeCol.darkText,
      border: themeCol.border,
      notification: themeCol.error,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '800' as const },
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingScreen
                onComplete={() => setOnboardingComplete(true)}
              />
            )}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="AddDog"
              component={AddDogScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Reminders"
              component={RemindersScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="VetAppointments"
              component={VetScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Vaccinations"
              component={VaccinationScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Challenges"
              component={ChallengesScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="WeeklyPawReport"
              component={WeeklyPawReport}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="HealthPassport"
              component={HealthPassportScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="BreedBuddy"
              component={BreedBuddyScreen}
              options={{ presentation: 'card' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
