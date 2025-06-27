import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DesignCard } from '../types';
import DesignCardComponent from './DesignCard';
import { ImageIcon, Sparkles, Search, Filter, Grid, List, SortAsc, MoreHorizontal, CheckSquare, Trash2, Download, Star, Eye } from 'lucide-react';

interface DesignGalleryProps {
  designCards: DesignCard[];
  onCardClick?: (designCard: DesignCard) => void;
}

interface VirtualItem {
  index: number;
  height: number;
  offset: number;
}

const ITEM_HEIGHT = 280; // 设计卡片的估计高度
const OVERSCAN = 3; // 渲染额外的项目数量

const DesignGallery: React.FC<DesignGalleryProps> = ({ designCards, onCardClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'popularity'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // 虚拟滚动计算
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    designCards.length - 1,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  // 监听容器尺寸变化
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 过滤和排序设计稿
  const filteredAndSortedCards = useMemo(() => {
    let filtered = designCards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterTag === 'all' || 
        (filterTag === 'recent' && Date.now() - card.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000) ||
        (filterTag === 'starred' && false); // 假设有收藏功能
      
      return matchesSearch && matchesFilter;
    });

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
      case 'popularity':
        // 模拟热度排序
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    return filtered;
  }, [designCards, searchTerm, sortBy, filterTag]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleCardSelect = useCallback((cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedCards.size === filteredAndSortedCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredAndSortedCards.map(card => card.id)));
    }
  }, [selectedCards.size, filteredAndSortedCards]);

  const handleBulkDelete = useCallback(() => {
    if (window.confirm(`确定要删除选中的 ${selectedCards.size} 个设计稿吗？`)) {
      console.log('Bulk delete:', Array.from(selectedCards));
      setSelectedCards(new Set());
      setIsSelectionMode(false);
    }
  }, [selectedCards]);

  const handleBulkExport = useCallback(() => {
    const selectedCardsData = filteredAndSortedCards.filter(card => selectedCards.has(card.id));
    const exportData = {
      cards: selectedCardsData,
      exportTime: new Date().toISOString(),
      count: selectedCardsData.length
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-cards-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredAndSortedCards, selectedCards]);

  const handleDragStart = useCallback((cardId: string) => {
    setDraggedCard(cardId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
  }, []);

  // 获取标签列表
  const tags = useMemo(() => [
    { id: 'all', label: '全部', count: designCards.length },
    { id: 'recent', label: '最近7天', count: designCards.filter(c => Date.now() - c.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000).length },
    { id: 'starred', label: '收藏', count: 0 }
  ], [designCards]);

  if (designCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        {/* 空状态插图 */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl animate-bounceIn">
            <ImageIcon size={64} className="text-white" />
          </div>
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles size={24} className="text-white" />
          </div>
          {/* 装饰性粒子 */}
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
          {[
            { icon: '🎨', title: '智能设计', desc: 'AI 驱动创作' },
            { icon: '⚡', title: '快速生成', desc: '秒级响应' },
            { icon: '🎯', title: '精准匹配', desc: '理解需求' },
            { icon: '✨', title: '持续优化', desc: '不断进步' }
          ].map((feature, index) => (
            <div key={index} className="glass-effect p-4 rounded-xl text-center hover-lift-subtle cursor-pointer group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <div className="font-medium text-gray-700">{feature.title}</div>
              <div className="text-xs text-gray-500 mt-1">{feature.desc}</div>
            </div>
          ))}
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
              {selectedCards.size > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  · 已选 {selectedCards.size} 个
                </span>
              )}
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* 工具栏 */}
          <div className="flex items-center gap-2">
            {/* 批量操作按钮 */}
            {selectedCards.size > 0 && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={handleBulkExport}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  title="批量导出"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  title="批量删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isSelectionMode ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="选择模式"
            >
              <CheckSquare size={18} />
            </button>
            
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
        <div className="space-y-3">
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
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="newest">最新创建</option>
                <option value="oldest">最早创建</option>
                <option value="title">按标题</option>
                <option value="popularity">按热度</option>
              </select>
            </div>
            
            {/* 高级筛选 */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showAdvancedFilters ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter size={18} />
            </button>
          </div>
          
          {/* 标签筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(tag.id)}
                className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                  filterTag === tag.id
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tag.label} ({tag.count})
              </button>
            ))}
          </div>
          
          {/* 批量操作栏 */}
          {isSelectionMode && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedCards.size === filteredAndSortedCards.length ? '取消全选' : '全选'}
                </button>
                <span className="text-sm text-gray-600">
                  已选择 {selectedCards.size} / {filteredAndSortedCards.length} 项
                </span>
              </div>
              <button
                onClick={() => setIsSelectionMode(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                退出选择
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Gallery */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 backdrop-blur-sm"
        onScroll={handleScroll}
      >
        {filteredAndSortedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">未找到匹配的设计稿</p>
            <p className="text-sm">尝试调整搜索关键词或清空筛选条件</p>
          </div>
        ) : (
          <div className="p-6">
            {viewMode === 'grid' ? (
              // 虚拟滚动网格布局
              <div 
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                style={{ minHeight: filteredAndSortedCards.length * ITEM_HEIGHT }}
              >
                {filteredAndSortedCards.slice(startIndex, endIndex + 1).map((designCard, index) => (
                  <div
                    key={designCard.id}
                    className={`animate-fadeInUp ${isSelectionMode ? 'cursor-pointer' : ''} ${
                      selectedCards.has(designCard.id) ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                    }`}
                    style={{ 
                      animationDelay: `${(index % 9) * 0.05}s`,
                      transform: draggedCard === designCard.id ? 'rotate(5deg) scale(0.95)' : undefined
                    }}
                    onClick={isSelectionMode ? () => handleCardSelect(designCard.id) : undefined}
                    draggable={!isSelectionMode}
                    onDragStart={() => handleDragStart(designCard.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <DesignCardComponent
                      designCard={designCard}
                      onClick={() => !isSelectionMode && onCardClick?.(designCard)}
                      showCheckbox={isSelectionMode}
                      isSelected={selectedCards.has(designCard.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // 列表布局
              <div className="space-y-4">
                {filteredAndSortedCards.slice(startIndex, endIndex + 1).map((designCard, index) => (
                  <div
                    key={designCard.id}
                    className={`animate-fadeInUp ${isSelectionMode ? 'cursor-pointer' : ''} ${
                      selectedCards.has(designCard.id) ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={isSelectionMode ? () => handleCardSelect(designCard.id) : undefined}
                  >
                    <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={designCard.imageUrl} 
                          alt={designCard.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{designCard.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{designCard.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{designCard.createdAt.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {Math.floor(Math.random() * 100)} 次查看
                          </span>
                        </div>
                      </div>
                      {isSelectionMode && (
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded border-2 transition-colors duration-200 ${
                            selectedCards.has(designCard.id) 
                              ? 'bg-purple-500 border-purple-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedCards.has(designCard.id) && (
                              <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignGallery;