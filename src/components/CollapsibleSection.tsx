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
        className="
          w-full text-center p-3 rounded-lg shadow-md
          bg-app-surface-muted dark:bg-app-surface-muted-dark
          hover:bg-app-border dark:hover:bg-app-border-dark
          transition-colors
        "
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
