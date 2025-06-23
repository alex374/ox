import React, { useState, useRef, useEffect } from 'react';
import { Message, DesignCard, ChatState } from '../types';
import { APIService } from '../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageCircle, Settings, Sparkles, Zap, Lightbulb, Layers, TrendingUp } from 'lucide-react';
import { useNotify } from './NotificationProvider';

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
  const notify = useNotify();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // 从本地存储加载API密钥
  useEffect(() => {
    const savedOpenRouterKey = localStorage.getItem('openrouter-api-key');
    const savedOpenAIKey = localStorage.getItem('openai-api-key');
    if (savedOpenRouterKey) {
      setOpenrouterApiKey(savedOpenRouterKey);
      notify.info('API 密钥已加载', 'OpenRouter API 密钥已从本地存储加载');
    }
    if (savedOpenAIKey) {
      setOpenaiApiKey(savedOpenAIKey);
    }
  }, [notify]);

  const handleSendMessage = async (content: string) => {
    if (!openrouterApiKey) {
      notify.warning('需要设置 API 密钥', '请先配置 OpenRouter API 密钥才能开始聊天');
      setShowSettings(true);
      return;
    }

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
        notify.success('设计稿已生成', '新的设计稿已添加到画廊中');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      // 提供具体的错误通知
      if (errorMessage.includes('API')) {
        notify.error('API 调用失败', '请检查您的 API 密钥是否正确', {
          label: '检查设置',
          onClick: () => setShowSettings(true)
        });
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        notify.error('网络连接失败', '请检查您的网络连接并重试');
      } else {
        notify.error('发送消息失败', errorMessage);
      }
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openrouterApiKey.trim()) {
      notify.warning('缺少必需的 API 密钥', 'OpenRouter API 密钥是必需的');
      return;
    }
    
    // 保存API密钥到本地存储
    localStorage.setItem('openrouter-api-key', openrouterApiKey);
    localStorage.setItem('openai-api-key', openaiApiKey);
    
    setShowSettings(false);
    
    if (openaiApiKey) {
      notify.success('设置已保存', 'API 密钥已保存，现在可以使用所有功能了');
    } else {
      notify.success('设置已保存', 'OpenRouter API 密钥已保存，聊天功能已激活');
    }
  };

  const clearMessages = () => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: null
    }));
    notify.info('聊天记录已清空', '所有消息已被删除');
  };

  // 加载状态骨架屏
  const LoadingSkeleton = () => (
    <div className="flex gap-4 p-6 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full skeleton animate-shimmer"></div>
      <div className="flex-1 space-y-3">
        <div className="h-4 skeleton animate-shimmer rounded w-3/4"></div>
        <div className="h-4 skeleton animate-shimmer rounded w-1/2"></div>
        <div className="h-4 skeleton animate-shimmer rounded w-5/6"></div>
      </div>
    </div>
  );

  // 功能卡片数据
  const featureCards = [
    {
      icon: <Sparkles className="text-blue-600" />,
      title: '界面设计',
      description: '生成精美的界面设计稿和原型',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: <Lightbulb className="text-purple-600" />,
      title: '设计建议',
      description: '提供专业的 UI/UX 设计建议',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: <Layers className="text-pink-600" />,
      title: '组件设计',
      description: '创建可复用的组件设计方案',
      gradient: 'from-pink-500 to-red-600'
    },
    {
      icon: <TrendingUp className="text-indigo-600" />,
      title: '趋势分析',
      description: '分析设计趋势和最佳实践',
      gradient: 'from-indigo-500 to-blue-600'
    }
  ];

  if (chatState.messages.length === 0) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-8 animate-slide-in-up">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse-soft">
              <Sparkles size={48} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Zap size={16} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-primary mb-4 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            AI 设计师助手
          </h2>
          <p className="text-secondary mb-8 max-w-md text-lg leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            欢迎使用 AI 设计师助手！我可以帮您创造出色的设计作品
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm max-w-2xl mb-8">
            {featureCards.map((card, index) => (
              <div 
                key={index}
                className="glass-effect p-6 rounded-xl hover-lift interactive animate-slide-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <div className="font-semibold text-primary">{card.title}</div>
                </div>
                <p className="text-secondary leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
          
          {!openrouterApiKey && (
            <div className="glass-effect border-2 border-yellow-200 rounded-2xl p-6 mb-6 max-w-md animate-slide-in-up" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Settings size={16} className="text-white" />
                </div>
                <p className="text-primary text-sm font-medium">
                  请先设置 API 密钥以开始使用
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg interactive"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="modal-gradient w-full max-w-md animate-slide-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Settings size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary">
                    API 设置
                  </h3>
                </div>
                {chatState.messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="text-sm px-3 py-1 glass-effect rounded-full text-secondary hover:text-primary transition-colors"
                    title="清空聊天记录"
                  >
                    清空记录
                  </button>
                )}
              </div>
              <form onSubmit={handleSettingsSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    OpenRouter API 密钥 (必需)
                  </label>
                  <div className="input-gradient-border">
                    <input
                      type="password"
                      value={openrouterApiKey}
                      onChange={(e) => setOpenrouterApiKey(e.target.value)}
                      className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 enhanced-input shadow-inner"
                      placeholder="输入您的 OpenRouter API 密钥"
                      required
                    />
                  </div>
                  <p className="text-xs text-secondary mt-2">
                    用于聊天功能，您可以在 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenRouter</a> 获取
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    OpenAI API 密钥 (可选)
                  </label>
                  <div className="input-gradient-border">
                    <input
                      type="password"
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 enhanced-input shadow-inner"
                      placeholder="输入您的 OpenAI API 密钥"
                    />
                  </div>
                  <p className="text-xs text-secondary mt-2">
                    用于 DALL-E 图片生成，您可以在 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenAI Platform</a> 获取
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg interactive"
                  >
                    保存设置
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-6 py-3 glass-effect text-primary rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium interactive"
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
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-lg flex items-center justify-between">
        <div className="animate-slide-in-left">
          <h1 className="text-xl font-bold text-primary">
            AI 设计师助手
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-secondary">
              {chatState.messages.length} 条消息
            </p>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {chatState.messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 text-secondary hover:text-primary rounded-xl glass-effect transition-all duration-300 hover-lift interactive text-sm"
              title="清空聊天记录"
            >
              清空
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 text-secondary hover:text-primary rounded-xl glass-effect transition-all duration-300 hover-lift interactive"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 backdrop-blur-sm">
        {chatState.messages.map((message, index) => (
          <div 
            key={message.id}
            className="animate-slide-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ChatMessage message={message} />
          </div>
        ))}
        
        {chatState.isLoading && <LoadingSkeleton />}
        
        {chatState.error && (
          <div className="p-6 animate-fade-in">
            <div className="glass-effect border-2 border-red-200 rounded-2xl p-4 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium">{chatState.error}</p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-red-600 hover:text-red-800 text-xs underline mt-1"
                  >
                    检查设置
                  </button>
                </div>
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="modal-gradient w-full max-w-md animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Settings size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary">
                  API 设置
                </h3>
              </div>
              {chatState.messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="text-sm px-3 py-1 glass-effect rounded-full text-secondary hover:text-primary transition-colors"
                  title="清空聊天记录"
                >
                  清空记录
                </button>
              )}
            </div>
            <form onSubmit={handleSettingsSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  OpenRouter API 密钥 (必需)
                </label>
                <div className="input-gradient-border">
                  <input
                    type="password"
                    value={openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 enhanced-input shadow-inner"
                    placeholder="输入您的 OpenRouter API 密钥"
                    required
                  />
                </div>
                <p className="text-xs text-secondary mt-2">
                  用于聊天功能，您可以在 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenRouter</a> 获取
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  OpenAI API 密钥 (可选)
                </label>
                <div className="input-gradient-border">
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 enhanced-input shadow-inner"
                    placeholder="输入您的 OpenAI API 密钥"
                  />
                </div>
                <p className="text-xs text-secondary mt-2">
                  用于 DALL-E 图片生成，您可以在 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-medium">OpenAI Platform</a> 获取
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg interactive"
                >
                  保存设置
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-3 glass-effect text-primary rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium interactive"
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