import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import DesignGallery from './components/DesignGallery';
import ThemeToggle from './components/ThemeToggle';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import FullscreenModal from './components/FullscreenModal';
import { DesignCard } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { useResponsive } from './hooks/useResponsive';
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { HelpCircle } from 'lucide-react';
import mermaid from 'mermaid';

function AppContent() {
  const [designCards, setDesignCards] = useState<DesignCard[]>([]);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [selectedDesignCard, setSelectedDesignCard] = useState<DesignCard | null>(null);
  const { isMobile, isTablet } = useResponsive();

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
  };

  const handleCardClick = (designCard: DesignCard) => {
    setSelectedDesignCard(designCard);
  };

  // 键盘快捷键
  useKeyboardShortcuts({
    [SHORTCUTS.ESCAPE]: () => {
      if (selectedDesignCard) {
        setSelectedDesignCard(null);
      } else if (showShortcutsHelp) {
        setShowShortcutsHelp(false);
      }
    },
    '?': () => {
      setShowShortcutsHelp(true);
    },
  });

  const layoutClasses = isMobile 
    ? "flex flex-col gap-4 h-screen" 
    : "flex gap-4 h-screen";

  const panelClasses = isMobile 
    ? "flex-1 modern-card" 
    : isTablet 
      ? "w-1/2 modern-card hover-lift" 
      : "w-1/2 modern-card hover-lift";

  return (
    <div className="min-h-screen p-2 sm:p-4 transition-all duration-300">
      {/* 顶部控制栏 */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        <button
          onClick={() => setShowShortcutsHelp(true)}
          className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift"
          aria-label="查看键盘快捷键"
        >
          <HelpCircle size={20} className="text-white" />
        </button>
        <ThemeToggle />
      </div>

      <div className={layoutClasses}>
        {/* 对话区域 */}
        <div className={`${panelClasses} ${isMobile ? 'h-1/2' : ''}`}>
          <Chat onDesignCardCreated={handleDesignCardCreated} />
        </div>
        
        {/* 设计稿画廊 */}
        <div className={`${panelClasses} ${isMobile ? 'h-1/2' : ''}`}>
          <DesignGallery 
            designCards={designCards}
            onCardClick={handleCardClick}
          />
        </div>
      </div>

      {/* 键盘快捷键帮助 */}
      <KeyboardShortcutsHelp 
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* 全屏模态框 */}
      <FullscreenModal
        isOpen={!!selectedDesignCard}
        onClose={() => setSelectedDesignCard(null)}
        designCard={selectedDesignCard}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;