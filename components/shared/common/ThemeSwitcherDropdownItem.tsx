'use client';

import { Moon, Sun, ChevronRight, Check } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect, useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const ThemeSwitcherDropdownItem = () => {
  const { theme, toggleTheme } = useAppStore();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  const CustomMenuItem = ({ children, onClick, className }: { 
    children: React.ReactNode, 
    onClick: (e: React.MouseEvent) => void, 
    className?: string 
  }) => {
    return (
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(e);
        }}
        className={cn(
          "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )}
      >
        {children}
      </div>
    );
  };

  return (
    <DropdownMenuSub open={open} onOpenChange={setOpen}>
      <DropdownMenuSubTrigger className="cursor-pointer">
        {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-48">
        <CustomMenuItem 
          onClick={() => theme === 'dark' && toggleTheme()} 
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </div>
          {theme === 'light' && <Check className="h-4 w-4" />}
        </CustomMenuItem>
        <CustomMenuItem 
          onClick={() => theme === 'light' && toggleTheme()} 
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </div>
          {theme === 'dark' && <Check className="h-4 w-4" />}
        </CustomMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
