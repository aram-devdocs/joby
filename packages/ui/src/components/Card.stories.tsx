import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Button } from "./Button";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minWidth: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <p className="text-gray-600">
        This is a simple card component with some content inside.
      </p>
    ),
  },
};

export const WithTitle: Story = {
  args: {
    title: "Card Title",
    children: (
      <p className="text-gray-600">
        This card has a title and some content below it.
      </p>
    ),
  },
};

export const WithMultipleElements: Story = {
  args: {
    title: "User Profile",
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">Name: John Doe</p>
        <p className="text-gray-600">Email: john@example.com</p>
        <Button variant="primary">Edit Profile</Button>
      </div>
    ),
  },
};

export const WithLongContent: Story = {
  args: {
    title: "Article Preview",
    children: (
      <div className="space-y-3">
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="text-gray-600">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
        </p>
        <div className="pt-2">
          <Button variant="secondary">Read More</Button>
        </div>
      </div>
    ),
  },
};

export const CustomStyling: Story = {
  args: {
    className:
      "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200",
    title: "Styled Card",
    children: (
      <p className="text-gray-700">
        This card has custom styling applied through the className prop.
      </p>
    ),
  },
};
