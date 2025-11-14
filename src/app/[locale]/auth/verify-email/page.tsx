'use client';

import { Suspense } from 'react';
import { VerifyEmailContent } from '@/components/shared/auth/VerifyEmailForm';

// Loading component for Suspense fallback
const LoadingState = () => (
  <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
    <div className="w-full max-w-sm text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <VerifyEmailContent />
        </div>
      </div>
    </Suspense>
  );
}

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'
export const dynamicParams = true
