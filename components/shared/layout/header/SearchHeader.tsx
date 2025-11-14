'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SearchHeaderDropdown } from './SearchHeaderDropdown';
import { useRouter } from 'next/navigation';

interface SearchHeaderProps {
  onExpand?: (expanded: boolean) => void;
  isMobile?: boolean;
}

const SearchHeader = ({ onExpand, isMobile = false }: SearchHeaderProps) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Get current locale from URL path
      const pathSegments = window.location.pathname.split('/');
      const locale = pathSegments[1] === 'vi' || pathSegments[1] === 'en' ? pathSegments[1] : 'vi';
      
      // Navigate to search page with query
      router.push(`/${locale}/search?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  const toggleExpanded = () => {
    if (isMobile) {
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);
      if (onExpand) onExpand(newExpandedState);
      
      if (newExpandedState && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        if (onExpand) onExpand(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, onExpand, isMobile]);

  useEffect(() => {
    setShowDropdown(query.length >= 2);
  }, [query]);

  if (isMobile && !isExpanded) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleExpanded}
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div 
      ref={searchRef} 
      className={`relative ${isMobile ? 'w-[calc(100%-40px)]' : 'w-[350px]'} transition-all duration-200`}
    >
      <form onSubmit={handleSearch} className="w-full relative">
        <div className="relative flex items-center w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="block w-full py-2 pl-10 pr-12 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary border-0 placeholder:text-gray-500 dark:placeholder:text-gray-300"
            placeholder="Tìm kiếm khóa học, giảng viên"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
          />
          {query && (
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center bg-transparent border-0 cursor-pointer outline-none"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
        
        {isMobile && isExpanded && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -right-10 top-0 h-9 w-9 ml-2"
            onClick={toggleExpanded}
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        <SearchHeaderDropdown 
          query={query} 
          isOpen={showDropdown} 
          onClose={() => setShowDropdown(false)} 
        />
      </form>
    </div>
  );
};

export default SearchHeader;