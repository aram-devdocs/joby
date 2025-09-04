import type { Meta, StoryObj } from "@storybook/react";
import { Input, InputProps } from "./input";
import { useState } from "react";
import {
  Search as SearchIcon,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
} from "lucide-react";

const meta = {
  title: "Core/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile input component with support for all standard HTML input types and custom styling.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "date",
        "time",
        "search",
        "url",
      ],
      description: "The type of input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether the input is required",
    },
    readOnly: {
      control: "boolean",
      description: "Whether the input is read-only",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@example.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "Enter number",
    min: 0,
    max: 100,
  },
};

export const Search: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
  },
};

export const Tel: Story = {
  args: {
    type: "tel",
    placeholder: "+1 (555) 000-0000",
  },
};

export const Date: Story = {
  args: {
    type: "date",
  },
};

export const Time: Story = {
  args: {
    type: "time",
  },
};

export const Disabled: Story = {
  args: {
    type: "text",
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    type: "text",
    value: "Read-only text",
    readOnly: true,
  },
};

export const Required: Story = {
  args: {
    type: "text",
    placeholder: "Required field",
    required: true,
  },
};

export const WithValue: Story = {
  args: {
    type: "text",
    value: "Pre-filled value",
    onChange: () => {},
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Type something..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="text-sm text-gray-600">Value: {value}</p>
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="input-with-label" className="text-sm font-medium">
        Username
      </label>
      <Input id="input-with-label" type="text" placeholder="Enter username" />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" type="text" placeholder="John Doe" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input id="password" type="password" placeholder="••••••••" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input type="search" placeholder="Search..." className="pl-10" />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input type="email" placeholder="Email" className="pl-10" />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input type="password" placeholder="Password" className="pl-10" />
      </div>
      <div className="relative">
        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input type="text" placeholder="Username" className="pl-10" />
      </div>
    </div>
  ),
};

export const FileInput: Story = {
  args: {
    type: "file",
    accept: "image/*",
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone input" />
      <Input type="search" placeholder="Search input" />
      <Input type="url" placeholder="URL input" />
      <Input type="date" />
      <Input type="time" />
      <Input type="file" />
    </div>
  ),
};
