'use client';

import { createTheme, MantineProvider as MantineProviderLib } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  /** Put your mantine theme override here */
});

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProviderLib theme={theme}>
      <Notifications />
      {children}
    </MantineProviderLib>
  );
}
