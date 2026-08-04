import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { EmptyState, ListRow } from '@/components/ui/list';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';

const trash = [
  { id: 'ft1', concept: 'Pago duplicado proveedor', amount: '450', type: 'EXPENSE', deletedAt: '2026-07-31' },
  { id: 'ft2', concept: 'Abono erróneo cliente', amount: '1200', type: 'INCOME', deletedAt: '2026-07-29' },
];

export default function TransactionTrashScreen() {
  return (
    <Screen>
      <ScreenHeader title="Papelera" subtitle="2 transacciones" showBack />
      {trash.length === 0 ? (
        <EmptyState icon="trash-outline" title="Papelera vacía" message="Las transacciones eliminadas aparecerán aquí" />
      ) : (
        <Card>
          {trash.map((t, i) => (
            <View key={t.id}>
              {i > 0 && <Divider />}
              <ListRow
                icon="trash-outline"
                iconTone="danger"
                title={t.concept}
                subtitle={`${t.type === 'INCOME' ? 'Ingreso' : 'Gasto'} · Eliminada ${t.deletedAt}`}
                right={<Badge label={`$${t.amount}`} tone={t.type === 'INCOME' ? 'success' : 'danger'} />}
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
