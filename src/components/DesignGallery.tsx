import React from 'react';
import { DesignCard } from '../types';
import DesignCardComponent from './DesignCard';
import { ImageIcon } from 'lucide-react';

interface DesignGalleryProps {
  designCards: DesignCard[];
  onCardClick?: (designCard: DesignCard) => void;
}

const DesignGallery: React.FC<DesignGalleryProps> = ({ designCards, onCardClick }) => {
  if (designCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
        <ImageIcon size={64} className="mb-4" />
        <h3 className="text-lg font-medium mb-2">还没有设计稿</h3>
        <p className="text-center text-sm">
          在左侧对话框中描述您的设计需求，
          <br />
          AI 将为您生成精美的设计稿
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">设计稿画廊</h2>
        <p className="text-sm text-gray-600">
          共 {designCards.length} 个设计稿
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {designCards.map((designCard) => (
          <DesignCardComponent
            key={designCard.id}
            designCard={designCard}
            onClick={() => onCardClick?.(designCard)}
          />
        ))}
      </div>
    </div>
  );
};

export default DesignGallery;