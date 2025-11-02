'use client';

import { Button, Container, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationTest() {
  const notifications = useNotifications();
  const [notificationId, setNotificationId] = useState<string>('');

  const showSuccess = () => {
    notifications.show({
      title: 'Thành công',
      message: 'Thao tác đã được thực hiện thành công!',
      color: 'green',
      autoClose: 3000,
    });
  };

  const showError = () => {
    notifications.show({
      title: 'Lỗi',
      message: 'Đã xảy ra lỗi khi thực hiện thao tác!',
      color: 'red',
      autoClose: 5000,
    });
  };

  const showInfo = () => {
    notifications.show({
      title: 'Thông tin',
      message: 'Đây là thông báo thông tin',
      color: 'blue',
      autoClose: 4000,
    });
  };

  const showWarning = () => {
    notifications.show({
      title: 'Cảnh báo',
      message: 'Đây là thông báo cảnh báo',
      color: 'yellow',
      autoClose: 4000,
    });
  };

  const showLoading = () => {
    const id = notifications.show({
      title: 'Đang tải',
      message: 'Đang xử lý, vui lòng đợi...',
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });

    setNotificationId(id);

    // Tự động cập nhật sau 3 giây
    setTimeout(() => {
      notifications.update(id, {
        title: 'Hoàn thành',
        message: 'Tải dữ liệu thành công!',
        color: 'green',
        loading: false,
        autoClose: 3000,
        withCloseButton: true,
      });
      setNotificationId('');
    }, 3000);
  };

  const showUpdateExample = () => {
    const id = notifications.show({
      title: 'Đang xử lý',
      message: 'Bắt đầu xử lý...',
      color: 'blue',
      autoClose: false,
    });

    setTimeout(() => {
      notifications.update(id, {
        title: 'Đã cập nhật',
        message: 'Thông báo đã được cập nhật!',
        color: 'green',
        autoClose: 3000,
      });
    }, 2000);
  };

  const showWithCallback = () => {
    notifications.show({
      title: 'Thông báo với callback',
      message: 'Callback đã được gọi (kiểm tra console)',
      color: 'cyan',
      onOpen: () => {
        console.warn('Notification opened');
      },
      onClose: () => {
        console.warn('Notification closed');
      },
      autoClose: 3000,
    });
  };

  const showWithCustomStyle = () => {
    notifications.show({
      title: 'Thông báo tùy chỉnh',
      message: 'Thông báo với style và class tùy chỉnh',
      color: 'violet',
      className: 'custom-notification',
      style: { backgroundColor: '#f0f0f0' },
      autoClose: 4000,
    });
  };

  const showDifferentPositions = (position: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center') => {
    notifications.show({
      title: `Vị trí: ${position}`,
      message: `Thông báo này hiển thị ở vị trí ${position}`,
      color: 'indigo',
      position,
      autoClose: 3000,
    });
  };

  const hideNotification = () => {
    if (notificationId) {
      notifications.hide(notificationId);
      setNotificationId('');
    } else {
      notifications.show({
        title: 'Lỗi',
        message: 'Không có notification ID để ẩn',
        color: 'red',
        autoClose: 2000,
      });
    }
  };

  const cleanAll = () => {
    notifications.clean();
    notifications.show({
      title: 'Đã xóa',
      message: 'Tất cả thông báo đã được xóa',
      color: 'blue',
      autoClose: 2000,
    });
  };

  const cleanQueue = () => {
    notifications.cleanQueue();
    notifications.show({
      title: 'Đã xóa queue',
      message: 'Tất cả thông báo trong hàng đợi đã được xóa',
      color: 'teal',
      autoClose: 2000,
    });
  };

  const showMultipleColors = () => {
    const colors: Array<'blue' | 'green' | 'red' | 'yellow' | 'grape' | 'violet' | 'cyan' | 'pink' | 'orange' | 'teal' | 'lime' | 'indigo'> = [
      'blue',
      'green',
      'red',
      'yellow',
      'grape',
      'violet',
    ];

    colors.forEach((color, index) => {
      setTimeout(() => {
        notifications.show({
          title: `Màu ${color}`,
          message: `Thông báo với màu ${color}`,
          color,
          autoClose: 2000,
        });
      }, index * 300);
    });
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={1}>Thử nghiệm Notifications</Title>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">
              Các loại thông báo cơ bản
            </Title>
            <Group gap="md">
              <Button onClick={showSuccess} color="green">
                Thành công (Success)
              </Button>
              <Button onClick={showError} color="red">
                Lỗi (Error)
              </Button>
              <Button onClick={showInfo} color="blue">
                Thông tin (Info)
              </Button>
              <Button onClick={showWarning} color="yellow">
                Cảnh báo (Warning)
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">
              Loading & Update
            </Title>
            <Group gap="md">
              <Button onClick={showLoading} color="cyan">
                Loading (Tự động cập nhật)
              </Button>
              <Button onClick={showUpdateExample} color="violet">
                Update Notification
              </Button>
              <Button onClick={hideNotification} color="gray" disabled={!notificationId}>
                Ẩn Notification
              </Button>
            </Group>
            {notificationId && (
              <TextInput
                label="Notification ID hiện tại"
                value={notificationId}
                readOnly
                size="sm"
              />
            )}
          </Stack>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">
              Tính năng nâng cao
            </Title>
            <Group gap="md">
              <Button onClick={showWithCallback} color="cyan">
                Callback (Check Console)
              </Button>
              <Button onClick={showWithCustomStyle} color="violet">
                Custom Style
              </Button>
              <Button onClick={showMultipleColors} color="indigo">
                Nhiều màu cùng lúc
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">
              Các vị trí hiển thị
            </Title>
            <Group gap="md">
              <Button onClick={() => showDifferentPositions('top-left')} size="sm">
                Top Left
              </Button>
              <Button onClick={() => showDifferentPositions('top-center')} size="sm">
                Top Center
              </Button>
              <Button onClick={() => showDifferentPositions('top-right')} size="sm">
                Top Right
              </Button>
              <Button onClick={() => showDifferentPositions('bottom-left')} size="sm">
                Bottom Left
              </Button>
              <Button onClick={() => showDifferentPositions('bottom-center')} size="sm">
                Bottom Center
              </Button>
              <Button onClick={() => showDifferentPositions('bottom-right')} size="sm">
                Bottom Right
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">
              Quản lý Notifications
            </Title>
            <Group gap="md">
              <Button onClick={cleanAll} color="red" variant="outline">
                Xóa tất cả (Clean All)
              </Button>
              <Button onClick={cleanQueue} color="orange" variant="outline">
                Xóa Queue (Clean Queue)
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
