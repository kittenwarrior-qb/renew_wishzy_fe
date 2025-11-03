'use client';

import { createTheme, MantineProvider as MantineProviderLib } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  components: {
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
    Tabs: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProviderLib theme={theme}>
      <Notifications />
      {children}
    </MantineProviderLib>
  );
}
