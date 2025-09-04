import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

// Since BrowserView uses webview which requires Electron context,
// we'll create a mock version for Storybook demonstration
const MockBrowserView: React.FC<{
  onFormDetected?: (forms: any) => void;
  onNavigationChange?: () => void;
}> = ({ onFormDetected, onNavigationChange }) => {
  const [currentUrl, setCurrentUrl] = React.useState(
    "https://www.example-jobs.com",
  );
  const [inputUrl, setInputUrl] = React.useState(
    "https://www.example-jobs.com",
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNavigate = () => {
    setIsLoading(true);
    setCurrentUrl(inputUrl);
    setTimeout(() => {
      setIsLoading(false);
      onNavigationChange?.();
      // Simulate form detection
      if (inputUrl.includes("job") || inputUrl.includes("apply")) {
        onFormDetected?.([
          {
            fields: [
              { name: "name", type: "text", placeholder: "Full Name" },
              { name: "email", type: "email", placeholder: "Email" },
            ],
          },
        ]);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      {/* Browser Controls */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        <button
          className="p-1.5 hover:bg-gray-200 rounded"
          onClick={() => window.history.back()}
        >
          ←
        </button>
        <button
          className="p-1.5 hover:bg-gray-200 rounded"
          onClick={() => window.history.forward()}
        >
          →
        </button>
        <button
          className="p-1.5 hover:bg-gray-200 rounded"
          onClick={handleNavigate}
        >
          ⟳
        </button>
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
          className="flex-1 px-3 py-1.5 border rounded-md text-sm"
          placeholder="Enter URL..."
        />
        <div className="px-2">
          {isLoading ? (
            <span className="text-blue-500">Loading...</span>
          ) : (
            <span className="text-green-500">✓</span>
          )}
        </div>
      </div>

      {/* Mock Browser Content */}
      <div className="flex-1 bg-white p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Mock Browser View</h1>
            <p className="text-gray-600">
              This is a mock browser view for Storybook. The actual BrowserView
              component uses Electron's webview which is not available in this
              environment.
            </p>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Current URL:{" "}
                <code className="bg-blue-100 px-2 py-1 rounded">
                  {currentUrl}
                </code>
              </p>
            </div>
            {currentUrl.includes("job") && (
              <div className="p-4 border-2 border-green-300 rounded-lg bg-green-50">
                <h2 className="font-semibold text-green-800 mb-2">
                  Job Application Form Detected!
                </h2>
                <p className="text-sm text-green-700">
                  The form analysis panel would display detected form fields
                  here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const meta = {
  title: "Features/Browser/BrowserView",
  component: MockBrowserView,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
The BrowserView component provides an embedded web browser with form detection capabilities.
This is a mock version for Storybook - the actual component uses Electron's webview.

## Features
- URL navigation
- Form detection
- Page title tracking
- Loading states
- Job site detection

## Usage
The real component is used in Electron applications to browse job sites and automatically detect application forms.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onFormDetected: {
      action: "form-detected",
      description: "Called when forms are detected on the page",
    },
    onNavigationChange: {
      action: "navigation-changed",
      description: "Called when navigation occurs",
    },
  },
} satisfies Meta<typeof MockBrowserView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const JobSite: Story = {
  args: {},
  play: async ({ args, canvasElement }) => {
    // Simulate navigating to a job site
    const input = canvasElement.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;
    if (input) {
      input.value = "https://www.example-jobs.com/apply";
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    }
  },
};

export const WithCallbacks: Story = {
  args: {
    onFormDetected: (forms) => {
      console.log("Forms detected:", forms);
      alert(`Detected ${forms.length} form(s) on the page!`);
    },
    onNavigationChange: () => {
      console.log("Navigation changed");
    },
  },
};
