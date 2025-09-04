import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Core/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A skeleton loading component that provides animated placeholders while content is loading. Perfect for improving perceived performance.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-4 w-[250px]",
  },
};

export const Circle: Story = {
  args: {
    className: "h-12 w-12 rounded-full",
  },
};

export const Square: Story = {
  args: {
    className: "h-24 w-24",
  },
};

export const TextLines: Story = {
  render: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="w-[350px] rounded-lg border p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <div className="w-[300px] rounded-lg border p-4">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-5 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <div className="w-full space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[70%]" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  ),
};

export const Table: Story = {
  render: () => (
    <div className="w-[500px]">
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-[50px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const BlogPost: Story = {
  render: () => (
    <div className="w-[600px] space-y-6">
      <Skeleton className="h-8 w-[70%]" />
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[85%]" />
      </div>
    </div>
  ),
};

export const MediaCard: Story = {
  render: () => (
    <div className="w-[350px] rounded-lg border overflow-hidden">
      <Skeleton className="h-[200px] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-[80%]" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[90%]" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-8 w-[80px]" />
        </div>
      </div>
    </div>
  ),
};

export const ProductGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-[800px]">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-3 w-[60%]" />
          <Skeleton className="h-6 w-[40%]" />
        </div>
      ))}
    </div>
  ),
};

export const Navigation: Story = {
  render: () => (
    <div className="w-[250px] space-y-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      ))}
    </div>
  ),
};

export const Comment: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex space-x-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div className="w-[900px] space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-[150px]" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
