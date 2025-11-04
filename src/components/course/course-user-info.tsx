import { Avatar, Badge, Group, Paper, Stack, Text } from '@mantine/core';

export function CourseUserInfo() {
  return (
    <Paper p="lg" withBorder>
      <Stack gap="md">
        <Group>
          <Avatar
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Instructor"
            size={80}
            radius="md"
          />
          <Stack gap={4}>
            <Group gap="xs">
              <Text size="lg" fw={600}>
                Nguyễn Văn An
              </Text>
              <Badge color="blue" variant="light">
                Giảng viên
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Chuyên gia lập trình Full-stack
            </Text>
            <Group gap="lg" mt={4}>
              <Group gap={4}>
                <Text size="sm" fw={500}>
                  4.8
                </Text>
                <Text size="sm" c="dimmed">
                  ⭐ Đánh giá
                </Text>
              </Group>
              <Group gap={4}>
                <Text size="sm" fw={500}>
                  15,234
                </Text>
                <Text size="sm" c="dimmed">
                  Học viên
                </Text>
              </Group>
              <Group gap={4}>
                <Text size="sm" fw={500}>
                  42
                </Text>
                <Text size="sm" c="dimmed">
                  Khóa học
                </Text>
              </Group>
            </Group>
          </Stack>
        </Group>

        <Text size="sm">
          Với hơn 10 năm kinh nghiệm trong ngành phát triển phần mềm, tôi đã giúp hàng nghìn học viên
          chinh phục các công nghệ hiện đại và xây dựng sự nghiệp thành công trong lĩnh vực IT.
        </Text>
      </Stack>
    </Paper>
  );
}
