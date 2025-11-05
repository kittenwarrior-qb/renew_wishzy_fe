'use client';

import { Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { InstructorCard } from './instructor-card';
import { mockInstructors } from './mock-instructors';

export function InstructorList() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" align="center">
          <Title order={1} ta="center" fw={700}>
            Đội ngũ giảng viên
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Gặp gỡ những giảng viên tài năng và giàu kinh nghiệm của chúng tôi
          </Text>
        </Stack>

        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing="xl"
        >
          {mockInstructors.map(instructor => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
