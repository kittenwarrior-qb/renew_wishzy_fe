'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { useVerifyEmail, useResendVerification } from './useAuth';
import { useTranslations } from '@/providers/TranslationProvider';
import { cn } from '@/lib/utils';

export const VerifyEmailForm = () => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'manual'>(() => {
    return token ? 'pending' : 'manual';
  });
  const [error, setError] = useState('');

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  // Update status when token becomes available
  useEffect(() => {
    if (token && verificationStatus === 'manual') {
      setVerificationStatus('pending');
    }
  }, [token, verificationStatus]);

  useEffect(() => {
    if (token && verificationStatus === 'pending' && !verifyEmailMutation.isPending) {
      verifyEmailMutation.mutate(token, {
        onSuccess: () => {
          setVerificationStatus('success');
        },
        onError: () => {
          setVerificationStatus('error');
        }
      });
    }
  }, [token, verificationStatus]);

  const handleResendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('auth.emailRequired'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.emailInvalid'));
      return;
    }
    setError('');
    resendVerificationMutation.mutate({ email });
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  if (verificationStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {t('auth.emailVerifiedTitle')}
          </CardTitle>
          <CardDescription>
            {t('auth.accountActivatedMessage')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('auth.canLoginMessage')}
            </p>
            <Link href="/auth/login">
              <Button className="w-full">
                {t('auth.loginNow')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (verificationStatus === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-destructive-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {t('auth.verificationFailedTitle')}
          </CardTitle>
          <CardDescription>
            {t('auth.verificationLinkExpired')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('auth.tokenExpiredMessage')}
            </p>
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.yourEmail')}</Label>
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
                disabled={resendVerificationMutation.isPending}
              >
                {resendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.sending')}
                  </>
                ) : (
                  t('auth.resendVerificationEmail')
                )}
              </Button>
            </form>
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full">
                {t('auth.backToLogin')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (verificationStatus === 'pending') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('auth.verifyingEmail')}
          </CardTitle>
          <CardDescription>
            {t('auth.pleaseWait')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Manual verification form
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-secondary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t('auth.manualVerificationTitle')}
        </CardTitle>
        <CardDescription>
          {t('auth.manualVerificationMessage')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('auth.verificationEmailSent')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('auth.checkSpamFolder')}
          </p>
          
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.yourEmail')}</Label>
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
              disabled={resendVerificationMutation.isPending}
            >
              {resendVerificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.sending')}
                </>
              ) : (
                t('auth.resendVerificationEmail')
              )}
            </Button>
          </form>
          
          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              {t('auth.backToLogin')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
