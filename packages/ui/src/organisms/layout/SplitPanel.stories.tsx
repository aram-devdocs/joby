import type { Meta, StoryObj } from "@storybook/react";
import { SplitPanel } from "./SplitPanel";

const meta = {
  title: "Organisms/Layout/SplitPanel",
  component: SplitPanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultSplit: {
      control: { type: "range", min: 20, max: 80, step: 5 },
      description: "Initial split percentage for the left panel",
    },
    minSize: {
      control: { type: "range", min: 10, max: 40, step: 5 },
      description: "Minimum size percentage for each panel",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "500px", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SplitPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const LeftContent = () => (
  <div className="p-6 h-full bg-gray-50">
    <h2 className="text-xl font-bold mb-4">Left Panel</h2>
    <p className="text-gray-600 mb-4">
      This is the left panel content. You can drag the divider to resize the
      panels.
    </p>
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 bg-white rounded shadow">
          Item {i}
        </div>
      ))}
    </div>
  </div>
);

const RightContent = () => (
  <div className="p-6 h-full bg-white">
    <h2 className="text-xl font-bold mb-4">Right Panel</h2>
    <p className="text-gray-600 mb-4">
      This is the right panel content. The panels maintain their minimum sizes.
    </p>
    <div className="bg-gray-100 p-4 rounded">
      <h3 className="font-semibold mb-2">Details</h3>
      <p className="text-sm text-gray-600">
        The split panel component allows you to create resizable layouts with a
        draggable divider. It's perfect for dashboards, file explorers, or any
        interface that needs adjustable panels.
      </p>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    left: <LeftContent />,
    right: <RightContent />,
  },
};

export const CustomSplit: Story = {
  args: {
    left: <LeftContent />,
    right: <RightContent />,
    defaultSplit: 70,
  },
};

export const SmallMinimumSize: Story = {
  args: {
    left: <LeftContent />,
    right: <RightContent />,
    defaultSplit: 50,
    minSize: 10,
  },
};

export const LargeMinimumSize: Story = {
  args: {
    left: <LeftContent />,
    right: <RightContent />,
    defaultSplit: 50,
    minSize: 35,
  },
};

export const WithSidebar: Story = {
  args: {
    left: (
      <div className="h-full bg-gray-900 text-white p-4">
        <h3 className="text-lg font-bold mb-4">Navigation</h3>
        <nav className="space-y-2">
          <a href="#" className="block p-2 hover:bg-gray-800 rounded">
            Dashboard
          </a>
          <a href="#" className="block p-2 hover:bg-gray-800 rounded">
            Analytics
          </a>
          <a href="#" className="block p-2 hover:bg-gray-800 rounded">
            Settings
          </a>
        </nav>
      </div>
    ),
    right: (
      <div className="h-full p-6">
        <h2 className="text-2xl font-bold mb-4">Main Content Area</h2>
        <p className="text-gray-600">
          This demonstrates a typical sidebar layout using the SplitPanel
          component.
        </p>
      </div>
    ),
    defaultSplit: 25,
  },
};

export const CodeEditor: Story = {
  args: {
    left: (
      <div className="h-full bg-gray-800 text-green-400 p-4 font-mono">
        <div className="text-xs text-gray-500 mb-2">// Code Editor</div>
        <pre className="text-sm">
          {`function hello() {
  console.log("Hello, World!");
  return true;
}

hello();`}
        </pre>
      </div>
    ),
    right: (
      <div className="h-full bg-gray-100 p-4">
        <h3 className="font-bold mb-2">Output</h3>
        <div className="bg-black text-white p-3 rounded font-mono text-sm">
          Hello, World!
        </div>
      </div>
    ),
    defaultSplit: 60,
  },
};
