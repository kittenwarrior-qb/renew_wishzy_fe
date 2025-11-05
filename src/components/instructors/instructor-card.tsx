'use client';

import type { Instructor } from '@/types/instructor';
import {
  Avatar,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconBook,
  IconCertificate,
  IconStar,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';

type InstructorCardProps = {
  instructor: Instructor;
};

export function InstructorCard({ instructor }: InstructorCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
      <Stack gap="md">
        <Group justify="center">
          <Avatar
            src={instructor.avatar}
            size={120}
            radius="50%"
            className="border-4 border-blue-100 dark:border-blue-900"
          >
            {!instructor.avatar && getInitials(instructor.name)}
          </Avatar>
        </Group>

        <Stack gap="xs" align="center">
          <Text fw={700} size="lg" ta="center">
            {instructor.name}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {instructor.title}
          </Text>
        </Stack>

        {instructor.bio && (
          <Text size="sm" c="dimmed" lineClamp={3} ta="center">
            {instructor.bio}
          </Text>
        )}

        <Group gap="xs" justify="center" wrap="wrap">
          {instructor.specialties.slice(0, 3).map(specialty => (
            <Badge key={specialty} variant="light" color="blue" size="sm">
              {specialty}
            </Badge>
          ))}
          {instructor.specialties.length > 3 && (
            <Badge variant="light" color="gray" size="sm">
              +
              {instructor.specialties.length - 3}
            </Badge>
          )}
        </Group>

        <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Tooltip label="Đánh giá trung bình">
            <Group gap={4}>
              <IconStar size={16} className="fill-current text-yellow-400" />
              <Text size="sm" fw={600}>
                {instructor.rating.toFixed(1)}
              </Text>
            </Group>
          </Tooltip>

          <Tooltip label="Số khóa học">
            <Group gap={4}>
              <IconBook size={16} />
              <Text size="sm" fw={600}>
                {instructor.totalCourses}
              </Text>
            </Group>
          </Tooltip>

          <Tooltip label="Tổng học viên">
            <Group gap={4}>
              <IconUsers size={16} />
              <Text size="sm" fw={600}>
                {instructor.totalStudents.toLocaleString('vi-VN')}
              </Text>
            </Group>
          </Tooltip>
        </Group>

        {instructor.experience > 0 && (
          <Group gap={4} justify="center" mt="xs">
            <IconCertificate size={16} className="text-blue-600" />
            <Text size="xs" c="dimmed">
              {instructor.experience}
              {' '}
              năm kinh nghiệm
            </Text>
          </Group>
        )}

        <Link href={`/instructor/${instructor.id}`} className="w-full">
          <Card
            padding="sm"
            radius="md"
            className="mt-2 cursor-pointer bg-blue-50 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
          >
            <Text size="sm" fw={600} ta="center" c="blue">
              Xem hồ sơ
            </Text>
          </Card>
        </Link>
      </Stack>
    </Card>
  );
}
