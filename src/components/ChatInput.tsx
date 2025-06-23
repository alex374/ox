import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Paperclip, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整textarea高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // 最大高度
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      // 重置textarea高度
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // 建议的快速回复
  const quickSuggestions = [
    "设计一个登录页面",
    "创建移动端界面",
    "设计一个仪表板",
    "制作产品卡片"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-100 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-lg">
      {/* 快速建议 - 仅在空消息时显示 */}
      {!message && !isLoading && (
        <div className="px-6 py-3 border-b border-gray-100/50">
          <div className="flex items-center gap-2 mb-2">
            <Smile size={14} className="text-secondary" />
            <span className="text-xs font-medium text-secondary">快速开始</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs glass-effect rounded-full hover-lift interactive text-secondary hover:text-primary transition-all duration-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 主输入区域 */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className={`flex gap-3 transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
          <div className="flex-1 input-gradient-border">
            <div className="flex items-end gap-3 enhanced-input rounded-lg">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="描述您的设计需求，比如：'设计一个简洁的登录页面' 或 '创建一个电商产品卡片组件'"
                className="flex-1 resize-none border-0 px-4 py-3 bg-transparent focus:outline-none focus:ring-0 placeholder:text-secondary transition-all duration-300 min-h-[48px] max-h-[120px]"
                rows={1}
                disabled={disabled || isLoading}
                style={{ lineHeight: '1.5' }}
              />
              
              {/* 工具栏 */}
              <div className="flex items-center gap-2 px-2 pb-2">
                <button
                  type="button"
                  className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-gray-100 transition-all duration-300 interactive"
                  title="语音输入"
                  disabled={disabled || isLoading}
                >
                  <Mic size={16} />
                </button>
                <button
                  type="button"
                  className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-gray-100 transition-all duration-300 interactive"
                  title="附件"
                  disabled={disabled || isLoading}
                >
                  <Paperclip size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || disabled || isLoading}
            className={`px-6 py-3 btn-gradient text-white rounded-xl hover-lift focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-medium shadow-lg interactive transition-all duration-300 ${
              message.trim() && !disabled && !isLoading ? 'animate-pulse-soft' : ''
            }`}
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

        {/* 字符计数和状态 */}
        <div className="flex items-center justify-between mt-3 text-xs text-secondary">
          <div className="flex items-center gap-4">
            <span>{message.length} 字符</span>
            {message.length > 500 && (
              <span className="text-yellow-600 font-medium">
                建议保持简洁以获得更好的结果
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!disabled && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>就绪</span>
              </>
            )}
            {isLoading && (
              <>
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span>AI 正在思考...</span>
              </>
            )}
          </div>
        </div>

        {/* 键盘快捷键提示 */}
        <div className="mt-2 text-xs text-secondary opacity-60">
          <span>按 Enter 发送，Shift + Enter 换行</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;