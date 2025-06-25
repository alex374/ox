import React, { useState, useRef, useEffect } from 'react';
import { Message, DesignCard, ChatState } from '../types';
import { APIService } from '../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageCircle, Sparkles } from 'lucide-react';

interface ChatProps {
  onDesignCardCreated?: (designCard: DesignCard) => void;
}

const Chat: React.FC<ChatProps> = ({ onDesignCardCreated }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 创建API服务实例，从环境变量读取密钥
  const apiService = new APIService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      const response = await apiService.sendMessage(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        designCard: response.designCard
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));

      // 如果生成了设计稿，通知父组件
      if (response.designCard) {
        onDesignCardCreated?.(response.designCard);
      }
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  if (chatState.messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <Sparkles size={40} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            AI 设计师助手
          </h2>
          <p className="text-gray-600 mb-8 max-w-md text-lg">
            欢迎使用 AI 设计师助手！我可以帮您：
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-left text-sm text-gray-600 mb-8 max-w-lg">
            <div className="glass-effect p-4 rounded-xl hover-lift">
              <div className="font-semibold text-blue-600 mb-2">🎨 界面设计</div>
              <p>生成精美的界面设计稿和原型</p>
            </div>
            <div className="glass-effect p-4 rounded-xl hover-lift">
              <div className="font-semibold text-purple-600 mb-2">💡 设计建议</div>
              <p>提供专业的 UI/UX 设计建议</p>
            </div>
            <div className="glass-effect p-4 rounded-xl hover-lift">
              <div className="font-semibold text-pink-600 mb-2">🧩 组件设计</div>
              <p>创建可复用的组件设计方案</p>
            </div>
            <div className="glass-effect p-4 rounded-xl hover-lift">
              <div className="font-semibold text-indigo-600 mb-2">📊 趋势分析</div>
              <p>分析设计趋势和最佳实践</p>
            </div>
          </div>
        </div>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={false}
          isLoading={chatState.isLoading}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            AI 设计师助手
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {chatState.messages.length} 条消息
          </p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {chatState.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {chatState.isLoading && (
          <div className="flex gap-4 p-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-lg">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-4 rounded-2xl chat-message-gradient bg-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-gray-600">正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {chatState.error && (
          <div className="p-6">
            <div className="glass-effect border-2 border-red-200 rounded-2xl p-4">
              <p className="text-red-700 text-sm font-medium">{chatState.error}</p>
              <p className="text-red-600 text-xs mt-2">请确保在 .env 文件中正确配置了 API 密钥</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={false}
        isLoading={chatState.isLoading}
      />
    </div>
  );
};

export default Chat;