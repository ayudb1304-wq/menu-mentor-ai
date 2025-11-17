import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { AuthScreen } from '../screens/AuthScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { HomeNavigator } from './HomeNavigator';
import { AuthWrapper } from '../screens/AuthWrapper';
import { TermsScreen } from '../screens/TermsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { CancellationPolicyScreen } from '../screens/CancellationPolicyScreen';
import { ContactSupportScreen } from '../screens/ContactSupportScreen';
import { RootStackParamList } from './types';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { AppHeader } from '../components';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: profileLoading } = useUserProfile();
  const { colors, isDarkMode } = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTintColor: colors.primaryText,
    headerTitleStyle: {
      // fontFamily: 'Inter-SemiBold', // Uncomment when fonts are loaded
      fontSize: 18,
      fontWeight: '600' as '600',
    },
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={Colors.brand.blue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AuthWrapper>
        <Stack.Navigator screenOptions={screenOptions}>
          {!user ? (
            // Not authenticated
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{ headerShown: false }}
            />
            ) : !userData?.profileComplete ? (
            // Authenticated but profile not complete
            <Stack.Screen
              name="ProfileSetup"
              component={ProfileSetupScreen}
              options={{
                header: () => <AppHeader />,
              }}
            />
          ) : (
            // Authenticated and profile complete
            <>
              <Stack.Screen
                name="Home"
                component={HomeNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ProfileSetup"
                component={ProfileSetupScreen}
                options={{
                  header: () => <AppHeader />,
                }}
              />
            </>
          )}
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{
              header: () => <AppHeader title="Terms & Conditions" showBackButton />,
            }}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicyScreen}
            options={{
              header: () => <AppHeader title="Privacy Policy" showBackButton />,
            }}
          />
          <Stack.Screen
            name="CancellationPolicy"
            component={CancellationPolicyScreen}
            options={{
              header: () => <AppHeader title="Cancellation & Refund" showBackButton />,
            }}
          />
          <Stack.Screen
            name="ContactSupport"
            component={ContactSupportScreen}
            options={{
              header: () => <AppHeader title="Contact Support" showBackButton />,
            }}
          />
        </Stack.Navigator>
      </AuthWrapper>
    </NavigationContainer>
  );
};