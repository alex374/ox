import React, { useState, useRef, useEffect } from 'react';
import { Message, DesignCard, ChatState } from '../types';
import { APIService } from '../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageCircle, Settings } from 'lucide-react';

interface ChatProps {
  onDesignCardCreated?: (designCard: DesignCard) => void;
}

const Chat: React.FC<ChatProps> = ({ onDesignCardCreated }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });
  
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiService = new APIService(apiKey);

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

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSettings(false);
  };

  if (chatState.messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <MessageCircle size={64} className="text-blue-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            AI 设计师助手
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            欢迎使用 AI 设计师助手！我可以帮您：
          </p>
          <div className="text-left text-sm text-gray-600 space-y-2 mb-8">
            <p>• 生成界面设计稿和原型</p>
            <p>• 提供 UI/UX 设计建议</p>
            <p>• 创建组件设计方案</p>
            <p>• 分析设计趋势和最佳实践</p>
          </div>
          
          {!apiKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm mb-2">
                请先设置 OpenRouter API 密钥
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                <Settings size={16} />
                设置 API 密钥
              </button>
            </div>
          )}
        </div>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={!apiKey}
          isLoading={chatState.isLoading}
        />
        
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">API 设置</h3>
              <form onSubmit={handleSettingsSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenRouter API 密钥
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入您的 OpenRouter API 密钥"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    您可以在 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500">OpenRouter</a> 获取 API 密钥
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">AI 设计师助手</h1>
          <p className="text-sm text-gray-600">
            {chatState.messages.length} 条消息
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <Settings size={20} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {chatState.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {chatState.isLoading && (
          <div className="flex gap-3 p-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-lg bg-gray-100">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">正在思考...</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {chatState.error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{chatState.error}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={!apiKey}
        isLoading={chatState.isLoading}
      />
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">API 设置</h3>
            <form onSubmit={handleSettingsSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenRouter API 密钥
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入您的 OpenRouter API 密钥"
                />
                <p className="text-xs text-gray-500 mt-1">
                  您可以在 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500">OpenRouter</a> 获取 API 密钥
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;