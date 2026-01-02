import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'standard' | 'wide' | 'full';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'standard',
  className = '',
}) => {
  const widthClass = {
    standard: 'max-w-[860px]',
    wide: 'max-w-[1200px]',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div className="min-h-screen bg-office-slate">
      <div className={`${widthClass} mx-auto p-page ${className}`}>
        {children}
      </div>
    </div>
  );
};
