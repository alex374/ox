import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto' | 'purple' | 'ocean' | 'sunset' | 'forest';

export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient: string;
  };
  effects: {
    blur: string;
    shadow: string;
    glow: string;
  };
}

const themes: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: '浅色主题',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.95)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: 'rgba(255, 255, 255, 0.2)',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)'
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      glow: '0 0 30px rgba(102, 126, 234, 0.3)'
    }
  },
  dark: {
    name: 'dark',
    displayName: '深色主题',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#ec4899',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      surface: 'rgba(30, 41, 59, 0.95)',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: 'rgba(148, 163, 184, 0.2)',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899, #f59e0b)'
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      glow: '0 0 30px rgba(139, 92, 246, 0.4)'
    }
  },
  purple: {
    name: 'purple',
    displayName: '紫色幻想',
    colors: {
      primary: '#9333ea',
      secondary: '#c026d3',
      accent: '#f59e0b',
      background: 'linear-gradient(135deg, #4c1d95 0%, #7c2d12 50%, #9333ea 100%)',
      surface: 'rgba(147, 51, 234, 0.1)',
      text: '#f3e8ff',
      textSecondary: '#d8b4fe',
      border: 'rgba(196, 181, 253, 0.2)',
      gradient: 'linear-gradient(135deg, #9333ea, #c026d3, #f59e0b, #ef4444)'
    },
    effects: {
      blur: 'blur(25px)',
      shadow: '0 12px 40px rgba(147, 51, 234, 0.3)',
      glow: '0 0 40px rgba(196, 181, 253, 0.5)'
    }
  },
  ocean: {
    name: 'ocean',
    displayName: '海洋蓝调',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#10b981',
      background: 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #155e75 100%)',
      surface: 'rgba(14, 165, 233, 0.1)',
      text: '#f0f9ff',
      textSecondary: '#bae6fd',
      border: 'rgba(186, 230, 253, 0.2)',
      gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4, #10b981, #3b82f6)'
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(14, 165, 233, 0.3)',
      glow: '0 0 35px rgba(186, 230, 253, 0.4)'
    }
  },
  sunset: {
    name: 'sunset',
    displayName: '日落橙辉',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)',
      surface: 'rgba(249, 115, 22, 0.1)',
      text: '#fff7ed',
      textSecondary: '#fed7aa',
      border: 'rgba(254, 215, 170, 0.2)',
      gradient: 'linear-gradient(135deg, #f97316, #ea580c, #fbbf24, #ef4444)'
    },
    effects: {
      blur: 'blur(22px)',
      shadow: '0 10px 35px rgba(249, 115, 22, 0.3)',
      glow: '0 0 38px rgba(254, 215, 170, 0.4)'
    }
  },
  forest: {
    name: 'forest',
    displayName: '森林绿意',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#84cc16',
      background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
      surface: 'rgba(5, 150, 105, 0.1)',
      text: '#f0fdf4',
      textSecondary: '#bbf7d0',
      border: 'rgba(187, 247, 208, 0.2)',
      gradient: 'linear-gradient(135deg, #059669, #047857, #84cc16, #10b981)'
    },
    effects: {
      blur: 'blur(18px)',
      shadow: '0 8px 30px rgba(5, 150, 105, 0.3)',
      glow: '0 0 32px rgba(187, 247, 208, 0.4)'
    }
  },
  auto: {
    name: 'auto',
    displayName: '跟随系统',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.95)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: 'rgba(255, 255, 255, 0.2)',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)'
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      glow: '0 0 30px rgba(102, 126, 234, 0.3)'
    }
  }
};

interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  setTheme: (theme: Theme) => void;
  availableThemes: ThemeConfig[];
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
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // 检测系统主题
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // 从本地存储恢复主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
    }
  }, []);

  // 保存主题到本地存储
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 获取当前主题配置
  const getCurrentTheme = (): ThemeConfig => {
    if (theme === 'auto') {
      return themes[systemTheme];
    }
    return themes[theme];
  };

  // 应用主题到CSS变量
  useEffect(() => {
    const themeConfig = getCurrentTheme();
    const root = document.documentElement;

    // 设置CSS变量
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(themeConfig.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value);
    });

    // 设置主题类名
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${themeConfig.name}`);
  }, [theme, systemTheme]);

  const value: ThemeContextType = {
    theme,
    themeConfig: getCurrentTheme(),
    setTheme,
    availableThemes: Object.values(themes)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};