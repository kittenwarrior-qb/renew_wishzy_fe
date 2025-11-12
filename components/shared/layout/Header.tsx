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
import { User, LogOut, Heart, BookOpen, UserCircle } from "lucide-react"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeSwitcher } from "../common/ThemeSwitcher"
import { LocaleSwitcher } from "../common/LocaleSwitcher"
import { useLogout, useAuthStatus } from "@/components/shared/auth/useAuth"
import { useTranslations } from "@/providers/TranslationProvider"
import { useAppStore } from "@/stores/useAppStore"
import CartPopover from "../cart/CartPopover"

const Header = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const { user, isAuthenticated } = useAuthStatus();
  const logoutMutation = useLogout();
  const { theme } = useAppStore();

  // Hide header on admin routes (supports both /admin and /[locale]/admin)
  if (pathname?.includes('/admin')) {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full bg-card text-card-foreground transition-colors border-b border-border">
      <div className="max-w-[1300px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src={theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"}
                alt="Wishzy logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </Link>

            <NavigationMenu>
              <NavigationMenuList className="space-x-6">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className="text-foreground hover:text-primary transition-colors cursor-pointer">
                      {t('navigation.home')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/courses" className="text-foreground hover:text-primary transition-colors cursor-pointer">
                      {t('navigation.courses')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors cursor-pointer">
                      {t('navigation.dashboard')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                 <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/students" className="text-foreground hover:text-primary transition-colors cursor-pointer">
                      {t('navigation.students')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            <LocaleSwitcher />
            <ThemeSwitcher />
            <CartPopover />

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium hidden md:block">
                  {user.fullName || user.email}
                </span>

                {/* Avatar Dropdown Menu */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full cursor-pointer">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={t('common.avatar')}
                          className="w-8 h-8 rounded-full object-cover border-2 border-border hover:border-primary transition-colors"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-border hover:border-primary transition-colors">
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
        </div>
      </div>
    </header>
  );
};

export default Header;  