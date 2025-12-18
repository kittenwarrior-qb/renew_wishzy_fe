import { Suspense } from 'react';
import { ProfileTabs } from '@/components/shared/profile';

const ProfilePage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    }>
      <ProfileTabs />
    </Suspense>
  );
};

export default ProfilePage;