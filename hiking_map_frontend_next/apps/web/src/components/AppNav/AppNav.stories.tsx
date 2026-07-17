import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AppNav from './AppNav';

const meta: Meta<typeof AppNav> = {
  title: 'components/AppNav',
  component: AppNav,
};

export default meta;

type Story = StoryObj<typeof AppNav>;

export const Default: Story = {};
