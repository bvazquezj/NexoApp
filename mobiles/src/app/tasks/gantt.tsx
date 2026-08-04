import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockGantt } from '@/data/mock';

export default function TaskGanttScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Gantt" subtitle="Cronograma de fases" showBack />
      <Card>
        <View style={styles.legend}>
          <Badge label="Progreso" tone="primary" />
          <Badge label="Pendiente" tone="default" />
        </View>
      </Card>

      <SectionHeader title="Fases" />
      {mockGantt.map((phase) => (
        <Card key={phase.id} style={styles.phase}>
          <View style={styles.phaseRow}>
            <View style={styles.phaseText}>
              <ThemedText type="smallBold">{phase.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {phase.startDate} → {phase.endDate}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" themeColor="primary">
              {Math.round(phase.progress * 100)}%
            </ThemedText>
          </View>
          <View style={[styles.bar, { backgroundColor: theme.surfaceAlt }]}>
            <View
              style={[
                styles.barFill,
                { backgroundColor: phase.progress >= 1 ? theme.success : theme.primary, width: `${phase.progress * 100}%` },
              ]}
            />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  phase: {
    marginBottom: Spacing.two,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  phaseText: {
    flex: 1,
    gap: 2,
  },
  bar: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
