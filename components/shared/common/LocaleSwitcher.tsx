'use client';

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState(() => {
    const segments = pathname.split('/');
    return segments[1] === 'en' ? 'en' : 'vi';
  });

  const toggleLocale = () => {
    const newLocale = currentLocale === 'vi' ? 'en' : 'vi';
    setCurrentLocale(newLocale);
    
    const pathWithoutLocale = pathname.startsWith('/en') || pathname.startsWith('/vi') 
      ? pathname.substring(3) 
      : pathname;
    
    const newPath = `/${newLocale}${pathWithoutLocale || ''}`;
    router.push(newPath);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className="text-gray-900 dark:text-white hover:text-orange-400 transition-colors"
      aria-label={`Switch to ${currentLocale === 'vi' ? 'English' : 'Vietnamese'}`}
    >
      <Globe className="h-5 w-5" />
      <span className="ml-1 text-xs font-medium">
        {currentLocale.toUpperCase()}
      </span>
    </Button>
  );
};
