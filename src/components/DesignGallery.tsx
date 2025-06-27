import React, { useState, useMemo } from 'react';
import { DesignCard } from '../types';
import DesignCardComponent from './DesignCard';
import { ImageIcon, Sparkles, Search, Filter, Grid, List, SortAsc } from 'lucide-react';

interface DesignGalleryProps {
  designCards: DesignCard[];
  onCardClick?: (designCard: DesignCard) => void;
}

const DesignGallery: React.FC<DesignGalleryProps> = ({ designCards, onCardClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 过滤和排序设计稿
  const filteredAndSortedCards = useMemo(() => {
    let filtered = designCards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [designCards, searchTerm, sortBy]);

  if (designCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        {/* 空状态插图 */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl">
            <ImageIcon size={64} className="text-white" />
          </div>
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles size={24} className="text-white" />
          </div>
          {/* 装饰性圆点 */}
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/4 -left-4 w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-1/4 -right-6 w-5 h-5 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          设计稿画廊
        </h3>
        <p className="text-center text-gray-600 max-w-md leading-relaxed mb-8">
          在左侧对话框中描述您的设计需求，
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
            AI 将为您生成精美的设计稿
          </span>
        </p>
        
        {/* 特性展示 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500 max-w-2xl">
          <div className="glass-effect p-4 rounded-xl text-center hover-lift-subtle">
            <div className="text-3xl mb-2">🎨</div>
            <div className="font-medium text-gray-700">智能设计</div>
            <div className="text-xs text-gray-500 mt-1">AI 驱动创作</div>
          </div>
          <div className="glass-effect p-4 rounded-xl text-center hover-lift-subtle">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-medium text-gray-700">快速生成</div>
            <div className="text-xs text-gray-500 mt-1">秒级响应</div>
          </div>
          <div className="glass-effect p-4 rounded-xl text-center hover-lift-subtle">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-medium text-gray-700">精准匹配</div>
            <div className="text-xs text-gray-500 mt-1">理解需求</div>
          </div>
          <div className="glass-effect p-4 rounded-xl text-center hover-lift-subtle">
            <div className="text-3xl mb-2">✨</div>
            <div className="font-medium text-gray-700">持续优化</div>
            <div className="text-xs text-gray-500 mt-1">不断进步</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100/20 bg-gradient-to-r from-white/10 to-gray-50/10 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              设计稿画廊
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                共 {designCards.length} 个设计稿
              </p>
              {filteredAndSortedCards.length !== designCards.length && (
                <span className="text-sm text-purple-600">
                  · 显示 {filteredAndSortedCards.length} 个
                </span>
              )}
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* 视图切换 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        
        {/* 搜索和过滤栏 */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设计稿..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {/* 排序选择 */}
          <div className="flex items-center gap-2">
            <SortAsc size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              className="px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="newest">最新创建</option>
              <option value="oldest">最早创建</option>
              <option value="title">按标题</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Gallery */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 backdrop-blur-sm">
        {filteredAndSortedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">未找到匹配的设计稿</p>
            <p className="text-sm">尝试调整搜索关键词或清空搜索框</p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredAndSortedCards.map((designCard, index) => (
              <div
                key={designCard.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DesignCardComponent
                  designCard={designCard}
                  onClick={() => onCardClick?.(designCard)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignGallery;