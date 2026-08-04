import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ListRowProps = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconTone?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'purple' | 'info';
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

const iconColorMap = {
  default: 'textSecondary',
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  purple: 'purple',
  info: 'info',
} as const;

const iconBgMap: Record<keyof typeof iconColorMap, ThemeColor> = {
  default: 'surfaceAlt',
  primary: 'primaryLight',
  success: 'successLight',
  danger: 'dangerLight',
  warning: 'warningLight',
  purple: 'purpleLight',
  info: 'infoLight',
};

export function ListRow({ icon, iconTone = 'primary', title, subtitle, right, onPress, style }: ListRowProps) {
  const theme = useTheme();
  const body = (
    <View style={[styles.row, style]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: theme[iconBgMap[iconTone]] }]}>
          <Ionicons name={icon} size={20} color={theme[iconColorMap[iconTone]]} />
        </View>
      )}
      <View style={styles.textWrap}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {body}
      </TouchableOpacity>
    );
  }
  return body;
}

export function EmptyState({ icon, title, message }: { icon: ComponentProps<typeof Ionicons>['name']; title: string; message?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceAlt }]}>
        <Ionicons name={icon} size={28} color={theme.textSecondary} />
      </View>
      <ThemedText type="smallBold" style={styles.emptyTitle}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyMsg}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function StatCard({ label, value, delta, positive }: { label: string; value: string; delta?: string; positive?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          padding: Spacing.three * theme.spacingScale,
        },
      ]}>
      <ThemedText type="stamp" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
      <ThemedText
        type="display"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={[styles.statValue, theme.isTablet && styles.statValueTablet]}>
        {value}
      </ThemedText>
      {delta ? (
        <ThemedText type="small" themeColor={positive ? 'success' : 'danger'}>
          {delta}
        </ThemedText>
      ) : null}
    </View>
  );
}

/**
 * The signature ledger row: `LABEL ············· FIGURE` — the dotted
 * leader that ties a register label to its figure.
 */
export function LedgerRow({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.ledgerRow}>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.ledgerLabel}>
        {label}
      </ThemedText>
      <View style={[styles.ledgerLeader, { borderTopColor: theme.ruleStrong }]} />
      <ThemedText type="figure" themeColor={hot ? 'primary' : 'text'} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.one,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  emptyTitle: {
    fontSize: 16,
  },
  emptyMsg: {
    textAlign: 'center',
  },
  stat: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
    gap: Spacing.one,
    boxShadow: '0 1px 2px rgba(40,32,14,0.05), 0 4px 16px rgba(40,32,14,0.05)',
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
  },
  statValueTablet: {
    fontSize: 28,
    lineHeight: 34,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 5,
  },
  ledgerLabel: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  ledgerLeader: {
    flex: 1,
    height: 0,
    marginHorizontal: Spacing.two,
    borderStyle: 'dotted',
    borderTopWidth: 1,
  },
});
