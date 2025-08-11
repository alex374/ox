import React, { useEffect } from 'react';
import { X, Download, Share2, Maximize2 } from 'lucide-react';
import { DesignCard } from '../types';
import LazyImage from './LazyImage';
import { useKeyboardShortcuts, SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  designCard: DesignCard | null;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ isOpen, onClose, designCard }) => {
  // 键盘快捷键
  useKeyboardShortcuts({
    [SHORTCUTS.ESCAPE]: onClose,
  });

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !designCard) return null;

  const handleDownload = () => {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = designCard.imageUrl;
    link.download = `${designCard.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: designCard.title,
          text: designCard.description,
          url: designCard.imageUrl,
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    } else {
      // 降级方案：复制到剪贴板
      try {
        await navigator.clipboard.writeText(designCard.imageUrl);
        // 这里可以添加一个toast提示
        console.log('链接已复制到剪贴板');
      } catch (error) {
        console.log('复制失败:', error);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部控制栏 */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-lg sm:text-xl font-bold mb-1 truncate">
                {designCard.title}
              </h2>
              <p className="text-sm text-gray-300 line-clamp-2">
                {designCard.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover-lift focus-visible"
                aria-label="下载图片"
              >
                <Download size={16} className="text-white sm:w-5 sm:h-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover-lift focus-visible"
                aria-label="分享图片"
              >
                <Share2 size={16} className="text-white sm:w-5 sm:h-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 hover-lift focus-visible"
                aria-label="关闭"
              >
                <X size={16} className="text-white sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 图片容器 */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <LazyImage
            src={designCard.imageUrl}
            alt={designCard.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* 底部信息栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 sm:p-6">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">
                创建于 {designCard.createdAt.toLocaleDateString()}
              </span>
            </div>
            
            <div className="text-xs text-gray-300">
              按 <kbd className="px-1 bg-white/20 rounded">Esc</kbd> 关闭
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;