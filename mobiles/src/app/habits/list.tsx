import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { mockHabitCategories, mockHabits } from '@/data/mock';

export default function HabitListScreen() {
  const router = useRouter();
  const [category, setCategory] = React.useState<string>('ALL');

  const filtered = mockHabits.filter((h) => category === 'ALL' || h.category.id === category);
  const active = filtered.filter((h) => h.isActive);

  return (
    <Screen>
      <ScreenHeader title="Hábitos" subtitle={`${mockHabits.length} hábitos`} showBack />

      <View style={styles.filters}>
        <Chip label="Todos" active={category === 'ALL'} onPress={() => setCategory('ALL')} />
        {mockHabitCategories.map((c) => (
          <Chip key={c.id} label={c.name} active={category === c.id} tone="default" onPress={() => setCategory(c.id)} />
        ))}
      </View>

      <SectionHeader title="Activos" />
      <Card>
        {active.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            Sin hábitos en esta categoría
          </ThemedText>
        )}
        {active.map((h, i) => (
          <View key={h.id}>
            {i > 0 && <Divider />}
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/habits/${h.id}`)}>
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: `${h.color}22` }]}>
                  <Ionicons name={h.icon as keyof typeof Ionicons.glyphMap} size={20} color={h.color} />
                </View>
                <View style={styles.textWrap}>
                  <ThemedText type="smallBold">{h.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {h.category.name} · {h.frequency === 'DAILY' ? 'Diario' : 'Personalizado'}
                  </ThemedText>
                </View>
                <Badge label={`${h.currentStreak}🔥`} tone={h.currentStreak >= 10 ? 'warning' : 'default'} />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      <SectionHeader title="Inactivos" />
      <Card>
        {mockHabits
          .filter((h) => !h.isActive)
          .map((h, i) => (
            <View key={h.id}>
              {i > 0 && <Divider />}
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/habits/${h.id}`)}>
                <View style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: `${h.color}22` }]}>
                    <Ionicons name={h.icon as keyof typeof Ionicons.glyphMap} size={20} color={h.color} />
                  </View>
                  <View style={styles.textWrap}>
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      {h.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Racha máxima: {h.maxStreak} días
                    </ThemedText>
                  </View>
                  <Badge label="Inactivo" tone="default" />
                </View>
              </TouchableOpacity>
            </View>
          ))}
      </Card>
    </Screen>
  );
}

import * as React from 'react';

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
