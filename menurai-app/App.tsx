import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // For now, we'll use system fonts since we haven't added Inter fonts yet
        // In production, you would download and add Inter font files to assets/fonts/
        await Font.loadAsync({
          // Placeholder for custom fonts
          // 'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          // 'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          // 'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          // 'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });
      } catch (error) {
        console.warn('Error loading fonts:', error);
        // Continue without custom fonts - fallback to system fonts
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </ThemeProvider>
  );
}