import { List, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

type CourseOverviewProps = {
  learningObjectives?: string[];
};

export function CourseOverview({ learningObjectives }: CourseOverviewProps) {
  // Mock data if not provided
  const objectives = learningObjectives ?? [
    'Hiểu được các khái niệm cơ bản và nâng cao',
    'Xây dựng được các dự án thực tế từ đầu đến cuối',
    'Nắm vững các best practices trong ngành',
    'Áp dụng kiến thức vào công việc thực tế',
    'Làm việc hiệu quả với các công cụ hiện đại',
  ];

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Title order={3}>Bạn sẽ học được gì?</Title>
        <List
          spacing="sm"
          icon={(
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
          )}
        >
          {objectives.map((objective, index) => (
            <List.Item key={index}>
              <Text size="sm">{objective}</Text>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Paper>
  );
}
