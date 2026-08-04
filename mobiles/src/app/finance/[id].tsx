import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { mockTransactions } from '@/data/mock';

function fmt(n: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(parseFloat(n));
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = mockTransactions.find((t) => t.id === id) ?? mockTransactions[0];

  return (
    <Screen>
      <ScreenHeader title="Transacción" showBack />

      <Card style={styles.hero}>
        <ThemedText type="subtitle" themeColor={tx.type === 'INCOME' ? 'success' : 'danger'} style={styles.amount}>
          {tx.type === 'INCOME' ? '+' : '−'}
          {fmt(tx.amount)}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.concept}>
          {tx.concept}
        </ThemedText>
        <View style={styles.badges}>
          <Badge label={tx.type === 'INCOME' ? 'Ingreso' : 'Gasto'} tone={tx.type === 'INCOME' ? 'success' : 'danger'} />
          <Badge label={tx.category.name} tone="default" />
        </View>
      </Card>

      <SectionHeader title="Detalles" />
      <Card>
        <Info label="Fecha" value={tx.date} />
        <Divider />
        <Info label="Categoría" value={tx.category.name} />
        <Divider />
        <Info label="Tipo" value={tx.type === 'INCOME' ? 'Ingreso' : 'Gasto'} />
        <Divider />
        <Info label="Cliente" value={tx.clientName ?? '—'} />
      </Card>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.two,
  },
  amount: {
    fontSize: 34,
    lineHeight: 40,
  },
  concept: {
    fontSize: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  infoLabel: {
    flex: 1,
  },
});
