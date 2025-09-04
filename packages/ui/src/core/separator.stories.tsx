import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta = {
  title: "Core/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <div>Content above</div>
        <Story />
        <div>Content below</div>
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", height: "100px", alignItems: "center" }}>
        <div>Left content</div>
        <Story />
        <div>Right content</div>
      </div>
    ),
  ],
};

export const InList: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <div style={{ padding: "12px 0" }}>Item 1</div>
      <Separator />
      <div style={{ padding: "12px 0" }}>Item 2</div>
      <Separator />
      <div style={{ padding: "12px 0" }}>Item 3</div>
      <Separator />
      <div style={{ padding: "12px 0" }}>Item 4</div>
    </div>
  ),
};

export const InSidebar: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        width: "400px",
        height: "200px",
        backgroundColor: "#f3f4f6",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "150px", padding: "16px" }}>
        <h3 style={{ margin: "0 0 8px 0" }}>Sidebar</h3>
        <p style={{ fontSize: "14px", margin: 0 }}>Navigation items</p>
      </div>
      <Separator orientation="vertical" />
      <div style={{ flex: 1, padding: "16px" }}>
        <h3 style={{ margin: "0 0 8px 0" }}>Main Content</h3>
        <p style={{ fontSize: "14px", margin: 0 }}>Content area</p>
      </div>
    </div>
  ),
};

export const WithSpacing: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <h3 style={{ margin: "0 0 16px 0" }}>Section Title</h3>
      <Separator />
      <p style={{ margin: "16px 0 0 0", fontSize: "14px" }}>
        Section content goes here with proper spacing around the separator.
      </p>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <div style={{ padding: "8px 0" }}>Default separator</div>
      <Separator />
      <div style={{ padding: "8px 0" }}>Thick separator</div>
      <Separator className="h-[2px] bg-gray-400" />
      <div style={{ padding: "8px 0" }}>Dashed separator</div>
      <div
        style={{
          height: "1px",
          background:
            "repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 4px, transparent 4px, transparent 8px)",
        }}
      />
      <div style={{ padding: "8px 0" }}>Content below</div>
    </div>
  ),
};
