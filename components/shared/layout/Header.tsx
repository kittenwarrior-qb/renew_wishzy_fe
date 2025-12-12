'use client';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  LogOut, 
  Heart, 
  BookOpen, 
  UserCircle, 
  Menu, 
  Sun,
  Moon,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeSwitcherDropdownItem } from "../common/ThemeSwitcherDropdownItem"
import { useLogout, useAuthStatus } from "@/components/shared/auth/useAuth"
import { useAppStore } from "@/stores/useAppStore"
import CartPopover from "../cart/CartPopover"
import SearchHeader from "./header/SearchHeader"
import DiscoverDropdown from "./header/DiscoverDropdown"

const Header = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStatus();
  const logoutMutation = useLogout();
  const theme = useAppStore((state) => state.theme);
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const rafRef = React.useRef<number | undefined>(undefined);
  
  React.useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 0);
        
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
        setScrollProgress(scrolled);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (pathname?.includes('/admin') || pathname?.includes('/instructor')) {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-card text-card-foreground transition-all duration-200   ${isScrolled ? 'shadow-sm ' : 'border-b border-borderư'}`}>
      <div 
        className="absolute bottom-0 left-0 h-[3px] bg-primary w-full origin-left"
        style={{ 
          transform: `scaleX(${scrollProgress / 100})`,
          willChange: 'transform'
        }}
      />
      <div className="max-w-[1300px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-4 lg:gap-6 ${isSearchExpanded ? 'w-[calc(100%-80px)]' : ''}`}>
            {!isSearchExpanded && (
              <Link href="/" className="flex items-center shrink-0">
                {hasHydrated ? (
                  <img
                    src={theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"}
                    alt="Wishzy logo"
                    width={100}
                    height={90}
                    className="hidden sm:block object-contain"
                  />
                ) : (
                  <div className="hidden sm:block w-[100px] h-[90px]" />
                )}
                
                <img
                  src="/images/simple-logo.png"
                  alt="Wishzy logo"
                  width={16}
                  height={16}
                  className="sm:hidden object-contain"
                />
              </Link>
            )}
            
            {!isSearchExpanded && <DiscoverDropdown />}
            
            <div className="hidden md:block">
              <SearchHeader />
            </div>
            
            <div className={`${isSearchExpanded ? 'w-full' : ''} md:hidden transition-all duration-200`}>
              <SearchHeader onExpand={setIsSearchExpanded} isMobile={true} />
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/quiz"
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
              >
                Bài kiểm tra
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/about"
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
              >
                Về chúng tôi
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/#faq"
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
              >
                FAQ
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`hidden sm:flex items-center space-x-2 ${isSearchExpanded ? 'md:hidden' : ''}`}>
              <CartPopover />
            </div>
            
            <div className="hidden sm:block">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button className=" rounded-full cursor-pointer">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover transition-colors"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <span className="text-primary-foreground text-sm font-medium">
                              {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.fullName || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile?tab=wishlist" className="cursor-pointer flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Khoá học yêu thích</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile?tab=my-learning" className="cursor-pointer flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Khoá học của tôi</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile?tab=profile" className="cursor-pointer flex items-center">
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Hồ sơ</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <ThemeSwitcherDropdownItem />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="font-medium">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="font-medium bg-primary hover:bg-primary/90">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <SheetTitle className="text-lg font-medium">
                    Menu
                  </SheetTitle>
                </div>
                
                <div className="flex flex-col p-4 space-y-6">
                  <div className="flex flex-col space-y-4">
                    <Link 
                      href="/quiz" 
                      className="relative py-2 text-muted-foreground hover:text-foreground transition-colors group inline-block" 
                      onClick={() => setIsOpen(false)}
                    >
                      Bài kiểm tra
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link 
                      href="/about" 
                      className="relative py-2 text-muted-foreground hover:text-foreground transition-colors group inline-block" 
                      onClick={() => setIsOpen(false)}
                    >
                      Về chúng tôi
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link 
                      href="/#faq" 
                      className="relative py-2 text-muted-foreground hover:text-foreground transition-colors group inline-block" 
                      onClick={() => setIsOpen(false)}
                    >
                      FAQ
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link 
                      href="/contact" 
                      className="relative py-2 text-muted-foreground hover:text-foreground transition-colors group inline-block" 
                      onClick={() => setIsOpen(false)}
                    >
                      Liên hệ
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </div>
                  
                  <div className="border-t pt-4">
                    {isAuthenticated && user ? (
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-semibold">
                                {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{user.fullName || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        <Link href="/profile?tab=wishlist" className="flex items-center py-2 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Khoá học yêu thích</span>
                        </Link>
                        <Link href="/profile?tab=my-learning" className="flex items-center py-2 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Khoá học của tôi</span>
                        </Link>
                        <Link href="/profile?tab=profile" className="flex items-center py-2 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Hồ sơ</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          disabled={logoutMutation.isPending}
                          className="flex items-center py-2 text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        <Link href="/auth/login" className="w-full" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full font-medium">
                            Đăng nhập
                          </Button>
                        </Link>
                        <Link href="/auth/register" className="w-full" onClick={() => setIsOpen(false)}>
                          <Button className="w-full font-medium bg-primary hover:bg-primary/90">
                            Đăng ký
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 flex flex-col space-y-4">
                    <button 
                      onClick={() => {
                        const appStore = useAppStore.getState();
                        appStore.toggleTheme();
                      }}
                      className="flex items-center justify-between py-2 hover:text-primary transition-colors"
                    >
                      <span className="text-sm">Giao diện</span>
                      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Giỏ hàng</span>
                      <CartPopover />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
