import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockHabits } from '@/data/mock';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = mockHabits.find((h) => h.id === id) ?? mockHabits[0];
  const theme = useTheme();
  const rate = Math.min(Math.round((habit.currentStreak / habit.maxStreak) * 100), 100);

  return (
    <Screen>
      <ScreenHeader title="Hábito" showBack />

      <Card>
        <View style={styles.headerRow}>
          <View style={[styles.icon, { backgroundColor: `${habit.color}22` }]}>
            <Ionicons name={habit.icon as keyof typeof Ionicons.glyphMap} size={28} color={habit.color} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="subtitle" style={styles.name}>
              {habit.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {habit.category.name}
            </ThemedText>
          </View>
        </View>
        {habit.description ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
            {habit.description}
          </ThemedText>
        ) : null}
        <View style={styles.badges}>
          <Badge label={habit.isActive ? 'Activo' : 'Inactivo'} tone={habit.isActive ? 'success' : 'default'} />
          <Badge label={habit.frequency === 'DAILY' ? 'Diario' : 'Personalizado'} tone="primary" />
        </View>
      </Card>

      <SectionHeader title="Rachas" />
      <Card>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <ThemedText type="display" themeColor="primary" style={styles.streakValue}>
              {habit.currentStreak}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Racha actual
            </ThemedText>
          </View>
          <View style={styles.streakItem}>
            <ThemedText type="display" style={styles.streakValue}>
              {habit.maxStreak}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Racha máxima
            </ThemedText>
          </View>
        </View>
        <View style={styles.trackWrap}>
          <View style={[styles.track, { borderColor: theme.border }]}>
            <View style={[styles.fill, { backgroundColor: habit.color, width: `${rate}%` }]} />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {rate}% de tu mejor racha
          </ThemedText>
        </View>
      </Card>

      <SectionHeader title="Semana actual" />
      <Card>
        <View style={styles.weekRow}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
            <View key={d} style={styles.dayCell}>
              <View
                style={[
                  styles.dayDot,
                  { backgroundColor: i < habit.currentStreak % 7 ? habit.color : 'transparent', borderColor: habit.color },
                ]}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {d}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
  },
  desc: {
    marginBottom: Spacing.two,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  streakRow: {
    flexDirection: 'row',
    gap: Spacing.five,
    marginBottom: Spacing.three,
  },
  streakItem: {
    gap: 2,
  },
  streakValue: {
    fontSize: 32,
    lineHeight: 38,
  },
  trackWrap: {
    gap: Spacing.one,
  },
  track: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: 'transparent',
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
});
