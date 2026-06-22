import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../components/cic/Card';
import DensityWrapper from './DensityWrapper';
import DarkModeWrapper from './DarkModeWrapper';

const meta = {
  title: 'CIC/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DarkModeWrapper>
      <Card>Default card</Card>
    </DarkModeWrapper>
  ),
};

export const Subtle: Story = {
  render: () => (
    <DarkModeWrapper>
      <Card variant="subtle">Subtle card</Card>
    </DarkModeWrapper>
  ),
};

export const Density: Story = {
  render: () => (
    <DensityWrapper>
      <Card>Density test</Card>
    </DensityWrapper>
  ),
};
