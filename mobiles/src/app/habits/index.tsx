import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { ListRow, StatCard } from '@/components/ui/list';
import { Card, Divider, Row, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockHabits } from '@/data/mock';

export default function HabitTodayScreen() {
  const theme = useTheme();
  const router = useRouter();
  const done = mockHabits.filter((h) => h.isActive && h.completedToday).length;
  const total = mockHabits.filter((h) => h.isActive).length;

  return (
    <Screen>
      <ScreenHeader title="Hábitos" subtitle="Hoy" kicker="TÚ MISMO" />

      <Row style={styles.statsRow}>
        <StatCard label="Completados" value={`${done}/${total}`} />
        <StatCard label="Mejor racha" value="30 días" />
      </Row>

      <SectionHeader title="Tus hábitos de hoy" />
      <Card>
        {mockHabits
          .filter((h) => h.isActive)
          .map((h, i) => (
            <View key={h.id}>
              {i > 0 && <Divider />}
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/habits/${h.id}`)}>
                <View style={styles.habitRow}>
                  <TouchableOpacity
                    onPress={() => {}}
                    style={[styles.check, { borderColor: h.color, backgroundColor: h.completedToday ? h.color : 'transparent' }]}>
                    {h.completedToday && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                  <View style={styles.habitText}>
                    <ThemedText type="smallBold" style={h.completedToday ? styles.strikethrough : undefined}>
                      {h.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Racha: {h.currentStreak} días
                    </ThemedText>
                  </View>
                  <Badge label={`${h.currentStreak}🔥`} tone={h.currentStreak >= 10 ? 'warning' : 'default'} />
                </View>
              </TouchableOpacity>
            </View>
          ))}
      </Card>

      <SectionHeader title="Gestión" />
      <Card>
        <ListRow icon="list" title="Todos los hábitos" subtitle="Ver y crear hábitos" onPress={() => router.push('/habits/list')} />
        <Divider />
        <ListRow icon="alarm" title="Rutinas" subtitle="Bloques diarios" onPress={() => router.push('/habits/routines')} />
        <Divider />
        <ListRow icon="moon" title="Sueño" subtitle="Registro y estadísticas" onPress={() => router.push('/habits/sleep')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    gap: Spacing.two,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitText: {
    flex: 1,
    gap: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});
