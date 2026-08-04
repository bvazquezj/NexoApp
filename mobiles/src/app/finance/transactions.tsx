import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockTransactions, type TransactionType } from '@/data/mock';

function fmt(n: string, type: TransactionType): string {
  const v = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(parseFloat(n));
  return type === 'INCOME' ? `+${v}` : `−${v}`;
}

export default function TransactionListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = React.useState<'ALL' | TransactionType>('ALL');

  const filtered = mockTransactions.filter((t) => filter === 'ALL' || t.type === filter);

  return (
    <Screen>
      <ScreenHeader title="Transacciones" subtitle={`${mockTransactions.length} movimientos`} showBack />

      <View style={styles.filters}>
        <Chip label="Todas" active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
        <Chip label="Ingresos" active={filter === 'INCOME'} tone="success" onPress={() => setFilter('INCOME')} />
        <Chip label="Gastos" active={filter === 'EXPENSE'} tone="danger" onPress={() => setFilter('EXPENSE')} />
      </View>

      <Card>
        {filtered.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            Sin transacciones
          </ThemedText>
        )}
        {filtered.map((t, i) => (
          <View key={t.id}>
            {i > 0 && <Divider />}
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/finance/${t.id}`)}>
              <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: t.category.color }]} />
                <View style={styles.textWrap}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {t.concept}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t.category.name} · {t.date}
                  </ThemedText>
                </View>
                <ThemedText
                  type="smallBold"
                  themeColor={t.type === 'INCOME' ? 'success' : 'danger'}>
                  {fmt(t.amount, t.type)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      <Card style={styles.summary}>
        <Badge label={`Ingresos +${fmt('33000', 'INCOME')}`} tone="success" />
        <Badge label={`Gastos −${fmt('2430.5', 'EXPENSE')}`} tone="danger" />
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
  },
});
