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
    <div className={`flex gap-4 p-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg' 
          : 'bg-gradient-to-br from-gray-500 to-gray-700 shadow-lg'
      }`}>
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
          isUser 
            ? 'user-message-gradient text-white' 
            : 'chat-message-gradient bg-white text-gray-900 shadow-xl'
        }`}>
          <div className="whitespace-pre-wrap">
            {renderContent()}
          </div>
        </div>
        
        {message.designCard && (
          <div className="mt-4">
            <DesignCardComponent designCard={message.designCard} />
          </div>
        )}
        
        <div className={`text-xs mt-2 transition-opacity duration-300 ${
          isUser ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;