import React, { useState, useMemo } from 'react';
import { DesignCard } from '../types';
import DesignCardComponent from './DesignCard';
import { ImageIcon, Sparkles, Grid, List, Search, Filter } from 'lucide-react';

interface DesignGalleryProps {
  designCards: DesignCard[];
  onCardClick?: (designCard: DesignCard) => void;
}

const DesignGallery: React.FC<DesignGalleryProps> = ({ designCards, onCardClick }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // 过滤和排序逻辑
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
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [designCards, searchTerm, sortBy]);

  if (designCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 text-center max-w-md">
          {/* 主图标 */}
          <div className="relative mb-8 mx-auto w-32 h-32">
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl animate-pulse-glow">
              <ImageIcon size={56} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-float">
              <Sparkles size={20} className="text-white" />
            </div>
            
            {/* 装饰圆点 */}
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <div className="absolute -top-3 left-1/3 w-4 h-4 bg-gradient-to-br from-pink-500 to-red-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            设计稿画廊
          </h3>
          
          <div className="space-y-4 mb-8">
            <p className="text-gray-600 leading-relaxed text-lg">
              在左侧对话框中描述您的设计需求，
            </p>
            <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold text-lg">
              AI 将为您生成精美的设计稿
            </p>
          </div>
          
          {/* 功能展示卡片 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-effect p-6 rounded-2xl text-center hover-lift">
              <div className="text-3xl mb-3">🎨</div>
              <div className="font-semibold text-gray-700 mb-2">智能设计</div>
              <div className="text-sm text-gray-500">AI 驱动的设计生成</div>
            </div>
            <div className="glass-effect p-6 rounded-2xl text-center hover-lift">
              <div className="text-3xl mb-3">⚡</div>
              <div className="font-semibold text-gray-700 mb-2">快速生成</div>
              <div className="text-sm text-gray-500">秒级响应设计需求</div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 leading-relaxed">
            💡 尝试输入："设计一个现代风格的登录页面" 或 "创建一个电商产品卡片"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              设计稿画廊
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                共 {filteredAndSortedCards.length} 个设计稿
              </p>
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">实时更新</span>
            </div>
          </div>
          
          {/* 视图切换按钮 */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
        
        {/* 搜索和过滤栏 */}
        <div className="flex gap-3">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索设计稿..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>
          
          {/* 排序选择器 */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
              className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
            >
              <option value="newest">最新</option>
              <option value="oldest">最早</option>
              <option value="name">名称</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* Gallery Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {filteredAndSortedCards.length === 0 ? (
          /* 搜索无结果状态 */
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">未找到匹配的设计稿</h3>
            <p className="text-gray-500 mb-4">试试其他关键词或清空搜索条件</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              清空搜索
            </button>
          </div>
        ) : (
          <div className={`transition-all duration-300 ${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {filteredAndSortedCards.map((designCard, index) => (
              <div
                key={designCard.id}
                className="transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
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