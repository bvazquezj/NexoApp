import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, Chip } from '@/components/ui/badge';
import { ListRow } from '@/components/ui/list';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockTasks, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, type TaskPriority, type TaskStatus } from '@/data/mock';

const STATUS_FILTERS: (TaskStatus | 'ALL')[] = ['ALL', 'PENDING', 'READY', 'REVIEW', 'COMPLETED'];
const PRIORITY_FILTERS: (TaskPriority | 'ALL')[] = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

const statusTone: Record<TaskStatus, 'default' | 'primary' | 'warning' | 'success'> = {
  PENDING: 'default',
  READY: 'primary',
  REVIEW: 'warning',
  COMPLETED: 'success',
};

function ThemedMeta({ children }: { children: ReactNode }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
      {children}
    </ThemedText>
  );
}

export default function TaskListScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <ScreenHeader title="Tareas" subtitle="3 pendientes, 1 en revisión" kicker="TRABAJO" />

      <View style={styles.filters}>
        {STATUS_FILTERS.map((s) => (
          <Chip key={s} label={s === 'ALL' ? 'Todas' : TASK_STATUS_LABELS[s]} active={s === 'ALL'} />
        ))}
      </View>
      <View style={styles.filters}>
        {PRIORITY_FILTERS.map((p) => (
          <Chip
            key={p}
            label={p === 'ALL' ? 'Prioridad' : TASK_PRIORITY_LABELS[p]}
            active={false}
            tone={p === 'HIGH' ? 'danger' : p === 'MEDIUM' ? 'warning' : 'default'}
          />
        ))}
      </View>

      <Card style={styles.listCard}>
        {mockTasks.map((task, i) => (
          <View key={task.id}>
            {i > 0 && <Divider />}
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/tasks/${task.id}`)}>
              <View style={styles.taskRow}>
                <View style={styles.taskHeader}>
                  <View style={[styles.typeDot, { backgroundColor: task.type.color }]} />
                  <ThemedText type="smallBold" style={styles.taskTitle}>
                    {task.title}
                  </ThemedText>
                </View>
                <View style={styles.taskMeta}>
                  <Badge label={TASK_STATUS_LABELS[task.status]} tone={statusTone[task.status]} />
                  <Badge
                    label={TASK_PRIORITY_LABELS[task.priority]}
                    tone={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'}
                  />
                </View>
                <View style={styles.taskFooter}>
                  <ThemedMeta>
                    <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} /> {task.dueDate ?? 'Sin fecha'}
                  </ThemedMeta>
                  <ThemedMeta>
                    <Ionicons name="git-branch-outline" size={13} color={theme.textSecondary} />
                    {task.completedSubtaskCount}/{task.subtaskCount}
                  </ThemedMeta>
                  {task.projectName ? (
                    <ThemedMeta>
                      <Ionicons name="folder-outline" size={13} color={theme.textSecondary} /> {task.projectName}
                    </ThemedMeta>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      <SectionHeader title="Vistas" />
      <Card>
        <ListRow icon="layers-outline" title="Kanban" subtitle="Organiza por estado" onPress={() => router.push('/tasks/kanban')} />
        <Divider />
        <ListRow icon="calendar-outline" title="Gantt" subtitle="Cronograma del proyecto" onPress={() => router.push('/tasks/gantt')} />
        <Divider />
        <ListRow icon="trash-outline" title="Papelera" subtitle="Tareas eliminadas" onPress={() => router.push('/tasks/trash')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  listCard: {
    paddingHorizontal: Spacing.three,
  },
  taskRow: {
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  taskTitle: {
    flex: 1,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  meta: {
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
