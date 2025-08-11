import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift group"
      aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          size={20} 
          className={`absolute inset-0 text-white transition-all duration-300 ${
            theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
          }`} 
        />
        <Moon 
          size={20} 
          className={`absolute inset-0 text-white transition-all duration-300 ${
            theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;