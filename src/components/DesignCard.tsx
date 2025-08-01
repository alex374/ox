import React, { useState } from 'react';
import { DesignCard } from '../types';
import { Calendar, Eye, Sparkles, Download, Heart } from 'lucide-react';

interface DesignCardProps {
  designCard: DesignCard;
  onClick?: () => void;
}

const DesignCardComponent: React.FC<DesignCardProps> = ({ designCard, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 这里可以添加下载逻辑
    console.log('Download design:', designCard.title);
  };

  return (
    <div 
      className="group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      {/* 主卡片容器 */}
      <div className="modern-card hover-lift relative overflow-hidden">
        {/* 渐变背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* 图片容器 */}
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden relative">
          {/* 加载占位符 */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Sparkles size={24} className="text-white" />
              </div>
            </div>
          )}
          
          <img 
            src={designCard.imageUrl} 
            alt={designCard.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            } group-hover:scale-105`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x300?text=Design+Preview';
              setImageLoaded(true);
            }}
          />
          
          {/* 顶部工具栏 */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center ${
                isLiked 
                  ? 'bg-red-500 text-white shadow-lg scale-110' 
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:scale-110'
              }`}
            >
              <Heart size={16} className={isLiked ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleDownload}
              className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all duration-300"
            >
              <Download size={16} />
            </button>
          </div>
          
          {/* 左上角标签 */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full backdrop-blur-sm shadow-lg">
              AI 设计
            </div>
          </div>
          
          {/* 悬浮时的覆盖层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* 底部查看按钮 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md text-gray-700 rounded-full font-medium shadow-lg hover:bg-white hover:scale-105 transition-all duration-300">
              <Eye size={14} />
              <span className="text-sm">查看详情</span>
            </div>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="p-6 relative">
          {/* 顶部装饰线 */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          
          <div className="space-y-4">
            {/* 标题和描述 */}
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                {designCard.title}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {designCard.description}
              </p>
            </div>
            
            {/* 底部信息栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* 日期 */}
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Calendar size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-medium">{designCard.createdAt.toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
              
              {/* 状态指示器 */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-medium">已完成</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 边框高亮效果 */}
        <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      {/* 外部发光效果 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10 scale-110"></div>
    </div>
  );
};

export default DesignCardComponent;