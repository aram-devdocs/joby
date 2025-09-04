import type { Meta, StoryObj } from "@storybook/react";
import { TextArea } from "./text-area";
import { useState } from "react";

const meta = {
  title: "Atoms/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    rows: {
      control: { type: "number", min: 1, max: 20, step: 1 },
    },
    disabled: {
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const TextAreaWithState = (args: any) => {
  const [value, setValue] = useState("");
  return <TextArea {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: TextAreaWithState,
  args: {
    placeholder: "Enter your message here...",
  },
};

export const WithLabel: Story = {
  render: TextAreaWithState,
  args: {
    label: "Comments",
    placeholder: "Share your thoughts...",
  },
};

export const WithInitialValue: Story = {
  render: (args) => {
    const [value, setValue] = useState(
      "This is some initial text that appears in the textarea.",
    );
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Description",
  },
};

export const CustomRows: Story = {
  render: TextAreaWithState,
  args: {
    label: "Extended Text",
    rows: 8,
    placeholder: "This textarea has 8 rows...",
  },
};

export const MinimalRows: Story = {
  render: TextAreaWithState,
  args: {
    label: "Short Note",
    rows: 2,
    placeholder: "Brief input area...",
  },
};

export const Disabled: Story = {
  render: () => {
    const [value] = useState("This textarea is disabled and cannot be edited.");
    return (
      <TextArea
        value={value}
        onChange={() => {}}
        label="Read Only"
        disabled={true}
      />
    );
  },
};

export const LongContent: Story = {
  render: (args) => {
    const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
nisi ut aliquip ex ea commodo consequat. 

Duis aute irure dolor in reprehenderit in voluptate velit esse 
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat 
cupidatat non proident, sunt in culpa qui officia deserunt mollit 
anim id est laborum.`;

    const [value, setValue] = useState(longText);
    return <TextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Article Content",
    rows: 10,
  },
};

export const FormExample: Story = {
  render: TextAreaWithState,
  args: {
    label: "Feedback",
    placeholder: "We'd love to hear your feedback about our service...",
    rows: 5,
  },
};
