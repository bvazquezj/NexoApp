import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { mockProjects } from '@/data/mock';

const trash = mockProjects.filter((p) => p.status === 'CANCELLED' || p.status === 'ARCHIVED');

export default function ProjectTrashScreen() {
  return (
    <Screen>
      <ScreenHeader title="Papelera" subtitle={`${trash.length} proyectos`} showBack />
      {trash.length === 0 ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            <Ionicons name="trash-outline" size={16} /> Papelera vacía
          </ThemedText>
        </Card>
      ) : (
        <Card>
          {trash.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <View style={styles.textWrap}>
                  <ThemedText type="smallBold">{p.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {p.status === 'CANCELLED' ? 'Cancelado' : 'Archivado'}
                  </ThemedText>
                </View>
                <Badge label="Inactivo" tone="default" />
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
