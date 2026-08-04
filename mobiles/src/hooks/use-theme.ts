import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';

export function useTheme() {
  const scheme = useColorScheme();
  const { isTablet, isPhone, fontScale, spacingScale } = useResponsive();

  return {
    ...Colors[scheme === 'dark' ? 'dark' : 'light'],
    isTablet,
    isPhone,
    fontScale,
    spacingScale,
  };
}
