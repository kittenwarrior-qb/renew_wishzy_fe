'use client';

import { Container, Stack, Text } from '@mantine/core';

export default function Footer() {
  return (
    <Container size="xl" py="md" style={{ marginTop: 'auto' }}>
      <Stack gap="xs" align="center">
        <Text size="sm" c="dimmed">
          © 2024 Wishzy. All rights reserved.
        </Text>
      </Stack>
    </Container>
  );
}
