import React, { useState } from 'react';
import { DesignCard } from '../types';
import DesignCardComponent from './DesignCard';
import { ImageIcon, Sparkles, Grid, Filter, Search } from 'lucide-react';

interface DesignGalleryProps {
  designCards: DesignCard[];
  onCardClick?: (designCard: DesignCard) => void;
}

const DesignGallery: React.FC<DesignGalleryProps> = ({ designCards, onCardClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 过滤设计稿
  const filteredCards = designCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (designCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="relative mb-8 animate-slide-in-up">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl animate-pulse-soft">
            <ImageIcon size={64} className="text-white" />
          </div>
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-3xl font-bold text-primary mb-4 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          设计稿画廊
        </h3>
        <p className="text-center text-secondary max-w-md leading-relaxed mb-8 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          在左侧对话框中描述您的设计需求，
          <br />
          <span className="gradient-text font-semibold">
            AI 将为您生成精美的设计稿
          </span>
        </p>
        
        <div className="grid grid-cols-2 gap-6 text-sm max-w-md">
          <div className="glass-effect p-6 rounded-xl text-center hover-lift interactive animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="font-semibold text-primary mb-2">智能设计</div>
            <div className="text-secondary">AI 驱动的设计生成</div>
          </div>
          <div className="glass-effect p-6 rounded-xl text-center hover-lift interactive animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon size={20} className="text-white" />
            </div>
            <div className="font-semibold text-primary mb-2">快速生成</div>
            <div className="text-secondary">秒级创建设计方案</div>
          </div>
        </div>

        {/* 快速开始提示 */}
        <div className="mt-8 glass-effect p-4 rounded-xl max-w-lg animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center gap-3 text-sm text-secondary">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💡</span>
            </div>
            <span>
              尝试说：<span className="text-primary font-medium">"设计一个现代化的登录页面"</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4 animate-slide-in-left">
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">
              设计稿画廊
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary">
                  共 {designCards.length} 个设计稿
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              {filteredCards.length !== designCards.length && (
                <div className="badge">
                  <Search size={12} />
                  <span>显示 {filteredCards.length} 个</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 glass-effect rounded-lg hover-lift interactive"
              title="切换视图模式"
            >
              <Grid size={16} className="text-secondary" />
            </button>
          </div>
        </div>
        
        {/* 搜索栏 */}
        {designCards.length > 0 && (
          <div className="input-gradient-border animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 px-4 py-3 enhanced-input rounded-lg">
              <Search size={16} className="text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索设计稿..."
                className="flex-1 border-0 focus:outline-none focus:ring-0 bg-transparent text-primary placeholder:text-secondary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Gallery */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 backdrop-blur-sm">
        {filteredCards.length === 0 && searchTerm ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">未找到匹配的设计稿</h3>
            <p className="text-secondary">
              尝试使用不同的关键词搜索，或者
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-500 hover:text-blue-600 font-medium ml-1"
              >
                清除搜索条件
              </button>
            </p>
          </div>
        ) : (
          <div className={`responsive-grid ${viewMode === 'list' ? 'grid-cols-1' : ''}`}>
            {filteredCards.map((designCard, index) => (
              <div
                key={designCard.id}
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DesignCardComponent
                  designCard={designCard}
                  onClick={() => onCardClick?.(designCard)}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      {designCards.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-lg">
          <div className="flex items-center justify-between text-sm text-secondary">
            <div className="flex items-center gap-4">
              <span>总计 {designCards.length} 个设计稿</span>
              {filteredCards.length !== designCards.length && (
                <span className="badge">
                  筛选后 {filteredCards.length} 个
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>实时更新</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignGallery;