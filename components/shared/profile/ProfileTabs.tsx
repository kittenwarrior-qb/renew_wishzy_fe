'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BookOpen, Heart, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MyLearningTab } from './MyLearningTab';
import { WishlistTab } from './WishlistTab';
import { ProfileTabContent } from './ProfileTabContent';

const tabs = [
  { id: 'my-learning', label: 'Khóa học của tôi', icon: BookOpen },
  { id: 'wishlist', label: 'Khóa học yêu thích', icon: Heart },
  { id: 'profile', label: 'Hồ sơ', icon: UserCircle },
];

export const ProfileTabs = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = searchParams.get('tab') || 'my-learning';

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {currentTab === 'my-learning' && 'Khóa học của tôi'}
            {currentTab === 'wishlist' && 'Khóa học yêu thích'}
            {currentTab === 'profile' && 'Hồ sơ của tôi'}
          </h1>

          {/* Tabs Navigation */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {currentTab === 'my-learning' && <MyLearningTab />}
          {currentTab === 'wishlist' && <WishlistTab />}
          {currentTab === 'profile' && <ProfileTabContent />}
        </div>
      </div>
    </div>
  );
};
