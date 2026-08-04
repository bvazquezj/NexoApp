import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockRoutines, BLOCK_TYPE_LABELS, type BlockType } from '@/data/mock';

const blockTone: Record<BlockType, 'purple' | 'primary' | 'info' | 'warning' | 'default'> = {
  HABIT: 'purple',
  PRODUCTIVE: 'primary',
  SLEEP: 'info',
  BREAK: 'warning',
  FREE: 'default',
};

export default function RoutineDayScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const day = mockRoutines.find((r) => r.id === dayId) ?? mockRoutines[0];

  return (
    <Screen>
      <ScreenHeader title={day.name} subtitle="Editor de rutina" showBack />

      <SectionHeader title="Bloques" right={<Badge label={`${day.blocks.length} bloques`} tone="primary" />} />
      {day.blocks.map((b) => (
        <Card key={b.id} style={styles.block}>
          <View style={styles.timeRow}>
            <ThemedText type="smallBold">{b.startTime}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              a las {b.endTime}
            </ThemedText>
            {b.isFlexible ? <Badge label="Flexible" tone="default" /> : null}
          </View>
          <Divider />
          <View style={styles.titleRow}>
            <View style={[styles.dot, { backgroundColor: theme.info }]} />
            <View style={styles.titleText}>
              <ThemedText type="smallBold">{b.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {b.habitName ? `Vincular a: ${b.habitName}` : 'Bloque libre'}
              </ThemedText>
            </View>
            <Badge label={BLOCK_TYPE_LABELS[b.type]} tone={blockTone[b.type]} />
          </View>
        </Card>
      ))}

      <TouchableOpacity activeOpacity={0.8} style={styles.addButton}>
        <ThemedText type="smallBold" themeColor="primary">
          + Añadir bloque
        </ThemedText>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.action, { backgroundColor: theme.surfaceAlt }]}>
          <ThemedText type="smallBold">Guardar cambios</ThemedText>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titleText: {
    flex: 1,
    gap: 2,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    marginTop: Spacing.one,
  },
  actions: {
    marginTop: Spacing.three,
  },
  action: {
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
