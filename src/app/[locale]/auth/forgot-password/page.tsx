'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '@/hooks/useAuth';
import { useTranslations } from '@/providers/TranslationProvider';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useForgotPassword();

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setError(t('auth.emailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.emailInvalid'));
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      forgotPasswordMutation.mutate(email, {
        onSuccess: () => {
          setIsSubmitted(true);
        }
      });
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-accent-foreground font-bold text-xl">✓</span>
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.emailSentTitle')}</CardTitle>
            <CardDescription>
              {t('auth.emailSentMessage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('auth.checkEmailMessage')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('auth.noEmailMessage')}
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                {t('auth.resendEmail')}
              </Button>
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('auth.backToLogin')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.forgotPasswordTitle')}</CardTitle>
          <CardDescription>
            {t('auth.forgotPasswordSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => handleInputChange(e.target.value)}
                className={error ? 'border-destructive' : ''}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.sendingEmail')}
                </>
              ) : (
                t('auth.sendResetLink')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground underline inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
