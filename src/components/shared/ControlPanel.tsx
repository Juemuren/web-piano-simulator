import type { ReactNode } from 'react';

type ControlPanelProps = {
  children: ReactNode;
  className?: string;
};

function ControlPanel({ children, className = '' }: ControlPanelProps) {
  return (
    <div
      className={`
        w-full p-5 rounded-3xl
        border border-app-border/75 dark:border-app-border-dark/50
        bg-app-surface/40 dark:bg-app-surface-dark/40
        shadow-xl shadow-app-muted/5
        ${className}
        `}
    >
      {children}
    </div>
  );
}

export default ControlPanel;
