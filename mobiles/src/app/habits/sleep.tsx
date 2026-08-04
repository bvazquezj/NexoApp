import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { ListRow, StatCard } from '@/components/ui/list';
import { Card, Divider, Row, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockSleepLogs } from '@/data/mock';

export default function SleepScreen() {
  const theme = useTheme();
  const avg = Math.round(mockSleepLogs.reduce((a, l) => a + l.durationMinutes, 0) / mockSleepLogs.length);
  const avgHours = Math.floor(avg / 60);
  const avgMin = avg % 60;
  const last = mockSleepLogs[0];

  return (
    <Screen>
      <ScreenHeader title="Sueño" subtitle="Registro semanal" showBack />

      <Row style={styles.statsRow}>
        <StatCard label="Promedio" value={`${avgHours}h ${avgMin}m`} />
        <StatCard label="Anoche" value={`${Math.floor(last.durationMinutes / 60)}h ${last.durationMinutes % 60}m`} />
      </Row>

      <SectionHeader title="Esta semana" />
      <Card>
        {mockSleepLogs.map((l, i) => {
          const hours = Math.floor(l.durationMinutes / 60);
          const minutes = l.durationMinutes % 60;
          const target = 480;
          const pct = Math.min(l.durationMinutes / target, 1);
          const ok = l.durationMinutes >= 420;
          return (
            <View key={l.id}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <ThemedText type="small" style={styles.date}>
                  {l.date.slice(5)}
                </ThemedText>
                <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                  <View style={[styles.fill, { backgroundColor: ok ? theme.success : theme.warning, width: `${pct * 100}%` }]} />
                </View>
                <ThemedText type="smallBold">
                  {hours}h {minutes}m
                </ThemedText>
              </View>
            </View>
          );
        })}
      </Card>

      <SectionHeader title="Detalles" />
      <Card>
        <ListRow
          icon="moon"
          iconTone="info"
          title="Último registro"
          subtitle="Automático (Samsung Health)"
          right={<Badge label={last.source === 'SAMSUNG_HEALTH' ? 'Auto' : 'Manual'} tone="primary" />}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  date: {
    width: 40,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
