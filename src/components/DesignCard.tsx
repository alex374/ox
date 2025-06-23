import React from 'react';
import { DesignCard } from '../types';
import { Calendar, Eye, Sparkles } from 'lucide-react';

interface DesignCardProps {
  designCard: DesignCard;
  onClick?: () => void;
}

const DesignCardComponent: React.FC<DesignCardProps> = ({ designCard, onClick }) => {
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
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {designCard.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {designCard.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
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
      </div>
    </div>
  );
};

export default DesignCardComponent;