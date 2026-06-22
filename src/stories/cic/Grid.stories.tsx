import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '../../components/cic/Grid';
import { Card } from '../../components/cic/Card';
import DensityWrapper from './DensityWrapper';
import DarkModeWrapper from './DarkModeWrapper';

const meta = {
  title: 'CIC/Grid',
  component: Grid,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwelveColumn: Story = {
  render: () => (
    <DarkModeWrapper>
      <Grid cols={12}>
        <div style={{ gridColumn: 'span 6' }}>
          <Card>6 columns</Card>
        </div>
        <div style={{ gridColumn: 'span 6' }}>
          <Card>6 columns</Card>
        </div>
      </Grid>
    </DarkModeWrapper>
  ),
};

export const SixColumn: Story = {
  render: () => (
    <DarkModeWrapper>
      <Grid cols={6}>
        <div style={{ gridColumn: 'span 3' }}>
          <Card>3 columns</Card>
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <Card>3 columns</Card>
        </div>
      </Grid>
    </DarkModeWrapper>
  ),
};

export const Density: Story = {
  render: () => (
    <DensityWrapper>
      <Grid cols={12}>
        <div style={{ gridColumn: 'span 4' }}>
          <Card>Density test</Card>
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <Card>Density test</Card>
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <Card>Density test</Card>
        </div>
      </Grid>
    </DensityWrapper>
  ),
};
