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
        border border-slate-200/75 dark:border-slate-800/25
        shadow-xl shadow-slate-500/5
        ${className}
        `}
    >
      {children}
    </div>
  );
}

export default ControlPanel;
