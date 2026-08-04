import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card, Divider, Screen, ScreenHeader } from '@/components/ui/primitives';
import { Grid, GridItem } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mockBudgets } from '@/data/mock';

export default function BudgetListScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Presupuestos" subtitle="Agosto 2026" showBack />

      <Grid>
        {mockBudgets.map((b) => {
          const limit = parseFloat(b.limit);
          const spent = parseFloat(b.spent);
          const pct = Math.min(spent / limit, 1);
          const exceeded = spent > limit;
          const warning = !exceeded && spent / limit > 0.8;
          return (
            <GridItem key={b.id}>
              <Card style={styles.budget}>
                <View style={styles.topRow}>
                  <View style={styles.titleWrap}>
                    <View style={[styles.dot, { backgroundColor: b.category.color }]} />
                    <ThemedText type="smallBold">{b.name}</ThemedText>
                  </View>
                  <Badge
                    label={exceeded ? 'Excedido' : warning ? 'Cerca del límite' : 'OK'}
                    tone={exceeded ? 'danger' : warning ? 'warning' : 'success'}
                  />
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={styles.category}>
                  {b.category.name} · {b.period}
                </ThemedText>
                <View style={[styles.bar, { backgroundColor: theme.surfaceAlt }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        backgroundColor: exceeded ? theme.danger : warning ? theme.warning : theme.success,
                        width: `${pct * 100}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.bottomRow}>
                  <ThemedText type="smallBold">${spent.toFixed(2)}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    de ${limit.toFixed(2)} ({Math.round(pct * 100)}%)
                  </ThemedText>
                </View>
              </Card>
            </GridItem>
          );
        })}
      </Grid>

      <Divider />
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        Toca un presupuesto para editar su límite.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  budget: {
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  category: {
    fontSize: 12,
  },
  bar: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  note: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
