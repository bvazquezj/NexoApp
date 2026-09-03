import { Ionicons } from '@expo/vector-icons';
import { setApiBaseUrl } from '@adminpersonal/shared';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';

setApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

function TabIcon({
  name,
  focused,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}) {
  const theme = useTheme();
  return (
    <View style={styles.tabIconWrap}>
      {focused ? <View style={[styles.tabTick, { backgroundColor: theme.primary }]} /> : null}
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isTablet } = useResponsive();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <>
      <StatusBar style="auto" />
      <AnimatedSplashOverlay />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {
            fontSize: isTablet ? 12 : 11,
            fontWeight: '600',
            letterSpacing: 0.3,
            marginBottom: isTablet ? 6 : 2,
          },
          tabBarIconStyle: {
            marginTop: isTablet ? 6 : 4,
          },
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: isTablet ? 72 : 60,
            paddingTop: isTablet ? 6 : 4,
            paddingBottom: isTablet ? 8 : 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} size={isTablet ? size + 2 : size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tareas',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name={focused ? 'checkbox' : 'checkbox-outline'} focused={focused} size={isTablet ? size + 2 : size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="finance"
          options={{
            title: 'Finanzas',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} size={isTablet ? size + 2 : size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Hábitos',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name={focused ? 'flame' : 'flame-outline'} focused={focused} size={isTablet ? size + 2 : size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'Más',
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name={focused ? 'apps' : 'apps-outline'} focused={focused} size={isTablet ? size + 2 : size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabTick: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
