import React from 'react';
import { DesignCard } from '../types';
import { Calendar, Eye, Sparkles, Clock } from 'lucide-react';

interface DesignCardProps {
  designCard: DesignCard;
  onClick?: () => void;
  compact?: boolean;
}

const DesignCardComponent: React.FC<DesignCardProps> = ({ designCard, onClick, compact = false }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays - 1} 天前`;
    return date.toLocaleDateString();
  };

  if (compact) {
    return (
      <div 
        className="modern-card hover-lift cursor-pointer transition-all duration-300 group relative overflow-hidden"
        onClick={onClick}
      >
        {/* 渐变边框效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
        
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden relative">
          <img 
            src={designCard.imageUrl} 
            alt={designCard.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x300?text=Design+Preview';
            }}
          />
          
          {/* 悬浮时的覆盖层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* 魔法图标 */}
          <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
            <Sparkles size={12} className="text-white" />
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {designCard.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock size={10} />
              <span className="font-medium">{formatDate(designCard.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-1 px-2 py-1 btn-gradient text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
              <Eye size={10} />
              <span className="font-medium">查看</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="modern-card hover-lift cursor-pointer transition-all duration-300 group relative overflow-hidden"
      onClick={onClick}
    >
      {/* 渐变边框效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
      
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden relative">
        <img 
          src={designCard.imageUrl} 
          alt={designCard.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300?text=Design+Preview';
          }}
        />
        
        {/* 悬浮时的覆盖层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* 魔法图标 */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
          <Sparkles size={14} className="text-white" />
        </div>
        
        {/* 新标签 */}
        {(() => {
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - designCard.createdAt.getTime());
          const diffHours = diffTime / (1000 * 60 * 60);
          
          if (diffHours < 24) {
            return (
              <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full font-medium shadow-lg">
                新创建
              </div>
            );
          }
          return null;
        })()}
      </div>
      
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {designCard.title}
        </h3>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
          {designCard.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Calendar size={10} className="text-white sm:w-3 sm:h-3" />
            </div>
            <span className="font-medium">{formatDate(designCard.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 btn-gradient text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
            <Eye size={12} />
            <span className="font-medium hidden sm:inline">查看详情</span>
            <span className="font-medium sm:hidden">查看</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCardComponent;