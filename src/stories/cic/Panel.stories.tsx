import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from '../../components/cic/Panel';
import DensityWrapper from './DensityWrapper';
import { DarkModeWrapper } from '../utils/DarkModeWrapper';

const meta = {
  title: 'CIC/Panel',
  component: Panel,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DarkModeWrapper>
      <Panel>Panel content</Panel>
    </DarkModeWrapper>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <DarkModeWrapper>
      <Panel padding="none">No padding</Panel>
    </DarkModeWrapper>
  ),
};

export const NoElevation: Story = {
  render: () => (
    <DarkModeWrapper>
      <Panel elevation="none">Flat panel</Panel>
    </DarkModeWrapper>
  ),
};

export const Density: Story = {
  render: () => (
    <DensityWrapper>
      <Panel>Density test</Panel>
    </DensityWrapper>
  ),
};
