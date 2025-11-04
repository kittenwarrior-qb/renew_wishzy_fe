'use client';

import {
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Container,
  Divider,
  Flex,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useChapterList } from '@/components/chapter/useChapter';
import { useCourseDetail } from '@/components/course/useCourse';
import { useLectureList } from '@/components/lecture/useLecture';
import { NotFoundAnimation } from '@/components/rive-animation/NotFoundAnimation';
import { CourseModal } from './course-modal';
import { CourseUserInfo } from './course-user-info';

function ChapterItem({ chapterId, name }: { chapterId: string; name: string }) {
  const lectureQuery = useLectureList(chapterId);
  const lecturesRaw = lectureQuery.data?.data ?? ([] as any);
  const lectures = Array.isArray(lecturesRaw)
    ? lecturesRaw
    : Object.values(lecturesRaw).filter(v => typeof v === 'object');

  return (
    <Container size="lg" py="xl">
      <Paper p="md" withBorder>
        <Stack gap={6}>
          <Group justify="space-between">
            <Title order={4}>{name}</Title>
            <Text c="dimmed" size="sm">
              {lectureQuery.isLoading ? '...' : lectures.length}
              {' '}
              lectures
            </Text>
          </Group>
          {lectureQuery.isLoading
            ? (
                <Loader size="sm" />
              )
            : (
                <Stack gap={4}>
                  {lectures.map((lec: any) => (
                    <Group key={lec.id} justify="space-between">
                      <Text>{lec.name}</Text>
                      {lec.duration
                        ? (
                            <Text c="dimmed" size="sm">
                              {lec.duration}
                              {' '}
                              sec
                            </Text>
                          )
                        : null}
                    </Group>
                  ))}
                </Stack>
              )}
        </Stack>
      </Paper>
    </Container>
  );
}

function BreadcrumbItem({ items }: { items: { title: string; href?: string }[] }) {
  return (
    <Breadcrumbs>
      {items.map(item => (
        item.href
          ? (
              <Anchor href={item.href} key={item.title}>
                {item.title}
              </Anchor>
            )
          : (
              <Text key={item.title}>
                {item.title}
              </Text>
            )
      ))}
    </Breadcrumbs>
  );
}

export function CourseDetail({ id }: { id: string }) {
  const courseQuery = useCourseDetail(id);
  const chaptersQuery = useChapterList(id);

  const chapters = chaptersQuery.data?.data?.items ?? [];

  if (courseQuery.isLoading || chaptersQuery.isLoading) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center" py="lg">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (courseQuery.isError || !courseQuery.data?.data) {
    return (
      <Container size="lg" py="xl">
        <Paper p="xl" withBorder>
          <Stack align="center" gap="sm">
            <NotFoundAnimation height={220} />
            <Title order={3}>Course not found</Title>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const course = courseQuery.data.data as any;

  const items = [
    { title: 'Trang chủ', href: '/' },
    { title: 'Chi tiết khóa học' },
    { title: course.name },
  ];

  return (
    <Box maw="1280px" mx="auto" py="xl">
      <BreadcrumbItem items={items} />
      <Flex gap={32}>
        {/* Left page */}
        <Stack gap="lg" className="mt-5 w-[70%]">
          <Stack gap={4}>
            {/* Course name */}
            <Title order={2}>{typeof course.name === 'string' ? course.name : String(course.name ?? '')}</Title>
            {/* Level, Students, Rating */}
            <Group gap="sm" className="mt-2">
              {course?.category?.name && (
                <Badge color="blue">{String(course.category.name)}</Badge>
              )}
              <Badge color="grape">
                Level:
                {' '}
                {String(course.level ?? '')}
              </Badge>
              <Badge color="orange">
                Students:
                {' '}
                {Number.isFinite(course.numberOfStudents) ? course.numberOfStudents : 0}
              </Badge>
              <Badge color="yellow">
                Rating:
                {' '}
                {Number.isFinite(course.averageRating) ? Number(course.averageRating).toFixed(1) : '0.0'}
              </Badge>
            </Group>

            <Image
              className="mt-2"
              radius="md"
              src={course.thumbnail}
            />

          </Stack>

          <Stack gap="xs">
            <Title order={3}>Mô tả khoá học</Title>
            {course.description && <Text c="dimmed">{typeof course.description === 'string' ? course.description : String(course.description)}</Text>}
          </Stack>

          <Divider label="Chapters" />
          <Stack gap="md">
            {chapters.length === 0
              ? (
                  <Text c="dimmed">No chapters</Text>
                )
              : (
                  chapters.map(ch => (
                    <ChapterItem key={ch.id} chapterId={ch.id} name={ch.name} />
                  ))
                )}
          </Stack>

          <Divider label="Instructor Info" />
          {/* User info */}
          <CourseUserInfo />
        </Stack>

        {/* Modal right page */}
        <CourseModal course={course} chapters={chapters} />

      </Flex>
    </Box>
  );
}
