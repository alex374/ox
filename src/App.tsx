import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import DesignGallery from './components/DesignGallery';
import { DesignCard } from './types';
import mermaid from 'mermaid';

function App() {
  const [designCards, setDesignCards] = useState<DesignCard[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'gallery'>('chat');

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    // 在移动端生成设计稿后自动切换到画廊视图
    if (isMobile) {
      setActiveView('gallery');
    }
  };

  const handleCardClick = (designCard: DesignCard) => {
    // 可以在这里实现查看设计稿详情的功能
    console.log('Clicked design card:', designCard);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* 桌面端布局 */}
      {!isMobile ? (
        <div className="h-screen max-h-screen flex gap-6 p-6">
          {/* 左侧对话区域 */}
          <div className="w-1/2 modern-card hover-lift">
            <Chat onDesignCardCreated={handleDesignCardCreated} />
          </div>
          
          {/* 右侧设计稿画廊 */}
          <div className="w-1/2 modern-card hover-lift">
            <DesignGallery 
              designCards={designCards}
              onCardClick={handleCardClick}
            />
          </div>
        </div>
      ) : (
        /* 移动端布局 */
        <div className="h-screen flex flex-col">
          {/* 移动端顶部切换标签 */}
          <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex rounded-b-2xl mx-4 mb-4 mt-4 shadow-lg">
            <button
              onClick={() => setActiveView('chat')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeView === 'chat'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              💬 AI 助手
            </button>
            <button
              onClick={() => setActiveView('gallery')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ml-2 relative ${
                activeView === 'gallery'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🎨 设计画廊
              {designCards.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {designCards.length}
                </span>
              )}
            </button>
          </div>

          {/* 移动端内容区域 */}
          <div className="flex-1 px-4 pb-4">
            <div className="h-full modern-card">
              {activeView === 'chat' ? (
                <Chat onDesignCardCreated={handleDesignCardCreated} />
              ) : (
                <DesignGallery 
                  designCards={designCards}
                  onCardClick={handleCardClick}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;