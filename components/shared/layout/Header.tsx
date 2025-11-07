'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import Link from "next/link"
import { ThemeSwitcher } from "../common/ThemeSwitcher"
import { LocaleSwitcher } from "../common/LocaleSwitcher"
import { useAppStore } from "@/stores/useAppStore"
import { useLogout } from "@/hooks/useAuth"

const Header = () => {
  const { user, isAuthenticated } = useAppStore();
  const logoutMutation = useLogout();
  
  // Debug logging
  console.log('Header - User object:', user);
  console.log('Header - User email:', user?.email);
  console.log('Header - User fullName:', user?.fullName);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full bg-card text-card-foreground transition-colors border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-semibold">MarshallMS</span>
          </div>

          {/* Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="space-x-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className="text-foreground transition-colors cursor-pointer">
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/courses" className="text-foreground transition-colors cursor-pointer">
                    Courses
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/dashboard" className="text-foreground transition-colors cursor-pointer">
                    Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            <LocaleSwitcher />
            <ThemeSwitcher />
            
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium hidden md:block">
                  {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                </span>
                
                {/* Avatar or Initial */}
                <div className="flex items-center space-x-2">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-border">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {(() => {
                          const initial = user.email?.charAt(0).toUpperCase() || user.fullName?.charAt(0).toUpperCase() || 'U';
                          console.log('Header - Displaying initial:', initial);
                          return initial;
                        })()}
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-foreground"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    title="Đăng xuất"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" className="text-foreground">
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