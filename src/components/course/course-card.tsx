'use client';

import type { Course } from '@/types/course';
import {
  Avatar,
  Box,
  Button,
  Card,
  Group,
  Image,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBook,
  IconClock,
  IconShoppingCart,
  IconShoppingCartCheck,
  IconStar,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { formatDuration, mapLevel } from '@/utils/course';

type CourseCardProps = {
  course: Course;
  index?: number;
  purchased?: boolean;
};

export function CourseCard({ course, purchased }: CourseCardProps) {
  const { addItem, removeItem, items } = useCartStore();
  const inCart = items.some(item => item.course.id === course.id);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('right');
  const cardRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    if (!Number.isFinite(price)) {
      return '0';
    }
    return new Intl.NumberFormat('vi-VN').format(Number(price));
  };

  const calculateFinalPrice = () => {
    const basePrice = Number.isFinite(Number(course.price)) ? Number(course.price) : 0;

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

  const calculatePopupPosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const popupWidth = 320;
      const viewportPadding = 16;

      const spaceRight = window.innerWidth - rect.right - viewportPadding;
      const spaceLeft = rect.left - viewportPadding;

      if (spaceRight < popupWidth && spaceLeft >= popupWidth) {
        setPopupPosition('left');
      } else {
        setPopupPosition('right');
      }
    }
  };

  useEffect(() => {
    if (!course) {
      return;
    }

    const handleResize = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const popupWidth = 320;
        const viewportPadding = 16;

        const spaceRight = window.innerWidth - rect.right - viewportPadding;
        const spaceLeft = rect.left - viewportPadding;

        if (spaceRight < popupWidth && spaceLeft >= popupWidth) {
          setPopupPosition('left');
        } else {
          setPopupPosition('right');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [course]);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    calculatePopupPosition();

    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      removeItem(course.id);
      notifications.show({
        title: 'Đã xóa khỏi giỏ hàng',
        message: `"${course.name}" đã được xóa khỏi giỏ hàng`,
        color: 'blue',
      });
    } else {
      addItem(course);
      notifications.show({
        title: 'Đã thêm vào giỏ hàng',
        message: `"${course.name}" đã được thêm vào giỏ hàng`,
        color: 'green',
      });
    }
  };

  if (!course) {
    return null;
  }

  const finalPrice = calculateFinalPrice();
  const ratingCount = Number.isFinite(course.numberOfStudents) ? Number(course.numberOfStudents) : 10;
  const publishedDate = course.createdAt && !Number.isNaN(new Date(course.createdAt).getTime())
    ? new Date(course.createdAt).toLocaleDateString('vi-VN')
    : 'N/A';

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        className="group flex w-full flex-row overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 sm:flex-col"
        padding={0}
        radius="md"
        withBorder
      >
        <Link href={`/course/${course.id}`} className="shrink-0">
          <Box className="relative h-[120px] w-[120px] overflow-hidden bg-gray-100 sm:h-[185px] sm:w-full dark:bg-gray-800">
            <Image
              src={course.thumbnail || '/logo/bg_logo_black.png'}
              alt={course.name}
              width={120}
              height={120}
              className="h-full w-full object-cover sm:h-[185px] sm:w-full"
              fit="cover"
              fallbackSrc="/placeholder-image.jpg"
            />
            <Box className="absolute inset-0 bg-black/0 transition-all duration-300 ease-in-out group-hover:bg-black/30" />
          </Box>
        </Link>

        <Stack className="flex flex-1 flex-col gap-[10px] px-3 py-3 sm:px-4">
          <Group justify="space-between" className="w-full">
            <Group gap={7}>
              <IconUsers className="h-3 w-3 text-gray-500 sm:hidden dark:text-gray-400" size={12} />
              <Text size="xs" className="text-gray-500 sm:text-sm dark:text-gray-400">
                {course.numberOfStudents || 0}
                {' '}
                học sinh
              </Text>
            </Group>
            <Text size="xs" className="text-gray-500 sm:text-sm dark:text-gray-400">
              {formatDuration(course.totalDuration)}
            </Text>
          </Group>

          <Link href={`/course/${course.id}`}>
            <Text
              fw={600}
              size="sm"
              className="line-clamp-2 leading-5 hover:underline sm:text-base sm:leading-6"
            >
              {course.name}
            </Text>
          </Link>

          <Group justify="space-between" className="mt-auto w-full">
            <Text fw={700} size="base" className="text-base">
              {formatPrice(finalPrice)}
              {' '}
              đ
            </Text>
          </Group>
        </Stack>
      </Card>

      {/* Popup chi tiết - chỉ hiển thị trên desktop */}
      <Box
        className={`
          absolute top-1/2 z-50 hidden w-80 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-xl transition-opacity duration-200 lg:block dark:border-gray-700 dark:bg-gray-800
          ${isHovered ? 'opacity-100' : 'pointer-events-none opacity-0'}
          ${popupPosition === 'right' ? 'left-full ml-2' : 'right-full mr-2'}
        `}
        style={{
          position: 'absolute',
        }}
      >
        <Stack gap="md">
          <Text fw={700} size="lg" className="leading-6 text-gray-900 dark:text-gray-100">
            {course.name}
          </Text>

          {course.description && (
            <Text size="sm" className="line-clamp-3 text-gray-600 dark:text-gray-300">
              {course.description}
            </Text>
          )}

          <Group gap="md" className="text-sm text-gray-600 dark:text-gray-400">
            <Group gap={4}>
              <IconClock size={16} />
              <Text size="sm">{formatDuration(course.totalDuration)}</Text>
            </Group>
            <Group gap={4}>
              <IconUsers size={16} />
              <Text size="sm">
                {course.numberOfStudents || 0}
                {' '}
                học sinh
              </Text>
            </Group>
            <Group gap={4}>
              <IconBook size={16} />
              <Text size="sm">{mapLevel(course.level)}</Text>
            </Group>
          </Group>

          <Group gap="xs" align="center">
            <Group gap={4}>
              {Array.from({ length: 5 }, (_, i) => {
                const ratingValue = Number.isFinite(Number(course.averageRating)) ? Number(course.averageRating) : 0;
                const isFilled = i < Math.floor(ratingValue);
                return (
                  <IconStar
                    key={`${course.id}-star-${i}-${isFilled ? 'filled' : 'empty'}`}
                    size={16}
                    className={
                      isFilled
                        ? 'fill-current text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }
                  />
                );
              })}
            </Group>
            <Text size="sm" fw={500} className="text-gray-900 dark:text-gray-100">
              {Number.isFinite(Number(course.averageRating)) ? Number(course.averageRating).toFixed(1) : '0.0'}
            </Text>
            <Text size="sm" className="text-gray-600 dark:text-gray-400">
              (
              {ratingCount}
              {' '}
              đánh giá)
            </Text>
          </Group>

          {course.creator && (
            <Group gap="sm" className="pt-2">
              <Avatar size="sm" radius="xl">
                {course.creator.fullName?.charAt(0).toUpperCase() || 'GV'}
              </Avatar>
              <Box>
                <Text size="sm" fw={500} className="text-gray-900 dark:text-gray-100">
                  {course.creator.fullName || 'Giảng viên'}
                </Text>
                <Text size="xs" className="text-gray-600 dark:text-gray-400">
                  Được tạo:
                  {' '}
                  {publishedDate}
                </Text>
              </Box>
            </Group>
          )}

          <Box className="pt-4">
            <Group justify="space-between" mb="md">
              <Text size="xl" fw={700} className="text-gray-900 dark:text-gray-100">
                {formatPrice(finalPrice)}
                {' '}
                đ
              </Text>
            </Group>
            {!purchased && (
              <Button
                fullWidth
                variant={inCart ? 'filled' : 'filled'}
                color={inCart ? 'green' : 'blue'}
                leftSection={inCart ? <IconShoppingCartCheck size={18} /> : <IconShoppingCart size={18} />}
                onClick={handleCartClick}
                className={inCart ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {inCart ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}
              </Button>
            )}
          </Box>
        </Stack>
      </Box>
    </div>
  );
}
