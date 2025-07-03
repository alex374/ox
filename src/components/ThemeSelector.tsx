import React, { useState } from 'react';
import { useTheme, Theme } from './ThemeProvider';
import { Palette, Check, Monitor, Sun, Moon, Droplets, Sunrise, TreePine } from 'lucide-react';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Sun size={16} />,
  dark: <Moon size={16} />,
  auto: <Monitor size={16} />,
  purple: <div className="w-4 h-4 rounded-full bg-purple-500" />,
  ocean: <Droplets size={16} />,
  sunset: <Sunrise size={16} />,
  forest: <TreePine size={16} />
};

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);

  if (!isOpen) return null;

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    // 添加一个短暂的反馈延迟
    setTimeout(() => {
      onClose();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 主题选择器容器 */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 max-w-md w-full mx-4 animate-modalSlideIn">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Palette size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">选择主题</h3>
            <p className="text-sm text-gray-500">个性化您的设计体验</p>
          </div>
        </div>

        {/* 主题预览网格 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {availableThemes.map((themeConfig) => {
            const themeKey = themeConfig.name as Theme;
            const isSelected = theme === themeKey;
            const isHovered = hoveredTheme === themeKey;
            
            return (
              <button
                key={themeKey}
                onClick={() => handleThemeSelect(themeKey)}
                onMouseEnter={() => setHoveredTheme(themeKey)}
                onMouseLeave={() => setHoveredTheme(null)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                {/* 主题预览卡片 */}
                <div className="space-y-3">
                  {/* 主题色彩预览 */}
                  <div className="h-16 rounded-lg overflow-hidden relative">
                    <div 
                      className="absolute inset-0"
                      style={{ background: themeConfig.colors.background }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 shadow-lg"
                        style={{ backgroundColor: themeConfig.colors.primary }}
                      >
                        {themeIcons[themeKey]}
                      </div>
                    </div>
                    
                    {/* 选中指示器 */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Check size={14} className="text-purple-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* 主题名称 */}
                  <div className="text-center">
                    <div className={`font-medium text-sm ${
                      isSelected ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {themeConfig.displayName}
                    </div>
                  </div>

                  {/* 悬浮时的额外预览 */}
                  {isHovered && !isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-300/50 flex items-center justify-center">
                      <div className="text-purple-600 text-xs font-medium">点击应用</div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 当前主题信息 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ 
                background: availableThemes.find(t => t.name === theme)?.colors.primary 
              }}
            >
              {themeIcons[theme]}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                当前主题: {availableThemes.find(t => t.name === theme)?.displayName}
              </div>
              <div className="text-xs text-gray-500">
                {theme === 'auto' ? '自动跟随系统设置' : '手动选择的主题'}
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            关闭
          </button>
          <button
            onClick={() => handleThemeSelect('auto')}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
          >
            跟随系统
          </button>
        </div>

        {/* 装饰性元素 */}
        <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-lg" />
      </div>
    </div>
  );
};

export default ThemeSelector;