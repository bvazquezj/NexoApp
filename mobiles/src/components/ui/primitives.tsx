import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, MaxContentWidthTablet, Radius, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = ScrollViewProps & {
  children: ReactNode;
  style?: ViewStyle;
};

export function Screen({ children, style, ...rest }: ScreenProps) {
  const theme = useTheme();
  const padH = Spacing.three * theme.spacingScale;
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: padH,
              paddingTop: theme.isPhone ? Spacing.three : Spacing.four,
              maxWidth: theme.isTablet ? MaxContentWidthTablet : MaxContentWidth,
            },
            style,
          ]}
          showsVerticalScrollIndicator={false}
          {...rest}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  right?: ReactNode;
  showBack?: boolean;
};

export function ScreenHeader({ title, subtitle, kicker, right, showBack }: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerText}>
          {kicker ? (
            <ThemedText type="stamp" themeColor="primary" style={styles.headerKicker}>
              {kicker}
            </ThemedText>
          ) : null}
          <ThemedText
            style={[styles.headerTitle, theme.isTablet && styles.headerTitleTablet]}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="figure" themeColor="textSecondary" style={styles.headerSubtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
  type?: ThemeColor;
};

export function Card({ children, style, type = 'surface' }: CardProps) {
  const theme = useTheme();
  const pad = Spacing.three * theme.spacingScale;
  return (
    <ThemedView
      type={type}
      style={[styles.card, { borderColor: theme.border, padding: pad }, style]}>
      {children}
    </ThemedView>
  );
}
type SectionHeaderProps = {
  title: string;
  right?: ReactNode;
  onPress?: () => void;
};

export function SectionHeader({ title, right, onPress }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.sectionHeader,
        { marginTop: (theme.isTablet ? Spacing.five : Spacing.four) * theme.spacingScale },
      ]}>
      <View style={[styles.sectionRule, { backgroundColor: theme.primary }]} />
      <ThemedText type="stamp" style={[styles.sectionTitle, theme.isTablet && styles.sectionTitleTablet]}>
        {title}
      </ThemedText>
      {right ??
        (onPress && (
          <TouchableOpacity onPress={onPress}>
            <ThemedText type="stamp" themeColor="primary">
              Ver todo
            </ThemedText>
          </TouchableOpacity>
        ))}
    </View>
  );
}

type DividerProps = { style?: ViewStyle; solid?: boolean };

export function Divider({ style, solid }: DividerProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: solid ? theme.border : 'transparent',
          borderStyle: solid ? undefined : 'dotted',
          borderTopWidth: solid ? undefined : StyleSheet.hairlineWidth,
          borderTopColor: solid ? undefined : theme.ruleStrong,
        },
        style,
      ]}
    />
  );
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

/**
 * Responsive grid container: single column on phones, two columns on tablets.
 * Pass `columns={2}` to force two columns on phones too.
 * Wrap each item in <GridItem> for automatic column sizing.
 */
export function Grid({ children, style, columns }: { children: ReactNode; style?: ViewStyle; columns?: 1 | 2 }) {
  const theme = useTheme();
  const twoCols = theme.isTablet || columns === 2;
  return (
    <View
      style={[
        styles.grid,
        twoCols && { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
        style,
      ]}>
      {children}
    </View>
  );
}

export function GridItem({ children, style, columns }: { children: ReactNode; style?: ViewStyle; columns?: 1 | 2 }) {
  const theme = useTheme();
  const twoCols = theme.isTablet || columns === 2;
  return (
    <View
      style={[
        twoCols
          ? { flexBasis: '47%', flexGrow: 1, marginBottom: Spacing.two }
          : { marginBottom: Spacing.two },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.five,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  headerText: {
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerKicker: {
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerTitleTablet: {
    fontSize: 32,
    lineHeight: 38,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
    boxShadow: '0 1px 2px rgba(40,32,14,0.05), 0 4px 16px rgba(40,32,14,0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  sectionRule: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.3,
    flex: 1,
  },
  sectionTitleTablet: {
    fontSize: 16,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    gap: Spacing.two,
  },
});
