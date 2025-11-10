import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ScanOptionsScreen } from '../screens/ScanOptionsScreen';
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { AnalysisResultScreen } from '../screens/AnalysisResultScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { AnimatedTabBar } from '../components/AnimatedTabBar';
import { AppHeader } from '../components';
import { useTheme } from '../theme/ThemeContext';
import { HomeTabParamList, ScanStackParamList } from './types';

const Tab = createBottomTabNavigator<HomeTabParamList>();
const ScanStack = createStackNavigator<ScanStackParamList>();


// Scan Stack Navigator (will include ScanOptions and Analysis screens)
const ScanNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <ScanStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primaryText,
        headerTitleStyle: {
          // fontFamily: 'Inter-SemiBold', // Uncomment when fonts are loaded
          fontSize: 18,
          fontWeight: '600' as '600',
        },
      }}
    >
      <ScanStack.Screen
        name="ScanOptions"
        component={ScanOptionsScreen}
        options={{
          header: () => <AppHeader />,
        }}
      />
      <ScanStack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          header: () => <AppHeader title="Menu Analysis" showBackButton />,
        }}
      />
      <ScanStack.Screen
        name="AnalysisResult"
        component={AnalysisResultScreen}
        options={{
          header: () => <AppHeader title="Scan Details" showBackButton />,
        }}
      />
      <ScanStack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </ScanStack.Navigator>
  );
};

export const HomeNavigator: React.FC = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primaryText,
        headerTitleStyle: {
          // fontFamily: 'Inter-SemiBold', // Uncomment when fonts are loaded
          fontSize: 18,
          fontWeight: '600' as '600',
        },
      }}
    >
      <Tab.Screen
        name="Scan"
        component={ScanNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          header: () => <AppHeader />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          header: () => <AppHeader />,
        }}
      />
    </Tab.Navigator>
  );
};

