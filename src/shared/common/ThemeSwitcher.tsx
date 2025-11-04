'use client';

import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useThemeStore } from '@/stores/useThemeStore';

export const ThemeSwitcher = () => {
  const { colorScheme, setColorScheme } = useThemeStore();
  const mantine = useMantineColorScheme();

  const handleCycle = () => {
    const next = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(next);
    mantine.setColorScheme(next);
  };

  const isDark = colorScheme === 'dark';

  return (
    <Tooltip label={colorScheme} withinPortal zIndex={2000} position="bottom" offset={6}>
      <ActionIcon variant="subtle" size="lg" onClick={handleCycle} aria-label="Toggle theme">
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
};
