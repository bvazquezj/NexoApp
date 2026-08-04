import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Grid, GridItem, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockClients } from '@/data/mock';

export default function ClientListScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <ScreenHeader title="Clientes" subtitle={`${mockClients.length} clientes`} showBack />

      <Grid>
        {mockClients.map((c) => (
          <GridItem key={c.id}>
            <Card style={styles.client}>
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText type="smallBold" themeColor="primary">
                    {initials(c.name)}
                  </ThemedText>
                </View>
                <View style={styles.textWrap}>
                  <ThemedText type="smallBold">{c.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {c.email}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Badge label={`${c.projectCount} proyectos`} tone="purple" />
                <Badge label={`${c.taskCount} tareas`} tone="primary" />
                <Badge label={`${c.domainCount} dominios`} tone="info" />
                <Badge label={`${c.deploymentCount} deploys`} tone="success" />
              </View>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <SectionHeader title="Más" />
      <Card>
        <View style={styles.linkRow} onTouchEnd={() => router.push('/more/clients/trash')}>
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

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
  client: {
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
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
