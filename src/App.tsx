import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import DesignGallery from './components/DesignGallery';
import DesignPreviewModal from './components/DesignPreviewModal';
import { DesignCard } from './types';
import mermaid from 'mermaid';
import { Moon, Sun, Palette, Keyboard } from 'lucide-react';

function App() {
  const [designCards, setDesignCards] = useState<DesignCard[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCard, setSelectedCard] = useState<DesignCard | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);

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

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 检查是否在输入框中
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                            document.activeElement?.tagName === 'TEXTAREA';
      
      if (isInputFocused) return;

      switch (e.key) {
        case 't':
        case 'T':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleTheme();
          }
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
        case 'Escape':
          if (showPreview) {
            setShowPreview(false);
            setSelectedCard(null);
          } else if (showKeyboardShortcuts) {
            setShowKeyboardShortcuts(false);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showPreview, showKeyboardShortcuts]);

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
    setSelectedCard(designCard);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedCard(null);
  };

  // 键盘快捷键帮助模态框
  const KeyboardShortcutsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="modal-gradient w-full max-w-lg animate-slide-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Keyboard size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-primary">
            键盘快捷键
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <span className="text-primary">切换主题</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl/Cmd + T</kbd>
            </div>
            <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <span className="text-primary">显示快捷键</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">?</kbd>
            </div>
            <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <span className="text-primary">关闭模态框</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
            </div>
            <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <span className="text-primary">发送消息</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <span className="text-primary">换行</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Shift + Enter</kbd>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-primary mb-3">预览模式快捷键</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-secondary">缩放</span>
                <span className="text-secondary">+/-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">旋转</span>
                <span className="text-secondary">R</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">重置</span>
                <span className="text-secondary">0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowKeyboardShortcuts(false)}
            className="px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg interactive"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );

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
      {/* 顶部工具栏 */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        {/* 键盘快捷键按钮 */}
        <button
          onClick={() => setShowKeyboardShortcuts(true)}
          className="theme-toggle p-3 rounded-full interactive"
          aria-label="键盘快捷键"
          title="键盘快捷键 (?)"
        >
          <Keyboard size={20} className="text-gray-600" />
        </button>
        
        {/* 主题切换按钮 */}
        <button
          onClick={toggleTheme}
          className="theme-toggle p-3 rounded-full interactive"
          aria-label="Toggle theme"
          title={`切换到${isDarkMode ? '浅色' : '深色'}模式 (Ctrl+T)`}
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

      {/* 设计稿预览模态框 */}
      <DesignPreviewModal
        designCard={selectedCard}
        isOpen={showPreview}
        onClose={handleClosePreview}
      />

      {/* 键盘快捷键帮助模态框 */}
      {showKeyboardShortcuts && <KeyboardShortcutsModal />}
    </div>
  );
}

export default App;