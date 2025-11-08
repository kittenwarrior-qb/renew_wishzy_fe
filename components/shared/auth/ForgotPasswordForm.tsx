'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useForgotPassword } from './useAuth';
import { useTranslations } from '@/providers/TranslationProvider';
import { cn } from '@/lib/utils';

export const ForgotPasswordForm = () => {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const forgotPasswordMutation = useForgotPassword();

  const validateForm = (): boolean => {
    if (!email) {
      setError(t('auth.emailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.emailInvalid'));
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      forgotPasswordMutation.mutate({ email });
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t('auth.forgotPasswordTitle')}
        </CardTitle>
        <CardDescription>
          {t('auth.forgotPasswordSubtitle')}
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
              value={email}
              onChange={(e) => handleInputChange(e.target.value)}
              className={cn(error && 'border-destructive')}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.sending')}
              </>
            ) : (
              t('auth.sendResetLink')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('auth.resetPasswordInstructions')}
          </p>
          
          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToLogin')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
