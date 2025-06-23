import React, { useEffect, useState } from 'react';
import { DesignCard } from '../types';
import { X, Download, Share2, Heart, Copy, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { useNotify } from './NotificationProvider';

interface DesignPreviewModalProps {
  designCard: DesignCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const DesignPreviewModal: React.FC<DesignPreviewModalProps> = ({
  designCard,
  isOpen,
  onClose
}) => {
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [liked, setLiked] = useState(false);
  const notify = useNotify();

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          setImageScale(prev => Math.min(prev + 0.2, 3));
          break;
        case '-':
          setImageScale(prev => Math.max(prev - 0.2, 0.5));
          break;
        case 'r':
        case 'R':
          setImageRotation(prev => (prev + 90) % 360);
          break;
        case '0':
          setImageScale(1);
          setImageRotation(0);
          notify.info('视图已重置', '图片缩放和旋转已恢复默认设置');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, notify]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 复制功能
  const handleCopy = async () => {
    if (!designCard) return;
    try {
      await navigator.clipboard.writeText(designCard.imageUrl);
      notify.success('链接已复制', '设计稿链接已复制到剪贴板');
    } catch (err) {
      console.error('Failed to copy: ', err);
      notify.error('复制失败', '无法复制链接到剪贴板');
    }
  };

  // 下载功能
  const handleDownload = async () => {
    if (!designCard) return;
    try {
      notify.info('开始下载', '正在准备下载文件...');
      const response = await fetch(designCard.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${designCard.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify.success('下载成功', '设计稿已保存到您的设备');
    } catch (err) {
      console.error('Failed to download: ', err);
      notify.error('下载失败', '无法下载设计稿，请稍后重试');
    }
  };

  // 分享功能
  const handleShare = async () => {
    if (!designCard) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: designCard.title,
          text: designCard.description,
          url: designCard.imageUrl,
        });
        notify.success('分享成功', '设计稿已成功分享');
      } else {
        // 回退到复制链接
        await handleCopy();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing: ', err);
        notify.error('分享失败', '无法分享设计稿');
      }
    }
  };

  // 喜欢功能
  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    
    if (newLiked) {
      notify.success('已添加到收藏', '您喜欢了这个设计稿');
    } else {
      notify.info('已取消收藏', '从收藏中移除了这个设计稿');
    }
  };

  if (!isOpen || !designCard) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative w-full h-full max-w-6xl max-h-full flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg rounded-t-2xl border border-white/20">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold text-lg line-clamp-1">
              {designCard.title}
            </h2>
            <div className="hidden md:flex items-center gap-2 text-sm text-white/70">
              <span>ESC 关闭</span>
              <span>•</span>
              <span>+/- 缩放</span>
              <span>•</span>
              <span>R 旋转</span>
              <span>•</span>
              <span>0 重置</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 缩放控制 */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setImageScale(prev => Math.max(prev - 0.2, 0.5))}
                className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
                title="缩小 (-)"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-white text-sm min-w-[3rem] text-center">
                {Math.round(imageScale * 100)}%
              </span>
              <button
                onClick={() => setImageScale(prev => Math.min(prev + 0.2, 3))}
                className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
                title="放大 (+)"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* 旋转按钮 */}
            <button
              onClick={() => setImageRotation(prev => (prev + 90) % 360)}
              className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
              title="旋转 (R)"
            >
              <RotateCw size={16} />
            </button>

            {/* 重置按钮 */}
            <button
              onClick={() => {
                setImageScale(1);
                setImageRotation(0);
                notify.info('视图已重置', '图片缩放和旋转已恢复默认设置');
              }}
              className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
              title="重置 (0)"
            >
              <Maximize2 size={16} />
            </button>

            {/* 功能按钮组 */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={handleLike}
                className={`p-2 rounded transition-all interactive ${
                  liked ? 'text-red-400 hover:bg-red-400/10' : 'text-white hover:bg-white/10'
                }`}
                title={liked ? '取消喜欢' : '添加到收藏'}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              </button>
              
              <button
                onClick={handleCopy}
                className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
                title="复制链接"
              >
                <Copy size={16} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
                title="分享"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
                title="下载"
              >
                <Download size={16} />
              </button>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/10 rounded transition-all interactive"
              title="关闭 (ESC)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 图片预览区域 */}
        <div className="flex-1 bg-white/5 backdrop-blur-lg rounded-b-2xl border-x border-b border-white/20 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={designCard.imageUrl}
              alt={designCard.title}
              className="max-w-full max-h-full object-contain transition-all duration-300 cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${imageScale}) rotate(${imageRotation}deg)`
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                notify.warning('图片加载失败', '使用了默认占位图片');
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* 底部信息栏 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                  {designCard.description}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/70 ml-4">
                <span>创建时间：{designCard.createdAt.toLocaleString()}</span>
                {liked && (
                  <div className="flex items-center gap-1">
                    <Heart size={12} className="text-red-400" fill="currentColor" />
                    <span>已收藏</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPreviewModal;