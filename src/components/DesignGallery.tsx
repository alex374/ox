import React, { useState, useMemo } from 'react';
import { DesignCard } from '../types';
import DesignCardComponent from './DesignCard';
import { ImageIcon, Sparkles, Search, SortDesc, Filter, Grid3X3, Grid2X2 } from 'lucide-react';

interface DesignGalleryProps {
  designCards: DesignCard[];
  onCardClick?: (designCard: DesignCard) => void;
}

type SortOption = 'newest' | 'oldest' | 'title';
type ViewMode = 'grid' | 'compact';

const DesignGallery: React.FC<DesignGalleryProps> = ({ designCards, onCardClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // 过滤和排序逻辑
  const filteredAndSortedCards = useMemo(() => {
    let filtered = designCards;
    
    // 搜索过滤
    if (searchTerm) {
      filtered = designCards.filter(card => 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [designCards, searchTerm, sortBy]);

  if (designCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="relative mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl">
            <ImageIcon size={window.innerWidth < 640 ? 40 : 48} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles size={window.innerWidth < 640 ? 12 : 16} className="text-white" />
          </div>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 text-center">
          设计稿画廊
        </h3>
        <p className="text-center text-gray-600 max-w-md leading-relaxed text-sm sm:text-base">
          在左侧对话框中描述您的设计需求，
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
            AI 将为您生成精美的设计稿
          </span>
        </p>
        
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-500 max-w-md">
          <div className="glass-effect p-3 sm:p-4 rounded-xl text-center hover-lift">
            <div className="text-xl sm:text-2xl mb-2">🎨</div>
            <div className="font-medium text-xs sm:text-sm">智能设计</div>
          </div>
          <div className="glass-effect p-3 sm:p-4 rounded-xl text-center hover-lift">
            <div className="text-xl sm:text-2xl mb-2">⚡</div>
            <div className="font-medium text-xs sm:text-sm">快速生成</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
              设计稿画廊
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-gray-500">
                共 {designCards.length} 个设计稿
                {filteredAndSortedCards.length !== designCards.length && 
                  ` • 显示 ${filteredAndSortedCards.length} 个`
                }
              </p>
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* 视图切换按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="网格视图"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'compact' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="紧凑视图"
            >
              <Grid2X2 size={16} />
            </button>
          </div>
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索设计稿..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* 排序和筛选按钮 */}
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-gray-800 hover:border-gray-300 transition-all duration-200"
              >
                <SortDesc size={14} />
                <span className="hidden sm:inline">排序</span>
              </button>
              
              {showFilters && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 px-2">排序方式</div>
                    {[
                      { value: 'newest', label: '最新创建' },
                      { value: 'oldest', label: '最早创建' },
                      { value: 'title', label: '标题排序' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as SortOption);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          sortBy === option.value 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Gallery Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {filteredAndSortedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">未找到匹配的设计稿</p>
            <p className="text-sm text-center">尝试调整搜索关键词或清空搜索条件</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                清空搜索
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {filteredAndSortedCards.map((designCard) => (
              <DesignCardComponent
                key={designCard.id}
                designCard={designCard}
                onClick={() => onCardClick?.(designCard)}
                compact={viewMode === 'compact'}
              />
            ))}
          </div>
        )}
      </div>

      {/* 点击遮罩关闭筛选菜单 */}
      {showFilters && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default DesignGallery;