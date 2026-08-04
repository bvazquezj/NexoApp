import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { EmptyState, ListRow } from '@/components/ui/list';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';

const trashTasks = [
  { id: 'd1', title: 'Borrador de propuesta comercial', status: 'PENDING', deletedAt: '2026-07-30', project: 'Consultoría' },
  { id: 'd2', title: 'Antigua landing de marketing', status: 'COMPLETED', deletedAt: '2026-07-28', project: 'Marketing' },
];

export default function TaskTrashScreen() {
  return (
    <Screen>
      <ScreenHeader title="Papelera" subtitle="2 tareas eliminadas" showBack />
      {trashTasks.length === 0 ? (
        <EmptyState icon="trash-outline" title="Papelera vacía" message="Las tareas eliminadas aparecerán aquí" />
      ) : (
        <Card>
          {trashTasks.map((t, i) => (
            <View key={t.id}>
              {i > 0 && <Divider />}
              <ListRow
                icon="trash-outline"
                iconTone="danger"
                title={t.title}
                subtitle={`${t.project} · Eliminada ${t.deletedAt}`}
                right={<Badge label={t.status} tone="default" />}
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
