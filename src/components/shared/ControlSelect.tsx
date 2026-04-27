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
        w-full py-2 rounded-2xl text-center
        border border-slate-300/80 dark:border-slate-700/20
        bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

export default ControlSelect;
