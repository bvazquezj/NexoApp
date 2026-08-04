import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { mockClients } from '@/data/mock';

const trash = mockClients.filter((c) => c.taskCount === 0 && c.projectCount === 0);

export default function ClientTrashScreen() {
  return (
    <Screen>
      <ScreenHeader title="Papelera" subtitle={`${trash.length} clientes`} showBack />
      {trash.length === 0 ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            <Ionicons name="trash-outline" size={16} /> Papelera vacía
          </ThemedText>
        </Card>
      ) : (
        <Card>
          {trash.map((c, i) => (
            <View key={c.id}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <View style={styles.textWrap}>
                  <ThemedText type="smallBold">{c.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {c.email}
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
