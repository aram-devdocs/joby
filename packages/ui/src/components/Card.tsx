import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};