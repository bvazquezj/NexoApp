/**
 * Design tokens — "El Diario", a personal day-book / general ledger.
 *
 * The app is a single register where work, money and self are kept as
 * columns and figures. Surfaces are buff ledger paper and white index
 * stock; ink is near-black; one red line marks "today" (active, due,
 * alerts); a denim blue echoes the faint ruling of a register page.
 * Every figure in the app is set in tabular mono so columns align.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Paper & ink
    text: '#211B12',
    background: '#F2EEE0',
    backgroundElement: '#EAE4D1',
    backgroundSelected: '#DED7C0',
    textSecondary: '#7E7560',
    // Semantic (ledger red = today / active / alert)
    primary: '#BE3B2B',
    primaryLight: '#F3E1D8',
    onPrimary: '#FBF5EC',
    surface: '#FDFBF3',
    surfaceAlt: '#F4F0E1',
    border: '#DFD7BF',
    ruleStrong: '#CFC5A4',
    ink: '#1F1A11',
    onInk: '#F2EDDE',
    success: '#2F7A55',
    successLight: '#E2EDE3',
    danger: '#A62B21',
    dangerLight: '#F2DDD6',
    warning: '#A4630E',
    warningLight: '#F5E9D1',
    info: '#46588C',
    infoLight: '#E6E8F0',
    purple: '#6E5396',
    purpleLight: '#ECE5F3',
  },
  dark: {
    text: '#EEE7D2',
    background: '#16130B',
    backgroundElement: '#221D11',
    backgroundSelected: '#2C2616',
    textSecondary: '#9A917A',
    // Semantic
    primary: '#E05A3A',
    primaryLight: '#3A2419',
    onPrimary: '#180F0B',
    surface: '#1F1A0F',
    surfaceAlt: '#282216',
    border: '#332C1B',
    ruleStrong: '#3C3521',
    ink: '#292317',
    onInk: '#F2EDDE',
    success: '#63B98C',
    successLight: '#1D3027',
    danger: '#F2654B',
    dangerLight: '#3A2419',
    warning: '#E0A64B',
    warningLight: '#332712',
    info: '#93A6D0',
    infoLight: '#252D41',
    purple: '#B99FE3',
    purpleLight: '#2F2645',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'Menlo',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const MaxContentWidthTablet = 1080;
