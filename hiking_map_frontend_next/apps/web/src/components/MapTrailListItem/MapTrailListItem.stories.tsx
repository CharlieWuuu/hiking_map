import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import MapTrailListItem from './MapTrailListItem';

const meta: Meta<typeof MapTrailListItem> = {
  title: 'components/MapTrailListItem',
  component: MapTrailListItem,
  args: {
    name: '雪山主峰步道',
    county: '台中市',
    town: '和平區',
    date: '2026-03-12',
    distanceKm: 10.5,
    isActive: false,
    onMouseEnter: fn(),
    onMouseLeave: fn(),
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof MapTrailListItem>;

export const Default: Story = {};

export const Active: Story = {
  args: { isActive: true },
};
