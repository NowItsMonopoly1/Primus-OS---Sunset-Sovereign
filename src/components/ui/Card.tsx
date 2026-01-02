import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'standard' | 'compact' | 'none';
  interactive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'standard',
  interactive = false,
  onClick,
}) => {
  const paddingStyles = {
    standard: 'p-card',
    compact: 'p-4',
    none: 'p-0',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-border-strong transition-colors'
    : '';

  return (
    <div
      className={`bg-surface border border-border-subtle rounded-card ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
