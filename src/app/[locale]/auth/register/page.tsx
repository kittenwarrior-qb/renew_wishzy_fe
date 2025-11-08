'use client';

import { RegisterForm } from '@/components/shared/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
