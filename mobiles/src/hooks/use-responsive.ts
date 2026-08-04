import { useWindowDimensions } from 'react-native';

export const TABLET_BREAKPOINT = 768;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const isPhone = !isTablet;

  return {
    isTablet,
    isPhone,
    // Tablet: slightly larger type and breathing room.
    fontScale: isTablet ? 1.08 : 1,
    spacingScale: isTablet ? 1.15 : 1,
  };
}
