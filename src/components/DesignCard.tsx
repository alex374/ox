import React from 'react';
import { DesignCard } from '../types';
import { Calendar, Eye, Sparkles, Clock } from 'lucide-react';

interface DesignCardProps {
  designCard: DesignCard;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
}

const DesignCardComponent: React.FC<DesignCardProps> = ({ 
  designCard, 
  onClick, 
  viewMode = 'grid' 
}) => {
  if (viewMode === 'list') {
    return (
      <div 
        className="modern-card hover-lift cursor-pointer transition-all duration-300 group relative overflow-hidden animate-fade-in"
        onClick={onClick}
      >
        <div className="flex gap-6 p-6">
          {/* 图片区域 */}
          <div className="flex-shrink-0 w-48 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative">
            <img 
              src={designCard.imageUrl} 
              alt={designCard.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 image-preview"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400x300?text=Design+Preview';
              }}
            />
            
            {/* 悬浮时的覆盖层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* 魔法图标 */}
            <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
              <Sparkles size={14} className="text-white" />
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-primary text-lg mb-3 line-clamp-2 group-hover:gradient-text transition-all duration-300">
                {designCard.title}
              </h3>
              
              <p className="text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                {designCard.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-2 text-secondary">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Calendar size={12} className="text-white" />
                  </div>
                  <span className="font-medium">{designCard.createdAt.toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-secondary">
                  <Clock size={12} />
                  <span>{designCard.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 btn-gradient text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
                <Eye size={14} />
                <span className="font-medium text-sm">查看详情</span>
              </div>
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
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 image-preview"
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

        {/* 新增：左上角标签 */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          设计稿
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-primary text-base mb-3 line-clamp-2 group-hover:gradient-text transition-all duration-300">
          {designCard.title}
        </h3>
        
        <p className="text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
          {designCard.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-secondary">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Calendar size={12} className="text-white" />
            </div>
            <span className="font-medium">{designCard.createdAt.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 btn-gradient text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
            <Eye size={12} />
            <span className="font-medium">查看详情</span>
          </div>
        </div>

        {/* 新增：底部状态指示器 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-secondary">已生成</span>
          </div>
          <div className="text-xs text-secondary">
            {designCard.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCardComponent;