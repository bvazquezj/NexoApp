import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { ListRow } from '@/components/ui/list';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockTasks, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/data/mock';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const task = mockTasks.find((t) => t.id === id) ?? mockTasks[0];

  return (
    <Screen>
      <ScreenHeader title="Detalle de tarea" showBack />

      <Card>
        <ThemedText type="subtitle" style={styles.title}>
          {task.title}
        </ThemedText>
        <View style={styles.badges}>
          <Badge label={TASK_STATUS_LABELS[task.status]} tone={task.status === 'COMPLETED' ? 'success' : task.status === 'REVIEW' ? 'warning' : task.status === 'READY' ? 'primary' : 'default'} />
          <Badge
            label={TASK_PRIORITY_LABELS[task.priority]}
            tone={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'}
          />
        </View>
        {task.description ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
            {task.description}
          </ThemedText>
        ) : null}
      </Card>

      <SectionHeader title="Información" />
      <Card>
        <InfoRow icon="calendar-outline" label="Vence" value={task.dueDate ?? 'Sin fecha'} />
        <Divider />
        <InfoRow icon="flag-outline" label="Inicia" value={task.startDate ?? 'Sin fecha'} />
        <Divider />
        <InfoRow icon="folder-outline" label="Proyecto" value={task.projectName ?? '—'} />
        <Divider />
        <InfoRow icon="pricetag-outline" label="Tipo" value={task.type.name} />
      </Card>

      <SectionHeader title={`Subtareas (${task.completedSubtaskCount}/${task.subtaskCount})`} />
      <Card>
        {[0, 1, 2].map((n) =>
          n < task.subtaskCount ? (
            <View key={n}>
              {n > 0 && <Divider />}
              <ListRow
                icon={n < task.completedSubtaskCount ? 'checkmark-circle' : 'ellipse-outline'}
                iconTone={n < task.completedSubtaskCount ? 'success' : 'default'}
                title={`Subtarea ${n + 1}`}
              />
            </View>
          ) : null,
        )}
        {task.subtaskCount === 0 && <EmptyNote text="Sin subtareas" />}
      </Card>
    </Screen>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={theme.textSecondary} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" style={styles.emptyNote}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    lineHeight: 30,
    marginBottom: Spacing.two,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  desc: {
    marginTop: Spacing.one,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    textAlign: 'right',
  },
  emptyNote: {
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
});
