# Storybook Component Story Template

This document provides standardized templates and guidelines for creating
Storybook stories in this monorepo. AI coders should follow these patterns when
creating new component stories.

## Table of Contents

- [Basic Story Structure](#basic-story-structure)
- [Story File Naming](#story-file-naming)
- [Import Requirements](#import-requirements)
- [Meta Configuration](#meta-configuration)
- [Story Patterns](#story-patterns)
- [Best Practices](#best-practices)
- [Complete Example](#complete-example)

## Basic Story Structure

Every story file should follow this structure:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered', // or "fullscreen" for full-page components
  },
  tags: ['autodocs'], // Enables automatic documentation
  argTypes: {
    // Define controls here
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

## Story File Naming

- Story files must be co-located with their components
- Use the pattern: `ComponentName.stories.tsx`
- Examples:
  - `Button.stories.tsx`
  - `Card.stories.tsx`
  - `badge.stories.tsx`

## Import Requirements

```tsx
// Required imports for every story
import type { Meta, StoryObj } from '@storybook/react';

// For components with state
import { useState } from 'react';

// Import the component
import { ComponentName } from './ComponentName';

// Import any additional components used in stories
import { OtherComponent } from './OtherComponent';
```

## Meta Configuration

### Title Categories

Use these standard categories following Atomic Design principles:

- `Atoms/` - Basic building blocks (Button, Input, Card, Badge, Separator,
  Skeleton, Select, TextArea)
- `Molecules/` - Combinations of atoms (HelloWorld, OllamaChat, TailwindTest)
- `Organisms/Layout/` - Complex layout components (Sidebar, SplitPanel)
- `Organisms/` - Other complex components
- `Features/Browser/` - Browser-specific features (BrowserView,
  FormAnalysisPanel)
- `Features/` - Other feature-specific components
- `Templates/` - Page templates (DashboardTemplate)
- `Pages/` - Full page components (BrowserPage, OllamaPage)

### Parameters

Common parameter configurations:

```tsx
parameters: {
  // Component positioning
  layout: "centered",    // Centers component
  layout: "fullscreen",  // Full viewport
  layout: "padded",      // Adds padding

  // Documentation
  docs: {
    description: {
      component: "Component description here",
    },
  },

  // Backgrounds
  backgrounds: {
    default: "light",
    values: [
      { name: "light", value: "#ffffff" },
      { name: "dark", value: "#1a1a1a" },
    ],
  },
}
```

### ArgTypes

Define interactive controls:

```tsx
argTypes: {
  // Select control
  variant: {
    control: "select",
    options: ["primary", "secondary", "danger"],
  },

  // Boolean control
  disabled: {
    control: "boolean",
  },

  // Number control
  size: {
    control: { type: "number", min: 1, max: 100, step: 1 },
  },

  // Text control
  label: {
    control: "text",
  },

  // Color control
  backgroundColor: {
    control: "color",
  },

  // Date control
  date: {
    control: "date",
  },

  // Disable control
  onClick: {
    action: "clicked", // Shows action in Actions panel
  },
}
```

## Story Patterns

### 1. Basic Story

```tsx
export const Default: Story = {
  args: {
    label: 'Click me',
    variant: 'primary',
  },
};
```

### 2. Story with State (for controlled components)

```tsx
const ComponentWithState = (args: any) => {
  const [value, setValue] = useState('');
  return <Component {...args} value={value} onChange={setValue} />;
};

export const Controlled: Story = {
  render: ComponentWithState,
  args: {
    placeholder: 'Enter text...',
  },
};
```

### 3. Story with Decorators

```tsx
export const WithPadding: Story = {
  args: {
    children: 'Content',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', backgroundColor: '#f3f4f6' }}>
        <Story />
      </div>
    ),
  ],
};
```

### 4. Multiple Variants Story

```tsx
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Component variant="primary">Primary</Component>
      <Component variant="secondary">Secondary</Component>
      <Component variant="danger">Danger</Component>
    </div>
  ),
};
```

### 5. Story with Play Function (for interaction testing)

```tsx
export const Interactive: Story = {
  args: {
    label: 'Click to test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
```

## Best Practices

### ✅ DO

1. **Create comprehensive examples** - Include all major use cases
2. **Use realistic content** - Avoid "Lorem ipsum" when possible
3. **Group related stories** - Keep similar variants together
4. **Add controls** - Make stories interactive with argTypes
5. **Document edge cases** - Include disabled, loading, error states
6. **Test responsiveness** - Include stories with different sizes
7. **Use consistent naming** - Follow the pattern: Default, WithFeature,
   AllVariants

### ❌ DON'T

1. **Don't hardcode styles** - Use component props instead
2. **Don't skip default story** - Always include a Default export
3. **Don't use complex logic** - Keep stories simple and focused
4. **Don't forget state** - Add state wrapper for controlled components
5. **Don't ignore TypeScript** - Use proper types with
   `satisfies Meta<typeof Component>`

## Complete Example

Here's a complete example following all best practices:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { useState } from 'react';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile input component with multiple variants and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel'],
      description: 'The type of input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    label: {
      control: 'text',
      description: 'Label for the input field',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper for controlled component
const InputWithState = (args: any) => {
  const [value, setValue] = useState('');
  return <Input {...args} value={value} onChange={setValue} />;
};

// Default story - most common use case
export const Default: Story = {
  render: InputWithState,
  args: {
    placeholder: 'Enter text...',
  },
};

// With label
export const WithLabel: Story = {
  render: InputWithState,
  args: {
    label: 'Your Name',
    placeholder: 'John Doe',
  },
};

// Different types
export const Email: Story = {
  render: InputWithState,
  args: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'user@example.com',
  },
};

// Disabled state
export const Disabled: Story = {
  render: InputWithState,
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit this',
    disabled: true,
  },
};

// Show all variants
export const AllTypes: Story = {
  render: () => {
    const [text, setText] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [number, setNumber] = useState('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          type="text"
          label="Text"
          value={text}
          onChange={setText}
          placeholder="Enter text"
        />
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="Enter email"
        />
        <Input
          type="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter password"
        />
        <Input
          type="number"
          label="Number"
          value={number}
          onChange={setNumber}
          placeholder="Enter number"
        />
      </div>
    );
  },
};
```

## Quick Reference Checklist

When creating a new story file:

- [ ] Named as `ComponentName.stories.tsx`
- [ ] Imports `Meta` and `StoryObj` types
- [ ] Has proper `meta` configuration with title and component
- [ ] Includes `tags: ["autodocs"]`
- [ ] Has a `Default` story
- [ ] Uses state wrapper for controlled components
- [ ] Defines relevant `argTypes` for controls
- [ ] Includes examples of all major variants
- [ ] Has proper TypeScript types
- [ ] Follows the naming convention for stories
- [ ] Includes decorators if needed for layout
- [ ] Documents edge cases (disabled, loading, error)

## Additional Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [Controls](https://storybook.js.org/docs/react/essentials/controls)
- [Actions](https://storybook.js.org/docs/react/essentials/actions)
- [Decorators](https://storybook.js.org/docs/react/writing-stories/decorators)
