import { Badge, Button, Divider, Group, Image, Paper, Stack, Text } from '@mantine/core';

export function CourseModal({ course, chapters }: { course: any; chapters: any }) {
  return (
    <Stack gap="lg" className="mt-5 w-[30%]">
      <Paper p="lg" withBorder shadow="sm" style={{ position: 'sticky', top: '80px' }}>
        <Stack gap="md">
          <Image
            src={course.thumbnail}
            alt={course.name}
            radius="md"
            h={150}
            fit="cover"
          />

          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text size="xl" fw={700} c="blue">
                {course.price ? `${Number(course.price).toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
              </Text>
              {course.originalPrice && course.originalPrice > course.price && (
                <Text size="sm" td="line-through" c="dimmed">
                  {Number(course.originalPrice).toLocaleString('vi-VN')}
                  {' '}
                  ₫
                </Text>
              )}
            </Group>

            {course.originalPrice && course.originalPrice > course.price && (
              <Badge color="red" size="lg">
                Giảm
                {' '}
                {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}
                %
              </Badge>
            )}
          </Stack>

          <Button size="md" fullWidth color="blue">
            Mua khoá học
          </Button>

          <Button size="md" fullWidth color="blue" variant="outline">
            Thêm vào giỏ hàng
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
                <Text size="sm">👥</Text>
                <Text size="sm">
                  {Number.isFinite(course.numberOfStudents) ? course.numberOfStudents : 0}
                  {' '}
                  học viên
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm">⭐</Text>
                <Text size="sm">
                  Đánh giá:
                  {' '}
                  {Number.isFinite(course.averageRating) ? Number(course.averageRating).toFixed(1) : '0.0'}
                  /5
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm">🎓</Text>
                <Text size="sm">
                  Cấp độ:
                  {' '}
                  {String(course.level ?? 'N/A')}
                </Text>
              </Group>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
