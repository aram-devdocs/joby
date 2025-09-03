import React, { useState } from 'react';
import { HelloWorld } from '@packages/ui';

export const App: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);

  const handleButtonClick = () => {
    setClickCount(prev => prev + 1);
    console.log(`Button clicked ${clickCount + 1} times`);
  };

  return (
    <div>
      <HelloWorld 
        name="Electron + TypeScript" 
        onButtonClick={handleButtonClick}
      />
      {clickCount > 0 && (
        <div className="text-center mt-4 text-gray-600">
          Button clicked {clickCount} time{clickCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};