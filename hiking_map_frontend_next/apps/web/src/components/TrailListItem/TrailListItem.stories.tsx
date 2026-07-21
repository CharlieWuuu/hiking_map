import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TrailListItem from './TrailListItem';

const meta: Meta<typeof TrailListItem> = {
  title: 'components/TrailListItem',
  component: TrailListItem,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  args: {
    href: '/profile/charliewu/hikes/xueshan-main-peak-20260312',
    name: '雪山主峰步道',
    county: '台中市',
    town: '和平區',
    date: '2026-03-12',
    distanceKm: 10.5,
  },
};

export default meta;

type Story = StoryObj<typeof TrailListItem>;

export const Default: Story = {};

// 官方路線目錄（例如搜尋結果）沒有「某次紀錄」的日期/距離，這兩個欄位是 optional
export const WithoutStats: Story = {
  args: {
    href: '/trails/xueshan-main-peak',
    date: undefined,
    distanceKm: undefined,
  },
};
