import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Keyboard, Zap } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, isLoading }) => {
  const [message, setMessage] = useState('');
  const [showTips, setShowTips] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整输入框高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

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

  const insertSuggestion = (suggestion: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + suggestion);
    textareaRef.current?.focus();
  };

  const suggestions = [
    '设计一个简洁的登录页面',
    '创建一个电商产品卡片组件',
    '设计一个现代化的导航栏',
    '制作一个数据可视化面板',
    '设计一个移动端应用界面'
  ];

  const quickActions = [
    { icon: '🎨', text: '界面设计', suggestion: '帮我设计一个' },
    { icon: '💡', text: '设计建议', suggestion: '请给我一些设计建议关于' },
    { icon: '🧩', text: '组件设计', suggestion: '创建一个组件用于' },
    { icon: '📱', text: '移动端', suggestion: '设计一个移动端' }
  ];

  const charCount = message.length;
  const maxChars = 1000;
  const isNearLimit = charCount > maxChars * 0.8;

  return (
    <div className="border-t border-gray-100 bg-gradient-to-r from-white to-gray-50">
      {/* 快捷操作按钮 */}
      {message.length === 0 && (
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex flex-wrap gap-2">
            <div className="text-xs text-gray-500 w-full mb-2 flex items-center gap-2">
              <Zap size={12} />
              快速开始：
            </div>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => insertSuggestion(action.suggestion)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-gray-800 hover:border-gray-300 transition-all duration-200 hover-lift"
                disabled={disabled || isLoading}
              >
                <span>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="input-gradient-border">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowTips(true)}
                onBlur={() => setTimeout(() => setShowTips(false), 200)}
                placeholder="描述您的设计需求，比如：'设计一个简洁的登录页面' 或 '创建一个电商产品卡片组件'"
                className="w-full resize-none border-0 rounded-lg px-4 py-3 focus:outline-none focus:ring-0 bg-white shadow-inner transition-all duration-300 placeholder:text-gray-400 min-h-[48px] max-h-[120px]"
                disabled={disabled || isLoading}
                maxLength={maxChars}
                aria-label="输入设计需求"
              />
            </div>
            
            {/* 字符计数 */}
            <div className={`absolute bottom-2 right-2 text-xs transition-colors duration-200 ${
              isNearLimit ? 'text-orange-500' : 'text-gray-400'
            }`}>
              {charCount}/{maxChars}
            </div>

            {/* 快捷键提示 */}
            {showTips && (
              <div className="absolute -top-12 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 opacity-90 z-10">
                <Keyboard size={12} />
                <span>Enter 发送 • Shift+Enter 换行</span>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || disabled || isLoading || charCount > maxChars}
            className="px-6 py-3 btn-gradient text-white rounded-xl hover-lift focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 font-medium shadow-lg min-w-[120px] sm:min-w-[140px] transition-all duration-300"
            aria-label="发送消息"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="hidden sm:inline">生成中...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span className="hidden sm:inline">发送</span>
              </>
            )}
          </button>
        </div>

        {/* 建议词汇 */}
        {message.length === 0 && (
          <div className="mt-4 sm:mt-3">
            <div className="text-xs text-gray-500 mb-2">💡 试试这些想法：</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(suggestion)}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-200 hover-lift border border-blue-200"
                  disabled={disabled || isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput;