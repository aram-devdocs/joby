import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './scroll-area';

const meta = {
  title: 'Atoms/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A custom scrollable area component with configurable scroll direction. Provides consistent scrolling behavior across browsers.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
      description: 'The scroll direction',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VerticalScroll: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <ScrollArea {...args} className="h-[200px] w-[350px] rounded-md border p-4">
      <div>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="py-2 border-b">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <ScrollArea {...args} className="h-[100px] w-[350px] rounded-md border p-4">
      <div className="flex space-x-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-24 h-16 bg-gray-200 rounded flex items-center justify-center"
          >
            Card {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const BothDirections: Story = {
  args: {
    orientation: 'both',
  },
  render: (args) => (
    <ScrollArea {...args} className="h-[300px] w-[400px] rounded-md border p-4">
      <div className="w-[800px]">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="py-2 border-b whitespace-nowrap">
            This is a very long line of text that extends beyond the container
            width - Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const WithText: Story = {
  render: () => (
    <ScrollArea
      className="h-[200px] w-[350px] rounded-md border p-4"
      orientation="vertical"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Terms of Service</h3>
        <p className="text-sm text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="text-sm text-gray-600">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
        <p className="text-sm text-gray-600">
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
          officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde
          omnis iste natus error sit voluptatem accusantium doloremque
          laudantium.
        </p>
        <p className="text-sm text-gray-600">
          Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
          quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
          voluptatem quia voluptas sit aspernatur aut odit aut fugit.
        </p>
        <p className="text-sm text-gray-600">
          Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
          nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
          amet, consectetur, adipisci velit.
        </p>
      </div>
    </ScrollArea>
  ),
};

export const WithImages: Story = {
  render: () => (
    <ScrollArea
      className="h-[300px] w-[350px] rounded-md border p-4"
      orientation="vertical"
    >
      <div className="space-y-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg"></div>
            <div>
              <h4 className="font-medium">Image {i + 1}</h4>
              <p className="text-sm text-gray-600">
                Description for image {i + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const ChatMessages: Story = {
  render: () => (
    <ScrollArea
      className="h-[400px] w-[400px] rounded-md border p-4"
      orientation="vertical"
    >
      <div className="space-y-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                i % 2 === 0
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-blue-500 text-white'
              }`}
            >
              <p className="text-sm">
                Message {i + 1}: This is a sample chat message
              </p>
              <p className="text-xs mt-1 opacity-70">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const CodeBlock: Story = {
  render: () => (
    <ScrollArea
      className="h-[300px] w-[500px] rounded-md border bg-gray-900 p-4"
      orientation="both"
    >
      <pre className="text-green-400 text-sm font-mono">
        {`function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * calculateFactorial(n - 1);
}

function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const quickSort = (arr) => {
  if (arr.length <= 1) {
    return arr;
  }
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
};

// Example outputs:
// Factorial of 5: calculateFactorial(5) = 120
// Fibonacci of 10: fibonacci(10) = 55
// Sorted array: quickSort([3, 6, 8, 10, 1, 2, 1]) = [1, 1, 2, 3, 6, 8, 10]`}
      </pre>
    </ScrollArea>
  ),
};

export const Table: Story = {
  render: () => (
    <ScrollArea
      className="h-[300px] w-[500px] rounded-md border"
      orientation="both"
    >
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Department</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 50 }, (_, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{i + 1}</td>
              <td className="p-2 whitespace-nowrap">User {i + 1}</td>
              <td className="p-2 whitespace-nowrap">user{i + 1}@example.com</td>
              <td className="p-2 whitespace-nowrap">
                Department {(i % 5) + 1}
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    i % 3 === 0
                      ? 'bg-green-100 text-green-800'
                      : i % 3 === 1
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {i % 3 === 0
                    ? 'Active'
                    : i % 3 === 1
                      ? 'Pending'
                      : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  ),
};
