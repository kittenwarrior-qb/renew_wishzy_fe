'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/shared/auth/ResetPasswordForm';

// Loading component for Suspense fallback
const LoadingState = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="w-full max-w-sm text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ResetPasswordForm />
      </div>
    </Suspense>
  );
}

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'
export const dynamicParams = true
