'use client';

import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Progress,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  IconBook,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconFileText,
  IconMessageCircle,
  IconNote,
  IconPlay,
  IconVideo,
} from '@tabler/icons-react';
import { useState } from 'react';

type Chapter = {
  id: string;
  title: string;
  duration: number;
  lectures: Lecture[];
};

type Lecture = {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  type: 'video' | 'reading' | 'quiz';
};

const mockChapters: Chapter[] = [
  {
    id: '1',
    title: 'Giới thiệu về React',
    duration: 45,
    lectures: [
      {
        id: '1-1',
        title: 'React là gì?',
        duration: 10,
        completed: true,
        type: 'video',
      },
      {
        id: '1-2',
        title: 'Tại sao nên học React?',
        duration: 15,
        completed: true,
        type: 'video',
      },
      {
        id: '1-3',
        title: 'Tài liệu đọc thêm',
        duration: 20,
        completed: false,
        type: 'reading',
      },
    ],
  },
  {
    id: '2',
    title: 'Cài đặt và Setup',
    duration: 30,
    lectures: [
      {
        id: '2-1',
        title: 'Cài đặt Node.js',
        duration: 10,
        completed: true,
        type: 'video',
      },
      {
        id: '2-2',
        title: 'Tạo project React đầu tiên',
        duration: 20,
        completed: false,
        type: 'video',
      },
    ],
  },
  {
    id: '3',
    title: 'JSX và Components',
    duration: 60,
    lectures: [
      {
        id: '3-1',
        title: 'Hiểu về JSX',
        duration: 20,
        completed: false,
        type: 'video',
      },
      {
        id: '3-2',
        title: 'Tạo Component đầu tiên',
        duration: 25,
        completed: false,
        type: 'video',
      },
      {
        id: '3-3',
        title: 'Bài tập thực hành',
        duration: 15,
        completed: false,
        type: 'quiz',
      },
    ],
  },
  {
    id: '4',
    title: 'State và Props',
    duration: 75,
    lectures: [
      {
        id: '4-1',
        title: 'Quản lý State',
        duration: 30,
        completed: false,
        type: 'video',
      },
      {
        id: '4-2',
        title: 'Truyền Props',
        duration: 25,
        completed: false,
        type: 'video',
      },
      {
        id: '4-3',
        title: 'Bài tập thực hành',
        duration: 20,
        completed: false,
        type: 'quiz',
      },
    ],
  },
];

const mockCourse = {
  id: '1',
  title: 'Khóa học React từ cơ bản đến nâng cao',
  progress: 35,
  totalLectures: 12,
  completedLectures: 4,
  totalDuration: 210,
  remainingDuration: 136,
};

