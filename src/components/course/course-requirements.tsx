import { List, Paper, Stack, Text, Title } from '@mantine/core';

type CourseRequirementsProps = {
  requirements?: string[];
};

export function CourseRequirements({ requirements }: CourseRequirementsProps) {
  // Mock data if not provided
  const reqs = requirements ?? [
    'Máy tính có kết nối internet',
    'Không cần kiến thức nền tảng trước đó',
    'Tinh thần học hỏi và sẵn sàng thực hành',
    'Cam kết hoàn thành khóa học',
  ];

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Title order={3}>Yêu cầu</Title>
        <List spacing="sm">
          {reqs.map((req, index) => (
            <List.Item key={index}>
              <Text size="sm" c="dimmed">
                {req}
              </Text>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Paper>
  );
}
