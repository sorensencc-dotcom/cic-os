import type { Preview } from '@storybook/react';
import '../design-system/tokens/dark-mode/dark-mode.css';
import '../design-system/tokens/density/density.css';
import './storybook.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
