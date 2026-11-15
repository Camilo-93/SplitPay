import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storageService } from '../services/storageService';

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayMedium: 'BricolageGrotesque_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
};

export const lightTheme = {
  isDark: false,
  fonts,
  colors: {
    primary: '#1E4BFF', // azul cobalto
    onPrimary: '#FFFFFF',
    primaryDark: '#1636C9',
    primaryLight: '#5C7DFF',
    primaryBg: '#DCE5FF',
    accent: '#FFC400', // amarillo sol

    background: '#EEF3FF', // cielo claro
    surface: '#FFFFFF',
    surfaceSecondary: '#DEE7FF',
    surfaceElevated: '#FFFFFF',

    text: '#0B1440',
    textSecondary: '#3D4A85',
    textMuted: '#5A67A3',
    textInverse: '#FFFFFF',

    border: '#C9D6FF',
    borderLight: '#E1E9FF',

    success: '#007A4F',
    successBg: '#D2F5E5',
    successText: '#00573A',

    danger: '#D4103A',
    dangerBg: '#FFDDE3',
    dangerText: '#8F0A26',

    warning: '#E08A00',
    warningBg: '#FFEBC2',
    warningText: '#7A4A00',

    cardShadow: 'rgba(30, 75, 255, 0.12)',
    overlay: 'rgba(11, 20, 64, 0.55)',
  },
};

export const darkTheme = {
  isDark: true,
  fonts,
  colors: {
    primary: '#F5B82E', // en oscuro el color principal pasa a ser maíz
    onPrimary: '#16140F',
    primaryDark: '#D99A12',
    primaryLight: '#FFD36B',
    primaryBg: 'rgba(245, 184, 46, 0.14)',
    accent: '#F5B82E',

    background: '#14120E',
    surface: '#1D1A14',
    surfaceSecondary: '#272319',
    surfaceElevated: '#2F2A1E',

    text: '#F3EEE3',
    textSecondary: '#B4AC98',
    textMuted: '#948D79',
    textInverse: '#16140F',

    border: '#352F22',
    borderLight: '#2A261B',

    success: '#6FCF97',
    successBg: 'rgba(111, 207, 151, 0.14)',
    successText: '#B7EBCB',

    danger: '#FF8266',
    dangerBg: 'rgba(255, 130, 102, 0.14)',
    dangerText: '#FFC2B3',

    warning: '#F5B82E',
    warningBg: 'rgba(245, 184, 46, 0.16)',
    warningText: '#FFE2A0',

    cardShadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setMode: (mode) => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar preferencia guardada o usar preferencia del sistema
    const loadTheme = async () => {
      const saved = await storageService.getThemePreference();
      if (saved !== null) {
        setIsDark(saved === 'dark');
      } else {
        setIsDark(systemScheme === 'dark');
      }
      setIsLoaded(true);
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const nextValue = !isDark;
    setIsDark(nextValue);
    await storageService.setThemePreference(nextValue ? 'dark' : 'light');
  };

  const setMode = async (mode) => {
    const nextValue = mode === 'dark';
    setIsDark(nextValue);
    await storageService.setThemePreference(nextValue ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setMode, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
