import type { Chapter } from '@/types/chapter';
import type { Course } from '@/types/course';
import { Badge, Button, Divider, Group, Image, Paper, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useCartStore } from '@/stores';

type CourseModalProps = {
  course: Course;
  chapters: Chapter[];
};

export function CourseModal({ course, chapters }: CourseModalProps) {
  const addItem = useCartStore(state => state.addItem);
  const isAlreadyInCart = useCartStore(state => state.isInCart(course.id));

  // Calculate sale price
  const { currentPrice, originalPrice, discountPercent } = useMemo(() => {
    const basePrice = typeof course.price === 'string'
      ? Number.parseFloat(course.price)
      : course.price;

    if (!course.saleInfo) {
      return { currentPrice: basePrice, originalPrice: null, discountPercent: 0 };
    }

    let salePrice = basePrice;
    if (course.saleInfo.saleType === 'percent') {
      salePrice = basePrice - (basePrice * course.saleInfo.value) / 100;
    } else {
      salePrice = basePrice - course.saleInfo.value;
    }

    const discount = Math.round(((basePrice - salePrice) / basePrice) * 100);
    return { currentPrice: salePrice, originalPrice: basePrice, discountPercent: discount };
  }, [course.price, course.saleInfo]);

  // Format duration
  const formattedDuration = useMemo(() => {
    const hours = Math.floor(course.totalDuration / 3600);
    const minutes = Math.floor((course.totalDuration % 3600) / 60);
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  }, [course.totalDuration]);

  // Format level display
  const levelMap: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };
  const displayLevel = levelMap[course.level] || course.level;
  return (
    <Stack gap="lg" className="mt-5 w-full md:w-1/2 lg:w-2/5 xl:w-[30%]">
      <div style={{ position: 'sticky', top: '80px' }}>
        <Paper p="lg" withBorder shadow="sm" style={{ position: 'relative', overflow: 'visible' }}>
          {/* Discount Badge - Absolute positioned */}
          {discountPercent > 0 && (
            <Badge
              color="red"
              variant="filled"
              size="md"
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 8px',
                height: 'auto',
                zIndex: 10,
                borderRadius: '5px',
                minWidth: '20px',
                minHeight: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              -
              {discountPercent}
              %
            </Badge>
          )}

          <Stack gap="md">
            <Image
              src={course.thumbnail}
              alt={course.name}
              radius="md"
              h={150}
              fit="cover"
            />

            {/* Price Section */}
            <Stack gap="xs">
              <Group gap="sm" align="baseline" wrap="wrap">
                <Text size="24px" fw={700} c="blue" style={{ lineHeight: 1 }}>
                  {currentPrice > 0 ? `₫${currentPrice.toLocaleString('vi-VN')}` : 'Miễn phí'}
                </Text>
                {originalPrice && originalPrice > currentPrice && (
                  <Text size="md" td="line-through" c="dimmed" fw={400}>
                    ₫
                    {originalPrice.toLocaleString('vi-VN')}
                  </Text>
                )}
              </Group>

              {/* {discountPercent > 0 && (
              <Group gap={4} align="center">
                <Text size="sm" c="red" fw={700}>
                  ⏰ 1 giờ
                </Text>
                <Text size="sm" c="red" fw={400}>
                  còn lại với giá này!
                </Text>
              </Group>
            )} */}
            </Stack>

            <Button
              onClick={() => addItem(course)}
              size="lg"
              fullWidth
              color="blue"
              disabled={isAlreadyInCart}
            >
              {isAlreadyInCart ? 'Đã có trong giỏ hàng' : 'Thêm vào giỏ hàng'}
            </Button>

            <Button
              size="lg"
              fullWidth
              variant="outline"
              style={{
                height: '48px',
                fontSize: '1rem',
                borderColor: '#1c1d1f',
                color: '#1c1d1f',
                fontWeight: 700,
              }}
            >
              Mua ngay
            </Button>

            <Divider />

            <Stack gap="xs">
              <Text size="sm" fw={500}>Khóa học bao gồm:</Text>
              <Stack gap={4}>
                <Group gap="xs">
                  <Text size="sm">📚</Text>
                  <Text size="sm">
                    {chapters.length}
                    {' '}
                    chương học
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="sm">⏱️</Text>
                  <Text size="sm">
                    {formattedDuration}
                    {' '}
                    thời lượng
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="sm">👥</Text>
                  <Text size="sm">
                    {course.numberOfStudents.toLocaleString('vi-VN')}
                    {' '}
                    học viên
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="sm">⭐</Text>
                  <Text size="sm">
                    Đánh giá:
                    {' '}
                    {typeof course.averageRating === 'string'
                      ? Number.parseFloat(course.averageRating).toFixed(1)
                      : course.averageRating.toFixed(1)}
                    /5
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="sm">🎓</Text>
                  <Text size="sm">
                    Cấp độ:
                    {' '}
                    {displayLevel}
                  </Text>
                </Group>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </div>
    </Stack>
  );
}
