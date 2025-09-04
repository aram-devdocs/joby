import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { useState } from "react";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel"],
    },
    disabled: {
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: "300px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const InputWithState = (args: any) => {
  const [value, setValue] = useState("");
  return <Input {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InputWithState,
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  render: InputWithState,
  args: {
    label: "Your Name",
    placeholder: "John Doe",
  },
};

export const Email: Story = {
  render: InputWithState,
  args: {
    type: "email",
    label: "Email Address",
    placeholder: "user@example.com",
  },
};

export const Password: Story = {
  render: InputWithState,
  args: {
    type: "password",
    label: "Password",
    placeholder: "Enter password",
  },
};

export const Disabled: Story = {
  render: InputWithState,
  args: {
    label: "Disabled Input",
    placeholder: "Cannot edit this",
    disabled: true,
  },
};

export const Number: Story = {
  render: InputWithState,
  args: {
    type: "number",
    label: "Age",
    placeholder: "25",
  },
};
