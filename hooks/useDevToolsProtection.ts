'use client';

import { useEffect, useCallback } from 'react';

interface DevToolsProtectionOptions {
  onDevToolsOpen?: () => void;
  redirectUrl?: string;
  showWarning?: boolean;
}

export function useDevToolsProtection(options: DevToolsProtectionOptions = {}) {
  const { 
    onDevToolsOpen, 
    redirectUrl,
    showWarning = true 
  } = options;

  const handleDevToolsOpen = useCallback(() => {
    if (onDevToolsOpen) {
      onDevToolsOpen();
    } else if (redirectUrl) {
      window.location.href = redirectUrl;
    } else if (showWarning) {
      // Pause video if playing
      const video = document.querySelector('video');
      if (video && !video.paused) {
        video.pause();
      }
    }
  }, [onDevToolsOpen, redirectUrl, showWarning]);

  useEffect(() => {
    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        handleDevToolsOpen();
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        handleDevToolsOpen();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        handleDevToolsOpen();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleDevToolsOpen();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect DevTools via debugger timing
    let devToolsOpen = false;
    const detectDevTools = () => {
      const threshold = 160;
      const start = performance.now();
      
      // debugger statement takes longer when DevTools is open
      // eslint-disable-next-line no-debugger
      debugger;
      
      const end = performance.now();
      
      if (end - start > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          handleDevToolsOpen();
        }
      } else {
        devToolsOpen = false;
      }
    };

    // Detect via window size difference (less reliable but doesn't pause execution)
    const detectBySize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          handleDevToolsOpen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Check periodically for DevTools (using size method to avoid debugger pauses)
    const interval = setInterval(detectBySize, 1000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(interval);
    };
  }, [handleDevToolsOpen]);
}
