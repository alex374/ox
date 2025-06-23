import React from 'react';
import { DesignCard } from '../types';
import DesignCardComponent from './DesignCard';
import { ImageIcon, Sparkles } from 'lucide-react';

interface DesignGalleryProps {
  designCards: DesignCard[];
  onCardClick?: (designCard: DesignCard) => void;
}

const DesignGallery: React.FC<DesignGalleryProps> = ({ designCards, onCardClick }) => {
  if (designCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl">
            <ImageIcon size={48} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          设计稿画廊
        </h3>
        <p className="text-center text-gray-600 max-w-md leading-relaxed">
          在左侧对话框中描述您的设计需求，
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
            AI 将为您生成精美的设计稿
          </span>
        </p>
        
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-500 max-w-md">
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-medium">智能设计</div>
          </div>
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium">快速生成</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          设计稿画廊
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            共 {designCards.length} 个设计稿
          </p>
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Gallery */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
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
    </div>
  );
};

export default DesignGallery;