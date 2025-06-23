import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="max-w-2xl w-full text-center">
            <div className="modern-card p-8 animate-slide-in-up">
              {/* 错误图标 */}
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-2xl mx-auto animate-pulse-soft">
                  <AlertTriangle size={48} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Bug size={16} className="text-white" />
                </div>
              </div>

              {/* 错误标题 */}
              <h1 className="text-3xl font-bold text-primary mb-4">
                哎呀，出了点问题
              </h1>
              
              <p className="text-secondary text-lg mb-8 leading-relaxed">
                应用遇到了一个意外错误，但别担心，我们正在努力修复它。
                <br />
                您可以尝试刷新页面或重置应用状态。
              </p>

              {/* 错误详情（开发模式） */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-8 text-left">
                  <details className="glass-effect p-4 rounded-xl">
                    <summary className="cursor-pointer text-sm font-medium text-secondary mb-2">
                      错误详情 (开发模式)
                    </summary>
                    <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono overflow-auto max-h-40">
                      <div className="text-red-600 font-bold mb-2">
                        {this.state.error.name}: {this.state.error.message}
                      </div>
                      <pre className="text-gray-700 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </details>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleRefresh}
                  className="flex items-center justify-center gap-2 px-6 py-3 btn-gradient text-white rounded-xl hover-lift font-medium shadow-lg interactive"
                >
                  <RefreshCw size={20} />
                  刷新页面
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 glass-effect text-primary rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium interactive"
                >
                  <Home size={20} />
                  重置应用
                </button>
              </div>

              {/* 帮助信息 */}
              <div className="mt-8 p-4 glass-effect rounded-xl">
                <div className="flex items-start gap-3 text-sm text-secondary">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <div>
                    <p className="font-medium mb-1">需要帮助？</p>
                    <p>
                      如果问题持续存在，请尝试清除浏览器缓存或使用无痕模式。
                      您也可以检查浏览器控制台以获取更多信息。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;