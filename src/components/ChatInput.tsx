import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useKeyboardShortcuts, SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 键盘快捷键
  useKeyboardShortcuts({
    [SHORTCUTS.SEND_MESSAGE]: () => {
      if (message.trim() && !disabled && !isLoading) {
        handleSubmit(new Event('submit') as any);
      }
    },
    [SHORTCUTS.FOCUS_INPUT]: () => {
      textareaRef.current?.focus();
    },
  });

  // 自动调整文本域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="flex gap-3">
        <div className="flex-1 input-gradient-border">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="描述您的设计需求，比如：'设计一个简洁的登录页面' 或 '创建一个电商产品卡片组件'"
            className="w-full resize-none border-0 rounded-lg px-4 py-3 min-h-[3rem] max-h-32 focus:outline-none focus:ring-0 bg-white dark:bg-gray-800 dark:text-white shadow-inner transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible"
            disabled={disabled || isLoading}
            aria-label="输入消息"
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className="px-4 sm:px-6 py-3 btn-gradient text-white rounded-xl hover-lift focus-visible disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-medium shadow-lg transition-all duration-300"
          aria-label={isLoading ? '生成中' : '发送消息'}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
          <span className="hidden sm:inline">
            {isLoading ? '生成中...' : '发送'}
          </span>
        </button>
      </div>
      
      {/* 快捷键提示 */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> 发送 · 
        <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">/</kbd> 聚焦输入框 · 
        <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">?</kbd> 查看快捷键
      </div>
    </form>
  );
};

export default ChatInput;