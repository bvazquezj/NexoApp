import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, Chip, type BadgeTone } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Radius, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockNotifications } from '@/data/mock';

const typeTone: Record<string, BadgeTone> = {
  TASK: 'primary',
  HABIT: 'purple',
  FINANCE: 'success',
  DOMAIN: 'warning',
  DEPLOYMENT: 'danger',
  SYSTEM: 'default',
};

const toneColor: Record<string, ThemeColor> = {
  TASK: 'primary',
  HABIT: 'purple',
  FINANCE: 'success',
  DOMAIN: 'warning',
  DEPLOYMENT: 'danger',
  SYSTEM: 'textSecondary',
};

const toneBg: Record<string, ThemeColor> = {
  TASK: 'primaryLight',
  HABIT: 'purpleLight',
  FINANCE: 'successLight',
  DOMAIN: 'warningLight',
  DEPLOYMENT: 'dangerLight',
  SYSTEM: 'surfaceAlt',
};

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  TASK: 'checkbox',
  HABIT: 'flame',
  FINANCE: 'wallet',
  DOMAIN: 'globe',
  DEPLOYMENT: 'server',
  SYSTEM: 'information-circle',
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const [filter, setFilter] = React.useState<'ALL' | 'UNREAD'>('ALL');
  const filtered = mockNotifications.filter((n) => filter === 'ALL' || !n.isRead);

  return (
    <Screen>
      <ScreenHeader title="Notificaciones" subtitle={`${mockNotifications.filter((n) => !n.isRead).length} sin leer`} showBack />

      <View style={styles.filters}>
        <Chip label="Todas" active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
        <Chip label="Sin leer" active={filter === 'UNREAD'} tone="danger" onPress={() => setFilter('UNREAD')} />
      </View>

      {filtered.length === 0 ? (
        <Card>
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={28} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              No hay notificaciones
            </ThemedText>
          </View>
        </Card>
      ) : (
        <Card>
          {filtered.map((n, i) => (
            <View key={n.id}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: theme[toneBg[n.type]] }]}>
                  <Ionicons name={typeIcon[n.type]} size={20} color={theme[toneColor[n.type]]} />
                </View>
                <View style={styles.textWrap}>
                  <View style={styles.titleRow}>
                    {!n.isRead && <View style={[styles.dot, { backgroundColor: theme.danger }]} />}
                    <ThemedText type="smallBold" style={styles.title}>
                      {n.title}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {n.message}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.date}>
                    {new Date(n.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

import * as React from 'react';

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  title: {
    flex: 1,
  },
  date: {
    fontSize: 11,
    marginTop: Spacing.one,
  },
});
