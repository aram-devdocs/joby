import type { Meta, StoryObj } from '@storybook/react';
import { HelloWorld } from './HelloWorld';

const meta = {
  title: 'Molecules/HelloWorld',
  component: HelloWorld,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A welcome component that displays a greeting with interactive buttons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'The name to display in the greeting',
    },
    onButtonClick: {
      action: 'buttonClicked',
      description: 'Callback when the main button is clicked',
    },
  },
} satisfies Meta<typeof HelloWorld>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'World',
  },
};

export const WithCustomName: Story = {
  args: {
    name: 'Storybook User',
  },
};

export const WithLongName: Story = {
  args: {
    name: 'Christopher Alexander Hamilton III',
  },
};

export const WithEmoji: Story = {
  args: {
    name: '🎉 Party Time 🎉',
  },
};

export const WithCustomHandler: Story = {
  args: {
    name: 'Developer',
    onButtonClick: () => {
      action('custom-handler-executed')();

      // Custom handler called
    },
  },
};

export const DifferentNames: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        minHeight: '100vh',
      }}
    >
      <HelloWorld name="Alice" />
      <HelloWorld name="Bob" />
      <HelloWorld name="Charlie" />
      <HelloWorld name="Diana" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const names = ['World', 'Friend', 'Developer', 'Designer', 'Team'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    return (
      <HelloWorld
        name={randomName}
        onButtonClick={() => {
          // Greeting handled with Sample User
        }}
      />
    );
  },
};
