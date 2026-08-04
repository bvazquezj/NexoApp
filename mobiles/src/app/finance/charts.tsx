import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockCategoryBreakdown, mockMonthlySeries } from '@/data/mock';

function fmt(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
}

export default function FinanceChartsScreen() {
  const theme = useTheme();
  const totalExpense = mockCategoryBreakdown.filter((c) => c.name !== 'Ingresos').reduce((a, c) => a + c.amount, 0);
  const maxIncome = Math.max(...mockMonthlySeries.map((m) => m.income));

  return (
    <Screen>
      <ScreenHeader title="Gráficas" subtitle="Análisis anual" showBack />

      <SectionHeader title="Ingresos vs gastos (meses)" />
      <Card>
        {mockMonthlySeries.map((m) => (
          <View key={m.month} style={styles.barRow}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.barLabel}>
              {m.month}
            </ThemedText>
            <View style={styles.barArea}>
              <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                <View style={[styles.fill, { backgroundColor: theme.success, width: `${(m.income / maxIncome) * 100}%` }]} />
              </View>
              <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                <View style={[styles.fill, { backgroundColor: theme.danger, width: `${(m.expense / maxIncome) * 100}%` }]} />
              </View>
            </View>
            <ThemedText type="small" style={styles.barAmount}>
              {fmt(m.income)}
            </ThemedText>
          </View>
        ))}
        <Divider />
        <View style={styles.legend}>
          <Badge label="Ingresos" tone="success" />
          <Badge label="Gastos" tone="danger" />
        </View>
      </Card>

      <SectionHeader title="Distribución de gastos" />
      <Card>
        {mockCategoryBreakdown
          .filter((c) => c.name !== 'Ingresos')
          .map((c) => {
            const pct = (c.amount / totalExpense) * 100;
            return (
              <View key={c.name} style={styles.catRow}>
                <View style={styles.catTop}>
                  <View style={styles.catLabel}>
                    <View style={[styles.dot, { backgroundColor: c.color }]} />
                    <ThemedText type="small">{c.name}</ThemedText>
                  </View>
                  <ThemedText type="smallBold">{fmt(c.amount)}</ThemedText>
                </View>
                <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                  <View style={[styles.fill, { backgroundColor: c.color, width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  barLabel: {
    width: 36,
  },
  barArea: {
    flex: 1,
    gap: 2,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  barAmount: {
    width: 56,
    textAlign: 'right',
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  catRow: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  catTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
