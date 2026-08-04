import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockDomains, DOMAIN_EFFECTIVE_LABELS, type DomainEffectiveStatus } from '@/data/mock';

const statusTone: Record<DomainEffectiveStatus, BadgeTone> = {
  ACTIVE: 'success',
  EXPIRING_SOON: 'warning',
  EXPIRED: 'danger',
  TRANSFERRED: 'info',
  RELEASED: 'default',
};

export default function DomainDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const domain = mockDomains.find((d) => d.id === id) ?? mockDomains[0];

  return (
    <Screen>
      <ScreenHeader title="Dominio" showBack />

      <Card>
        <View style={styles.headerRow}>
          <View style={[styles.icon, { backgroundColor: theme.infoLight }]}>
            <ThemedText type="subtitle" themeColor="info" style={styles.iconText}>
              .
            </ThemedText>
          </View>
          <View style={styles.headerText}>
            <ThemedText type="subtitle" style={styles.name}>
              {domain.name}
            </ThemedText>
            <Badge label={DOMAIN_EFFECTIVE_LABELS[domain.effectiveStatus]} tone={statusTone[domain.effectiveStatus]} />
          </View>
        </View>
      </Card>

      <SectionHeader title="Información" />
      <Card>
        <Info label="Registrador" value={domain.registrar} />
        <Divider />
        <Info label="DNS" value={domain.dnsProvider} />
        <Divider />
        <Info label="Fecha de expiración" value={domain.expiryDate} />
        <Divider />
        <Info label="Renovación automática" value={domain.autoRenew ? 'Activada' : 'Desactivada'} />
        <Divider />
        <Info label="Cliente" value={domain.clientName ?? '—'} />
      </Card>
    </Screen>
  );
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
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
    lineHeight: 32,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
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
});
