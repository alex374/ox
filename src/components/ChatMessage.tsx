import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Message } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';
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
            ref.current.innerHTML = '<p>Mermaid diagram rendering failed</p>';
          }
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = '<p>Mermaid diagram rendering failed</p>';
        }
      }
    }
  }, [chart]);

  return <div ref={ref} className="mermaid-diagram" />;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // 消息入场动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
          className="prose prose-sm max-w-none prose-headings:text-current prose-p:text-current prose-strong:text-current prose-code:text-current"
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div 
      ref={messageRef}
      className={`flex gap-4 p-6 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* 头像 */}
      <div className={`flex-shrink-0 relative group ${isUser ? 'ml-2' : 'mr-2'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 hover:shadow-blue-500/25' 
            : 'bg-gradient-to-br from-gray-500 to-gray-700 hover:shadow-gray-500/25'
        }`}>
          {isUser ? (
            <User size={20} className="text-white" />
          ) : (
            <Bot size={20} className="text-white" />
          )}
        </div>
        
        {/* 在线状态指示器 */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className={`flex-1 max-w-4xl ${isUser ? 'text-right' : 'text-left'}`}>
        {/* 消息气泡 */}
        <div className={`group relative inline-block transition-all duration-300 hover:scale-[1.01] ${
          isUser ? 'ml-12' : 'mr-12'
        }`}>
          <div className={`p-5 rounded-2xl relative overflow-hidden ${
            isUser 
              ? 'user-message-gradient text-white' 
              : 'chat-message-gradient bg-white text-gray-900 shadow-xl'
          }`}>
            {/* 复制按钮 */}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0"
                title="复制消息"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} className="text-gray-600" />
                )}
              </button>
            )}
            
            {/* 消息内容 */}
            <div className="whitespace-pre-wrap pr-8">
              {renderContent()}
            </div>
            
            {/* 消息装饰效果 */}
            {isUser && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0"></div>
            )}
          </div>
          
          {/* 气泡尾巴 */}
          <div className={`absolute top-6 w-0 h-0 ${
            isUser 
              ? 'right-[-8px] border-l-[16px] border-l-blue-500 border-t-[8px] border-b-[8px] border-t-transparent border-b-transparent'
              : 'left-[-8px] border-r-[16px] border-r-white border-t-[8px] border-b-[8px] border-t-transparent border-b-transparent shadow-xl'
          }`}></div>
        </div>
        
        {/* 设计卡片 */}
        {message.designCard && (
          <div className={`mt-6 transform transition-all duration-500 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${isUser ? 'mr-12' : 'ml-12'}`}>
            <div className="relative">
              {/* 连接线 */}
              <div className={`absolute top-0 w-8 h-px bg-gradient-to-r ${
                isUser 
                  ? 'right-0 from-blue-500 to-transparent' 
                  : 'left-0 from-gray-300 to-transparent'
              }`}></div>
              
              <div className="pt-4">
                <DesignCardComponent designCard={message.designCard} />
              </div>
            </div>
          </div>
        )}
        
        {/* 时间戳 */}
        <div className={`text-xs mt-3 transition-all duration-300 flex items-center gap-2 ${
          isUser 
            ? 'text-blue-200 justify-end mr-12' 
            : 'text-gray-500 justify-start ml-12'
        }`}>
          <div className="w-1 h-1 rounded-full bg-current opacity-50"></div>
          <span className="font-medium">
            {message.timestamp.toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isUser && (
            <>
              <div className="w-1 h-1 rounded-full bg-current opacity-50"></div>
              <span className="text-xs opacity-75">已发送</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;