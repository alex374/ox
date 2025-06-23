import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import DesignGallery from './components/DesignGallery';
import { DesignCard } from './types';
import mermaid from 'mermaid';

function App() {
  const [designCards, setDesignCards] = useState<DesignCard[]>([]);

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
    // 可以在这里实现查看设计稿详情的功能
    console.log('Clicked design card:', designCard);
  };

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="h-screen max-h-screen flex gap-4">
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
    </div>
  );
}

export default App;