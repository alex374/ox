import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, DesignCard, ChatState } from '../types';
import { APIService } from '../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageCircle, Settings, Sparkles, History, Trash2, Download, RefreshCw, Archive } from 'lucide-react';

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
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 从本地存储恢复状态
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouterApiKey');
    const savedOpenaiKey = localStorage.getItem('openaiApiKey');
    const savedMessages = localStorage.getItem('chatMessages');
    const savedHistory = localStorage.getItem('messageHistory');
    
    if (savedApiKey) setOpenrouterApiKey(savedApiKey);
    if (savedOpenaiKey) setOpenaiApiKey(savedOpenaiKey);
    if (savedHistory) setMessageHistory(JSON.parse(savedHistory));
    
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setChatState(prev => ({ ...prev, messages }));
      } catch (error) {
        console.error('Failed to restore messages:', error);
      }
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (openrouterApiKey) {
      localStorage.setItem('openrouterApiKey', openrouterApiKey);
    }
  }, [openrouterApiKey]);

  useEffect(() => {
    if (openaiApiKey) {
      localStorage.setItem('openaiApiKey', openaiApiKey);
    }
  }, [openaiApiKey]);

  useEffect(() => {
    if (chatState.messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(chatState.messages));
    }
  }, [chatState.messages]);

  useEffect(() => {
    if (messageHistory.length > 0) {
      localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
    }
  }, [messageHistory]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: 焦点到输入框
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // 触发输入框焦点事件
        const event = new CustomEvent('focusInput');
        window.dispatchEvent(event);
      }
      
      // Ctrl/Cmd + /: 显示快捷键帮助
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // 可以添加快捷键帮助模态框
      }
      
      // Escape: 取消当前操作
      if (e.key === 'Escape') {
        if (chatState.isLoading && abortControllerRef.current) {
          abortControllerRef.current.abort();
          setChatState(prev => ({ ...prev, isLoading: false }));
        }
        setShowSettings(false);
        setShowHistory(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatState.isLoading]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (content: string) => {
    // 添加到历史记录
    setMessageHistory(prev => {
      const newHistory = [content, ...prev.filter(h => h !== content)].slice(0, 50);
      return newHistory;
    });
    
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
      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();
      
      const apiService = new APIService(openrouterApiKey, openaiApiKey);
      const response = await apiService.sendMessage(content, abortControllerRef.current.signal);
      
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
      if (error instanceof Error && error.name === 'AbortError') {
        setChatState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [openrouterApiKey, openaiApiKey, onDesignCardCreated]);

  const handleSettingsSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowSettings(false);
  }, []);

  const handleClearChat = useCallback(() => {
    if (window.confirm('确定要清空聊天记录吗？此操作不可恢复。')) {
      setChatState({ messages: [], isLoading: false, error: null });
      localStorage.removeItem('chatMessages');
    }
  }, []);

  const handleExportChat = useCallback(() => {
    const chatData = {
      messages: chatState.messages,
      exportTime: new Date().toISOString(),
      messageCount: chatState.messages.length
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chatState.messages]);

  const handleRetryLastMessage = useCallback(() => {
    const lastUserMessage = chatState.messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  }, [chatState.messages, handleSendMessage]);

  const handleArchiveConversation = useCallback(() => {
    const archiveData = {
      messages: chatState.messages,
      archivedAt: new Date().toISOString(),
      id: `archive-${Date.now()}`
    };
    
    const existingArchives = JSON.parse(localStorage.getItem('archivedChats') || '[]');
    existingArchives.push(archiveData);
    localStorage.setItem('archivedChats', JSON.stringify(existingArchives));
    
    setChatState({ messages: [], isLoading: false, error: null });
  }, [chatState.messages]);

  const messageCount = chatState.messages.length;
  const hasMessages = messageCount > 0;

  // 计算统计信息
  const stats = useMemo(() => {
    const userMessages = chatState.messages.filter(m => m.role === 'user').length;
    const aiMessages = chatState.messages.filter(m => m.role === 'assistant').length;
    const designCards = chatState.messages.filter(m => m.designCard).length;
    
    return { userMessages, aiMessages, designCards };
  }, [chatState.messages]);

  if (!hasMessages) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          {/* 主图标和装饰 */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-bounceIn">
              <Sparkles size={48} className="text-white" />
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/4 -left-4 w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <h2 className="text-3xl font-bold gradient-text mb-4">
            AI 设计师助手
          </h2>
          <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
            欢迎使用 AI 设计师助手！我可以帮您创造出色的设计作品
          </p>
          
          {/* 功能特性网格 */}
          <div className="grid grid-cols-2 gap-4 text-left text-sm text-gray-600 mb-8 max-w-lg">
            <div className="glass-effect p-4 rounded-xl hover-lift-subtle cursor-pointer group">
              <div className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                🎨 
                <span className="group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">界面设计</span>
              </div>
              <p>生成精美的界面设计稿和原型</p>
            </div>
            <div className="glass-effect p-4 rounded-xl hover-lift-subtle cursor-pointer group">
              <div className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                💡 
                <span className="group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">设计建议</span>
              </div>
              <p>提供专业的 UI/UX 设计建议</p>
            </div>
            <div className="glass-effect p-4 rounded-xl hover-lift-subtle cursor-pointer group">
              <div className="font-semibold text-pink-600 mb-2 flex items-center gap-2">
                🧩 
                <span className="group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-red-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">组件设计</span>
              </div>
              <p>创建可复用的组件设计方案</p>
            </div>
            <div className="glass-effect p-4 rounded-xl hover-lift-subtle cursor-pointer group">
              <div className="font-semibold text-indigo-600 mb-2 flex items-center gap-2">
                📊 
                <span className="group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">趋势分析</span>
              </div>
              <p>分析设计趋势和最佳实践</p>
            </div>
          </div>
          
          {/* API 密钥提醒 */}
          {!openrouterApiKey && (
            <div className="glass-effect border-2 border-yellow-200/50 rounded-2xl p-6 mb-6 max-w-md backdrop-blur-lg animate-fadeInUp">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🔑</span>
                </div>
                <p className="text-gray-700 text-sm font-medium">
                  请先设置 API 密钥以开始使用
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg"
              >
                <Settings size={16} />
                设置 API 密钥
              </button>
            </div>
          )}
          
          {/* 快速开始提示 */}
          {openrouterApiKey && (
            <div className="glass-effect rounded-2xl p-4 max-w-md animate-fadeInUp">
              <p className="text-sm text-gray-600 mb-3">💡 快速开始，试试这些示例：</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "设计一个登录页面",
                  "创建按钮组件",
                  "设计仪表板"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(example)}
                    className="text-xs px-3 py-1.5 bg-white/50 text-purple-600 rounded-full hover:bg-white/70 transition-colors duration-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 快捷键提示 */}
          <div className="mt-6 text-xs text-gray-400 space-y-1">
            <p>💡 提示：</p>
            <p>Ctrl+K 快速聚焦输入框</p>
            <p>Esc 取消当前操作</p>
          </div>
        </div>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={!openrouterApiKey}
          isLoading={chatState.isLoading}
          messageHistory={messageHistory}
          historyIndex={historyIndex}
          onHistoryIndexChange={setHistoryIndex}
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
      <div className="p-6 border-b border-gray-100/20 bg-gradient-to-r from-white/10 to-gray-50/10 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              AI 设计师助手
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500">
                {stats.userMessages} 条提问 · {stats.aiMessages} 条回复
              </p>
              {stats.designCards > 0 && (
                <span className="text-sm text-purple-600 font-medium">
                  · {stats.designCards} 个设计稿
                </span>
              )}
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* 工具栏 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 hover-lift-subtle"
              title="消息历史"
            >
              <History size={18} />
            </button>
            <button
              onClick={handleRetryLastMessage}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 hover-lift-subtle"
              title="重试最后一条消息"
              disabled={chatState.isLoading}
            >
              <RefreshCw size={18} className={chatState.isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExportChat}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 hover-lift-subtle"
              title="导出聊天记录"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 hover-lift-subtle"
              title="设置"
            >
              <Settings size={18} />
            </button>
            
            {/* 更多选项菜单 */}
            <div className="relative group">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="19" cy="12" r="1"/>
                  <circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
              
              {/* 下拉菜单 */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={handleArchiveConversation}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Archive size={14} />
                  归档对话
                </button>
                <button
                  onClick={handleClearChat}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  清空对话
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 进度指示器 */}
        {chatState.isLoading && (
          <div className="mt-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <span>AI 正在思考中...</span>
              <button
                onClick={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                取消
              </button>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full animate-pulse w-1/3"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50 backdrop-blur-sm">
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
            <div className="glass-effect border-2 border-red-200 rounded-2xl p-4 bg-red-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">出现错误</p>
              </div>
              <p className="text-red-600 text-sm">{chatState.error}</p>
              <button
                onClick={handleRetryLastMessage}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <RefreshCw size={14} />
                重试
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
        messageHistory={messageHistory}
        historyIndex={historyIndex}
        onHistoryIndexChange={setHistoryIndex}
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
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-gradient w-full max-w-md max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              📝 消息历史
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messageHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无历史记录</p>
              ) : (
                messageHistory.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSendMessage(msg);
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    {msg}
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;