import { useEffect, useRef } from 'react';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const shortcutsRef = useRef(shortcuts);
  
  // 更新引用以获取最新的回调函数
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      
      // 构建快捷键字符串
      const keyCombo = [
        ctrlKey && 'ctrl',
        metaKey && 'cmd',
        shiftKey && 'shift', 
        altKey && 'alt',
        key.toLowerCase()
      ].filter(Boolean).join('+');

      // 检查是否有匹配的快捷键
      if (shortcutsRef.current[keyCombo]) {
        event.preventDefault();
        shortcutsRef.current[keyCombo]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

// 预定义的快捷键常量
export const SHORTCUTS = {
  SEND_MESSAGE: 'ctrl+enter',
  NEW_CHAT: 'ctrl+n', 
  SETTINGS: 'ctrl+,',
  TOGGLE_THEME: 'ctrl+shift+t',
  FOCUS_INPUT: '/',
  ESCAPE: 'escape'
} as const;