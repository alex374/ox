import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Message } from '../types';
import { User, Bot, Copy, Check, MessageSquare } from 'lucide-react';
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

  return <div ref={ref} className="mermaid-diagram my-4" />;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

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
          className="prose prose-sm max-w-none text-inherit"
          components={{
            h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-inherit">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-inherit">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-inherit">{children}</h3>,
            p: ({ children }) => <p className="mb-2 last:mb-0 text-inherit leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc ml-4 mb-2 text-inherit">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 text-inherit">{children}</ol>,
            li: ({ children }) => <li className="mb-1 text-inherit">{children}</li>,
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono text-inherit">
                  {children}
                </code>
              ) : (
                <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2">
                  <code className="text-xs font-mono text-gray-800">{children}</code>
                </pre>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-300 pl-4 italic my-2 text-inherit">
                {children}
              </blockquote>
            ),
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div className={`flex gap-4 p-6 group transition-all duration-300 hover:bg-gray-50/30 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 头像 */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg status-indicator ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
          : 'bg-gradient-to-br from-gray-500 to-gray-700'
      }`}>
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        {/* 发送者信息 */}
        <div className={`flex items-center gap-2 mb-2 text-xs text-secondary ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="font-medium">
            {isUser ? '您' : 'AI 助手'}
          </span>
          <span>•</span>
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {!isUser && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>在线</span>
              </div>
            </>
          )}
        </div>

        {/* 消息内容 */}
        <div className={`relative group/message ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className={`message-bubble transition-all duration-300 hover:scale-[1.02] relative ${
            isUser 
              ? 'user-message-gradient text-white max-w-lg' 
              : 'chat-message-gradient text-primary shadow-xl max-w-2xl'
          } p-4 rounded-2xl`}>
            {/* 消息内容 */}
            <div className="whitespace-pre-wrap break-words">
              {renderContent()}
            </div>

            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-300 opacity-0 group-hover/message:opacity-100 hover:scale-110 ${
                isUser 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="复制消息"
            >
              {copied ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>

            {/* 消息气泡尾巴 */}
            <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${
              isUser 
                ? '-left-1.5 bg-gradient-to-br from-blue-500 to-purple-600' 
                : '-right-1.5 bg-white border border-gray-200'
            }`}></div>
          </div>
        </div>
        
        {/* 设计卡片 */}
        {message.designCard && (
          <div className={`mt-4 animate-slide-in-up ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className="max-w-md">
              <DesignCardComponent designCard={message.designCard} />
            </div>
          </div>
        )}

        {/* 消息操作 */}
        <div className={`flex items-center gap-2 mt-2 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <button className="px-2 py-1 glass-effect rounded-full hover-lift interactive text-secondary hover:text-primary">
            <MessageSquare size={12} />
            <span className="ml-1">回复</span>
          </button>
          {!isUser && (
            <button className="px-2 py-1 glass-effect rounded-full hover-lift interactive text-secondary hover:text-primary">
              👍 有用
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;