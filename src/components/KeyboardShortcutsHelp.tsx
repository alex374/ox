import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter', description: '发送消息' },
    { key: 'Ctrl + N', description: '新建对话' },
    { key: 'Ctrl + ,', description: '打开设置' },
    { key: 'Ctrl + Shift + T', description: '切换主题' },
    { key: '/', description: '聚焦输入框' },
    { key: 'Esc', description: '关闭弹窗' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-gradient w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Keyboard size={16} className="text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              键盘快捷键
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">{shortcut.description}</span>
              <kbd className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-mono rounded-md border border-gray-300 dark:border-gray-600">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            按 <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">?</kbd> 可随时查看快捷键
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;