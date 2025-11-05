'use client';

import type { Course } from '@/types/course';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Group,
  Image,
  Input,
  Loader,
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCreditCard, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from '@/libs/I18nNavigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useCurrentUser } from '@/components/user/useUser';
import { useCreateOrder } from './useOrder';
import type { CreateOrderDto } from '@/types/order';

export function OrderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] || 'vi';
  const { isAuthenticated, user: authUser } = useAuthStore();
  const { data: userData, isLoading: loadingUser } = useCurrentUser();
  const { items } = useCartStore();
  const createOrderMutation = useCreateOrder();

  const user = userData?.data || authUser;

  const [selectedItems, setSelectedItems] = useState<Array<{ course: Course }>>([]);
  const [selectedTotals, setSelectedTotals] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
  });

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'vnpay'>('vnpay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 从 localStorage 获取选中的项目
  useEffect(() => {
    try {
      const rawItems = typeof window !== 'undefined' ? localStorage.getItem('checkout_items') : null;
      const rawTotals = typeof window !== 'undefined' ? localStorage.getItem('checkout_totals') : null;

      if (rawItems) {
        const parsedItems = JSON.parse(rawItems);
        // 转换格式以匹配 CartItem 结构
        const cartItems = parsedItems.map((item: Course & { _id?: string }) => ({
          course: {
            ...item,
            id: item.id || item._id || '',
          },
        }));
        setSelectedItems(cartItems);

        if (rawTotals) {
          const totals = JSON.parse(rawTotals);
          setSelectedTotals(totals);
        } else {
          // 计算总计
          const subtotal = cartItems.reduce((sum: number, item: { course: Course }) => {
            const priceNum = typeof item.course.price === 'string' ? Number.parseFloat(item.course.price) : item.course.price;
            return sum + (Number.isFinite(priceNum) ? priceNum : 0);
          }, 0);
          setSelectedTotals({
            subtotal,
            discount: 0,
            total: subtotal,
          });
        }
        return;
      }

      // 如果没有 checkout_items，使用购物车中的所有项目
      if (items.length > 0) {
        setSelectedItems(items);
        const subtotal = items.reduce((sum, item) => {
          const priceNum = typeof item.course.price === 'string' ? Number.parseFloat(item.course.price) : item.course.price;
          return sum + (Number.isFinite(priceNum) ? priceNum : 0);
        }, 0);
        setSelectedTotals({
          subtotal,
          discount: 0,
          total: subtotal,
        });
        return;
      }

      // 如果没有任何项目，跳转回购物车
      router.push('/cart');
    } catch (error) {
      console.error('Error loading checkout items:', error);
      router.push('/cart');
    }
  }, [items, router]);

  // 检查认证并填充用户信息
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=${encodeURIComponent(`/${locale}/order`)}`);
      return;
    }

    if (user) {
      setUserInfo(prev => ({
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || '',
      }));
    }
  }, [isAuthenticated, user, router, locale]);

  const formatPrice = (price: number) => {
    if (!Number.isFinite(price)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(price));
  };

  const calculateFinalPrice = (course: Course) => {
    const priceNum = typeof course.price === 'string' ? Number.parseFloat(course.price) : course.price;
    const basePrice = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0;

    if (!course.saleInfo) {
      return basePrice;
    }

    const { saleType, value } = course.saleInfo;
    if (!Number.isFinite(value) || !value) {
      return basePrice;
    }

    const saleValue = Number(value);
    if (saleType === 'percent') {
      return basePrice * (1 - saleValue / 100);
    }
    if (saleType === 'fixed') {
      return Math.max(0, basePrice - saleValue);
    }

    return basePrice;
  };

  const validateForm = (): boolean => {
    if (!userInfo.fullName.trim()) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập họ tên',
        color: 'red',
      });
      return false;
    }

    if (!userInfo.email.trim()) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập email',
        color: 'red',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      notifications.show({
        title: 'Lỗi',
        message: 'Email không hợp lệ',
        color: 'red',
      });
      return false;
    }

    if (userInfo.phone && userInfo.phone.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(userInfo.phone.replace(/\s/g, ''))) {
        notifications.show({
          title: 'Lỗi',
          message: 'Số điện thoại không hợp lệ',
          color: 'red',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (selectedItems.length === 0) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không có khóa học để thanh toán',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 创建订单数据
      const orderData: CreateOrderDto = {
        totalPrice: selectedTotals.total,
        paymentMethod: 'vnpay',
        orderItems: selectedItems.map(item => ({
          courseId: item.course.id,
          price: calculateFinalPrice(item.course),
        })),
      };

      // 保存用户信息和订单信息到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('checkout_items', JSON.stringify(selectedItems.map(item => ({
          _id: item.course.id,
          id: item.course.id,
          ...item.course,
        }))));
        localStorage.setItem('checkout_totals', JSON.stringify(selectedTotals));
        localStorage.setItem('checkout_user_info', JSON.stringify(userInfo));
      }

      // 调用创建订单 API
      const response = await createOrderMutation.mutateAsync(orderData);

      if (response.paymentUrl) {
        // 跳转到 VNPay 支付页面
        if (typeof window !== 'undefined') {
          window.location.href = response.paymentUrl;
        }
      } else {
        notifications.show({
          title: 'Lỗi',
          message: 'Không thể tạo link thanh toán',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo đơn hàng',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Đang tải thông tin...</Text>
        </Stack>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null; // useEffect 会处理重定向
  }

  if (selectedItems.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md">
          <Title order={2}>Giỏ hàng trống</Title>
          <Text c="dimmed">Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng</Text>
          <Button onClick={() => router.push('/cart')}>
            Quay lại giỏ hàng
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <Box mb="md">
        <Breadcrumbs>
          <Link href={`/${locale}`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            Trang chủ
          </Link>
          <Link href={`/${locale}/cart`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            Giỏ hàng
          </Link>
          <Text c="dimmed">Đặt hàng</Text>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box mb="xl">
        <Title order={1} mb="xs">
          Đặt hàng
        </Title>
        <Text c="dimmed" size="lg">
          Hoàn tất thông tin để đặt hàng
        </Text>
      </Box>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column - Form */}
        <div className="lg:col-span-7">
          {/* User Info */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-6 bg-white dark:bg-gray-800">
            <Stack gap="lg">
              <Group gap="sm">
                <IconUser size={20} />
                <Title order={3}>Thông tin người nhận</Title>
              </Group>

              <Stack gap="md">
                <TextInput
                  label="Họ và tên"
                  placeholder="Nhập họ và tên"
                  value={userInfo.fullName}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />

                <TextInput
                  label="Email"
                  placeholder="example@email.com"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />

                <TextInput
                  label="Số điện thoại (không bắt buộc)"
                  placeholder="0123456789"
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Stack>
            </Stack>
          </Card>

          {/* Payment Method */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-6 bg-white dark:bg-gray-800">
            <Stack gap="lg">
              <Group gap="sm">
                <IconCreditCard size={20} />
                <Title order={3}>Phương thức thanh toán</Title>
              </Group>

              <Radio.Group value={paymentMethod} onChange={(value) => setPaymentMethod(value as 'vnpay')}>
                <Stack gap="md">
                  <Radio
                    value="vnpay"
                    label={
                      <Group gap="sm">
                        <Box className="flex h-5 w-5 items-center justify-center rounded bg-blue-600">
                          <Text size="xs" fw={700} c="white">V</Text>
                        </Box>
                        <Box>
                          <Text fw={500}>Thanh toán VNPay</Text>
                          <Text size="sm" c="dimmed">Thanh toán trực tuyến qua VNPay</Text>
                        </Box>
                      </Group>
                    }
                    className="cursor-pointer"
                  />
                </Stack>
              </Radio.Group>
            </Stack>
          </Card>

          {/* Order Items */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className="bg-white dark:bg-gray-800">
            <Stack gap="lg">
              <Title order={3}>Thông tin đơn hàng</Title>

              <Stack gap="md">
                {selectedItems.map((item) => {
                  const finalPrice = calculateFinalPrice(item.course);
                  return (
                    <Group key={item.course.id} gap="md" align="flex-start">
                      <Link href={`/course/${item.course.id}`} className="shrink-0">
                        <Image
                          src={item.course.thumbnail || '/placeholder-image.jpg'}
                          alt={item.course.name}
                          width={64}
                          height={64}
                          fit="cover"
                          radius="md"
                          fallbackSrc="/placeholder-image.jpg"
                        />
                      </Link>

                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/course/${item.course.id}`} className="no-underline">
                          <Text fw={500} size="sm" lineClamp={2} className="mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {item.course.name}
                          </Text>
                        </Link>
                        {item.course.creator && (
                          <Text size="xs" c="dimmed" className="mb-1">
                            {item.course.creator.fullName || 'Giảng viên'}
                          </Text>
                        )}
                        <Text fw={600} size="sm" c="blue">
                          {formatPrice(finalPrice)}
                        </Text>
                      </Box>
                    </Group>
                  );
                })}
              </Stack>
            </Stack>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-5">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="bg-white dark:bg-gray-800 sticky top-8"
          >
            <Stack gap="lg">
              <Title order={3}>Tóm tắt đơn hàng</Title>

              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Tạm tính</Text>
                  <Text size="sm" fw={500}>{formatPrice(selectedTotals.subtotal)}</Text>
                </Group>

                {selectedTotals.discount > 0 && (
                  <Group justify="space-between">
                    <Text size="sm" c="green">Tiết kiệm</Text>
                    <Text size="sm" fw={500} c="green">
                      -{formatPrice(selectedTotals.discount)}
                    </Text>
                  </Group>
                )}

                <Box className="border-t pt-4">
                  <Group justify="space-between">
                    <Text fw={600}>Tổng cộng</Text>
                    <Text fw={700} size="lg" c="blue">
                      {formatPrice(selectedTotals.total)}
                    </Text>
                  </Group>
                </Box>
              </Stack>

              <Button
                fullWidth
                size="md"
                onClick={handleSubmitOrder}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Thanh toán'}
              </Button>

              <Text size="xs" c="dimmed" ta="center">
                Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của Wishzy
              </Text>
            </Stack>
          </Card>
        </div>
      </div>
    </Container>
  );
}


