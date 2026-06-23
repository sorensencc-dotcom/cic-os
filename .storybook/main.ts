import type { StorybookConfig } from '@storybook/react';

const config: StorybookConfig = {
  framework: '@storybook/react',
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-docs'],
  docs: {
    autodocs: true,
  },
  staticDirs: ['./public'],
};

export default config;
