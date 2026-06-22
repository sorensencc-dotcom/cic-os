import type { Meta, StoryObj } from '@storybook/react';
import { Row } from '../../components/cic/Row';
import DensityWrapper from './DensityWrapper';
import DarkModeWrapper from './DarkModeWrapper';

const meta = {
  title: 'CIC/Row',
  component: Row,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Row>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DarkModeWrapper>
      <Row>Row content</Row>
    </DarkModeWrapper>
  ),
};

export const Selected: Story = {
  render: () => (
    <DarkModeWrapper>
      <Row selected>Selected row</Row>
    </DarkModeWrapper>
  ),
};

export const Density: Story = {
  render: () => (
    <DensityWrapper>
      <Row>Density test</Row>
    </DensityWrapper>
  ),
};
