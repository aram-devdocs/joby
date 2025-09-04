import React, { useState, useRef, useEffect } from 'react';

interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number;
  minSize?: number;
}

export const SplitPanel: React.FC<SplitPanelProps> = ({
  left,
  right,
  defaultSplit = 60,
  minSize = 20,
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;

      if (percentage >= minSize && percentage <= 100 - minSize) {
        setSplit(percentage);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minSize]);

  return (
    <div ref={containerRef} className="flex h-full relative">
      <div className="overflow-hidden" style={{ width: `${split}%` }}>
        {left}
      </div>
      <div
        className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative ${
          isDragging ? 'bg-blue-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
      </div>
      <div
        className="flex-1 overflow-hidden"
        style={{ width: `${100 - split}%` }}
      >
        {right}
      </div>
    </div>
  );
};
