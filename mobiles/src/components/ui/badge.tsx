import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeTone =
  | 'default'
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'purple';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
};

const toneMap: Record<BadgeTone, { bg: ThemeColor; text: ThemeColor }> = {
  default: { bg: 'surfaceAlt', text: 'textSecondary' },
  primary: { bg: 'primaryLight', text: 'primary' },
  success: { bg: 'successLight', text: 'success' },
  danger: { bg: 'dangerLight', text: 'danger' },
  warning: { bg: 'warningLight', text: 'warning' },
  info: { bg: 'infoLight', text: 'info' },
  purple: { bg: 'purpleLight', text: 'purple' },
};

export function Badge({ label, tone = 'default', style }: BadgeProps) {
  const theme = useTheme();
  const tones = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: theme[tones.bg] }, style]}>
      <ThemedText themeColor={tones.text} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

type ChipProps = {
  label: string;
  active?: boolean;
  tone?: BadgeTone;
  onPress?: () => void;
};

export function Chip({ label, active, tone = 'primary', onPress }: ChipProps) {
  const theme = useTheme();
  const tones = toneMap[tone];
  return (
    <ThemedText
      themeColor={active ? tones.text : 'textSecondary'}
      style={[
        styles.chip,
        { backgroundColor: active ? theme[tones.bg] : theme.surface, borderColor: theme.border },
      ]}
      onPress={onPress}
      suppressHighlighting>
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.half + 1,
    borderRadius: Radius.sm,
    borderCurve: 'continuous',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  chip: {
    fontSize: 12,
    lineHeight: 30,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
