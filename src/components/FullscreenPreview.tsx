import React, { useState, useEffect, useRef } from 'react';
import { DesignCard } from '../types';
import { X, Download, Share2, Heart, ZoomIn, ZoomOut, RotateCw, Move, Maximize2 } from 'lucide-react';

interface FullscreenPreviewProps {
  designCard: DesignCard;
  isOpen: boolean;
  onClose: () => void;
}

const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({ designCard, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 重置状态当组件打开时
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setShowDetails(true);
    }
  }, [isOpen]);

  // 键盘控制
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '=':
        case '+':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'd':
          e.preventDefault();
          setShowDetails(!showDetails);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showDetails]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = designCard.imageUrl;
    link.download = `${designCard.title}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: designCard.title,
          text: designCard.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('分享被取消');
      }
    } else {
      // 回退到复制链接
      navigator.clipboard.writeText(window.location.href);
      // 这里可以显示一个toast提示
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 backdrop-blur-sm">
      {/* 粒子背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 主容器 */}
      <div className="h-full flex">
        {/* 图片预览区域 */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={designCard.imageUrl}
            alt={designCard.title}
            className="max-w-none transition-all duration-300 ease-out select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
          />
        </div>

        {/* 侧边栏详情 */}
        <div className={`w-80 bg-white bg-opacity-95 backdrop-blur-lg transform transition-transform duration-300 ${
          showDetails ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 h-full flex flex-col">
            {/* 头部 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                  {designCard.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{designCard.createdAt.toLocaleDateString()}</span>
                  <span>•</span>
                  <span>AI 生成</span>
                </div>
              </div>
            </div>

            {/* 描述 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">描述</h3>
              <p className="text-gray-600 leading-relaxed">
                {designCard.description}
              </p>
            </div>

            {/* 统计信息 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">统计信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor(Math.random() * 500)}
                  </div>
                  <div className="text-xs text-gray-500">查看次数</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-pink-600">
                    {Math.floor(Math.random() * 50)}
                  </div>
                  <div className="text-xs text-gray-500">点赞数</div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-auto space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors duration-200 ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  {isLiked ? '已收藏' : '收藏'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                >
                  <Share2 size={16} />
                  分享
                </button>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
              >
                <Download size={16} />
                下载高清图
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 顶部工具栏 */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
            缩放: {Math.round(zoom * 100)}%
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-black bg-opacity-50 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-70 transition-all duration-200"
            title="切换详情面板"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-black bg-opacity-50 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-70 transition-all duration-200"
            title="关闭预览"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
            title="缩小 (-)"
          >
            <ZoomOut size={18} />
          </button>
          
          <button
            onClick={resetZoom}
            className="px-3 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200 text-sm"
            title="重置缩放 (0)"
          >
            重置
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
            title="放大 (+)"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* 快捷键提示 */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 text-white text-xs space-y-1">
          <div>快捷键:</div>
          <div>ESC - 关闭</div>
          <div>+/- - 缩放</div>
          <div>0 - 重置</div>
          <div>D - 切换详情</div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenPreview;