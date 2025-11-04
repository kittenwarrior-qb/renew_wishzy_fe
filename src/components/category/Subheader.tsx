'use client';

import { Box, Group, ScrollArea, Text, useMantineColorScheme } from '@mantine/core';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useCategoryList } from '@/components/category/useCategory';

function SubcategoryPreloader({ parentId }: { parentId: string }) {
  useCategoryList({ parentId, isSubCategory: true, limit: 20 });
  return null;
}

function SubcategoryListWithData({ parentId }: { parentId: string }) {
  const items = useSubcategoryData(parentId);
  return <SubcategoryList items={items} />;
}

function SubcategoryList({ items }: { items: Array<{ id: string; name: string }> }) {
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);
  return (
    <ScrollArea type="never">
      <Group gap="lg" p="md" justify="center" wrap="nowrap">
        {items.length === 0
          ? (
              <Text c="dimmed" size="sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Không có danh mục con</Text>
            )
          : (
              items.map(c => (
                <Text
                  key={c.id}
                  size="sm"
                  onMouseEnter={() => setHoveredSubId(c.id)}
                  onMouseLeave={() => setHoveredSubId(null)}
                  style={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    color: hoveredSubId === c.id ? 'var(--mantine-color-orange-6)' : 'white',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {c.name}
                </Text>
              ))
            )}
      </Group>
    </ScrollArea>
  );
}

function useSubcategoryData(parentId: string) {
  const query = useCategoryList({ parentId, isSubCategory: true, limit: 20 });
  const items = query.data?.data?.items ?? [];
  return items;
}

export default function SubheaderCategories() {
  const rootQuery = useCategoryList({ isSubCategory: false, limit: 50 });
  const roots = rootQuery.data?.data?.items ?? [];
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
  const [arrowPosition, setArrowPosition] = useState<number | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const secondRowRef = useRef<HTMLDivElement | null>(null);
  const hoverClearTimerRef = useRef<number | null>(null);

  const calculateArrowPosition = useCallback((categoryId: string) => {
    if (categoryRefs.current[categoryId] && secondRowRef.current) {
      const element = categoryRefs.current[categoryId];
      const secondRow = secondRowRef.current;
      if (element && secondRow) {
        const elementRect = element.getBoundingClientRect();
        const secondRowRect = secondRow.getBoundingClientRect();
        const position = elementRect.left - secondRowRect.left + elementRect.width / 2;
        return position;
      }
    }
    return null;
  }, []);

  const handleMouseEnter = useCallback((categoryId: string) => {
    if (hoverClearTimerRef.current) {
      window.clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }
    setHoveredCategoryId(categoryId);
    requestAnimationFrame(() => {
      const position = calculateArrowPosition(categoryId);
      setArrowPosition(position);
    });
  }, [calculateArrowPosition]);

  const handleMouseLeave = useCallback(() => {
    if (hoverClearTimerRef.current) {
      window.clearTimeout(hoverClearTimerRef.current);
    }
    hoverClearTimerRef.current = window.setTimeout(() => {
      setHoveredCategoryId(null);
      setArrowPosition(null);
      hoverClearTimerRef.current = null;
    }, 150);
  }, []);

  const hoveredCategory = roots.find(cat => cat.id === hoveredCategoryId);

  const [firstRowHeight, setFirstRowHeight] = useState(0);
  const firstRowRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (firstRowRef.current) {
        const height = firstRowRef.current.offsetHeight;
        setFirstRowHeight(prev => (prev !== height ? height : prev));
      }
    };

    const element = firstRowRef.current;
    if (element) {
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(element);
      return () => {
        resizeObserver.disconnect();
      };
    }
    return undefined;
  }, [roots.length]);

  // Nếu đang loading hoặc chưa có data, không render gì (hoặc có thể render loading state)
  if (rootQuery.isLoading || !rootQuery.data) {
    return null;
  }

  return (
    <>
      {roots.map(root => (
        <SubcategoryPreloader key={`preloader-${root.id}`} parentId={root.id} />
      ))}

      <Box
        ref={containerRef}
        style={{
          position: 'sticky',
          top: '60px',
          zIndex: 1000,
          background: isDark ? 'var(--mantine-color-dark-7)' : 'white',
          // Top border for home view
          borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--mantine-color-gray-3)',
          // Inset top hairline + soft drop shadow downward for separation
          boxShadow: isDark
            ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 16px -14px rgba(0,0,0,0.6)'
            : 'inset 0 1px 0 rgba(0,0,0,0.06), 0 8px 16px -14px rgba(0,0,0,0.18)',
        }}
      >
        <Box
          ref={firstRowRef}
          data-first-row
          style={{
            background: isDark ? 'var(--mantine-color-dark-7)' : 'white',
            // Remove hard borders; rely on header shadow for separation
          }}
        >
          <ScrollArea type="never">
            <Group gap="lg" p="md" justify="center" wrap="nowrap">
              {roots.length === 0 && (
                <Text c="dimmed" size="sm">Không có danh mục</Text>
              )}
              {roots.length > 0 && roots.map(cat => (
                <Box
                  key={cat.id}
                  ref={(el) => {
                    categoryRefs.current[cat.id] = el;
                  }}
                  onMouseEnter={() => {
                    setHoveredParentId(cat.id);
                    handleMouseEnter(cat.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredParentId(null);
                    handleMouseLeave();
                  }}
                  style={{ position: 'relative' }}
                >
                  <Text
                    size="sm"
                    style={{
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      color: hoveredParentId === cat.id
                        ? 'var(--mantine-color-orange-6)'
                        : isDark
                          ? 'white'
                          : 'var(--mantine-color-dark-9)',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {cat.name}
                  </Text>
                </Box>
              ))}
            </Group>
          </ScrollArea>
        </Box>
      </Box>

      {hoveredCategoryId && hoveredCategory && (
        <Box
          ref={secondRowRef}
          style={{
            position: 'fixed',
            top: `${60 + firstRowHeight}px`,
            left: 0,
            right: 0,
            background: 'var(--mantine-color-dark-9)',
            borderBottom: '1px solid var(--mantine-color-gray-3)',
            width: '100%',
            zIndex: 1001,
          }}
          onMouseEnter={() => hoveredCategoryId && handleMouseEnter(hoveredCategoryId)}
          onMouseLeave={handleMouseLeave}
        >
          {arrowPosition !== null && (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: `${arrowPosition}px`,
                transform: 'translateY(-100%) translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid var(--mantine-color-dark-9)',
                zIndex: 1002,
              }}
            />
          )}
          {hoveredCategoryId && <SubcategoryListWithData parentId={hoveredCategoryId} />}
        </Box>
      )}
    </>
  );
}
