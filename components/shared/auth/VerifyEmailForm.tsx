'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { useVerifyEmail, useResendVerification } from './useAuth';
import { useTranslations } from '@/providers/TranslationProvider';
import { cn } from '@/lib/utils';

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

// Main component that uses useSearchParams
export const VerifyEmailContent = () => {
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
      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-green-600">
                    {t('auth.emailVerifiedTitle')}
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    {t('auth.accountActivatedMessage')}
                  </p>
                </div>
                
                <FieldDescription className="text-center">
                  {t('auth.canLoginMessage')}
                </FieldDescription>
                
                <Field>
                  <Link href="/auth/login">
                    <Button className="w-full">
                      {t('auth.loginNow')}
                    </Button>
                  </Link>
                </Field>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (verificationStatus === 'error') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <form onSubmit={handleResendVerification} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-destructive-foreground" />
                  </div>
                  <h1 className="text-2xl font-bold text-destructive">
                    {t('auth.verificationFailedTitle')}
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    {t('auth.verificationLinkExpired')}
                  </p>
                </div>
                
                <FieldDescription className="text-center">
                  {t('auth.tokenExpiredMessage')}
                </FieldDescription>
                
                <Field>
                  <FieldLabel htmlFor="email">{t('auth.yourEmail')}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="border-input"
                    autoComplete="off"
                  />
                  {error && (
                    <FieldDescription className="text-destructive">
                      {error}
                    </FieldDescription>
                  )}
                </Field>
                
                <Field>
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
                </Field>
                
                <FieldDescription className="text-center">
                  <Link href="/auth/login" className="underline">
                    {t('auth.backToLogin')}
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (verificationStatus === 'pending') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold">
                    {t('auth.verifyingEmail')}
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    {t('auth.pleaseWait')}
                  </p>
                </div>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manual verification form
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <form onSubmit={handleResendVerification} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">
                  {t('auth.manualVerification')}
                </h1>
                <p className="text-muted-foreground text-balance">
                  {t('auth.enterEmailForVerification')}
                </p>
              </div>
              
              <FieldDescription className="text-center">
                {t('auth.verificationEmailSent')}
              </FieldDescription>
              
              <FieldDescription className="text-center">
                {t('auth.checkSpamFolder')}
              </FieldDescription>
              
              <Field>
                <FieldLabel htmlFor="email">{t('auth.yourEmail')}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="border-input"
                  autoComplete="off"
                />
                {error && (
                  <FieldDescription className="text-destructive">
                    {error}
                  </FieldDescription>
                )}
              </Field>
              
              <Field>
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
              </Field>
              
              <FieldDescription className="text-center">
                <Link href="/auth/login" className="underline">
                  {t('auth.backToLogin')}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
