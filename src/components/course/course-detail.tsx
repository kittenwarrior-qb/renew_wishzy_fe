'use client';

import {
  Badge,
  Container,
  Divider,
  Group,
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

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={2}>{typeof course.name === 'string' ? course.name : String(course.name ?? '')}</Title>
          <Group gap="sm">
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

        <Divider label="Documents" />
      </Stack>
    </Container>
  );
}
