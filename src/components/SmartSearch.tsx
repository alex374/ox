import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Tag, Clock, Sparkles, Filter, TrendingUp, Command } from 'lucide-react';
import { DesignCard } from '../types';

interface SmartSearchProps {
  designCards: DesignCard[];
  onSearchResults: (results: DesignCard[]) => void;
  onTagSelect: (tag: string) => void;
  className?: string;
}

interface SearchSuggestion {
  type: 'recent' | 'tag' | 'smart' | 'trending';
  text: string;
  count?: number;
  icon?: React.ReactNode;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ 
  designCards, 
  onSearchResults, 
  onTagSelect,
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 从本地存储恢复最近搜索
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // 提取标签和关键词
  const extractedData = useMemo(() => {
    const tags = new Set<string>();
    const keywords = new Set<string>();
    
    designCards.forEach(card => {
      // 从标题和描述中提取关键词
      const text = `${card.title} ${card.description}`.toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 2);
      
      words.forEach(word => {
        keywords.add(word);
        // 简单的标签提取逻辑
        if (word.includes('登录') || word.includes('login')) tags.add('登录页面');
        if (word.includes('按钮') || word.includes('button')) tags.add('按钮组件');
        if (word.includes('卡片') || word.includes('card')) tags.add('卡片设计');
        if (word.includes('导航') || word.includes('nav')) tags.add('导航栏');
        if (word.includes('移动') || word.includes('mobile')) tags.add('移动端');
        if (word.includes('网页') || word.includes('web')) tags.add('网页设计');
      });
    });

    return {
      tags: Array.from(tags),
      keywords: Array.from(keywords),
      popularTags: Array.from(tags).slice(0, 8)
    };
  }, [designCards]);

  // 生成搜索建议
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (!query && !isExpanded) return [];

    const results: SearchSuggestion[] = [];

    // 最近搜索
    if (query === '' && recentSearches.length > 0) {
      results.push(
        ...recentSearches.map(search => ({
          type: 'recent' as const,
          text: search,
          icon: <Clock size={14} />
        }))
      );
    }

    // 智能匹配的标签
    const matchingTags = extractedData.tags.filter(tag =>
      tag.toLowerCase().includes(query.toLowerCase())
    );
    
    results.push(
      ...matchingTags.slice(0, 3).map(tag => ({
        type: 'tag' as const,
        text: tag,
        count: designCards.filter(card => 
          card.title.toLowerCase().includes(tag.toLowerCase()) ||
          card.description.toLowerCase().includes(tag.toLowerCase())
        ).length,
        icon: <Tag size={14} />
      }))
    );

    // 智能搜索建议
    if (query.length > 1) {
      const smartSuggestions = [
        `设计一个${query}`,
        `${query}的最佳实践`,
        `现代化的${query}`,
        `移动端${query}`
      ].filter(suggestion => 
        !results.some(r => r.text.includes(suggestion))
      );

      results.push(
        ...smartSuggestions.slice(0, 2).map(text => ({
          type: 'smart' as const,
          text,
          icon: <Sparkles size={14} />
        }))
      );
    }

    // 热门标签（当输入为空时显示）
    if (query === '' && isExpanded) {
      results.push(
        ...extractedData.popularTags.map(tag => ({
          type: 'trending' as const,
          text: tag,
          count: designCards.filter(card => 
            card.title.toLowerCase().includes(tag.toLowerCase()) ||
            card.description.toLowerCase().includes(tag.toLowerCase())
          ).length,
          icon: <TrendingUp size={14} />
        }))
      );
    }

    return results.slice(0, 8);
  }, [query, isExpanded, recentSearches, extractedData, designCards]);

  // 执行搜索
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      onSearchResults(designCards);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const results = designCards.filter(card => {
      const titleMatch = card.title.toLowerCase().includes(queryLower);
      const descMatch = card.description.toLowerCase().includes(queryLower);
      
      // 智能匹配：支持同义词和相关词
      const synonyms: Record<string, string[]> = {
        '登录': ['login', 'signin', '登陆', '登入'],
        '按钮': ['button', 'btn', '按键'],
        '卡片': ['card', '卡片式', '卡片组件'],
        '导航': ['nav', 'navigation', '菜单', 'menu'],
        '移动': ['mobile', '手机', 'app', '移动端'],
        '网页': ['web', 'website', '网站', 'pc']
      };

      const synonymMatch = Object.entries(synonyms).some(([key, values]) => {
        if (queryLower.includes(key)) {
          return values.some(synonym => 
            card.title.toLowerCase().includes(synonym) ||
            card.description.toLowerCase().includes(synonym)
          );
        }
        return values.some(synonym => {
          if (queryLower.includes(synonym)) {
            return card.title.toLowerCase().includes(key) ||
                   card.description.toLowerCase().includes(key);
          }
          return false;
        });
      });

      return titleMatch || descMatch || synonymMatch;
    });

    // 按相关性排序
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(queryLower) ? 2 : 0;
      const aDesc = a.description.toLowerCase().includes(queryLower) ? 1 : 0;
      const bTitle = b.title.toLowerCase().includes(queryLower) ? 2 : 0;
      const bDesc = b.description.toLowerCase().includes(queryLower) ? 1 : 0;
      
      return (bTitle + bDesc) - (aTitle + aDesc);
    });

    onSearchResults(results);

    // 保存到最近搜索
    if (searchQuery.trim()) {
      const newRecent = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  }, [designCards, onSearchResults, recentSearches]);

  // 处理搜索输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestionIndex(-1);
    performSearch(value);
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    performSearch(suggestion.text);
    
    if (suggestion.type === 'tag') {
      onTagSelect(suggestion.text);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    onSearchResults(designCards);
  };

  // 清除最近搜索
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return <Clock size={14} className="text-gray-400" />;
      case 'tag': return <Tag size={14} className="text-blue-500" />;
      case 'smart': return <Sparkles size={14} className="text-purple-500" />;
      case 'trending': return <TrendingUp size={14} className="text-green-500" />;
      default: return <Search size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className={`relative transition-all duration-300 ${
        isExpanded ? 'transform scale-105' : ''
      }`}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsExpanded(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              // 延迟关闭，以便点击建议
              setTimeout(() => {
                setShowSuggestions(false);
                setIsExpanded(false);
              }, 200);
            }}
            placeholder="智能搜索设计稿... (支持自然语言)"
            className="w-full pl-10 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder:text-gray-400"
          />
          
          {/* 清除按钮 */}
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={16} />
            </button>
          )}

          {/* 键盘提示 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <Command size={12} />
            <span>K</span>
          </div>
        </div>

        {/* 搜索建议下拉框 */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-modalSlideIn"
          >
            <div className="max-h-80 overflow-y-auto">
              {/* 搜索结果计数 */}
              {query && (
                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  找到 {designCards.filter(card => 
                    card.title.toLowerCase().includes(query.toLowerCase()) ||
                    card.description.toLowerCase().includes(query.toLowerCase())
                  ).length} 个相关设计稿
                </div>
              )}

              {/* 建议列表 */}
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.text}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 ${
                      index === selectedSuggestionIndex ? 'bg-purple-50 border-r-2 border-purple-500' : ''
                    }`}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.count !== undefined && (
                        <div className="text-xs text-gray-500">
                          {suggestion.count} 个相关结果
                        </div>
                      )}
                    </div>
                    {suggestion.type === 'trending' && (
                      <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        热门
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* 最近搜索管理 */}
              {recentSearches.length > 0 && query === '' && (
                <div className="border-t border-gray-100 px-4 py-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">最近搜索</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    清除
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 智能过滤器快捷按钮 */}
      {!isExpanded && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {extractedData.popularTags.slice(0, 4).map(tag => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                performSearch(tag);
                onTagSelect(tag);
              }}
              className="flex-shrink-0 px-3 py-1.5 text-sm bg-white/50 text-gray-600 rounded-full hover:bg-white/70 transition-all duration-200 border border-gray-200 hover:border-purple-300"
            >
              <Tag size={12} className="inline mr-1" />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;