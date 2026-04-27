import type { ReactNode } from 'react';

type ControlPanelProps = {
  children: ReactNode;
  className?: string;
};

function ControlPanel({ children, className = '' }: ControlPanelProps) {
  return (
    <div
      className={`w-full sm:w-auto p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-slate-950/20 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default ControlPanel;
