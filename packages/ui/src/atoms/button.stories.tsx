import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonProps } from "./button";
import {
  Mail,
  Loader2,
  ChevronRight,
  Download,
  Heart,
  Settings,
  Trash2,
} from "lucide-react";

const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component with multiple variants, sizes, and states. Built with class-variance-authority for consistent styling.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "The visual style variant of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    asChild: {
      control: "boolean",
      description: "Whether to render as a child component",
    },
    onClick: {
      action: "clicked",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Click me",
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link Button",
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    children: "Small Button",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: <Settings className="h-4 w-4" />,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" />
        Login with Email
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Button variant="default" disabled>
          Default Disabled
        </Button>
        <Button variant="secondary" disabled>
          Secondary Disabled
        </Button>
        <Button variant="destructive" disabled>
          Destructive Disabled
        </Button>
        <Button variant="outline" disabled>
          Outline Disabled
        </Button>
        <Button variant="ghost" disabled>
          Ghost Disabled
        </Button>
        <Button variant="link" disabled>
          Link Disabled
        </Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Heart className="h-4 w-4" />
      </Button>
    </div>
  ),
};

export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "4px" }}>
      <Button variant="outline">Previous</Button>
      <Button variant="outline">1</Button>
      <Button variant="default">2</Button>
      <Button variant="outline">3</Button>
      <Button variant="outline">Next</Button>
    </div>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px" }}>
      <Button size="icon" variant="default">
        <Heart className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="secondary">
        <Download className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline">
        <Settings className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    className: "w-full",
  },
  parameters: {
    layout: "padded",
  },
};
