import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { LedgerRow, ListRow } from '@/components/ui/list';
import { Card, Divider, Grid, GridItem, Row, Screen, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockDashboard, mockDeployments, mockTasks } from '@/data/mock';

type QuickLink = {
  route: Href;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'success' | 'purple' | 'warning';
};

const quickLinks: QuickLink[] = [
  { route: '/tasks', title: 'Tareas', icon: 'checkbox', tone: 'primary' },
  { route: '/finance', title: 'Finanzas', icon: 'wallet', tone: 'success' },
  { route: '/habits', title: 'Hábitos', icon: 'flame', tone: 'purple' },
  { route: '/more/projects', title: 'Proyectos', icon: 'folder', tone: 'warning' },
];

const quickBg: Record<QuickLink['tone'], ThemeColor> = {
  primary: 'primaryLight',
  success: 'successLight',
  purple: 'purpleLight',
  warning: 'warningLight',
};

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <Card style={styles.hero}>
        <Row style={styles.heroStampRow}>
          <ThemedText type="stamp" themeColor="primary" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.heroStamp}>
            {mockDashboard.dateLabel}
          </ThemedText>
          <Badge label="Hoy" tone="primary" />
        </Row>
        <ThemedText style={styles.heroTitle}>{mockDashboard.greeting}</ThemedText>
        <View style={[styles.todayRule, { backgroundColor: theme.primary }]} />
        <View style={styles.ledger}>
          <LedgerRow label="Tareas activas" value={String(mockDashboard.stats.activeTasks)} />
          <LedgerRow label="Vencen hoy" value={String(mockDashboard.stats.tasksDueToday)} hot />
          <LedgerRow label="Mejor racha" value={`${mockDashboard.stats.currentStreak} días`} />
          <LedgerRow label="Balance del mes" value={`$${mockDashboard.stats.balance}`} />
        </View>
      </Card>

      <SectionHeader title="Accesos rápidos" />
      <Grid columns={2}>
        {quickLinks.map((q) => (
          <GridItem key={q.title} columns={2}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(q.route)}
              style={[styles.quick, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.quickIcon, { backgroundColor: theme[quickBg[q.tone]] }]}>
                <Ionicons name={q.icon} size={22} color={theme[q.tone]} />
              </View>
              <ThemedText type="stamp" themeColor="textSecondary" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {q.title}
              </ThemedText>
            </TouchableOpacity>
          </GridItem>
        ))}
      </Grid>

      <SectionHeader title="Tareas próximas" right={<Badge label={`${mockDashboard.stats.tasksDueToday} hoy`} tone="warning" />} />
      <Card>
        {mockTasks.slice(0, 3).map((t, i) => (
          <View key={t.id}>
            {i > 0 && <Divider />}
            <ListRow
              icon={t.status === 'COMPLETED' ? 'checkmark-circle' : 'ellipse-outline'}
              iconTone={t.status === 'COMPLETED' ? 'success' : 'default'}
              title={t.title}
              subtitle={`${t.dueDate ?? 'Sin fecha'} · ${t.type.name}`}
              onPress={() => router.push(`/tasks/${t.id}`)}
            />
          </View>
        ))}
      </Card>

      <SectionHeader title="Alertas" />
      <Card>
        <ListRow
          icon="alert-circle"
          iconTone="danger"
          title={`${mockDashboard.deploymentDown} servicio(s) caído(s)`}
          subtitle="Revisa los deployments"
          onPress={() => router.push('/more/deployments')}
        />
        <Divider />
        <ListRow
          icon="notifications"
          iconTone="warning"
          title={`${mockDashboard.recentNotifications.length} notificaciones sin leer`}
          subtitle="Revisa tus notificaciones"
          onPress={() => router.push('/more/notifications')}
        />
      </Card>

      <SectionHeader title="Hábitos de hoy" right={<Badge label={`${mockDashboard.todayHabits.filter((h) => h.completedToday).length}/${mockDashboard.todayHabits.length}`} tone="purple" />} />
      <Card>
        {mockDashboard.todayHabits.map((h, i) => (
          <View key={h.id}>
            {i > 0 && <Divider />}
            <ListRow
              icon={h.completedToday ? 'checkmark-circle' : 'ellipse-outline'}
              iconTone={h.completedToday ? 'success' : 'default'}
              title={h.name}
              subtitle={h.completedToday ? 'Completado' : 'Pendiente'}
              onPress={() => router.push(`/habits/${h.id}`)}
            />
          </View>
        ))}
      </Card>

      <SectionHeader title="Servicios" right={<Badge label={`${mockDeployments.length} deploys`} tone="success" />} />
      <Card>
        {mockDeployments.slice(0, 2).map((d, i) => (
          <View key={d.id}>
            {i > 0 && <Divider />}
            <ListRow
              icon="server"
              iconTone={d.status === 'ACTIVE' ? 'success' : d.status === 'DOWN' ? 'danger' : 'warning'}
              title={d.name}
              subtitle={d.url}
              onPress={() => router.push(`/more/deployments/${d.id}`)}
            />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: Spacing.four,
    marginBottom: Spacing.one,
  },
  heroStampRow: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  heroStamp: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  todayRule: {
    width: 44,
    height: 3,
    borderRadius: 2,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  ledger: {
    gap: Spacing.one,
  },
  quick: {
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    boxShadow: '0 1px 2px rgba(40,32,14,0.04), 0 3px 10px rgba(40,32,14,0.04)',
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
