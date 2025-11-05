'use client';

import type { Course } from '@/types/course';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from '@/libs/I18nNavigation';
import { useCartStore } from '@/stores/useCartStore';

export function MiniCart() {
  const { items, removeItem, getTotalPrice } = useCartStore();
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

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

  const handleRemoveItem = (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(courseId);
  };

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <Box
        style={{
          background: isDark ? 'var(--mantine-color-dark-7)' : 'white',
          borderRadius: '8px',
          boxShadow: isDark
            ? '0 4px 12px rgba(0, 0, 0, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '16px',
          minWidth: '320px',
          maxWidth: '400px',
        }}
      >
        <Text c="dimmed" size="sm" ta="center">
          Giỏ hàng của bạn đang trống
        </Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        background: isDark ? 'var(--mantine-color-dark-7)' : 'white',
        borderRadius: '8px',
        boxShadow: isDark
          ? '0 4px 12px rgba(0, 0, 0, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        maxWidth: '360px',
        maxHeight: '500px',
        overflow: 'auto',
      }}
    >
      <Stack gap={8} p="md">
        {items.slice(0, 5).map(({ course }, index) => {
          const finalPrice = calculateFinalPrice(course);
          const isLastItem = index === Math.min(items.length, 5) - 1;
          return (
            <Group
              key={course.id}
              gap="xs"
              align="flex-start"
              wrap="nowrap"
              style={{
                borderBottom: !isLastItem
                  ? isDark
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid var(--mantine-color-gray-3)'
                  : 'none',
                paddingBottom: !isLastItem ? '8px' : '0',
              }}
            >
              <Link
                href={`/course/${course.id}`}
                className="flex-shrink-0"
                style={{ textDecoration: 'none' }}
              >
                <Box
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid var(--mantine-color-gray-3)',
                    backgroundColor: isDark
                      ? 'var(--mantine-color-dark-6)'
                      : 'var(--mantine-color-gray-1)',
                  }}
                >
                  <Image
                    src={course.thumbnail ?? ''}
                    alt={course.name}
                    width={48}
                    height={48}
                    fit="cover"
                    fallbackSrc="/placeholder-image.jpg"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </Link>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/course/${course.id}`} className="no-underline">
                  <Text
                    fw={500}
                    size="xs"
                    lineClamp={2}
                    className="mb-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    style={{
                      color: isDark ? 'var(--mantine-color-gray-0)' : 'var(--mantine-color-dark-9)',
                      lineHeight: 1.4,
                    }}
                  >
                    {course.name}
                  </Text>
                </Link>
                <Text
                  fw={600}
                  size="xs"
                  c="blue.6"
                  style={{
                    fontSize: '11px',
                  }}
                >
                  {formatPrice(finalPrice)}
                </Text>
              </Box>

              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={e => handleRemoveItem(course.id, e)}
                style={{
                  flexShrink: 0,
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          );
        })}
        {items.length > 5 && (
          <Text size="xs" c="dimmed" ta="center" pt="xs">
            và
            {' '}
            {items.length - 5}
            {' '}
            khóa học khác...
          </Text>
        )}
      </Stack>

      <Box
        style={{
          borderTop: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid var(--mantine-color-gray-3)',
          padding: '12px 16px',
        }}
      >
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={600}>
            Tổng tiền:
          </Text>
          <Text size="sm" fw={700} c="blue.6">
            {formatPrice(totalPrice)}
          </Text>
        </Group>
        <Button
          size="sm"
          fullWidth
          onClick={() => router.push('/cart')}
          className="text-sm"
        >
          Xem giỏ hàng
        </Button>
      </Box>
    </Box>
  );
}
