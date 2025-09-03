import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'px-4 py-2 rounded font-semibold transition-colors duration-200';
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};