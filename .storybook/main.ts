import type { StorybookConfig } from '@storybook/react/webpack5';

const config: StorybookConfig = {
  framework: '@storybook/react/webpack5',
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-docs'],
  docs: {
    autodocs: true,
  },
  staticDirs: ['./public'],
};

export default config;
