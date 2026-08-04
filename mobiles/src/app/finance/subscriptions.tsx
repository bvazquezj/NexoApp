import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { ListRow } from '@/components/ui/list';
import { Card, Divider, Screen, ScreenHeader, SectionHeader } from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';
import { mockSubscriptions } from '@/data/mock';

const freqLabel: Record<string, string> = { MONTHLY: 'Mensual', YEARLY: 'Anual', WEEKLY: 'Semanal' };

export default function SubscriptionListScreen() {
  return (
    <Screen>
      <ScreenHeader title="Suscripciones" subtitle="3 activas" showBack />

      <SectionHeader title="Cobros recurrentes" />
      <Card>
        {mockSubscriptions.map((s, i) => (
          <View key={s.id}>
            {i > 0 && <Divider />}
            <ListRow
              icon="repeat"
              iconTone="purple"
              title={s.name}
              subtitle={`${freqLabel[s.frequency]} · Próximo cobro ${s.nextBillingDate}`}
              right={
                <View style={styles.right}>
                  <Badge label={s.active ? 'Activa' : 'Pausada'} tone={s.active ? 'success' : 'default'} />
                  <ThemedText type="smallBold">${s.amount}</ThemedText>
                </View>
              }
            />
          </View>
        ))}
      </Card>

      <SectionHeader title="Costo mensual" />
      <Card>
        <View style={styles.costRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Total mensual aproximado
          </ThemedText>
          <ThemedText type="subtitle" style={styles.costValue}>
            $35.00 USD
          </ThemedText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  right: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costValue: {
    fontSize: 24,
    lineHeight: 30,
  },
});
