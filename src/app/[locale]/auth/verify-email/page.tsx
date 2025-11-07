'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { useVerifyEmail, useResendVerification } from '@/hooks/useAuth';
import { useTranslations } from '@/providers/TranslationProvider';

export default function VerifyEmailPage() {
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

  useEffect(() => {
    if (token && verificationStatus === 'pending') {
      // Auto verify if token is present
      verifyEmailMutation.mutate(token, {
        onSuccess: () => {
          setVerificationStatus('success');
        },
        onError: () => {
          setVerificationStatus('error');
        }
      });
    }
  }, [token, verificationStatus, verifyEmailMutation]);

  const handleResendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email là bắt buộc');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setError('');
    resendVerificationMutation.mutate(email);
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">{t('auth.emailVerifiedTitle')}</CardTitle>
            <CardDescription>
              {t('auth.accountActivatedMessage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.canLoginMessage')}
              </p>
              <Link href="/auth/login">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  {t('auth.loginNow')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">{t('auth.verificationFailedTitle')}</CardTitle>
            <CardDescription>
              <span>{t('auth.verificationPending')}</span> không hợp lệ hoặc đã hết hạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.tokenExpiredMessage')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Liên kết xác thực có thể đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.
              </p>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email của bạn</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={resendVerificationMutation.isPending}
                >
                  {resendVerificationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi lại email xác thực'
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
      </div>
    );
  }

  // Loading state
  if (verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.pendingVerificationTitle')}</CardTitle>
            <CardDescription>
              Vui lòng chờ trong giây lát
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Manual verification form
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.manualVerificationTitle')}</CardTitle>
          <CardDescription>
            {t('auth.manualVerificationMessage')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chúng tôi đã gửi email xác thực đến địa chỉ email bạn đã đăng ký. 
              Vui lòng kiểm tra hộp thư và nhấp vào liên kết để kích hoạt tài khoản.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Không nhận được email? Kiểm tra thư mục spam hoặc yêu cầu gửi lại.
            </p>
            
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email của bạn</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={error ? 'border-red-500' : ''}
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={resendVerificationMutation.isPending}
              >
                {resendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi lại email xác thực'
                )}
              </Button>
            </form>

            <Link href="/auth/login">
              <Button variant="ghost" className="w-full">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
