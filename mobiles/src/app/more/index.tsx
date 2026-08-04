import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card, Divider, Grid, GridItem, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Radius, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockClients, mockDeployments, mockDomains, mockNotifications, mockProjects } from '@/data/mock';

type ModuleDef = {
  route: Href;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: BadgeTone;
  badge?: string;
};

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();

  const modules: ModuleDef[] = [
    { route: '/more/projects', title: 'Proyectos', subtitle: `${mockProjects.length} proyectos`, icon: 'folder', tone: 'purple' },
    { route: '/more/deployments', title: 'Deployments', subtitle: `${mockDeployments.length} servicios`, icon: 'server', tone: 'success' },
    { route: '/more/clients', title: 'Clientes', subtitle: `${mockClients.length} clientes`, icon: 'people', tone: 'primary' },
    { route: '/more/domains', title: 'Dominios', subtitle: `${mockDomains.length} dominios`, icon: 'globe', tone: 'info' },
    {
      route: '/more/notifications',
      title: 'Notificaciones',
      subtitle: `${mockNotifications.filter((n) => !n.isRead).length} sin leer`,
      icon: 'notifications',
      tone: 'warning',
      badge: String(mockNotifications.filter((n) => !n.isRead).length),
    },
  ];

  return (
    <Screen>
      <ScreenHeader title="Más" subtitle="Otras secciones" kicker="OPERACIÓN" />
      {theme.isTablet ? (
        <Grid>
          {modules.map((m) => (
            <GridItem key={m.title}>
              <Card>
                <ModuleRow module={m} onPress={() => router.push(m.route)} />
              </Card>
            </GridItem>
          ))}
        </Grid>
      ) : (
        <Card>
          {modules.map((m, i) => (
            <View key={m.title}>
              {i > 0 && <Divider />}
              <ModuleRow module={m} onPress={() => router.push(m.route)} />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function ModuleRow({ module: m, onPress }: { module: ModuleDef; onPress: () => void }) {
  const theme = useTheme();
  const bgKey = m.tone === 'default' ? 'surfaceAlt' : (m.tone + 'Light') as ThemeColor;
  const colorKey = m.tone === 'default' ? 'textSecondary' : m.tone;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: theme[bgKey] }]}>
          <Ionicons name={m.icon} size={22} color={theme[colorKey]} />
        </View>
        <View style={styles.textWrap}>
          <ThemedText type="smallBold">{m.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {m.subtitle}
          </ThemedText>
        </View>
        {m.badge ? <Badge label={m.badge} tone="danger" /> : <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.one,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
