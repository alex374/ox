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
  const maxLength = 2000;

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
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const isOverLimit = message.length > maxLength;
  const canSend = message.trim() && !disabled && !isLoading && !isOverLimit;

  return (
    <div className="border-t border-gray-100 bg-gradient-to-r from-white via-gray-50 to-white">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 主输入区域 */}
          <div className={`relative transition-all duration-300 ${
            isFocused ? 'transform scale-[1.01]' : ''
          }`}>
            <div className={`input-gradient-border transition-all duration-300 ${
              isFocused ? 'shadow-lg' : 'shadow-sm'
            }`}>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={
                    disabled 
                      ? "请先设置 API 密钥..." 
                      : "描述您的设计需求，比如：'设计一个简洁的登录页面' 或 '创建一个电商产品卡片组件'"
                  }
                  className={`w-full resize-none border-0 rounded-xl px-4 py-4 pr-16 focus:outline-none focus:ring-0 bg-white/90 backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 ${
                    disabled ? 'cursor-not-allowed' : ''
                  } ${isOverLimit ? 'text-red-500' : 'text-gray-900'}`}
                  rows={1}
                  disabled={disabled || isLoading}
                  maxLength={maxLength + 100} // 允许稍微超出以显示错误状态
                  style={{ 
                    minHeight: '56px',
                    maxHeight: '120px'
                  }}
                />
                
                {/* 快捷操作按钮 */}
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {/* 附件按钮 */}
                  <button
                    type="button"
                    disabled={disabled || isLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="附件"
                  >
                    <Paperclip size={16} />
                  </button>
                  
                  {/* 表情按钮 */}
                  <button
                    type="button"
                    disabled={disabled || isLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="表情"
                  >
                    <Smile size={16} />
                  </button>
                  
                  {/* 语音输入按钮 */}
                  <button
                    type="button"
                    disabled={disabled || isLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="语音输入"
                  >
                    <Mic size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* 字符计数器 */}
            <div className="absolute -bottom-6 right-0 flex items-center gap-2 text-xs">
              <span className={`transition-colors duration-300 ${
                isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'
              }`}>
                {message.length}/{maxLength}
              </span>
              {isOverLimit && (
                <span className="text-red-500 animate-pulse">超出限制</span>
              )}
            </div>
          </div>
          
          {/* 底部操作栏 */}
          <div className="flex items-center justify-between pt-2">
            {/* 左侧提示 */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <span>按 Enter 发送，Shift+Enter 换行</span>
            </div>
            
            {/* 右侧发送按钮 */}
            <div className="flex items-center gap-3">
              {/* 状态指示器 */}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span>AI 正在思考...</span>
                </div>
              )}
              
              {/* 发送按钮 */}
              <button
                type="submit"
                disabled={!canSend}
                className={`group relative px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 flex items-center gap-2 font-medium shadow-lg transition-all duration-300 ${
                  canSend 
                    ? 'btn-gradient text-white hover-lift transform hover:scale-105' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {/* 按钮背景动画 */}
                {canSend && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                <div className="relative flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>生成中</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} className={`transition-transform duration-300 ${
                        canSend ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''
                      }`} />
                      <span>发送</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>
        
        {/* 错误提示 */}
        {isOverLimit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-fade-in">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700 text-sm font-medium">
              消息长度超出限制，请精简内容后再发送
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;