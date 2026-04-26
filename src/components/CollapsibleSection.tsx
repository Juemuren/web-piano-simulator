import { type ReactNode, useState } from 'react';

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
};

function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
    <div className="w-full max-w-4xl">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full text-left p-3 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <h2 className="text-xl font-semibold">
          {title} {isExpanded ? '▼' : '▶'}
        </h2>
      </button>
      <div className={isExpanded ? 'mt-4' : 'mt-4 hidden'}>{children}</div>
    </div>
  );
}

export default CollapsibleSection;
