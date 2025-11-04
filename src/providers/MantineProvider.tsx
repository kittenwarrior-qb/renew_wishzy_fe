'use client';

import { createTheme, MantineProvider as MantineProviderLib } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#f5f5f6', // 0
      '#e7e7e9', // 1
      '#cfcfd3', // 2
      '#b7b7bd', // 3
      '#9fa0a7', // 4
      '#878992', // 5
      '#3d3e45', // 6
      '#2b2c31', // 7
      '#1b1c20', // 8
      '#0f1013', // 9
    ],
  },
  components: {
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        // Use filled button with brand color (black-ish)
        variant: 'filled',
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
