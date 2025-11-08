'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useRegister } from './useAuth';
import { useTranslations } from '@/providers/TranslationProvider';
import type { RegisterData } from '@/types/auth';
import { cn } from '@/lib/utils';

export const RegisterForm = () => {
  const t = useTranslations();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});

  const registerMutation = useRegister();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('auth.fullNameRequired');
    }

    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 1) {
      newErrors.password = t('auth.passwordMinLength');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      registerMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {t('auth.registerTitle')}
        </CardTitle>
        <CardDescription>
          {t('auth.registerSubtitle')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {t('auth.fullName')}
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder={t('auth.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={cn(errors.fullName && 'border-destructive')}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t('auth.confirmPassword')}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={cn('pr-10', errors.confirmPassword && 'border-destructive')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.registering')}
              </>
            ) : (
              t('auth.register')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
