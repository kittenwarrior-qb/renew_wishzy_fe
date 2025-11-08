'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useLogin } from './useAuth';
import { useTranslations } from '@/providers/TranslationProvider';
import type { LoginCredentials } from '@/types/auth';
import { cn } from '@/lib/utils';

export const LoginForm = () => {
  const t = useTranslations();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

  const loginMutation = useLogin();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      loginMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {t('auth.loginTitle')}
        </CardTitle>
        <CardDescription>
          {t('auth.loginSubtitle')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('auth.email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn(errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {t('auth.password')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={cn('pr-10', errors.password && 'border-destructive')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.loggingIn')}
              </>
            ) : (
              t('auth.login')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
