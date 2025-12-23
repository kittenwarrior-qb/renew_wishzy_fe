"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRegister } from "./useAuth";
import type { RegisterData } from "@/types/auth";
import { LittleBoyAnimation } from "@/components/animations/LittleBoyAnimation";
import { GoogleLoginButton } from "./GoogleLoginButton";

export const RegisterForm = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});

  const registerMutation = useRegister();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ thường";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ số";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      registerMutation.mutate(formData, {
        onError: (error: any) => {
          if (
            error?.code === "ECONNABORTED" ||
            error?.message?.includes("timeout")
          ) {
            setErrors({
              email: "Đăng ký có thể đã thành công. Vui lòng thử đăng nhập.",
            });
          } else if (
            error?.response?.status === 409 ||
            error?.message?.includes("already exists")
          ) {
            setErrors({
              email: "Email đã được sử dụng",
            });
          } else {
            setErrors({
              email: error?.message || "Đã xảy ra lỗi khi đăng ký",
            });
          }
        },
      });
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-4xl mx-auto">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Đăng ký</h1>
                <p className="text-muted-foreground text-balance">
                  Tạo tài khoản mới để bắt đầu
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="fullName">Họ và tên</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className={`border-input ${errors.fullName ? 'border-destructive' : ''}`}
                  autoComplete="off"
                />
                {errors.fullName && (
                  <FieldDescription className="text-destructive">
                    {errors.fullName}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`border-input ${errors.email ? 'border-destructive' : ''}`}
                  autoComplete="off"
                />
                {errors.email && (
                  <FieldDescription className="text-destructive">
                    {errors.email}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`pr-10 border-input ${errors.password ? 'border-destructive' : ''}`}
                    autoComplete="off"
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
                  <FieldDescription className="text-destructive">
                    {errors.password}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Xác nhận mật khẩu
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`pr-10 border-input ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    autoComplete="off"
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
                  <FieldDescription className="text-destructive">
                    {errors.confirmPassword}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc tiếp tục với
              </FieldSeparator>

              <Field>
                <GoogleLoginButton text="Đăng ký với Google" />
              </Field>

              {(errors.email?.includes("timeout") ||
                errors.email?.includes("đã được sử dụng")) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                    Đăng ký có thể đã thành công
                  </p>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Thử đăng nhập
                    </Button>
                  </Link>
                </div>
              )}

              <FieldDescription className="text-center">
                Đã có tài khoản?{" "}
                <Link href="/auth/login" className="underline">
                  Đăng nhập
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:flex items-center justify-center">
            <LittleBoyAnimation
              width="100%"
              height="100%"
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Bằng việc tiếp tục, bạn đồng ý với{" "}
        <Link href="/terms" className="underline">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="/privacy" className="underline">
          Chính sách bảo mật
        </Link>
        .
      </FieldDescription>
    </div>
  );
};
