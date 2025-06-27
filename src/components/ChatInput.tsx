import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Plus, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      
      // 重置文本框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const suggestions = [
    "设计一个现代化的登录页面",
    "创建一个电商产品卡片组件",
    "设计一个简洁的导航栏",
    "制作一个仪表板布局"
  ];

  return (
    <div className="relative">
      {/* 快速建议 - 仅在空输入时显示 */}
      {!message && !isLoading && (
        <div className="absolute bottom-full left-0 right-0 mb-4 px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setMessage(suggestion)}
                className="flex-shrink-0 px-4 py-2 text-sm bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <Sparkles size={14} className="inline mr-2" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100/20 bg-gradient-to-r from-white/10 to-gray-50/10 backdrop-blur-lg">
        <div className={`flex gap-3 transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
          {/* 附加功能按钮 */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="p-3 glass-effect text-gray-600 hover:text-purple-600 rounded-xl hover-lift transition-all duration-300 group"
              title="添加附件"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <button
              type="button"
              className="p-3 glass-effect text-gray-600 hover:text-red-500 rounded-xl hover-lift transition-all duration-300 group"
              title="语音输入"
            >
              <Mic size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
          
          {/* 输入框区域 */}
          <div className={`flex-1 input-gradient-border transition-all duration-300 ${
            isFocused ? 'shadow-lg shadow-purple-500/20' : ''
          }`}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="描述您的设计需求，比如：'设计一个简洁的登录页面' 或 '创建一个电商产品卡片组件'"
              className="w-full resize-none border-0 rounded-lg px-4 py-3 focus:outline-none focus:ring-0 bg-white/95 backdrop-blur-sm shadow-inner transition-all duration-300 placeholder:text-gray-400 text-gray-800 min-h-[48px] max-h-[120px]"
              disabled={disabled || isLoading}
              style={{ height: 'auto' }}
            />
            
            {/* 字符计数 */}
            {message.length > 100 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                {message.length}/1000
              </div>
            )}
          </div>
          
          {/* 发送按钮 */}
          <button
            type="submit"
            disabled={!message.trim() || disabled || isLoading}
            className={`px-6 py-3 btn-gradient text-white rounded-xl hover-lift focus:outline-none focus:ring-4 focus:ring-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-medium shadow-xl transition-all duration-300 ${
              message.trim() && !disabled && !isLoading 
                ? 'pulse-glow' 
                : ''
            }`}
          >
            <div className="relative">
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
              )}
            </div>
            <span className="hidden sm:inline">
              {isLoading ? '生成中...' : '发送'}
            </span>
          </button>
        </div>
        
        {/* 状态指示器 */}
        {isLoading && (
          <div className="mt-4 flex items-center gap-3 text-sm text-white/80">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <span>AI 正在为您思考最佳设计方案...</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput;