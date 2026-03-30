import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useStore } from '../../store/useStore';
import { ScreenContainer } from '../../components/ScreenContainer';

interface BuddyData {
  id: string;
  dogName: string;
  ownerName: string;
  distance: string;
  age: string;
  emoji: string;
}

interface MeetupData {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
}

const BREED_TIPS: Record<string, string> = {
  'Golden Retriever': 'Golden Retrievers love water! Try a lake meetup.',
  'Labrador Retriever': 'Labs are social butterflies — group walks are perfect!',
  'German Shepherd': 'German Shepherds thrive with structured activities and training meetups.',
  'French Bulldog': 'Frenchies overheat easily — stick to shaded parks and cool mornings.',
  'Poodle': 'Poodles love mental challenges. Try a puzzle-toy playdate!',
  'Beagle': 'Beagles follow their nose. Off-leash meetups in fenced areas work best.',
  'Bulldog': 'Bulldogs prefer low-key hangouts. A chill park bench meetup is ideal.',
  'Husky': 'Huskies have endless energy. Trail runs with other Huskies are a blast!',
};

const DEFAULT_TIP = 'Every breed is unique! Meeting same-breed owners helps you share tips and experiences.';

function getMockBuddies(_breed: string): BuddyData[] {
  return [
    { id: '1', dogName: 'Luna', ownerName: 'Sarah M.', distance: '0.3 mi away', age: '2 yrs', emoji: '\u{1F415}' },
    { id: '2', dogName: 'Cooper', ownerName: 'James K.', distance: '0.7 mi away', age: '4 yrs', emoji: '\u{1F436}' },
    { id: '3', dogName: 'Daisy', ownerName: 'Emily R.', distance: '1.2 mi away', age: '1 yr', emoji: '\u{1F9AE}' },
    { id: '4', dogName: 'Milo', ownerName: 'Alex T.', distance: '1.8 mi away', age: '3 yrs', emoji: '\u{1F429}' },
    { id: '5', dogName: 'Bella', ownerName: 'Olivia P.', distance: '2.4 mi away', age: '5 yrs', emoji: '\u{1F43E}' },
    { id: '6', dogName: 'Charlie', ownerName: 'Noah W.', distance: '3.1 mi away', age: '2 yrs', emoji: '\u{1F415}\u{200D}\u{1F9BA}' },
  ];
}

function getMockMeetups(breed: string): MeetupData[] {
  return [
    { id: '1', title: `${breed} Park Playdate`, date: 'Sat, Apr 5 \u00B7 10:00 AM', location: 'Riverside Dog Park', attendees: 8 },
    { id: '2', title: `${breed} Walk & Talk`, date: 'Sun, Apr 13 \u00B7 9:00 AM', location: 'Lakefront Trail', attendees: 12 },
    { id: '3', title: `${breed} Social Hour`, date: 'Sat, Apr 19 \u00B7 4:00 PM', location: 'Bark & Brew Cafe', attendees: 6 },
  ];
}

export const BreedBuddyScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { dogs, selectedDogId } = useStore();

  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];
  const breed = selectedDog?.breed ?? 'Dog';
  const buddies = getMockBuddies(breed);
  const meetups = getMockMeetups(breed);
  const tip = BREED_TIPS[breed] ?? DEFAULT_TIP;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.darkText }]}>Breed Buddy</Text>
        <Text style={[styles.subtitle, { color: colors.lightText }]}>
          Connect with {breed} owners near you
        </Text>
      </View>

      {/* Map Placeholder */}
      <View
        style={[
          styles.card,
          styles.mapCard,
          {
            backgroundColor: isDark ? 'rgba(74,144,217,0.12)' : 'rgba(74,144,217,0.08)',
            borderColor: isDark ? colors.border : 'rgba(74,144,217,0.15)',
          },
        ]}
      >
        <Ionicons name="location" size={40} color={colors.secondary} />
        <Text style={[styles.mapText, { color: colors.secondary }]}>Map coming soon</Text>
        <Text style={[styles.mapSubtext, { color: colors.lightText }]}>
          Discover {breed} owners in your neighborhood
        </Text>
      </View>

      {/* Nearby Buddies */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>
          Nearby {breed} Owners
        </Text>
        {buddies.map((buddy) => (
          <View
            key={buddy.id}
            style={[
              styles.card,
              styles.buddyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.buddyAvatar}>
              <Text style={styles.buddyEmoji}>{buddy.emoji}</Text>
            </View>
            <View style={styles.buddyInfo}>
              <Text style={[styles.buddyDogName, { color: colors.darkText }]}>
                {buddy.dogName}
              </Text>
              <Text style={[styles.buddyOwnerName, { color: colors.lightText }]}>
                {buddy.ownerName}
              </Text>
              <View style={styles.buddyMeta}>
                <Ionicons name="navigate-outline" size={12} color={colors.lightText} />
                <Text style={[styles.buddyMetaText, { color: colors.lightText }]}>
                  {buddy.distance}
                </Text>
                <View style={[styles.metaDot, { backgroundColor: colors.lightText }]} />
                <Text style={[styles.buddyMetaText, { color: colors.lightText }]}>
                  {buddy.age}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.waveButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Text style={styles.waveButtonText}>{`Wave \u{1F44B}`}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Breed Meetups */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>Breed Meetups</Text>
        {meetups.map((meetup) => (
          <View
            key={meetup.id}
            style={[
              styles.card,
              styles.meetupCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.meetupHeader}>
              <View
                style={[
                  styles.meetupIconContainer,
                  { backgroundColor: isDark ? 'rgba(255,140,66,0.15)' : 'rgba(255,140,66,0.1)' },
                ]}
              >
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <View style={styles.meetupInfo}>
                <Text style={[styles.meetupTitle, { color: colors.darkText }]}>
                  {meetup.title}
                </Text>
                <Text style={[styles.meetupDate, { color: colors.lightText }]}>
                  {meetup.date}
                </Text>
              </View>
            </View>
            <View style={styles.meetupFooter}>
              <View style={styles.meetupDetail}>
                <Ionicons name="location-outline" size={14} color={colors.lightText} />
                <Text style={[styles.meetupDetailText, { color: colors.bodyText }]}>
                  {meetup.location}
                </Text>
              </View>
              <View style={styles.meetupDetail}>
                <Ionicons name="people-outline" size={14} color={colors.lightText} />
                <Text style={[styles.meetupDetailText, { color: colors.bodyText }]}>
                  {meetup.attendees} attending
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Tips Section */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={[styles.sectionTitle, { color: colors.darkText }]}>Breed Tip</Text>
        <View
          style={[
            styles.card,
            styles.tipCard,
            {
              backgroundColor: isDark ? 'rgba(107,203,119,0.12)' : 'rgba(107,203,119,0.08)',
              borderColor: isDark ? colors.border : 'rgba(107,203,119,0.2)',
            },
          ]}
        >
          <Ionicons name="bulb" size={24} color={colors.accent} style={styles.tipIcon} />
          <Text style={[styles.tipText, { color: colors.bodyText }]}>{tip}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
  },
  mapCard: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  mapText: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
  },
  mapSubtext: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  buddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  buddyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,140,66,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyEmoji: {
    fontSize: 24,
  },
  buddyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  buddyDogName: {
    fontSize: 16,
    fontWeight: '700',
  },
  buddyOwnerName: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  buddyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  buddyMetaText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 3,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 6,
  },
  waveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  waveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  meetupCard: {
    padding: 16,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  meetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  meetupDate: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  meetupFooter: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  meetupDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetupDetailText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
});
