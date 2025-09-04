import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";
import { useState } from "react";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
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
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const SelectWithState = (args: Partial<SelectProps>) => {
  const [value, setValue] = useState("");
  return (
    <Select {...(args as SelectProps)} value={value} onChange={setValue} />
  );
};

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
];

const sizeOptions = [
  { value: "xs", label: "Extra Small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

export const Default: Story = {
  render: SelectWithState,
  args: {
    options: countryOptions,
    placeholder: "Select a country",
  },
};

export const WithLabel: Story = {
  render: SelectWithState,
  args: {
    label: "Country",
    options: countryOptions,
    placeholder: "Choose your country",
  },
};

export const WithSelectedValue: Story = {
  render: (args) => {
    const [value, setValue] = useState("ca");
    return <Select {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Country",
    options: countryOptions,
  },
};

export const Disabled: Story = {
  render: SelectWithState,
  args: {
    label: "Size",
    options: sizeOptions,
    placeholder: "Select size",
    disabled: true,
  },
};

export const FewOptions: Story = {
  render: SelectWithState,
  args: {
    label: "Priority",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    placeholder: "Select priority",
  },
};

export const LongLabels: Story = {
  render: SelectWithState,
  args: {
    label: "Department",
    options: [
      { value: "eng", label: "Engineering and Product Development" },
      { value: "hr", label: "Human Resources and Talent Management" },
      { value: "sales", label: "Sales and Business Development" },
      { value: "marketing", label: "Marketing and Brand Strategy" },
      { value: "ops", label: "Operations and Supply Chain Management" },
    ],
    placeholder: "Select department",
  },
};
