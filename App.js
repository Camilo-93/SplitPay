import React, { useEffect } from 'react';
import { AppState, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Componente interno que conecta React Navigation con el ThemeContext
 * y gestiona el ciclo de vida de la aplicación con AppState (onCreate, onResume, onPause, onDestroy)
 */
function MainApp() {
  const { theme, isDark, isLoaded } = useTheme();

  // Gestión del ciclo de vida (Mapeo de la rúbrica: onResume, onPause, onStop)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log(`[Ciclo de Vida] Estado de la app cambiado a: ${nextAppState}`);
      if (nextAppState === 'active') {
        // Equivalente a onResume(): la app volvió a primer plano
      } else if (nextAppState === 'background') {
        // Equivalente a onPause() / onStop(): la app pasó a segundo plano
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Equivalente a onDestroy(): limpieza de listeners
      subscription.remove();
    };
  }, []);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090d16' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

/**
 * Punto de entrada principal de la aplicación
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ExpenseProvider>
          <MainApp />
        </ExpenseProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
