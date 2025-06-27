import React, { useEffect, useRef, useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Message } from '../types';
import { User, Bot, Copy, Check, RefreshCw } from 'lucide-react';
import DesignCardComponent from './DesignCard';

interface ChatMessageProps {
  message: Message;
  onRegenerateResponse?: () => void;
}

const MermaidDiagram: React.FC<{ chart: string }> = memo(({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        const elementId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        mermaid.render(elementId, chart).then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg;
          }
        }).catch((error) => {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = '<div class="text-red-500 text-sm p-4 border border-red-200 rounded-lg bg-red-50">Mermaid图表渲染失败</div>';
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = '<div class="text-red-500 text-sm p-4 border border-red-200 rounded-lg bg-red-50">Mermaid图表渲染失败</div>';
        }
      }
    }
  }, [chart]);

  return <div ref={ref} className="mermaid-diagram my-4" />;
});

MermaidDiagram.displayName = 'MermaidDiagram';

const ChatMessage: React.FC<ChatMessageProps> = memo(({ message, onRegenerateResponse }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const renderContent = () => {
    // 检测是否包含 mermaid 代码块
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    const parts = message.content.split(mermaidRegex);
    
    return parts.map((part, index) => {
      // 奇数索引是 mermaid 代码
      if (index % 2 === 1) {
        return <MermaidDiagram key={index} chart={part} />;
      }
      
      // 偶数索引是普通文本/markdown
      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          className={`prose prose-sm max-w-none ${
            isUser 
              ? 'prose-invert prose-a:text-blue-200 prose-code:text-blue-100' 
              : 'prose-gray prose-a:text-blue-600 prose-code:text-purple-600'
          }`}
          components={{
            code: ({ className, children, ...props }: any) => {
              const isInline = !className?.includes('language-');
              if (isInline) {
                return (
                  <code 
                    className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                      isUser 
                        ? 'bg-white/20 text-blue-100' 
                        : 'bg-gray-100 text-purple-600'
                    }`} 
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <pre className={`p-3 rounded-lg text-xs overflow-x-auto ${
                  isUser 
                    ? 'bg-white/10 text-gray-100' 
                    : 'bg-gray-50 text-gray-800'
                }`}>
                  <code className={className} {...props}>{children}</code>
                </pre>
              );
            }
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div 
      className={`flex gap-3 sm:gap-4 p-4 sm:p-6 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 头像 */}
      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg hover:shadow-xl hover:scale-110' 
          : 'bg-gradient-to-br from-gray-500 to-gray-700 shadow-lg hover:shadow-xl hover:scale-110'
      }`}>
        {isUser ? (
          <User size={window.innerWidth < 640 ? 14 : 18} className="text-white" />
        ) : (
          <Bot size={window.innerWidth < 640 ? 14 : 18} className="text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        {/* 消息气泡 */}
        <div className={`inline-block relative transition-all duration-300 ${
          isUser 
            ? 'user-message-gradient text-white rounded-2xl rounded-tr-sm p-4 shadow-lg hover:shadow-xl' 
            : 'chat-message-gradient bg-white text-gray-900 shadow-xl hover:shadow-2xl rounded-2xl rounded-tl-sm p-4'
        }`}>
          {/* 操作按钮 */}
          {isHovered && (
            <div className={`absolute ${isUser ? 'left-0' : 'right-0'} top-0 -translate-y-full mb-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200`}>
              <button
                onClick={handleCopy}
                className="p-1.5 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
                title="复制消息"
              >
                {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              </button>
              
              {!isUser && onRegenerateResponse && (
                <button
                  onClick={onRegenerateResponse}
                  className="p-1.5 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
                  title="重新生成"
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>
          )}

          <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
            {renderContent()}
          </div>
        </div>
        
        {/* 设计卡片 */}
        {message.designCard && (
          <div className="mt-4 max-w-md">
            <DesignCardComponent designCard={message.designCard} />
          </div>
        )}
        
        {/* 时间戳 */}
        <div className={`text-xs mt-2 transition-opacity duration-300 ${
          isUser ? 'text-gray-400' : 'text-gray-500'
        } ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
          {formatTime(message.timestamp)}
          {copied && (
            <span className="ml-2 text-green-500 font-medium">已复制</span>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;