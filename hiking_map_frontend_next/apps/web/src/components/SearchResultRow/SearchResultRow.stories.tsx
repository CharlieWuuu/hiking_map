import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SearchResultRow from './SearchResultRow';

const meta: Meta<typeof SearchResultRow> = {
  title: 'components/SearchResultRow',
  component: SearchResultRow,
};

export default meta;

type Story = StoryObj<typeof SearchResultRow>;

export const User: Story = {
  args: {
    item: { type: 'user', username: 'demo', displayName: '示範使用者', level: '新手', matchReason: 'name' },
  },
};

export const Trail: Story = {
  args: {
    item: {
      type: 'trail',
      slug: 'trail-1',
      displayName: '象山親山步道',
      county: '台北市',
      town: '信義區',
      matchReason: 'name',
    },
  },
};
