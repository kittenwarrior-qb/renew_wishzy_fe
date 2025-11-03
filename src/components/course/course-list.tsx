'use client';

import type { Course } from '@/types/course';
import { Center, Container, Flex, Paper, Text } from '@mantine/core';
import { CourseCard } from './course-card';
import { useCourseList } from './useCourse';

type CourseListProps = {
  filter?: {
    page?: number;
    limit?: number;
    name?: string;
    categoryId?: string;
    courseLevel?: 'beginner' | 'intermediate' | 'advanced';
    createdBy?: string;
    rating?: number;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  };
};

export function CourseList({ filter }: CourseListProps = {}) {
  const { data, isLoading, isError, error } = useCourseList(filter);

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          Đang tải khóa học...
        </Center>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size="xl" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Text c="red" size="lg" ta="center">
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải danh sách khóa học'}
          </Text>
        </Paper>
      </Container>
    );
  }

  const courses = data?.data?.items ?? [];

  return (
    <Container size="xl" py="xl">
      {courses.length === 0
        ? (
            <Paper shadow="md" p="xl" radius="md" withBorder>
              <Text c="dimmed" ta="center" size="lg">
                Không có khóa học nào
              </Text>
            </Paper>
          )
        : (
            <Flex
              gap="lg"
              wrap="wrap"
              justify="flex-start"
              align="flex-start"
            >
              {courses.map((course: Course, index: number) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                />
              ))}
            </Flex>
          )}
    </Container>
  );
}
