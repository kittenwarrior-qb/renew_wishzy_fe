'use client';

import { Avatar, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconEdit, IconUpload } from '@tabler/icons-react';
import { useCurrentUser } from '@/components/user/useUser';
import { useAuthStore } from '@/stores/useAuthStore';

export function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const { data: userData, isLoading } = useCurrentUser();
  const user = userData?.data || authUser;

  const handleUploadAvatar = () => {
    // TODO: 实现上传头像功能
  };

  const handleEditProfile = () => {
    // TODO: 实现编辑资料功能
  };

  const getInitials = (name?: string | null) => {
    if (!name) {
      return 'U';
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Text>Đang tải...</Text>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Text>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Card padding="lg" radius="md" withBorder>
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Avatar
                src={user.avatar}
                size={80}
                radius="xl"
              >
                {!user.avatar && getInitials(user.fullName || user.email)}
              </Avatar>
              <Stack gap={4}>
                <Title order={3}>{user.fullName || user.email}</Title>
                {user.email && (
                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>
                )}
              </Stack>
            </Group>
            <Button
              leftSection={<IconUpload size={18} />}
              onClick={handleUploadAvatar}
              variant="outline"
            >
              Upload Avatar
            </Button>
          </Group>
        </Card>

        {/* Profile Section */}
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={4}>Profile</Title>
              <Button
                leftSection={<IconEdit size={18} />}
                onClick={handleEditProfile}
                variant="outline"
              >
                Edit Profile
              </Button>
            </Group>

            <Stack gap="sm" mt="md">
              <Group justify="space-between">
                <Text fw={500}>Email:</Text>
                <Text c="dimmed">{user.email || '—'}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500}>Username:</Text>
                <Text c="dimmed">{user.email?.split('@')[0] || '—'}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500}>Display Name:</Text>
                <Text c="dimmed">{user.fullName || '—'}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500}>Location:</Text>
                <Text c="dimmed">—</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500}>Bio:</Text>
                <Text c="dimmed">—</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500}>Website:</Text>
                <Text c="dimmed">—</Text>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
