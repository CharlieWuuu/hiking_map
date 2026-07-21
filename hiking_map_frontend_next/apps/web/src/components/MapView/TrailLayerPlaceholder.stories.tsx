import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TrailLayerPlaceholder from './TrailLayerPlaceholder';

const meta: Meta<typeof TrailLayerPlaceholder> = {
  title: 'components/MapView/TrailLayerPlaceholder',
  component: TrailLayerPlaceholder,
};

export default meta;

type Story = StoryObj<typeof TrailLayerPlaceholder>;

export const Default: Story = {};
