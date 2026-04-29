import { type ReactNode, useState } from 'react';

const articleUrl =
  'https://juemuren.github.io/MyBlogs/posts/math/%E9%9F%B3%E4%B9%90%E7%9A%84%E6%95%B0%E5%AD%A6%E5%8E%9F%E7%90%86/';
const repositoryUrl = 'https://github.com/Juemuren/web-piano-simulator/';
const abcUrl = 'https://abcnotation.com/learn';

type FooterPanelProps = {
  title: string;
  children: ReactNode;
};

type FooterLinkProps = {
  href: string;
  label: string;
};

function FooterPanel({ title, children }: FooterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      className="
      rounded-lg
      bg-app-surface/50 dark:bg-app-surface-dark/50
      border border-app-border dark:border-app-border-dark
    "
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="
          w-full flex items-center justify-between px-4 py-3
          rounded-lg text-left
          transition-colors hover:bg-app-surface dark:hover:bg-app-surface-dark
        "
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-semibold tracking-wide text-app-muted dark:text-app-muted-dark">
          {title}
        </span>
        <span className="shrink-0 text-sm text-app-muted dark:text-app-muted-dark">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      <div
        className={`
          text-sm text-app-muted dark:text-app-muted-dark
          ${isExpanded ? 'p-4 leading-8 text-base' : 'hidden'}
        `}
      >
        {children}
      </div>
    </section>
  );
}

function FooterLink({ href, label }: FooterLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        group w-full flex items-center justify-between px-4 py-3
        text-left text-app-muted dark:text-app-muted-dark
        rounded-lg bg-app-surface dark:bg-app-surface-dark
        border border-app-border dark:border-app-border-dark
        transition-colors
        hover:text-app-accent-strong dark:hover:text-app-accent-weak
        hover:bg-app-accent-weak/30 dark:hover:bg-app-accent-strong/30
        hover:border-app-accent dark:hover:border-app-accent
      "
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className="
          flex h-4 w-4 shrink-0 items-center justify-center
          rounded-full border border-app-border dark:border-app-border-dark
          text-xs text-app-muted dark:text-app-muted-dark
          transition-colors group-hover:text-app-accent dark:group-hover:text-app-accent-weak
          group-hover:border-app-accent dark:group-hover:border-app-accent 
        "
        aria-hidden="true"
      >
        ↗
      </span>
    </a>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-8 bg-app-surface/15 dark:bg-app-surface-dark/85">
      <div
        className="
          mx-auto w-full max-w-4xl text-left
          grid gap-5 sm:grid-cols-2 sm:items-start
          border-t pt-6 border-app-border dark:border-app-border-dark
        "
      >
        <div className="grid gap-3">
          <FooterPanel title="使用技巧">
            在乐谱编辑器中，单击乐谱中的音符可以选中并播放这个音符，而双击则会直接从选中处演奏整个乐谱
          </FooterPanel>
          <FooterPanel title="乐谱编码">
            乐谱使用 ABC Notation 编码格式，详细的标准可阅读官方教程
          </FooterPanel>
          <FooterPanel title="运行原理">
            声音基于 Web Audio API
            纯物理合成，数学原理和代码实现可分别参考我的科普文章与源代码
          </FooterPanel>
        </div>

        <div className="grid gap-3 sm:justify-items-end">
          <FooterLink href={articleUrl} label="数学原理科普文章" />
          <FooterLink href={repositoryUrl} label="源代码仓库" />
          <FooterLink href={abcUrl} label="乐谱格式教程" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
