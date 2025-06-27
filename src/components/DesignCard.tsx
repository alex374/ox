import React, { useState } from 'react';
import { DesignCard } from '../types';
import { Calendar, Eye, Sparkles, Heart, Download, Share2, MoreHorizontal } from 'lucide-react';

interface DesignCardProps {
  designCard: DesignCard;
  onClick?: () => void;
}

const DesignCardComponent: React.FC<DesignCardProps> = ({ designCard, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 下载逻辑
    console.log('下载设计稿:', designCard.title);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 分享逻辑
    console.log('分享设计稿:', designCard.title);
  };

  return (
    <div 
      className="modern-card hover-lift cursor-pointer transition-all duration-300 group relative overflow-hidden"
      onClick={onClick}
    >
      {/* 魔法光效边框 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10 animate-pulse"></div>
      
      {/* 图片容器 */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden relative">
        {/* 骨架屏加载效果 */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer"></div>
          </div>
        )}
        
        <img 
          src={designCard.imageUrl} 
          alt={designCard.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } group-hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageError(true);
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Design+Preview';
          }}
        />
        
        {/* 悬浮时的渐变覆盖层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* 顶部操作栏 */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
          <div className="flex gap-2">
            <div className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
              AI 生成
            </div>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={handleLike}
              className={`p-2 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 ${
                isLiked 
                  ? 'bg-red-500/90 text-white' 
                  : 'bg-white/90 text-gray-700 hover:bg-red-50'
              }`}
            >
              <Heart size={14} className={isLiked ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-110"
            >
              <Download size={14} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-green-50 hover:text-green-600 transition-all duration-200 hover:scale-110"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
        
        {/* 右下角魔法图标 */}
        <div className="absolute bottom-3 right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
          <Sparkles size={14} className="text-white" />
        </div>
      </div>
      
      {/* 卡片内容 */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {designCard.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {designCard.description}
        </p>
        
        {/* 底部信息栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Calendar size={12} className="text-white" />
            </div>
            <span className="font-medium">{designCard.createdAt.toLocaleDateString()}</span>
          </div>
          
          {/* 查看详情按钮 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full opacity-100 group-hover:opacity-0 transition-all duration-300 text-xs">
              <Eye size={12} />
              <span>查看</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 btn-gradient text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105 text-xs">
              <Eye size={12} />
              <span className="font-medium">查看详情</span>
            </div>
          </div>
        </div>
        
        {/* 进度指示器 */}
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>设计完成度</span>
            <span>95%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-1000 group-hover:w-[95%] w-0"></div>
          </div>
        </div>
      </div>
      
      {/* 点击涟漪效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-active:from-purple-400/20 group-active:to-pink-400/20 transition-all duration-150"></div>
      </div>
    </div>
  );
};

export default DesignCardComponent;