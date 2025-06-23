import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import DesignGallery from './components/DesignGallery';
import { DesignCard } from './types';
import mermaid from 'mermaid';
import { Moon, Sun, Palette } from 'lucide-react';

function App() {
  const [designCards, setDesignCards] = useState<DesignCard[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初始化 Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: isDarkMode ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [isDarkMode]);

  // 主题初始化和持久化
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(initialDarkMode);
    document.documentElement.setAttribute('data-theme', initialDarkMode ? 'dark' : 'light');
    
    // 模拟加载时间以展示动画
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // 主题切换
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleDesignCardCreated = (designCard: DesignCard) => {
    setDesignCards(prev => [designCard, ...prev]);
  };

  const handleCardClick = (designCard: DesignCard) => {
    // 可以在这里实现查看设计稿详情的功能
    console.log('Clicked design card:', designCard);
  };

  // 加载屏幕
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border border-white/20 flex items-center justify-center animate-pulse-soft">
              <Palette size={40} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 gradient-text">AI 设计师助手</h1>
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mobile-padding" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* 主题切换按钮 */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="theme-toggle p-3 rounded-full interactive"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      <div className="h-screen max-h-screen flex gap-4 mobile-stack">
        {/* 左侧对话区域 */}
        <div className="w-1/2 mobile-full-height modern-card hover-lift animate-slide-in-left">
          <Chat onDesignCardCreated={handleDesignCardCreated} />
        </div>
        
        {/* 右侧设计稿画廊 */}
        <div className="w-1/2 mobile-full-height modern-card hover-lift animate-slide-in-right">
          <DesignGallery 
            designCards={designCards}
            onCardClick={handleCardClick}
          />
        </div>
      </div>

      {/* 移动端底部操作栏 */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden">
        <div className="flex items-center justify-center gap-2 modern-card p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-secondary font-medium">
              {designCards.length} 个设计稿
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;