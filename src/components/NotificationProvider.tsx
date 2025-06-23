import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // 自动移除通知
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
  style?: React.CSSProperties;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
  style
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'info':
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`${getBgColor()} border rounded-xl p-4 shadow-lg backdrop-blur-lg animate-slide-in-left hover-lift interactive`}
      style={style}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// 便捷钩子
export const useNotify = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'success', title, message, action }),
    error: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'error', title, message, action }),
    warning: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'warning', title, message, action }),
    info: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'info', title, message, action }),
  };
};