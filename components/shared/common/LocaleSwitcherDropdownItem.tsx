'use client';

import { Globe, Check } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const LocaleSwitcherDropdownItem = () => {
  const router = useRouter();
  const pathname = usePathname();
  // Force the dropdown to stay open
  const [open, setOpen] = useState(true);
  const [currentLocale, setCurrentLocale] = useState(() => {
    const segments = pathname.split('/');
    return segments[1] === 'en' ? 'en' : 'vi';
  });

  const changeLocale = (locale: string) => {
    if (locale === currentLocale) {
      return; 
    }
    
    setCurrentLocale(locale);
    
    const pathWithoutLocale = pathname.startsWith('/en') || pathname.startsWith('/vi') 
      ? pathname.substring(3) 
      : pathname;
    
    const newPath = `/${locale}${pathWithoutLocale || ''}`;
    router.push(newPath);
  };

  const CustomMenuItem = ({ children, onClick, className }: { 
    children: React.ReactNode, 
    onClick: () => void, 
    className?: string 
  }) => {
    return (
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
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
        <Globe className="mr-2 h-4 w-4" />
        <span>Language</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-48">
        <CustomMenuItem 
          onClick={() => changeLocale('vi')} 
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <span>Tiếng Việt</span>
          </div>
          {currentLocale === 'vi' && <Check className="h-4 w-4" />}
        </CustomMenuItem>
        <CustomMenuItem 
          onClick={() => changeLocale('en')} 
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <span>English</span>
          </div>
          {currentLocale === 'en' && <Check className="h-4 w-4" />}
        </CustomMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
