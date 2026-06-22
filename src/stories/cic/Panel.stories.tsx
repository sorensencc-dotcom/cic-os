import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from '../../components/cic/Panel';
import DensityWrapper from './DensityWrapper';

const meta = {
  title: 'Components/Panel',
  component: Panel,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Panel content goes here' },
};

export const WithHeading: Story = {
  render: () => (
    <Panel>
      <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Panel Title</div>
      <div>This is the panel content with some information.</div>
    </Panel>
  ),
};

export const Nested: Story = {
  render: () => (
    <Panel>
      <div style={{ marginBottom: '1rem' }}>Outer panel</div>
      <Panel style={{ background: 'var(--cic-color-background-secondary)' }}>
        <div>Nested inner panel</div>
      </Panel>
    </Panel>
  ),
};

export const DensityModes: Story = {
  render: () => (
    <DensityWrapper>
      <Panel style={{ width: '250px' }}>Panel content</Panel>
    </DensityWrapper>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Light</div>
        <Panel style={{ width: '250px' }}>Panel in light mode</Panel>
      </div>
      <div style={{ padding: '1rem', background: '#1a1a1a', color: '#fff', borderRadius: '4px' }} data-theme="dark">
        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Dark</div>
        <Panel style={{ width: '250px' }}>Panel in dark mode</Panel>
      </div>
    </div>
  ),
};
