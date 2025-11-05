'use client';

import type { Course } from '@/types/course';
import {
  ActionIcon,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  Image,
  Input,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconShoppingBag,
  IconX,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { useCartStore } from '@/stores/useCartStore';
import { mapLevel } from '@/utils/course';

export function Cart() {
  const { items, removeItem, clearCart } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] || 'vi';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');

  // 当购物车项目变化时，同步选择状态
  useEffect(() => {
    const itemIds = items.map(item => item.course.id);
    setSelectedIds(prev => {
      const kept = prev.filter(id => itemIds.includes(id));
      return kept.length ? kept : itemIds;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  }, [items]);

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
    // 处理价格可能是字符串或数字的情况
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

  const calculateOriginalPrice = (course: Course) => {
    const priceNum = typeof course.price === 'string' ? Number.parseFloat(course.price) : course.price;
    return Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0;
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : items.map(item => item.course.id));
  };

  const selectedItems = useMemo(
    () => items.filter(item => selectedIds.includes(item.course.id)),
    [items, selectedIds],
  );

  const selSubtotal = useMemo(
    () => selectedItems.reduce((s, item) => s + calculateFinalPrice(item.course), 0),
    [selectedItems],
  );

  const selDiscount = useMemo(
    () =>
      selectedItems.reduce((s, item) => {
        const original = calculateOriginalPrice(item.course);
        const final = calculateFinalPrice(item.course);
        return s + Math.max(0, original - final);
      }, 0),
    [selectedItems],
  );

  const selTotal = selSubtotal;

  const handleRemoveItem = (courseId: string, courseName: string) => {
    removeItem(courseId);
    notifications.show({
      title: 'Đã xóa khỏi giỏ hàng',
      message: `"${courseName}" đã được xóa khỏi giỏ hàng`,
      color: 'blue',
    });
  };

  const handleClearCart = () => {
    clearCart();
    setSelectedIds([]);
    notifications.show({
      title: 'Đã xóa giỏ hàng',
      message: 'Tất cả khóa học đã được xóa khỏi giỏ hàng',
      color: 'blue',
    });
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng chọn ít nhất 1 khóa học để thanh toán',
        color: 'red',
      });
      return;
    }

    // 保存选中的项目到 localStorage（用于订单页面和支付返回页面）
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkout_items', JSON.stringify(selectedItems.map((item) => {
        const courseData = { ...item.course };
        return {
          ...courseData,
          _id: courseData.id,
        };
      })));
      localStorage.setItem('checkout_totals', JSON.stringify({
        subtotal: selSubtotal,
        discount: selDiscount,
        total: selTotal,
      }));
    }

    // 跳转到订单页面
    router.push('/order');
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập mã giảm giá',
        color: 'red',
      });
      return;
    }
    notifications.show({
      title: 'Thành công',
      message: `Đã nhập mã: ${code}`,
      color: 'green',
    });
  };

  if (items.length === 0) {
    return (
      <Container size="xl" py="xl" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Box mb="md">
          <Breadcrumbs>
            <Link href={`/${locale}`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Trang chủ
            </Link>
            <Text c="dimmed">Giỏ hàng</Text>
          </Breadcrumbs>
        </Box>

        <Card shadow="sm" p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconShoppingBag size={96} className="text-gray-300 dark:text-gray-600" />
            <Title order={2} className="text-gray-900 dark:text-gray-100">
              Giỏ hàng trống
            </Title>
            <Text c="dimmed" size="lg">
              Hãy thêm một số khóa học vào giỏ hàng của bạn
            </Text>
            <Button
              onClick={handleContinueShopping}
              size="md"
              className="bg-[#ffa500] text-black hover:bg-[#ff9500]"
            >
              Khám phá khóa học
            </Button>
          </Stack>
        </Card>
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
          <Text c="dimmed">Giỏ hàng</Text>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box mb="xl">
        <Title order={1} className="mb-2 text-gray-900 dark:text-gray-100">
          Giỏ hàng của bạn
        </Title>
        <Text c="dimmed" size="lg">
          {selectedItems.length}
          {' '}
          khóa học trong giỏ hàng
        </Text>
      </Box>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items - 8 columns */}
        <div className="lg:col-span-8">
          <Card shadow="sm" p="lg" radius="md" withBorder className="bg-white dark:bg-gray-800">
            <Stack gap="lg">
              <Group justify="space-between" wrap="wrap">
                <Title order={3} className="text-gray-900 dark:text-gray-100">
                  Khóa học đã chọn
                </Title>
                <Group gap="md">
                  <Group gap={8}>
                    <Checkbox
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      label="Chọn tất cả"
                      className="text-sm"
                    />
                  </Group>
                  <Button
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={handleClearCart}
                    className="cursor-pointer text-sm font-medium"
                  >
                    Xóa tất cả
                  </Button>
                </Group>
              </Group>

              <Stack gap="md">
                {items.map(({ course }) => {
                  const finalPrice = calculateFinalPrice(course);
                  const originalPrice = calculateOriginalPrice(course);
                  const isSelected = selectedIds.includes(course.id);

                  return (
                    <Card
                      key={course.id}
                      padding="md"
                      radius="md"
                      withBorder
                      className={`transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 hover:shadow-md'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <Group align="flex-start" gap="md" wrap="nowrap">
                        {/* Checkbox */}
                        <Box pt={4}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleSelect(course.id)}
                            className="cursor-pointer"
                          />
                        </Box>

                        {/* Image */}
                        <Link href={`/course/${course.id}`} className="flex-shrink-0">
                          <Box
                            style={{
                              width: 96,
                              height: 64,
                              minWidth: 96,
                              maxWidth: 96,
                            }}
                            className="overflow-hidden rounded-md"
                          >
                            <Image
                              src={course.thumbnail || '/placeholder-image.jpg'}
                              alt={course.name}
                              width={96}
                              height={64}
                              fit="cover"
                              radius="md"
                              fallbackSrc="/placeholder-image.jpg"
                              style={{
                                width: '96px',
                                height: '64px',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        </Link>

                        {/* Content */}
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Box style={{ flex: 1, minWidth: 0 }}>
                              <Link href={`/course/${course.id}`} className="no-underline">
                                <Title
                                  order={4}
                                  className="mb-1 text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                                >
                                  {course.name}
                                </Title>
                              </Link>

                              {course.creator && (
                                <Text size="sm" c="dimmed" className="mb-2">
                                  Giảng viên:
                                  {' '}
                                  {course.creator.fullName || 'Giảng viên'}
                                </Text>
                              )}

                              <Group gap="md" className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                                <Text size="sm">
                                  {Math.round((course.totalDuration || 0) / 60)}
                                  {' '}
                                  giờ
                                </Text>
                                <Text size="sm">
                                  Level:
                                  {mapLevel(course.level)}
                                </Text>
                                <Text size="sm">•</Text>
                                <Text size="sm">
                                  {course.numberOfStudents || 0}
                                  {' '}
                                  học viên
                                </Text>
                              </Group>

                              <Group gap="sm" align="center">
                                <Text fw={700} size="lg" c="blue">
                                  {formatPrice(finalPrice)}
                                </Text>
                                {originalPrice > finalPrice && (
                                  <Text size="sm" c="dimmed" className="line-through">
                                    {formatPrice(originalPrice)}
                                  </Text>
                                )}
                              </Group>
                            </Box>

                            {/* Remove Button */}
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              size="lg"
                              onClick={() => handleRemoveItem(course.id, course.name)}
                              className="cursor-pointer"
                            >
                              <IconX size={20} />
                            </ActionIcon>
                          </Group>
                        </Box>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>
          </Card>
        </div>

        {/* Order Summary - 4 columns */}
        <div className="lg:col-span-4">
          <Card
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            className="sticky top-8 bg-white dark:bg-gray-800"
          >
            <Stack gap="lg">
              <Title order={3} className="text-gray-900 dark:text-gray-100">
                Tóm tắt đơn hàng
              </Title>

              <Stack gap="md">
                <Group justify="space-between">
                  <Text c="dimmed">Tạm tính</Text>
                  <Text fw={500}>{formatPrice(selSubtotal)}</Text>
                </Group>

                {selDiscount > 0 && (
                  <Group justify="space-between" className="text-green-600">
                    <Text c="green">Tiết kiệm</Text>
                    <Text fw={500} c="green">
                      -
                      {formatPrice(selDiscount)}
                    </Text>
                  </Group>
                )}

                <Box className="border-t pt-4">
                  <Group justify="space-between">
                    <Text fw={600} c="blue">
                      Tổng cộng (
                      {selectedItems.length}
                      {' '}
                      khóa học):
                    </Text>
                    <Text fw={700} size="lg" c="blue">
                      {formatPrice(selTotal)}
                    </Text>
                  </Group>
                </Box>
              </Stack>

              <Button
                fullWidth
                size="md"
                onClick={handleProceedToCheckout}
                rightSection={<IconArrowRight size={18} />}
              >
                Tiến hành thanh toán
              </Button>

              <Text
                ta="center"
                size="sm"
                className="cursor-pointer hover:underline"
                c="primary"
                onClick={handleContinueShopping}
              >
                Tiếp tục mua sắm
              </Text>

              {/* Coupon Section */}
              <Box className="border-t pt-6">
                <Title order={5} mb="md">
                  Mã giảm giá
                </Title>
                <Group gap="sm">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyCoupon}>
                    Áp dụng
                  </Button>
                </Group>
              </Box>
            </Stack>
          </Card>
        </div>
      </div>
    </Container>
  );
}
