import React from "react";
import { Button } from "../atoms/button";

export interface HelloWorldProps {
  name?: string;
  onButtonClick?: () => void;
}

export const HelloWorld: React.FC<HelloWorldProps> = ({
  name = "World",
  onButtonClick,
}) => {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      alert(`Hello, ${name}!`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Hello, {name}!
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to your Electron + React + TypeScript app
        </p>
        <div className="flex gap-2">
          <Button onClick={handleClick}>Click Me</Button>
          <Button
            variant="secondary"
            onClick={() => console.log("Secondary clicked")}
          >
            Console Log
          </Button>
        </div>
      </div>
    </div>
  );
};
