import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="border-t py-6 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'white',
        borderColor: 'var(--color-accent-mid)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>
          GENT<span style={{ color: 'var(--color-primary)' }}>-Vision</span>
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          © 2026 GENT-Vision. All rights reserved.
        </span>
      </div>
    </footer>
  );
};
