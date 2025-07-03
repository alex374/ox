import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import DesignGallery from './components/DesignGallery';
import ThemeSelector from './components/ThemeSelector';
import FullscreenPreview from './components/FullscreenPreview';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { NotificationProvider, useToast } from './components/NotificationSystem';
import { DesignCard } from './types';
import mermaid from 'mermaid';
import { Menu, X, Palette, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const [designCards, setDesignCards] = useState<DesignCard[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [fullscreenCard, setFullscreenCard] = useState<DesignCard | null>(null);
  
  const { themeConfig } = useTheme();
  const toast = useToast();

  // 初始化 Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  const handleDesignCardCreated = (designCard: DesignCard) => {
    setDesignCards(prev => [designCard, ...prev]);
    toast.designGenerated(designCard.title);
  };

  const handleCardClick = (designCard: DesignCard) => {
    setFullscreenCard(designCard);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态主题背景 */}
      <div 
        className="fixed inset-0"
        style={{ background: themeConfig.colors.background }}
      >
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/5 to-white/10 animate-pulse"></div>
      </div>

      {/* 移动端顶部导航 */}
      <div className="lg:hidden relative z-50 bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">AI 设计师助手</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowThemeSelector(true)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <Palette size={20} />
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 p-2 sm:p-4 lg:p-6 h-screen max-h-screen">
        {/* 桌面端布局 */}
        <div className="hidden lg:flex gap-6 h-full">
          {/* 左侧对话区域 */}
          <div className="w-1/2 modern-card hover-lift-subtle overflow-hidden">
            <Chat onDesignCardCreated={handleDesignCardCreated} />
          </div>
          
          {/* 右侧设计稿画廊 */}
          <div className="w-1/2 modern-card hover-lift-subtle overflow-hidden">
            <DesignGallery 
              designCards={designCards}
              onCardClick={handleCardClick}
            />
          </div>
        </div>

        {/* 移动端布局 */}
        <div className="lg:hidden h-full flex flex-col">
          {/* 聊天区域 */}
          <div className={`modern-card flex-1 transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}>
            <Chat onDesignCardCreated={handleDesignCardCreated} />
          </div>

          {/* 移动端画廊侧边栏 */}
          <div className={`fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl transform transition-transform duration-300 z-40 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full pt-16">
              <DesignGallery 
                designCards={designCards}
                onCardClick={(card) => {
                  handleCardClick(card);
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </div>

          {/* 遮罩层 */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* 桌面端浮动主题按钮 */}
      <div className="hidden lg:block fixed top-6 right-6 z-50">
        <button
          onClick={() => setShowThemeSelector(true)}
          className="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center"
        >
          <Palette size={20} />
        </button>
      </div>

      {/* 移动端浮动操作按钮 */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button
          onClick={() => setShowThemeSelector(true)}
          className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-purple-500/25 active:scale-95 transition-all duration-200 flex items-center justify-center"
        >
          <Palette size={18} />
        </button>
        <button
          onClick={toggleMobileMenu}
          className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/25 active:scale-95 transition-all duration-200 flex items-center justify-center"
        >
          <span className="text-xs font-bold">{designCards.length}</span>
        </button>
      </div>

      {/* 主题选择器 */}
      <ThemeSelector 
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />

      {/* 全屏预览 */}
      {fullscreenCard && (
        <FullscreenPreview
          designCard={fullscreenCard}
          isOpen={true}
          onClose={() => setFullscreenCard(null)}
        />
      )}
    </div>
  );
};

// 主应用组件，包装提供商
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;