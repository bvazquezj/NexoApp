import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
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

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function RoutineListScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <ScreenHeader title="Rutinas" subtitle="Bloques por día" showBack />

      <SectionHeader title="Días de la semana" />
      <View style={styles.days}>
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={d}
            activeOpacity={0.7}
            style={[
              styles.dayChip,
              { backgroundColor: mockRoutines.some((r) => r.dayOfWeek === i) ? theme.primaryLight : theme.surface, borderColor: theme.border },
            ]}>
            <ThemedText
              type="smallBold"
              themeColor={mockRoutines.some((r) => r.dayOfWeek === i) ? 'primary' : 'textSecondary'}>
              {d}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {mockRoutines.map((day) => (
        <View key={day.id}>
          <SectionHeader title={day.name} right={<Badge label={day.isActive ? 'Activo' : 'Inactivo'} tone={day.isActive ? 'success' : 'default'} />} />
          <Card>
            {day.blocks.map((b, i) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/habits/routines/${day.id}`)}>
                <View
                  style={[
                    styles.block,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
                  ]}>
                  <View style={[styles.timeCol]}>
                    <ThemedText type="smallBold">{b.startTime}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {b.endTime}
                    </ThemedText>
                  </View>
                  <View style={[styles.typeLine, { backgroundColor: theme.info }]} />
                  <View style={styles.blockText}>
                    <ThemedText type="smallBold">{b.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {BLOCK_TYPE_LABELS[b.type]}
                      {b.habitName ? ` · ${b.habitName}` : ''}
                    </ThemedText>
                  </View>
                  <Badge label={BLOCK_TYPE_LABELS[b.type]} tone={blockTone[b.type]} />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  days: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  dayChip: {
    flex: 1,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  timeCol: {
    width: 44,
    gap: 1,
  },
  typeLine: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: Radius.full,
  },
  blockText: {
    flex: 1,
    gap: 2,
  },
});
