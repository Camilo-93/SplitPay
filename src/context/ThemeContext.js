import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storageService } from '../services/storageService';

export const lightTheme = {
  isDark: false,
  colors: {
    primary: '#10b981', // Emerald green
    primaryDark: '#059669',
    primaryLight: '#34d399',
    primaryBg: '#ecfdf5',
    
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    surfaceElevated: '#ffffff',
    
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    success: '#10b981',
    successBg: '#d1fae5',
    successText: '#065f46',
    
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    dangerText: '#991b1b',
    
    warning: '#f59e0b',
    warningBg: '#fef3c7',
    warningText: '#92400e',
    
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
};

export const darkTheme = {
  isDark: true,
  colors: {
    primary: '#10b981',
    primaryDark: '#059669',
    primaryLight: '#6ee7b7',
    primaryBg: 'rgba(16, 185, 129, 0.15)',
    
    background: '#090d16',
    surface: '#131c2e',
    surfaceSecondary: '#1a263d',
    surfaceElevated: '#1f2d47',
    
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textInverse: '#0f172a',
    
    border: '#24324d',
    borderLight: '#1e293b',
    
    success: '#34d399',
    successBg: 'rgba(16, 185, 129, 0.2)',
    successText: '#a7f3d0',
    
    danger: '#f87171',
    dangerBg: 'rgba(239, 68, 68, 0.2)',
    dangerText: '#fca5a5',
    
    warning: '#fbbf24',
    warningBg: 'rgba(245, 158, 11, 0.2)',
    warningText: '#fde68a',
    
    cardShadow: 'rgba(0, 0, 0, 0.3)',
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
