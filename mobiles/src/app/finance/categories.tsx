import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { ListRow } from '@/components/ui/list';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { mockCategories } from '@/data/mock';

const typeLabel: Record<string, string> = { INCOME: 'Ingreso', EXPENSE: 'Gasto', BOTH: 'Ambos' };

export default function CategoryManagerScreen() {
  const income = mockCategories.filter((c) => c.type === 'INCOME' || c.type === 'BOTH');
  const expense = mockCategories.filter((c) => c.type === 'EXPENSE' || c.type === 'BOTH');

  return (
    <Screen>
      <ScreenHeader title="Categorías" subtitle="5 categorías" showBack />

      <SectionHeader title="Ingresos" />
      <Card>
        {income.map((c, i) => (
          <View key={c.id}>
            {i > 0 && <Divider />}
            <ListRow
              icon="arrow-down-circle"
              iconTone="success"
              title={c.name}
              subtitle={`${c.count} transacciones`}
              right={<Badge label={typeLabel[c.type]} tone="success" />}
            />
          </View>
        ))}
      </Card>

      <SectionHeader title="Gastos" />
      <Card>
        {expense.map((c, i) => (
          <View key={c.id}>
            {i > 0 && <Divider />}
            <ListRow
              icon="arrow-up-circle"
              iconTone="danger"
              title={c.name}
              subtitle={`${c.count} transacciones`}
              right={<Badge label={typeLabel[c.type]} tone="default" />}
            />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
