import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/nextjs-vite';
import * as projectAnnotations from './preview';

// Mock environment variables for Storybook tests
if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = 'test_secret_key';
}
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test_publishable_key';
}

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
