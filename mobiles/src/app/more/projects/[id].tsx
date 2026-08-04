import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockProjects, PROJECT_STATUS_LABELS, type ProjectStatus } from '@/data/mock';

const statusTone: Record<ProjectStatus, 'default' | 'primary' | 'warning' | 'success' | 'danger'> = {
  ACTIVE: 'primary',
  IN_PROGRESS: 'success',
  PAUSED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  ARCHIVED: 'default',
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
  const pct = project.taskCount ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0;

  return (
    <Screen>
      <ScreenHeader title="Proyecto" showBack />

      <Card>
        <View style={styles.headerRow}>
          <View style={[styles.icon, { backgroundColor: `${project.color}22` }]}>
            <Ionicons name="folder" size={24} color={project.color} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="subtitle" style={styles.name}>
              {project.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {project.clientName ?? 'Proyecto interno'}
            </ThemedText>
          </View>
        </View>
        {project.description ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
            {project.description}
          </ThemedText>
        ) : null}
        <Badge label={PROJECT_STATUS_LABELS[project.status]} tone={statusTone[project.status]} />
      </Card>

      <SectionHeader title="Progreso" />
      <Card>
        <View style={styles.progressRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {project.completedTaskCount} de {project.taskCount} tareas
          </ThemedText>
          <ThemedText type="smallBold">{pct}%</ThemedText>
        </View>
        <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
          <View style={[styles.fill, { backgroundColor: project.color, width: `${pct}%` }]} />
        </View>
      </Card>

      <SectionHeader title="Información" />
      <Card>
        <InfoRow icon="calendar-outline" label="Inicio" value={project.startDate ?? '—'} />
        <Divider />
        <InfoRow icon="flag-outline" label="Vence" value={project.dueDate ?? '—'} />
        <Divider />
        <InfoRow icon="wallet-outline" label="Presupuesto" value={project.budget ? `$${project.budget}` : '—'} />
        <Divider />
        <InfoRow icon="people-outline" label="Cliente" value={project.clientName ?? '—'} />
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
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
  },
  desc: {
    marginBottom: Spacing.two,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  track: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
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
});
