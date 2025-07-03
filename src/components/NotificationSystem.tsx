import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, X, AlertTriangle, Info, Zap, Heart, Download, Share2 } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  progress?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const getNotificationIcon = (type: NotificationType, customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  
  switch (type) {
    case 'success':
      return <Check size={20} className="text-green-600" />;
    case 'error':
      return <X size={20} className="text-red-600" />;
    case 'warning':
      return <AlertTriangle size={20} className="text-yellow-600" />;
    case 'info':
      return <Info size={20} className="text-blue-600" />;
    case 'loading':
      return <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />;
    default:
      return <Zap size={20} className="text-purple-600" />;
  }
};

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-800',
        accent: 'bg-green-500'
      };
    case 'error':
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        accent: 'bg-red-500'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-800',
        accent: 'bg-yellow-500'
      };
    case 'info':
      return {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        accent: 'bg-blue-500'
      };
    case 'loading':
      return {
        bg: 'bg-purple-50 border-purple-200',
        text: 'text-purple-800',
        accent: 'bg-purple-500'
      };
    default:
      return {
        bg: 'bg-gray-50 border-gray-200',
        text: 'text-gray-800',
        accent: 'bg-gray-500'
      };
  }
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Notification>) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove, onUpdate }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(notification.duration || 0);
  const styles = getNotificationStyles(notification.type);

  useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);

      // 倒计时更新
      const countdownTimer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 100));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownTimer);
      };
    }
  }, [notification.duration, notification.persistent]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const progressPercentage = notification.duration 
    ? ((notification.duration - timeLeft) / notification.duration) * 100 
    : notification.progress || 0;

  return (
    <div className={`transform transition-all duration-300 ${
      isExiting 
        ? 'translate-x-full opacity-0 scale-95' 
        : 'translate-x-0 opacity-100 scale-100'
    }`}>
      <div className={`relative mb-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${styles.bg}`}>
        {/* 进度条 */}
        {(notification.duration || notification.progress !== undefined) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${styles.accent}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type, notification.icon)}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className={`font-semibold ${styles.text}`}>
              {notification.title}
            </div>
            {notification.message && (
              <div className={`text-sm mt-1 ${styles.text} opacity-80`}>
                {notification.message}
              </div>
            )}

            {/* 操作按钮 */}
            {notification.action && (
              <button
                onClick={() => {
                  notification.action!.onClick();
                  if (!notification.persistent) {
                    handleRemove();
                  }
                }}
                className={`mt-2 text-sm font-medium hover:underline ${styles.text}`}
              >
                {notification.action.label}
              </button>
            )}
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleRemove}
            className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors duration-200 ${styles.text}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    updateNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* 通知容器 */}
      <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onUpdate={updateNotification}
          />
        ))}

        {/* 清除所有按钮 */}
        {notifications.length > 1 && (
          <div className="mt-2 text-center">
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              清除所有通知
            </button>
          </div>
        )}
      </div>
    </NotificationContext.Provider>
  );
};

// 便捷的通知钩子
export const useToast = () => {
  const { addNotification } = useNotification();

  return {
    success: (title: string, message?: string, action?: Notification['action']) => 
      addNotification({ type: 'success', title, message, action }),
    
    error: (title: string, message?: string, action?: Notification['action']) => 
      addNotification({ type: 'error', title, message, action, duration: 8000 }),
    
    warning: (title: string, message?: string, action?: Notification['action']) => 
      addNotification({ type: 'warning', title, message, action }),
    
    info: (title: string, message?: string, action?: Notification['action']) => 
      addNotification({ type: 'info', title, message, action }),
    
    loading: (title: string, message?: string) => 
      addNotification({ type: 'loading', title, message, persistent: true }),

    custom: (notification: Omit<Notification, 'id'>) => 
      addNotification(notification),

    // 特殊用途的通知
    designGenerated: (designName: string) => 
      addNotification({
        type: 'success',
        title: '设计稿生成成功',
        message: `"${designName}" 已添加到画廊`,
        icon: <Heart size={20} className="text-pink-600" />,
        action: {
          label: '查看详情',
          onClick: () => console.log('查看设计稿详情')
        }
      }),

    downloadProgress: (progress: number, fileName: string) => 
      addNotification({
        type: 'loading',
        title: '正在下载',
        message: `${fileName} (${progress}%)`,
        progress,
        persistent: true,
        icon: <Download size={20} className="text-blue-600" />
      }),

    shareSuccess: () => 
      addNotification({
        type: 'success',
        title: '分享成功',
        message: '链接已复制到剪贴板',
        icon: <Share2 size={20} className="text-green-600" />
      })
  };
};