export function LearningPage() {
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(
    mockChapters[0]?.lectures[0] || null,
  );
  const [activeTab, setActiveTab] = useState<string>('content');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getLectureIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <IconVideo size={16} />;
      case 'reading':
        return <IconFileText size={16} />;
      case 'quiz':
        return <IconNote size={16} />;
      default:
        return <IconPlay size={16} />;
    }
  };

  const totalLectures = mockChapters.reduce(
    (acc, chapter) => acc + chapter.lectures.length,
    0,
  );
  const completedLectures = mockChapters.reduce(
    (acc, chapter) =>
      acc + chapter.lectures.filter(lec => lec.completed).length,
    0,
  );

  return (
    <Container size="xl" py="xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar - Course Content */}
        <div className="lg:col-span-1">
          <Card padding="md" radius="md" withBorder className="sticky top-4">
            <Stack gap="md">
              <Title order={4}>Nội dung khóa học</Title>
              <Progress
                value={mockCourse.progress}
                size="sm"
                radius="xl"
                label={`${mockCourse.progress}% hoàn thành`}
              />
              <Text size="sm" c="dimmed">
                {completedLectures}
                /
                {totalLectures}
                {' '}
                bài học đã hoàn thành
              </Text>

              <ScrollArea h={600}>
                <Accordion
                  defaultValue={mockChapters[0]?.id}
                  variant="separated"
                  radius="md"
                >
                  {mockChapters.map(chapter => (
                    <Accordion.Item key={chapter.id} value={chapter.id}>
                      <Accordion.Control>
                        <Group justify="space-between" className="w-full pr-2">
                          <Text size="sm" fw={500}>
                            {chapter.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDuration(chapter.duration)}
                          </Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="xs" mt="xs">
                          {chapter.lectures.map(lecture => (
                            <Button
                              key={lecture.id}
                              variant={
                                activeLecture?.id === lecture.id
                                  ? 'light'
                                  : 'subtle'
                              }
                              color={
                                activeLecture?.id === lecture.id
                                  ? 'blue'
                                  : 'gray'
                              }
                              justify="space-between"
                              fullWidth
                              leftSection={
                                lecture.completed
                                  ? (
                                      <IconCheck
                                        size={16}
                                        className="text-green-600"
                                      />
                                    )
                                  : (
                                      getLectureIcon(lecture.type)
                                    )
                              }
                              rightSection={(
                                <Text size="xs" c="dimmed">
                                  {formatDuration(lecture.duration)}
                                </Text>
                              )}
                              onClick={() => setActiveLecture(lecture)}
                              className="h-auto py-2"
                            >
                              {lecture.title}
                            </Button>
                          ))}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </ScrollArea>
            </Stack>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Stack gap="md">
            {/* Course Header */}
            <Card padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between" wrap="wrap">
                  <Title order={2}>{mockCourse.title}</Title>
                  <Badge color="blue" size="lg">
                    Đang học
                  </Badge>
                </Group>
                <Group gap="md">
                  <Group gap={4}>
                    <IconClock size={16} />
                    <Text size="sm" c="dimmed">
                      Còn lại:
                      {' '}
                      {formatDuration(mockCourse.remainingDuration)}
                    </Text>
                  </Group>
                  <Group gap={4}>
                    <IconBook size={16} />
                    <Text size="sm" c="dimmed">
                      {mockCourse.completedLectures}
                      /
                      {mockCourse.totalLectures}
                      {' '}
                      bài học
                    </Text>
                  </Group>
                </Group>
                <Progress
                  value={mockCourse.progress}
                  size="lg"
                  radius="xl"
                  label={`${mockCourse.progress}% hoàn thành`}
                />
              </Stack>
            </Card>

            {/* Video/Content Player */}
            <Card padding={0} radius="md" withBorder overflow="hidden">
              <Box className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ActionIcon
                    size={80}
                    radius="xl"
                    variant="filled"
                    color="blue"
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <IconPlay size={40} fill="white" />
                  </ActionIcon>
                </div>
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <Text c="white" fw={600} size="lg">
                    {activeLecture?.title || 'Chọn bài học để bắt đầu'}
                  </Text>
                </div>
              </Box>

              {/* Tabs for Content, Notes, Discussion */}
              <Tabs value={activeTab} onChange={setActiveTab} defaultValue="content">
                <Tabs.List grow>
                  <Tabs.Tab value="content" leftSection={<IconBook size={16} />}>
                    Nội dung
                  </Tabs.Tab>
                  <Tabs.Tab value="notes" leftSection={<IconNote size={16} />}>
                    Ghi chú
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="discussion"
                    leftSection={<IconMessageCircle size={16} />}
                  >
                    Thảo luận
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="content" p="md">
                  <Stack gap="md">
                    <Title order={4}>Mô tả bài học</Title>
                    <Text>
                      {activeLecture
                        ? `Trong bài học này, bạn sẽ tìm hiểu về ${activeLecture.title}. Đây là một phần quan trọng trong khóa học.`
                        : 'Chọn một bài học để xem nội dung'}
                    </Text>
                    {activeLecture && (
                      <Group>
                        <Badge variant="light" color="blue">
                          {activeLecture.type === 'video'
                            ? 'Video'
                            : activeLecture.type === 'reading'
                              ? 'Đọc'
                              : 'Bài tập'}
                        </Badge>
                        <Badge variant="light" color="gray">
                          {formatDuration(activeLecture.duration)}
                        </Badge>
                        {activeLecture.completed && (
                          <Badge variant="light" color="green">
                            Đã hoàn thành
                          </Badge>
                        )}
                      </Group>
                    )}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="notes" p="md">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Title order={4}>Ghi chú của bạn</Title>
                      <Button size="sm" variant="light">
                        Thêm ghi chú
                      </Button>
                    </Group>
                    <Card padding="md" radius="md" withBorder>
                      <Text size="sm" c="dimmed" ta="center" py="xl">
                        Chưa có ghi chú nào. Hãy thêm ghi chú đầu tiên của bạn!
                      </Text>
                    </Card>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="discussion" p="md">
                  <Stack gap="md">
                    <Title order={4}>Thảo luận</Title>
                    <Card padding="md" radius="md" withBorder>
                      <Text size="sm" c="dimmed" ta="center" py="xl">
                        Chưa có thảo luận nào. Hãy là người đầu tiên đặt câu hỏi!
                      </Text>
                    </Card>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Card>

            {/* Navigation */}
            <Group justify="space-between">
              <Button variant="subtle" leftSection={<IconChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />}>
                Bài trước
              </Button>
              <Button
                variant="filled"
                rightSection={<IconChevronRight size={16} />}
                onClick={() => {
                  // Mark as completed logic here
                }}
              >
                Đánh dấu hoàn thành
              </Button>
              <Button variant="subtle" rightSection={<IconChevronRight size={16} />}>
                Bài tiếp theo
              </Button>
            </Group>
          </Stack>
        </div>
      </div>
    </Container>
  );
}
