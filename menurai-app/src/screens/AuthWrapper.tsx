import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { LoadingOverlay } from '../components';
import { useTheme } from '../theme/ThemeContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { colors } = useTheme();

  // Show loading while checking auth state
  if (authLoading || (user && profileLoading)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingOverlay visible={true} message="Loading..." fullScreen={false} />
      </View>
    );
  }

  // The actual navigation logic will be handled by the navigation container
  // This component just ensures auth and profile are loaded
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});