import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
  FontAwesome,
  Ionicons,
  AntDesign,
  Entypo,
} from '@expo/vector-icons';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Load icon fonts from @expo/vector-icons
        await Font.loadAsync({
          ...MaterialIcons.font,
          ...MaterialCommunityIcons.font,
          ...Feather.font,
          ...FontAwesome.font,
          ...Ionicons.font,
          ...AntDesign.font,
          ...Entypo.font,
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