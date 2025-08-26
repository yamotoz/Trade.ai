import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  // Cores principais
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Cores de acento
  accent: {
    pink: string;
    green: string;
    yellow: string;
    red: string;
  };
  
  // Cores de fundo
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Cores de superfície
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Cores de texto
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
}

const darkTheme: ThemeColors = {
  primary: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  accent: {
    pink: '#ec4899',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  },
  background: {
    primary: '#000000',
    secondary: '#0f0f0f',
    tertiary: '#1a1a1a',
  },
  surface: {
    primary: '#111111',
    secondary: '#1e1e1e',
    tertiary: '#2a2a2a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e5e5e5',
    tertiary: '#a3a3a3',
    muted: '#737373',
  },
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setAccentColor: (color: keyof ThemeColors['accent']) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true); // Sempre dark por padrão
  const [accentColor, setAccentColorState] = useState<keyof ThemeColors['accent']>('green');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
      
      const savedAccent = await AsyncStorage.getItem('accent_color');
      if (savedAccent) {
        setAccentColorState(savedAccent as keyof ThemeColors['accent']);
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const setAccentColor = async (color: keyof ThemeColors['accent']) => {
    setAccentColorState(color);
    try {
      await AsyncStorage.setItem('accent_color', color);
    } catch (error) {
      console.error('Erro ao salvar cor de acento:', error);
    }
  };

  // Sempre usar tema dark para Trade.ai
  const colors = darkTheme;

  const value: ThemeContextType = {
    colors,
    isDark: true,
    toggleTheme,
    setAccentColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
