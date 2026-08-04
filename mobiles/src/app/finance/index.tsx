import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { ListRow, StatCard } from '@/components/ui/list';
import { Card, Divider, Row, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockBalanceSummary, mockMonthlySeries, mockTransactions } from '@/data/mock';

function fmt(n: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(parseFloat(n));
}

export default function FinanceSummaryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const last = mockMonthlySeries[mockMonthlySeries.length - 1];
  const lastIncome = last.income;
  const lastExpense = last.expense;

  return (
    <Screen>
      <ScreenHeader title="Finanzas" subtitle="Agosto 2026" kicker="DINERO" />

      <View style={[styles.hero, { backgroundColor: theme.ink }]}>
        <ThemedText type="stamp" style={{ color: theme.onInk, marginBottom: Spacing.two }}>
          Balance del mes
        </ThemedText>
        <ThemedText type="masthead" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={{ color: theme.onInk }}>
          {fmt(mockBalanceSummary.balance)}
        </ThemedText>
        <View style={[styles.heroRule, { backgroundColor: theme.primary }]} />
        <Row style={styles.heroRow}>
          <Badge label={`+${fmt(String(lastIncome))}`} tone="success" />
          <Badge label={`−${fmt(String(lastExpense))}`} tone="danger" />
        </Row>
      </View>

      <Row style={styles.statsRow}>
        <StatCard label="Ingresos" value={fmt(mockBalanceSummary.totalIncome)} delta={`+${fmt(String(lastIncome - 22000))} vs ene`} positive />
        <StatCard label="Egresos" value={fmt(mockBalanceSummary.totalExpense)} delta="+8% vs jul" />
      </Row>

      <SectionHeader title="Resumen del mes" />
      <Card>
        {mockMonthlySeries.map((m, i) => (
          <View key={m.month}>
            {i > 0 && <Divider />}
            <View style={styles.monthRow}>
              <ThemedText type="small" style={styles.monthLabel}>
                {m.month}
              </ThemedText>
              <View style={styles.monthBarWrap}>
                <View style={[styles.monthBar, { backgroundColor: theme.surfaceAlt }]}>
                  <View style={[styles.monthFill, { backgroundColor: theme.success, width: `${Math.min((m.income / 34000) * 100, 100)}%` }]} />
                </View>
              </View>
              <ThemedText type="smallBold" style={styles.monthAmount}>
                {fmt(String(m.income))}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>

      <SectionHeader title="Accesos rápidos" />
      <Card>
        <ListRow icon="swap-horizontal" title="Transacciones" subtitle="Registro y movimientos" onPress={() => router.push('/finance/transactions')} />
        <Divider />
        <ListRow icon="pie-chart" title="Presupuestos" subtitle="Límites por categoría" onPress={() => router.push('/finance/budgets')} />
        <Divider />
        <ListRow icon="repeat" title="Suscripciones" subtitle="Cobros recurrentes" onPress={() => router.push('/finance/subscriptions')} />
        <Divider />
        <ListRow icon="pricetags" title="Categorías" subtitle="Gestiona categorías" onPress={() => router.push('/finance/categories')} />
        <Divider />
        <ListRow icon="stats-chart" title="Gráficas" subtitle="Análisis mensual" onPress={() => router.push('/finance/charts')} />
        <Divider />
        <ListRow icon="trash" title="Papelera" subtitle="Transacciones eliminadas" onPress={() => router.push('/finance/trash')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  heroRule: {
    width: 44,
    height: 3,
    borderRadius: 2,
    marginVertical: Spacing.three,
  },
  heroRow: {
    gap: Spacing.two,
  },
  statsRow: {
    gap: Spacing.two,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  monthLabel: {
    width: 36,
  },
  monthBarWrap: {
    flex: 1,
  },
  monthBar: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  monthFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  monthAmount: {
    width: 64,
    textAlign: 'right',
  },
});
