import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import UserListItem from './UserListItem';

const meta: Meta<typeof UserListItem> = {
  title: 'components/UserListItem',
  component: UserListItem,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/' },
    },
  },
  args: {
    href: '/profile/charliewu',
    displayName: 'Charlie Wu',
  },
};

export default meta;

type Story = StoryObj<typeof UserListItem>;

export const WithAvatar: Story = {
  args: { avatar: 'https://i.pravatar.cc/64', subtitle: '資深' },
};

export const WithoutAvatar: Story = {
  args: { subtitle: '新手' },
};

export const NoSubtitle: Story = {};
