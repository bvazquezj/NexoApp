import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { mockDomains } from '@/data/mock';

const trash = mockDomains.filter((d) => d.status === 'TRANSFERRED' || d.status === 'RELEASED');

export default function DomainTrashScreen() {
  return (
    <Screen>
      <ScreenHeader title="Papelera" subtitle={`${trash.length} dominios`} showBack />
      {trash.length === 0 ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            <Ionicons name="trash-outline" size={16} /> Papelera vacía
          </ThemedText>
        </Card>
      ) : (
        <Card>
          {trash.map((d, i) => (
            <View key={d.id}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <View style={styles.textWrap}>
                  <ThemedText type="smallBold">{d.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {d.status === 'TRANSFERRED' ? 'Transferido' : 'Liberado'}
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
