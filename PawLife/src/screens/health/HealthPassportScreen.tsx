import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, Card, Button } from '../../components';
import { useTheme, spacing, borderRadius, typography } from '../../theme';
import { useStore } from '../../store/useStore';
import { generateHealthPassportHTML } from '../../utils/healthPassport';

export const HealthPassportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const { dogs, selectedDogId, injections, vetAppointments } = useStore();
  const dog = dogs.find((d) => d.id === selectedDogId);

  const dogInjections = injections.filter((i) => i.dogId === selectedDogId);
  const dogAppointments = vetAppointments.filter((a) => a.dogId === selectedDogId);
  const allergies = dog?.allergies ?? [];

  const overdueCount = dogInjections.filter(
    (i) => new Date(i.nextDueDate).getTime() < Date.now(),
  ).length;

  const handleGeneratePDF = useCallback(async () => {
    if (!dog) return;
    setLoading(true);

    try {
      const html = generateHealthPassportHTML(dog, dogInjections, dogAppointments, allergies);

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${dog.name}'s Health Passport`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Saved', `Health Passport saved to:\n${uri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dog, dogInjections, dogAppointments, allergies]);

  if (!dog) {
    return (
      <ScreenContainer>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.lightText} />
          <Text style={[styles.emptyText, { color: colors.lightText }]}>
            No dog selected. Please add a dog first.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Back header */}
      <View style={styles.header}>
        <Button
          title="Back"
          variant="ghost"
          size="sm"
          fullWidth={false}
          icon={<Ionicons name="chevron-back" size={20} color={colors.primary} />}
          onPress={() => navigation.goBack()}
        />
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.paw}>{'\uD83D\uDC3E'}</Text>
        <Text style={[styles.title, { color: colors.darkText }]}>Health Passport</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.lightText }]}>
        Generate a PDF with {dog.name}'s complete health records
      </Text>

      {/* Dog summary */}
      <Card style={styles.card} variant="elevated">
        <View style={styles.cardHeader}>
          <Ionicons name="paw" size={22} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.darkText }]}>{dog.name}</Text>
        </View>
        <View style={styles.detailGrid}>
          <DetailItem label="Breed" value={dog.breed} color={colors} />
          <DetailItem label="Weight" value={`${dog.weight} kg`} color={colors} />
          <DetailItem label="Gender" value={dog.gender === 'male' ? 'Male' : 'Female'} color={colors} />
          <DetailItem label="Color" value={dog.color} color={colors} />
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          icon="medkit"
          label="Vaccinations"
          value={dogInjections.length}
          colors={colors}
          accentColor={colors.secondary}
        />
        <StatCard
          icon="calendar"
          label="Appointments"
          value={dogAppointments.length}
          colors={colors}
          accentColor={colors.accent}
        />
        <StatCard
          icon="warning"
          label="Overdue"
          value={overdueCount}
          colors={colors}
          accentColor={overdueCount > 0 ? colors.error : colors.lightText}
        />
      </View>

      {/* Allergies preview */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={[styles.cardTitle, { color: colors.darkText }]}>Allergies</Text>
        </View>
        {allergies.length > 0 ? (
          <View style={styles.tagRow}>
            {allergies.map((allergy, i) => (
              <View key={i} style={[styles.allergyTag, { backgroundColor: colors.errorLight }]}>
                <Text style={[styles.allergyText, { color: colors.error }]}>{allergy}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.noData, { color: colors.lightText }]}>No known allergies</Text>
        )}
      </Card>

      {/* PDF contents preview */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.darkText }]}>PDF Will Include</Text>
        </View>
        <View style={styles.checkList}>
          <CheckItem label="Dog profile & identification" colors={colors} />
          <CheckItem label={`${dogInjections.length} vaccination record${dogInjections.length !== 1 ? 's' : ''}`} colors={colors} />
          <CheckItem label={`${dogAppointments.length} vet appointment${dogAppointments.length !== 1 ? 's' : ''}`} colors={colors} />
          <CheckItem label={`${allergies.length} allerg${allergies.length !== 1 ? 'ies' : 'y'} noted`} colors={colors} />
          <CheckItem label="Vaccination status indicators" colors={colors} />
        </View>
      </Card>

      {/* Generate button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Generate & Share PDF"
          onPress={handleGeneratePDF}
          loading={loading}
          icon={<Ionicons name="share-outline" size={20} color="#FFFFFF" />}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
};

/* --- Sub-components --- */

function DetailItem({ label, value, color }: { label: string; value: string; color: any }) {
  return (
    <View style={styles.detailItem}>
      <Text style={[styles.detailLabel, { color: color.lightText }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: color.darkText }]}>{value}</Text>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  colors,
  accentColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  colors: any;
  accentColor: string;
}) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={20} color={accentColor} />
      <Text style={[styles.statValue, { color: colors.darkText }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.lightText }]}>{label}</Text>
    </Card>
  );
}

function CheckItem({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={styles.checkItem}>
      <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
      <Text style={[styles.checkLabel, { color: colors.bodyText }]}>{label}</Text>
    </View>
  );
}

/* --- Styles --- */

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  paw: {
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: {
    marginBottom: spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailItem: {
    width: '45%',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  allergyTag: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  allergyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  checkList: {
    gap: spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkLabel: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.base,
    paddingTop: 120,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
