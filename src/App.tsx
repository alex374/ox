import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import DesignGallery from './components/DesignGallery';
import { DesignCard } from './types';
import mermaid from 'mermaid';
import { PanelRightOpen, PanelLeftOpen } from 'lucide-react';

function App() {
  const [designCards, setDesignCards] = useState<DesignCard[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showGallery, setShowGallery] = useState(true);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      // 在移动端默认隐藏画廊
      if (window.innerWidth < 1024) {
        setShowGallery(false);
      } else {
        setShowGallery(true);
      }
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
    // 在移动端创建设计稿后自动显示画廊
    if (isMobile) {
      setShowGallery(true);
    }
  };

  const handleCardClick = (designCard: DesignCard) => {
    console.log('Clicked design card:', designCard);
  };

  const toggleGallery = () => {
    setShowGallery(!showGallery);
  };

  return (
    <div className="min-h-screen p-2 sm:p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="h-screen max-h-screen flex flex-col lg:flex-row gap-2 sm:gap-4">
        
        {/* 移动端顶部切换按钮 */}
        {isMobile && (
          <div className="flex justify-center gap-2 mb-2">
            <button
              onClick={() => setShowGallery(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                !showGallery 
                  ? 'btn-gradient text-white shadow-lg' 
                  : 'bg-white/20 text-white backdrop-blur-sm border border-white/30'
              }`}
            >
              <PanelLeftOpen size={16} />
              聊天
            </button>
            <button
              onClick={() => setShowGallery(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                showGallery 
                  ? 'btn-gradient text-white shadow-lg' 
                  : 'bg-white/20 text-white backdrop-blur-sm border border-white/30'
              }`}
            >
              <PanelRightOpen size={16} />
              画廊 {designCards.length > 0 && `(${designCards.length})`}
            </button>
          </div>
        )}

        {/* 聊天区域 */}
        <div className={`${
          isMobile 
            ? (showGallery ? 'hidden' : 'flex-1') 
            : showGallery 
              ? 'w-1/2 lg:w-3/5' 
              : 'flex-1'
        } modern-card hover-lift transition-all duration-500 overflow-hidden`}>
          <Chat onDesignCardCreated={handleDesignCardCreated} />
        </div>
        
        {/* 桌面端切换按钮 */}
        {!isMobile && !showGallery && (
          <button
            onClick={toggleGallery}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-10 p-3 btn-gradient text-white rounded-xl shadow-lg hover-lift"
            title="显示设计画廊"
          >
            <PanelRightOpen size={20} />
          </button>
        )}
        
        {/* 设计稿画廊 */}
        {showGallery && (
          <div className={`${
            isMobile 
              ? 'flex-1' 
              : 'w-1/2 lg:w-2/5'
          } modern-card hover-lift transition-all duration-500 overflow-hidden relative`}>
            {/* 桌面端隐藏按钮 */}
            {!isMobile && (
              <button
                onClick={toggleGallery}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-lg transition-all duration-300 hover-lift backdrop-blur-sm"
                title="隐藏画廊"
              >
                <PanelRightOpen size={16} className="rotate-180" />
              </button>
            )}
            
            <DesignGallery 
              designCards={designCards}
              onCardClick={handleCardClick}
            />
          </div>
        )}
      </div>

      {/* 移动端设计稿数量指示器 */}
      {isMobile && !showGallery && designCards.length > 0 && (
        <div 
          className="fixed bottom-6 right-6 w-12 h-12 btn-gradient rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover-lift"
          onClick={() => setShowGallery(true)}
        >
          {designCards.length}
        </div>
      )}
    </div>
  );
}

export default App;