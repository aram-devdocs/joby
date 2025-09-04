import type { Meta, StoryObj } from "@storybook/react";

const TailwindTest = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
    <p className="text-gray-700 mb-6">
      If you can see colors and styling, Tailwind is working!
    </p>

    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold">Red Box</h3>
        <p className="text-sm">Background color test</p>
      </div>
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold">Green Box</h3>
        <p className="text-sm">Background color test</p>
      </div>
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold">Blue Box</h3>
        <p className="text-sm">Background color test</p>
      </div>
    </div>

    <div className="space-y-4">
      <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
        Styled Button
      </button>

      <input
        type="text"
        placeholder="Styled input field"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="flex space-x-2">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
          Success Badge
        </span>
        <span className="inline-block px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
          Warning Badge
        </span>
        <span className="inline-block px-3 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
          Error Badge
        </span>
      </div>

      <div className="p-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-lg">
        <p className="font-bold">Gradient Background</p>
        <p className="text-sm">
          If you see a gradient, Tailwind utilities are working!
        </p>
      </div>
    </div>

    <div className="mt-8 p-4 border-2 border-dashed border-gray-400 rounded">
      <p className="text-center text-gray-600">
        Border and spacing utilities test
      </p>
    </div>
  </div>
);

const meta = {
  title: "Molecules/TailwindTest",
  component: TailwindTest,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TailwindTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
