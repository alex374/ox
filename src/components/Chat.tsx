import React, { useState, useRef, useEffect } from 'react';
import { Message, DesignCard, ChatState } from '../types';
import { APIService } from '../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useKeyboardShortcuts, SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { useResponsive } from '../hooks/useResponsive';
import { MessageCircle, Settings, Sparkles, RotateCcw } from 'lucide-react';

interface ChatProps {
  onDesignCardCreated?: (designCard: DesignCard) => void;
}

const Chat: React.FC<ChatProps> = ({ onDesignCardCreated }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });
  
  const [openrouterApiKey, setOpenrouterApiKey] = useState<string>('');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();

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
      const apiService = new APIService(openrouterApiKey, openaiApiKey);
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

  const handleNewChat = () => {
    setChatState({
      messages: [],
      isLoading: false,
      error: null
    });
  };

  // 键盘快捷键
  useKeyboardShortcuts({
    [SHORTCUTS.NEW_CHAT]: handleNewChat,
    [SHORTCUTS.SETTINGS]: () => setShowSettings(true),
    [SHORTCUTS.ESCAPE]: () => setShowSettings(false),
  });

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
          
          {!openrouterApiKey && (
            <div className="glass-effect border-2 border-yellow-200 dark:border-yellow-500/30 rounded-2xl p-6 mb-6 max-w-md animate-slide-up">
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 font-medium">
                🔑 请先设置 API 密钥以开始使用
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg focus-visible"
                aria-label="设置 API 密钥"
              >
                <Settings size={16} />
                设置 API 密钥
              </button>
            </div>
          )}
        </div>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={!openrouterApiKey}
          isLoading={chatState.isLoading}
        />
        
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modal-gradient w-full max-w-md">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                🔧 API 设置
              </h3>
              <form onSubmit={handleSettingsSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    OpenRouter API 密钥 (必需)
                  </label>
                  <div className="input-gradient-border">
                    <input
                      type="password"
                      value={openrouterApiKey}
                      onChange={(e) => setOpenrouterApiKey(e.target.value)}
                      className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner"
                      placeholder="输入您的 OpenRouter API 密钥"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    用于聊天功能，您可以在 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenRouter</a> 获取
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    OpenAI API 密钥 (可选)
                  </label>
                  <div className="input-gradient-border">
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner"
                      placeholder="输入您的 OpenAI API 密钥"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    用于 DALL-E 图片生成，您可以在 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenAI Platform</a> 获取
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg"
                  >
                    保存设置
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
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
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-between transition-colors duration-300">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
            AI 设计师助手
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {chatState.messages.length} 条消息
          </p>
        </div>
        <div className="flex gap-2">
          {chatState.messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="p-2 sm:p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover-lift focus-visible"
              aria-label="新建对话"
            >
              <RotateCcw size={isMobile ? 16 : 20} />
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 sm:p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover-lift focus-visible"
            aria-label="设置"
          >
            <Settings size={isMobile ? 16 : 20} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {chatState.messages.map((message, index) => (
          <div key={message.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <ChatMessage message={message} />
          </div>
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
          <div className="p-4 sm:p-6 animate-slide-up">
            <div className="glass-effect border-2 border-red-200 dark:border-red-500/30 rounded-2xl p-4">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{chatState.error}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={!openrouterApiKey}
        isLoading={chatState.isLoading}
      />
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-gradient w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              🔧 API 设置
            </h3>
            <form onSubmit={handleSettingsSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  OpenRouter API 密钥 (必需)
                </label>
                <div className="input-gradient-border">
                  <input
                    type="password"
                    value={openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner"
                    placeholder="输入您的 OpenRouter API 密钥"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  用于聊天功能，您可以在 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenRouter</a> 获取
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  OpenAI API 密钥 (可选)
                </label>
                <div className="input-gradient-border">
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner"
                    placeholder="输入您的 OpenAI API 密钥"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  用于 DALL-E 图片生成，您可以在 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenAI Platform</a> 获取
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg"
                >
                  保存设置
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
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