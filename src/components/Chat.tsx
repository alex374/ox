import React, { useState, useRef, useEffect } from 'react';
import { Message, DesignCard, ChatState } from '../types';
import { APIService } from '../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageCircle, Settings, Sparkles, Zap, Star, Palette, Lightbulb } from 'lucide-react';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // 从localStorage加载API密钥
  useEffect(() => {
    const savedOpenrouterKey = localStorage.getItem('openrouter_api_key');
    const savedOpenaiKey = localStorage.getItem('openai_api_key');
    if (savedOpenrouterKey) setOpenrouterApiKey(savedOpenrouterKey);
    if (savedOpenaiKey) setOpenaiApiKey(savedOpenaiKey);
  }, []);

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
    // 保存到localStorage
    localStorage.setItem('openrouter_api_key', openrouterApiKey);
    localStorage.setItem('openai_api_key', openaiApiKey);
    setShowSettings(false);
  };

  const handleRegenerateResponse = () => {
    if (chatState.messages.length >= 2) {
      const lastUserMessage = chatState.messages[chatState.messages.length - 2];
      if (lastUserMessage.role === 'user') {
        // 移除最后一条AI回复
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.slice(0, -1)
        }));
        // 重新发送最后一条用户消息
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  if (chatState.messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
          {/* 主图标区域 */}
          <div className="relative mb-8 animate-enter">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl hover-lift">
              <Sparkles size={window.innerWidth < 640 ? 32 : 40} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          {/* 标题和描述 */}
          <div className="mb-8 animate-enter" style={{animationDelay: '0.1s'}}>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              AI 设计师助手
            </h2>
            <p className="text-gray-600 mb-2 max-w-md text-sm sm:text-lg leading-relaxed">
              欢迎使用智能设计助手！
            </p>
            <p className="text-gray-500 text-xs sm:text-sm max-w-lg">
              我可以帮您创建精美的界面设计、提供专业建议，让设计更简单高效
            </p>
          </div>
          
          {/* 功能卡片 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left text-sm mb-8 max-w-2xl animate-enter" style={{animationDelay: '0.2s'}}>
            <div className="glass-effect p-3 sm:p-4 rounded-xl hover-lift group">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                  <Palette size={16} className="text-white" />
                </div>
                <div className="font-semibold text-blue-600 text-xs sm:text-sm">界面设计</div>
              </div>
              <p className="text-xs text-gray-600">生成精美的界面设计稿和原型</p>
            </div>
            
            <div className="glass-effect p-3 sm:p-4 rounded-xl hover-lift group">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb size={16} className="text-white" />
                </div>
                <div className="font-semibold text-purple-600 text-xs sm:text-sm">设计建议</div>
              </div>
              <p className="text-xs text-gray-600">提供专业的 UI/UX 设计建议</p>
            </div>
            
            <div className="glass-effect p-3 sm:p-4 rounded-xl hover-lift group">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                  <Star size={16} className="text-white" />
                </div>
                <div className="font-semibold text-pink-600 text-xs sm:text-sm">组件设计</div>
              </div>
              <p className="text-xs text-gray-600">创建可复用的组件设计方案</p>
            </div>
            
            <div className="glass-effect p-3 sm:p-4 rounded-xl hover-lift group">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={16} className="text-white" />
                </div>
                <div className="font-semibold text-indigo-600 text-xs sm:text-sm">趋势分析</div>
              </div>
              <p className="text-xs text-gray-600">分析设计趋势和最佳实践</p>
            </div>
          </div>
          
          {/* API密钥提示 */}
          {!openrouterApiKey && (
            <div className="glass-effect border-2 border-yellow-200 rounded-2xl p-4 sm:p-6 mb-6 max-w-md animate-enter" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                  <Settings size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-700 text-sm font-medium">需要设置 API 密钥</p>
                  <p className="text-gray-500 text-xs">开始您的设计之旅</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg"
              >
                <Settings size={16} />
                <span>设置 API 密钥</span>
              </button>
            </div>
          )}

          {/* 开始提示 */}
          {openrouterApiKey && (
            <div className="text-center animate-enter" style={{animationDelay: '0.4s'}}>
              <p className="text-gray-500 text-sm mb-3">✨ 一切就绪！在下方描述您的设计需求开始创作</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AI 助手已就绪</span>
              </div>
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
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <Settings size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    API 设置
                  </h3>
                  <p className="text-sm text-gray-500">配置您的 API 密钥以开始使用</p>
                </div>
              </div>
              
              <form onSubmit={handleSettingsSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    OpenRouter API 密钥 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="input-gradient-border">
                    <input
                      type="password"
                      value={openrouterApiKey}
                      onChange={(e) => setOpenrouterApiKey(e.target.value)}
                      className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner text-sm"
                      placeholder="输入您的 OpenRouter API 密钥"
                      required
                    />
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">💡 获取方式：</p>
                    <p className="text-xs text-blue-600">
                      访问 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">OpenRouter</a> 注册账户并获取 API 密钥
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    OpenAI API 密钥 
                    <span className="text-gray-400 text-xs ml-1">(可选)</span>
                  </label>
                  <div className="input-gradient-border">
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner text-sm"
                      placeholder="输入您的 OpenAI API 密钥"
                    />
                  </div>
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 font-medium mb-1">🎨 用于图片生成：</p>
                    <p className="text-xs text-green-600">
                      访问 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-800">OpenAI Platform</a> 获取密钥以启用 DALL-E 图片生成
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!openrouterApiKey.trim()}
                    className="flex-1 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            AI 设计师助手
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span>{chatState.messages.length} 条消息</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              已连接
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-300 hover-lift"
          title="设置"
        >
          <Settings size={18} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {chatState.messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onRegenerateResponse={message.role === 'assistant' ? handleRegenerateResponse : undefined}
          />
        ))}
        
        {chatState.isLoading && (
          <div className="flex gap-3 sm:gap-4 p-4 sm:p-6">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-lg">
              <MessageCircle size={window.innerWidth < 640 ? 14 : 18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-4 rounded-2xl chat-message-gradient bg-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <span className="text-gray-600 text-sm">AI 正在思考中...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {chatState.error && (
          <div className="p-4 sm:p-6">
            <div className="glass-effect border-2 border-red-200 rounded-2xl p-4 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <div>
                  <p className="text-red-700 text-sm font-medium">出现错误</p>
                  <p className="text-red-600 text-xs mt-1">{chatState.error}</p>
                </div>
              </div>
              <button
                onClick={() => setChatState(prev => ({ ...prev, error: null }))}
                className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
              >
                关闭错误提示
              </button>
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
      
      {/* Settings Modal - Same as above */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-gradient w-full max-w-md">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Settings size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  API 设置
                </h3>
                <p className="text-sm text-gray-500">配置您的 API 密钥以开始使用</p>
              </div>
            </div>
            
            <form onSubmit={handleSettingsSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  OpenRouter API 密钥 
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="input-gradient-border">
                  <input
                    type="password"
                    value={openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner text-sm"
                    placeholder="输入您的 OpenRouter API 密钥"
                    required
                  />
                </div>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">💡 获取方式：</p>
                  <p className="text-xs text-blue-600">
                    访问 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">OpenRouter</a> 注册账户并获取 API 密钥
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  OpenAI API 密钥 
                  <span className="text-gray-400 text-xs ml-1">(可选)</span>
                </label>
                <div className="input-gradient-border">
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 bg-white shadow-inner text-sm"
                    placeholder="输入您的 OpenAI API 密钥"
                  />
                </div>
                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 font-medium mb-1">🎨 用于图片生成：</p>
                  <p className="text-xs text-green-600">
                    访问 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-800">OpenAI Platform</a> 获取密钥以启用 DALL-E 图片生成
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!openrouterApiKey.trim()}
                  className="flex-1 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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