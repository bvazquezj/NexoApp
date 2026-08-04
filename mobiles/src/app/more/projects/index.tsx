import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Grid, GridItem, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
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

export default function ProjectListScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <ScreenHeader title="Proyectos" subtitle={`${mockProjects.length} proyectos`} showBack />

      <Grid>{mockProjects.map((p) => {
        const pct = p.taskCount ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;
        return (
          <GridItem key={p.id}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/more/projects/${p.id}`)}>
              <Card style={styles.project}>
                <View style={styles.topRow}>
                  <View style={[styles.icon, { backgroundColor: `${p.color}22` }]}>
                    <Ionicons name="folder" size={20} color={p.color} />
                  </View>
                  <View style={styles.titleWrap}>
                    <ThemedText type="smallBold">{p.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {p.clientName ?? 'Proyecto interno'}
                    </ThemedText>
                  </View>
                  <Badge label={PROJECT_STATUS_LABELS[p.status]} tone={statusTone[p.status]} />
                </View>
                <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                  <View style={[styles.fill, { backgroundColor: p.color, width: `${pct}%` }]} />
                </View>
                <View style={styles.bottomRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {p.completedTaskCount}/{p.taskCount} tareas
                  </ThemedText>
                  <ThemedText type="smallBold">{pct}%</ThemedText>
                </View>
              </Card>
            </TouchableOpacity>
          </GridItem>
        );
      })}</Grid>

      <SectionHeader title="Más" />
      <Card>
        <View style={styles.linkRow} onTouchEnd={() => router.push('/more/projects/trash')}>
          <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
          <ThemedText type="small" style={styles.linkText}>
            Papelera
          </ThemedText>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  project: {
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    gap: 2,
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  linkText: {
    flex: 1,
  },
});
