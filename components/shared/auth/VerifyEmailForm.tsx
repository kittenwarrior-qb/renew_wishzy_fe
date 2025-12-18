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
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { useVerifyEmail, useResendVerification } from './useAuth';

const LoadingState = () => (
  <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
    <Card className="overflow-hidden p-0">
      <CardContent className="p-0">
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">Đang tải</h1>
            <p className="text-muted-foreground text-balance">Vui lòng chờ...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const VerifyEmailContent = () => {
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
      setError('Vui lòng nhập email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
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
                    Xác thực thành công
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Tài khoản của bạn đã được kích hoạt
                  </p>
                </div>
                
                <FieldDescription className="text-center">
                  Bạn có thể đăng nhập ngay bây giờ
                </FieldDescription>
                
                <Field>
                  <Link href="/auth/login">
                    <Button className="w-full">
                      Đăng nhập ngay
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
                    Xác thực thất bại
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Link xác thực đã hết hạn hoặc không hợp lệ
                  </p>
                </div>
                
                <FieldDescription className="text-center">
                  Nhập email để nhận link xác thực mới
                </FieldDescription>
                
                <Field>
                  <FieldLabel htmlFor="email">Email của bạn</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
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
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi lại email xác thực'
                    )}
                  </Button>
                </Field>
                
                <FieldDescription className="text-center">
                  <Link href="/auth/login" className="underline">
                    Quay lại đăng nhập
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    Đang xác thực email
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Vui lòng chờ...
                  </p>
                </div>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  Xác thực email
                </h1>
                <p className="text-muted-foreground text-balance">
                  Nhập email để nhận link xác thực
                </p>
              </div>
              
              <FieldDescription className="text-center">
                Email xác thực đã được gửi đến hộp thư của bạn
              </FieldDescription>
              
              <FieldDescription className="text-center">
                Vui lòng kiểm tra cả thư mục spam
              </FieldDescription>
              
              <Field>
                <FieldLabel htmlFor="email">Email của bạn</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
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
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi lại email xác thực'
                  )}
                </Button>
              </Field>
              
              <FieldDescription className="text-center">
                <Link href="/auth/login" className="underline">
                  Quay lại đăng nhập
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
