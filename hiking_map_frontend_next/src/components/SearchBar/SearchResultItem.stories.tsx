import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import SearchResultItem from './SearchResultItem';

const meta: Meta<typeof SearchResultItem> = {
  title: 'components/SearchBar/SearchResultItem',
  component: SearchResultItem,
  args: {
    onSelect: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof SearchResultItem>;

export const UserWithAvatar: Story = {
  args: {
    item: { type: 'user', username: 'charliewu', displayName: 'Charlie Wu', avatar: 'https://i.pravatar.cc/64', matchReason: 'name' },
  },
};

export const UserWithoutAvatar: Story = {
  args: {
    item: { type: 'user', username: 'charliewu', displayName: 'Charlie Wu', matchReason: 'name' },
  },
};

export const TrailMatchedByName: Story = {
  args: {
    item: { type: 'trail', slug: 'xueshan-main-peak', displayName: '雪山主峰步道', matchReason: 'name' },
  },
};

export const TrailMatchedByField: Story = {
  args: {
    item: { type: 'trail', slug: 'xueshan-main-peak', displayName: '雪山主峰步道', matchReason: 'field' },
  },
};
