import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Message } from '../types';
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import DesignCardComponent from './DesignCard';

interface ChatMessageProps {
  message: Message;
}

const MermaidDiagram: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        const elementId = 'mermaid-' + Date.now();
        mermaid.render(elementId, chart).then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg;
          }
        }).catch((error) => {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = '<p class="text-red-500 text-sm">图表渲染失败</p>';
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = '<p class="text-red-500 text-sm">图表渲染失败</p>';
        }
      }
    }
  }, [chart]);

  return <div ref={ref} className="mermaid-diagram my-4" />;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 进入动画
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
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
          className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-purple-600 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded"
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div className={`message-enter transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className={`flex gap-4 p-6 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 头像 */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
            : 'bg-gradient-to-br from-gray-600 to-gray-800'
        }`}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-white" />
          )}
          
          {/* 在线状态指示器 */}
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            isUser ? 'bg-green-400' : 'bg-blue-400'
          }`}></div>
        </div>
        
        {/* 消息内容 */}
        <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] relative group/message ${
            isUser 
              ? 'user-message-gradient text-white' 
              : 'chat-message-gradient bg-white text-gray-900 shadow-xl'
          }`}>
            {/* 消息内容 */}
            <div className="whitespace-pre-wrap">
              {renderContent()}
            </div>
            
            {/* 操作按钮 - 仅非用户消息显示 */}
            {!isUser && (
              <div className="absolute top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 flex gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors duration-200 shadow-sm"
                  title="复制消息"
                >
                  {copied ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} className="text-gray-600" />
                  )}
                </button>
                <button
                  className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors duration-200 shadow-sm"
                  title="点赞"
                >
                  <ThumbsUp size={14} className="text-gray-600 hover:text-green-600" />
                </button>
                <button
                  className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors duration-200 shadow-sm"
                  title="点踩"
                >
                  <ThumbsDown size={14} className="text-gray-600 hover:text-red-600" />
                </button>
              </div>
            )}
          </div>
          
          {/* 设计卡片 */}
          {message.designCard && (
            <div className={`mt-4 transition-all duration-300 delay-200 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <DesignCardComponent designCard={message.designCard} />
            </div>
          )}
          
          {/* 时间戳 */}
          <div className={`text-xs mt-2 transition-all duration-300 flex items-center gap-2 ${
            isUser ? 'justify-end text-white/70' : 'justify-start text-gray-500'
          }`}>
            <span>{message.timestamp.toLocaleTimeString()}</span>
            {isUser && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">已送达</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;