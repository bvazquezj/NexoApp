import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Grid, GridItem, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
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

const platformIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  VERCEL: 'triangle',
  RENDER: 'cloud',
  FLYIO: 'paper-plane',
  AWS: 'cloud',
  RAILWAY: 'train',
  NETLIFY: 'cloud-outline',
  OTHER: 'server',
};

export default function DeploymentListScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <ScreenHeader title="Deployments" subtitle={`${mockDeployments.length} servicios`} showBack />

      <Grid>
        {mockDeployments.map((d) => (
          <GridItem key={d.id}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/more/deployments/${d.id}`)}>
              <Card style={styles.card}>
                <View style={styles.topRow}>
                  <View style={[styles.icon, { backgroundColor: theme.surfaceAlt }]}>
                    <Ionicons name={platformIcon[d.platform]} size={20} color={theme.primary} />
                  </View>
                  <View style={styles.titleWrap}>
                    <ThemedText type="smallBold">{d.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {d.environment === 'PROD' ? 'Producción' : d.environment === 'STAGING' ? 'Staging' : 'Dev'} · {d.branch}
                    </ThemedText>
                  </View>
                  <Badge label={DEPLOYMENT_STATUS_LABELS[d.status]} tone={statusTone[d.status]} />
                </View>
                <View style={styles.bottomRow}>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {d.url}
                  </ThemedText>
                  <ThemedText type="smallBold">{d.version}</ThemedText>
                </View>
              </Card>
            </TouchableOpacity>
          </GridItem>
        ))}
      </Grid>

      <SectionHeader title="Más" />
      <Card>
        <View style={styles.linkRow} onTouchEnd={() => router.push('/more/deployments/trash')}>
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
  card: {
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
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
