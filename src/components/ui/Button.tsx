import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'medium' | 'small';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'font-medium transition-colors rounded-button focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-trust-blue text-white hover:bg-[#3651D4] active:bg-[#2A40B8]',
    secondary: 'bg-white text-text-primary border border-border-subtle hover:bg-surface-muted active:bg-border-subtle',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted',
  };

  const sizeStyles = {
    medium: 'px-5 py-2.5 text-body-strong',
    small: 'px-3 py-1.5 text-label',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
