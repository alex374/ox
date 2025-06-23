import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, isLoading }) => {
  const [message, setMessage] = useState('');

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

  return (
    <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50">
      <div className="flex gap-3">
        <div className="flex-1 input-gradient-border">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="描述您的设计需求，比如：'设计一个简洁的登录页面' 或 '创建一个电商产品卡片组件'"
            className="w-full resize-none border-0 rounded-lg px-4 py-3 focus:outline-none focus:ring-0 bg-white shadow-inner transition-all duration-300 placeholder:text-gray-400"
            rows={3}
            disabled={disabled || isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className="px-6 py-3 btn-gradient text-white rounded-xl hover-lift focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-medium shadow-lg"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
          {isLoading ? '生成中...' : '发送'}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;