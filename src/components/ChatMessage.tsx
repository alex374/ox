import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';
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
          className="prose prose-sm max-w-none"
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500' : 'bg-gray-500'
      }`}>
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap">
            {renderContent()}
          </div>
        </div>
        
        {message.designCard && (
          <div className="mt-3">
            <DesignCardComponent designCard={message.designCard} />
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;