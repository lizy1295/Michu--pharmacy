'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4' | 'theme-5' | 'theme-6';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  primary: string;
  background: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'theme-1',
    name: 'Theme 1 (Orange)',
    primary: '#F87B1B',
    background: '#EEEEEE',
    description: 'Primary: #F87B1B (Orange) · Background: #EEEEEE (Light Gray)',
  },
  {
    id: 'theme-2',
    name: 'Theme 2 (Apple Green)',
    primary: '#708D23',
    background: '#F9F5EB',
    description: 'Primary: #708D23 (Apple Green) · Background: #F9F5EB (Ivory Cream)',
  },
  {
    id: 'theme-3',
    name: 'Theme 3 (Sax Blue)',
    primary: '#5BB8E8',
    background: '#FFFFFF',
    description: 'Primary: #5BB8E8 (Sax Blue) · Background: #FFFFFF (White)',
  },
  {
    id: 'theme-4',
    name: 'Theme 4 (Lime)',
    primary: '#8DC63F',
    background: '#FFFFFF',
    description: 'Primary: #8DC63F (Lime) · Background: #FFFFFF (White)',
  },
  {
    id: 'theme-5',
    name: 'Theme 5 (Pizazz)',
    primary: '#FF8F00',
    background: '#FDF9E0',
    description: 'Primary: #FF8F00 (Pizazz) · Background: #FDF9E0 (Pearl Lusta)',
  },
  {
    id: 'theme-6',
    name: 'Theme 6 (Lavender)',
    primary: '#9B72CF',
    background: '#FFFFFF',
    description: 'Primary: #9B72CF (Lavender) · Background: #FFFFFF (White)',
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeMeta[];
  currentThemeMeta: ThemeMeta;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('theme-1');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read persisted theme on mount
    try {
      const saved = localStorage.getItem('mph_theme') as ThemeId | null;
      if (saved && ['theme-1','theme-2','theme-3','theme-4','theme-5','theme-6'].includes(saved)) {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'theme-1');
      }
    } catch {
      document.documentElement.setAttribute('data-theme', 'theme-1');
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('mph_theme', newTheme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const currentThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, currentThemeMeta }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
