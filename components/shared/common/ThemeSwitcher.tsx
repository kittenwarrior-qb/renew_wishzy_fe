'use client';

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useAppStore();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggle = () => {
    toggleTheme();
  };

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="text-gray-900 dark:text-white hover:text-orange-400 transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
