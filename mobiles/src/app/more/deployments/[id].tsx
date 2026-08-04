import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockDeployments, DEPLOYMENT_STATUS_LABELS, type DeploymentStatus } from '@/data/mock';

const statusTone: Record<DeploymentStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  UNKNOWN: 'default',
  DEPLOYING: 'primary',
  ACTIVE: 'success',
  DEGRADED: 'warning',
  DOWN: 'danger',
  INACTIVE: 'default',
};

export default function DeploymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const dep = mockDeployments.find((d) => d.id === id) ?? mockDeployments[0];

  return (
    <Screen>
      <ScreenHeader title="Deployment" showBack />

      <Card>
        <View style={styles.headerRow}>
          <View style={[styles.statusDot, { backgroundColor: theme[statusColor(dep.status)] }]} />
          <View style={styles.headerText}>
            <ThemedText type="subtitle" style={styles.name}>
              {dep.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {dep.url}
            </ThemedText>
          </View>
        </View>
        <Badge label={DEPLOYMENT_STATUS_LABELS[dep.status]} tone={statusTone[dep.status]} />
      </Card>

      <SectionHeader title="Información" />
      <Card>
        <Info label="Plataforma" value={dep.platform} />
        <Divider />
        <Info label="Ambiente" value={dep.environment} />
        <Divider />
        <Info label="Rama" value={dep.branch} />
        <Divider />
        <Info label="Versión" value={dep.version} />
        <Divider />
        <Info label="Último despliegue" value={dep.lastDeployAt ?? '—'} />
        <Divider />
        <Info label="Actualizado" value={dep.updatedAt} />
      </Card>

      <SectionHeader title="Salud" />
      <Card>
        <View style={styles.healthRow}>
          <Ionicons name={dep.status === 'DOWN' ? 'alert-circle' : dep.status === 'DEGRADED' ? 'warning' : 'checkmark-circle'} size={22} color={theme[statusColor(dep.status)]} />
          <ThemedText type="smallBold">
            {dep.status === 'DOWN' ? 'Sin respuesta' : dep.status === 'DEGRADED' ? 'Rendimiento degradado' : 'Operativo'}
          </ThemedText>
        </View>
      </Card>
    </Screen>
  );
}

function statusColor(s: DeploymentStatus): 'success' | 'warning' | 'danger' | 'primary' | 'textSecondary' {
  switch (s) {
    case 'ACTIVE':
      return 'success';
    case 'DEGRADED':
      return 'warning';
    case 'DOWN':
      return 'danger';
    case 'DEPLOYING':
      return 'primary';
    default:
      return 'textSecondary';
  }
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
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
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
