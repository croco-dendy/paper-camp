import { space } from '@/app/styles/tokens';
import type { ReactNode } from 'react';

interface SidebarSectionProps {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}

export const SidebarSection = ({ label, children, action }: SidebarSectionProps) => {
  return (
    <div style={{ marginBottom: space[5] }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.35rem',
          padding: `0 ${space[3]}`,
        }}
      >
        <span
          className="text-xs"
          style={{
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.4,
          }}
        >
          {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
};
