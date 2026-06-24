import type { StorybookConfig } from '@storybook/react';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-docs'],
  docs: {
    autodocs: true,
  },
  staticDirs: ['./public'],
  typescript: {
    check: true,
    checkOptions: {
      esModuleInterop: true,
      skipLibCheck: true,
    },
  },
  webpackFinal: async (config) => {
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    config.module.rules.unshift({
      test: /\.tsx?$/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json',
          compilerOptions: {
            jsx: 'react-jsx',
          },
        },
      },
      exclude: /node_modules/,
    });

    return config;
  },
};

export default config;
