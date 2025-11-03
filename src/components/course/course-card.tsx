'use client';

import type { Course } from '@/types/course';
import {
  Box,
  Card,
  Group,
  Image,
  Stack,
  Text,
} from '@mantine/core';
import Link from 'next/link';

type CourseCardProps = {
  course: Course;
  index?: number;
  purchased?: boolean;
};

export function CourseCard({ course, index, purchased }: CourseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Tính chapters từ totalDuration (giả định mỗi chapter khoảng 30 phút)
  // Hoặc có thể lấy từ API sau này
  const chapters = Math.max(1, Math.ceil(course.totalDuration / 30));

  const calculateFinalPrice = () => {
    if (!course.saleInfo) {
      return course.price;
    }

    const { saleType, value } = course.saleInfo;
    if (!value) {
      return course.price;
    }

    if (saleType === 'percent') {
      return course.price * (1 - value / 100);
    }
    if (saleType === 'fixed') {
      return Math.max(0, course.price - value);
    }

    return course.price;
  };

  const finalPrice = calculateFinalPrice();

  return (
    <Link href={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
      <Card
        shadow="sm"
        padding={0}
        radius="lg"
        withBorder
        style={{ width: '280px', cursor: 'pointer' }}
      >
        {/* Image */}
        <Box style={{ overflow: 'hidden', borderTopLeftRadius: 'var(--mantine-radius-lg)', borderTopRightRadius: 'var(--mantine-radius-lg)' }}>
          <Image
            src={course.thumbnail ?? ''}
            alt={course.name}
            height={230}
            width={280}
            fit="cover"
            fallbackSrc="/placeholder-image.jpg"
          />
        </Box>

        {/* Content */}
        <Stack gap="xs" p="md">
          {/* Title */}
          <Text fw={700} size="md" lineClamp={2}>
            {course.name}
          </Text>

          {/* Category */}
          {course.category && (
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              {course.category.name}
            </Text>
          )}

          {/* Chapters and Price */}
          <Group justify="space-between" mt="xs">
            {/* Chapters */}
            <Group gap="xs">
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--mantine-color-green-6)',
                  opacity: 0.2,
                  borderRadius: 'var(--mantine-radius-md)',
                  padding: '6px',
                }}
              >
                <Text
                  size="xs"
                  fw={700}
                  c="green.6"
                  style={{
                    fontFamily: 'monospace',
                  }}
                >
                  📖
                </Text>
              </Box>
              <Text size="sm" c="dimmed">
                {chapters}
                {' '}
                chapters
              </Text>
            </Group>

            {/* Price */}
            <Box>
              {purchased
                ? (
                    <Text size="sm" c="dimmed">
                      Paid
                    </Text>
                  )
                : (
                    <Text size="sm" fw={500}>
                      $
                      {' '}
                      {formatPrice(finalPrice)}
                    </Text>
                  )}
            </Box>
          </Group>
        </Stack>
      </Card>
    </Link>
  );
}
