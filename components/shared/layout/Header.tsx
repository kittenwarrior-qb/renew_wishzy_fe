'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ThemeSwitcher } from "../common/ThemeSwitcher"
import { LocaleSwitcher } from "../common/LocaleSwitcher"
import { useLogout, useAuthStatus } from "@/components/shared/auth/useAuth"
import { useTranslations } from "@/providers/TranslationProvider"
import { useAppStore } from "@/stores/useAppStore"
import CartPopover from "../cart/CartPopover"

const Header = () => {
  const t = useTranslations();
  const { user, isAuthenticated } = useAuthStatus();
  const logoutMutation = useLogout();
  const { theme } = useAppStore();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full bg-card text-card-foreground transition-colors border-b border-border">
      <div className="container mx-auto px-4 py-3">
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
                    <Link href="/" className="text-foreground transition-colors cursor-pointer">
                      {t('navigation.home')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/courses" className="text-foreground transition-colors cursor-pointer">
                      {t('navigation.courses')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/dashboard" className="text-foreground transition-colors cursor-pointer">
                      {t('navigation.dashboard')}
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

                {/* Avatar or Initial */}
                <div className="flex items-center space-x-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={t('common.avatar')}
                      className="w-8 h-8 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-border">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    title={t('auth.logout')}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" className="text-foreground" title={t('auth.login')}>
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