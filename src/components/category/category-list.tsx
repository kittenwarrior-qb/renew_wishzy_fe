'use client';

import type { Category } from '@/types/category';
import { Center, Container, Paper, Stack, Text } from '@mantine/core';
import { useCategoryList } from './useCategory';

export function CategoryList() {
  const { data, isLoading, isError, error } = useCategoryList();

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          Đang load nè...
        </Center>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size="xl" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Text c="red" size="lg" ta="center">
            {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải danh sách danh mục'}
          </Text>
        </Paper>
      </Container>
    );
  }

  const categories = data?.data?.items ?? [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        {categories.length === 0
          ? (
              <Paper shadow="md" p="xl" radius="md" withBorder>
                <Text c="dimmed" ta="center" size="lg">
                  Không có danh mục nào
                </Text>
              </Paper>
            )
          : (
              <Stack gap="md">
                {categories.map((category: Category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </Stack>
            )}

      </Stack>
    </Container>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div>
      {category.name}
    </div>
  );
}
