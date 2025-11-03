"use client";

import { Box, Group, HoverCard, ScrollArea, Text } from '@mantine/core';
import { useCategoryList } from '@/components/category/useCategory';

function SubcategoryList({ parentId }: { parentId: string }) {
  const subQuery = useCategoryList({ parentId, isSubCategory: true, limit: 20 });
  const items = subQuery.data?.data?.items ?? [];

  return (
    <ScrollArea.Autosize mah={280} type="auto" style={{ padding: 8 }}>
      <Group wrap="wrap" gap="sm">
        {items.length === 0 ? (
          <Text c="dimmed" size="sm">Không có danh mục con</Text>
        ) : (
          items.map((c) => (
            <Box key={c.id} style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--mantine-color-dark-6)' }}>
              <Text size="sm">{c.name}</Text>
            </Box>
          ))
        )}
      </Group>
    </ScrollArea.Autosize>
  );
}

export default function SubheaderCategories() {
  const rootQuery = useCategoryList({ isSubCategory: false, limit: 50 });
  const roots = rootQuery.data?.data?.items ?? [];

  return (
    <Box style={{ borderTop: '1px solid var(--mantine-color-gray-3)', borderBottom: '1px solid var(--mantine-color-gray-3)', background: 'var(--mantine-color-dark-8)' }}>
      <ScrollArea type="never">
        <Group gap="lg" p="md" justify="center" wrap="nowrap">
          {roots.map((cat) => (
            <HoverCard key={cat.id} shadow="md" withinPortal openDelay={120} closeDelay={80} position="bottom">
              <HoverCard.Target>
                <Text style={{ cursor: 'pointer' }}>{cat.name}</Text>
              </HoverCard.Target>
              <HoverCard.Dropdown style={{ background: 'var(--mantine-color-dark-7)' }}>
                <SubcategoryList parentId={cat.id} />
              </HoverCard.Dropdown>
            </HoverCard>
          ))}
        </Group>
      </ScrollArea>
    </Box>
  );
}
