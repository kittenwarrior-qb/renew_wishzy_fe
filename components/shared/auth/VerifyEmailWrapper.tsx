'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Import the original component
import { VerifyEmailContent } from './VerifyEmailForm';

// Loading component for Suspense fallback
const LoadingState = () => (
  <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">Loading</h1>
            <p className="text-muted-foreground text-balance">Please wait...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Export the wrapped component with Suspense
export const VerifyEmailWrapper = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyEmailContent />
    </Suspense>
  );
};
