import type { SelectHTMLAttributes } from 'react';

type ControlSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

function ControlSelect({
  className = '',
  children,
  ...props
}: ControlSelectProps) {
  return (
    <select
      className={`
        w-full rounded-2xl border border-slate-700 px-3 py-2
        focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25
        dark:bg-slate-800/70 dark:text-slate-100
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

export default ControlSelect;
