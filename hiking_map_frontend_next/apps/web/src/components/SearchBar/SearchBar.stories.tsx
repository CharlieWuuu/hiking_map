import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SearchBar from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'components/SearchBar',
  component: SearchBar,
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {};
