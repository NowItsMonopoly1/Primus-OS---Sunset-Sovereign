import React from 'react';

interface ContactCellProps {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
}

export const ContactCell: React.FC<ContactCellProps> = ({
  name,
  role,
  initials,
  avatarUrl,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-border-subtle flex items-center justify-center flex-shrink-0 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-label text-text-secondary font-medium">{initials}</span>
        )}
      </div>

      <div className="min-w-0">
        <div className="text-body-strong text-text-primary truncate">{name}</div>
        <div className="text-body text-text-muted truncate">{role}</div>
      </div>
    </div>
  );
};
