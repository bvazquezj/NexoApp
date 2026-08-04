import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'stamp'
    | 'figure'
    | 'display'
    | 'masthead'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

const TABULAR: TextStyle['fontVariant'] = ['tabular-nums'];

const baseStyles: Record<string, TextStyle> = {
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    fontVariant: TABULAR,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
    fontVariant: TABULAR,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    fontVariant: TABULAR,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
    fontVariant: TABULAR,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
    fontVariant: TABULAR,
  },
  // "Hoy · 3 de agosto" — stamped column header, letter-spaced caps.
  stamp: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // Inline ledger figure (dates, amounts inside rows).
  figure: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 600,
    fontFamily: Fonts.mono,
    fontVariant: TABULAR,
  },
  // Stat-card figure.
  display: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
    fontFamily: Fonts.mono,
    fontVariant: TABULAR,
    letterSpacing: -0.5,
  },
  // The date-line of the register — big mono masthead.
  masthead: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 700,
    fontFamily: Fonts.mono,
    fontVariant: TABULAR,
    letterSpacing: -0.5,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
    lineHeight: 16,
  },
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color =
    type === 'linkPrimary' ? theme.primary : type === 'link' ? theme.textSecondary : theme[themeColor ?? 'text'];

  const base = baseStyles[type];
  const scale = theme.fontScale;
  const scaled: TextStyle =
    scale === 1
      ? base
      : {
          ...base,
          fontSize: base.fontSize ? base.fontSize * scale : undefined,
          lineHeight: base.lineHeight ? base.lineHeight * scale : undefined,
        };

  return <Text style={[{ color }, scaled, style]} {...rest} />;
}

const styles = StyleSheet.create({});
