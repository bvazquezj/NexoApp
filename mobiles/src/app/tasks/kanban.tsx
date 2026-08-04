import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockKanban, mockTasks, TASK_STATUS_LABELS, type TaskStatus } from '@/data/mock';

const statusTone: Record<TaskStatus, 'default' | 'primary' | 'warning' | 'success'> = {
  PENDING: 'default',
  READY: 'primary',
  REVIEW: 'warning',
  COMPLETED: 'success',
};

export default function TaskKanbanScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Kanban" subtitle={`${mockTasks.length} tareas`} showBack />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>
        {mockKanban.map((col) => (
          <View key={col.status} style={[styles.column, { backgroundColor: theme.surfaceAlt }]}>
            <View style={styles.columnHeader}>
              <Badge label={TASK_STATUS_LABELS[col.status]} tone={statusTone[col.status]} />
              <Badge label={String(col.tasks.length)} tone="default" />
            </View>
            <View style={styles.cards}>
              {col.tasks.map((task) => (
                <Card key={task.id} style={styles.taskCard}>
                  <ThemedText type="smallBold">{task.title}</ThemedText>
                  <View style={styles.taskMeta}>
                    <Badge
                      label={task.priority}
                      tone={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'}
                    />
                    <ThemedText type="small" themeColor="textSecondary">
                      {task.dueDate ?? 'Sin fecha'}
                    </ThemedText>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: Spacing.three,
  },
  column: {
    width: 260,
    borderRadius: Radius.lg,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cards: {
    gap: Spacing.two,
  },
  taskCard: {
    padding: Spacing.three,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
