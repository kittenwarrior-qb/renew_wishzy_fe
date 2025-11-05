'use client';

import type { Course } from '@/types/course';
import { Button, Center, Container, Group, Text } from '@mantine/core';
import { useState } from 'react';
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

const INITIAL_LIMIT = 4; // Ban đầu chỉ hiển thị 4 khóa học (1 hàng)
const DEFAULT_SHOW_MORE_COUNT = 4; // Mặc định hiển thị thêm 4 khóa học

export function CourseList({ filter }: CourseListProps = {}) {
  const [displayCount, setDisplayCount] = useState(INITIAL_LIMIT);

  // Fetch toàn bộ dữ liệu, không giới hạn limit
  const filterWithMinPrice = {
    ...filter,
    minPrice: 1, // Chỉ lấy các khóa học có giá > 0
    // Không set limit để fetch toàn bộ
  };

  const { data, isError, error } = useCourseList(filterWithMinPrice);

  const allCourses = data?.data?.items ?? [];
  const displayedCourses = allCourses.slice(0, displayCount);
  const remainingCount = allCourses.length - displayCount;
  const hasMore = remainingCount > 0;
  const showAll = displayCount >= allCourses.length;

  // Tính số lượng sẽ hiển thị khi click "Xem thêm"
  const nextShowCount = remainingCount >= DEFAULT_SHOW_MORE_COUNT
    ? DEFAULT_SHOW_MORE_COUNT
    : remainingCount;

  const handleShowMore = () => {
    setDisplayCount(prev => prev + nextShowCount);
  };

  const handleShowFewer = () => {
    setDisplayCount(INITIAL_LIMIT);
  };

  if (isError) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Text c="red" size="lg" ta="center">
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải danh sách khóa học'}
          </Text>
        </Center>
      </Container>
    );
  }

  if (allCourses.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Text c="dimmed" size="lg">
            Không có khóa học nào
          </Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {displayedCourses.map((course: Course) => (
          <CourseCard
            key={course.id}
            course={course}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <Group mt="xl" gap="md">
        {hasMore && (
          <Button
            onClick={handleShowMore}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            Xem thêm
            {' '}
            {nextShowCount}
            {' '}
            khóa học
          </Button>
        )}

        {showAll && displayCount > INITIAL_LIMIT && (
          <Button
            onClick={handleShowFewer}
            variant="subtle"
            size="sm"
            className="text-sm"
          >
            Hiển thị ít hơn
          </Button>
        )}
      </Group>
    </Container>
  );
}
