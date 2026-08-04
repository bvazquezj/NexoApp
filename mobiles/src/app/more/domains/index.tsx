import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card, Divider, Grid, GridItem, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
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

export default function DomainListScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <ScreenHeader title="Dominios" subtitle={`${mockDomains.length} dominios`} showBack />

      <Grid>
        {mockDomains.map((d) => (
          <GridItem key={d.id}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/more/domains/${d.id}`)}>
              <Card style={styles.card}>
                <View style={styles.topRow}>
                  <View style={[styles.icon, { backgroundColor: theme.infoLight }]}>
                    <Ionicons name="globe" size={20} color={theme.info} />
                  </View>
                  <View style={styles.titleWrap}>
                    <ThemedText type="smallBold">{d.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Expira {d.expiryDate}
                    </ThemedText>
                  </View>
                  <Badge label={DOMAIN_EFFECTIVE_LABELS[d.effectiveStatus]} tone={statusTone[d.effectiveStatus]} />
                </View>
                <View style={styles.bottomRow}>
                  <Badge label={d.dnsProvider} tone="default" />
                  {d.clientName ? <Badge label={d.clientName} tone="purple" /> : null}
                </View>
              </Card>
            </TouchableOpacity>
          </GridItem>
        ))}
      </Grid>

      <SectionHeader title="Más" />
      <Card>
        <View style={styles.linkRow} onTouchEnd={() => router.push('/more/domains/trash')}>
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
