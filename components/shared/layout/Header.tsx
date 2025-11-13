'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
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
  User, 
  LogOut, 
  Heart, 
  BookOpen, 
  UserCircle, 
  Menu, 
  X,
  Sun,
  Moon,
  Globe
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeSwitcherDropdownItem } from "../common/ThemeSwitcherDropdownItem"
import { LocaleSwitcherDropdownItem } from "../common/LocaleSwitcherDropdownItem"
import { useLogout, useAuthStatus } from "@/components/shared/auth/useAuth"
import { useTranslations } from "@/providers/TranslationProvider"
import { useAppStore } from "@/stores/useAppStore"
import CartPopover from "../cart/CartPopover"
import SearchHeader from "./header/SearchHeader"
import CourseHeader from "./header/CourseHeader"

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const { user, isAuthenticated } = useAuthStatus();
  const logoutMutation = useLogout();
  const { theme } = useAppStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);

  if (pathname?.includes('/admin') || pathname?.includes('/instructor')) {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card text-card-foreground transition-colors border-b border-border shadow-sm backdrop-blur-sm bg-opacity-90">
      <div className="max-w-[1300px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-4 lg:gap-6 ${isSearchExpanded ? 'w-[calc(100%-80px)]' : ''}`}>
            {!isSearchExpanded && (
              <Link href="/" className="flex items-center shrink-0">
                <img
                  src={theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"}
                  alt="Wishzy logo"
                  width={80}
                  height={80}
                  className="hidden sm:block object-contain"
                />
                
                <img
                  src="/images/simple-logo.png"
                  alt="Wishzy logo"
                  width={16}
                  height={16}
                  className="sm:hidden object-contain"
                />
              </Link>
            )}
            
            <div className="hidden md:block">
              <SearchHeader />
            </div>
            
            <div className={`${isSearchExpanded ? 'w-full' : ''} md:hidden transition-all duration-200`}>
              <SearchHeader onExpand={setIsSearchExpanded} isMobile={true} />
            </div>

            <NavigationMenu className={`hidden ${isSearchExpanded ? 'md:hidden' : 'md:block'}`}>
              <NavigationMenuList className="">
                <CourseHeader />
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors cursor-pointer">
                      Bài kiểm tra
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
                            alt={t('common.avatar')}
                            className="w-8 h-8 rounded-full object-cover transition-colors"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <span className="text-primary-foreground text-sm font-semibold">
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
                      <LocaleSwitcherDropdownItem />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('auth.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent hover:text-accent-foreground" title={t('auth.login')}>
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
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
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex flex-col p-4 space-y-6">
                  <div className="flex flex-col space-y-4">
                    <div className="py-2">
                      <div className="flex items-center justify-between hover:text-primary transition-colors">
                        <Link href="/courses" className="flex-1" onClick={() => setIsOpen(false)}>
                          Khóa học
                        </Link>
                      </div>
                    </div>
                    <Link href="/dashboard" className="flex items-center py-2 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                      Bài kiểm tra
                    </Link>
                  </div>
                  
                  <div className="border-t pt-4">
                    {isAuthenticated && user ? (
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={t('common.avatar')}
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
                          <span>{t('auth.logout')}</span>
                        </button>
                      </div>
                    ) : (
                      <Link href="/auth/login" className="flex items-center py-2 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('auth.login')}</span>
                      </Link>
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
                      <span className="text-sm">{t('settings.theme')}</span>
                      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => {
                        const pathname = usePathname();
                        const segments = pathname.split('/');
                        const currentLocale = segments[1] === 'en' ? 'en' : 'vi';
                        const newLocale = currentLocale === 'vi' ? 'en' : 'vi';
                        const newPath = '/' + newLocale + pathname.substring(3);
                        router.push(newPath);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between py-2 hover:text-primary transition-colors"
                    >
                      <span className="text-sm">{t('settings.language')}</span>
                      <Globe className="h-5 w-5" />
                    </button>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('settings.cart')}</span>
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