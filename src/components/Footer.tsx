import { type ReactNode, useState } from 'react';

const articleUrl =
  'https://juemuren.github.io/MyBlogs/posts/math/%E9%9F%B3%E4%B9%90%E7%9A%84%E6%95%B0%E5%AD%A6%E5%8E%9F%E7%90%86/';
const repositoryUrl =
  'https://github.com/Juemuren/web-piano-simulator/';
const abcUrl =
  'https://abcnotation.com/learn'

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
    <section className="rounded-lg border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/60">
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80"
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <span className="shrink-0 text-sm text-slate-400 dark:text-slate-500">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      <div className={isExpanded ? 'px-4 py-4 text-base leading-7' : 'hidden'}>
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
      className="group flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/30 dark:hover:text-blue-200 sm:max-w-sm"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-400 transition-colors group-hover:border-blue-300 group-hover:text-blue-600 dark:border-slate-700 dark:text-slate-500 dark:group-hover:border-blue-500/70 dark:group-hover:text-blue-300"
        aria-hidden="true"
      >
        ↗
      </span>
    </a>
  );
}

function Footer() {
  return (
    <footer className="bg-white px-6 py-8 text-left text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      <div className="mx-auto grid w-full max-w-4xl gap-5 border-t border-slate-200 pt-6 dark:border-slate-800 sm:grid-cols-[1.15fr_0.85fr] sm:items-start">
        <div className="grid gap-3">
          <FooterPanel title="使用技巧">
            在乐谱编辑器中，单击乐谱中的音符可以选中并播放这个音符，而双击则会直接从选中处演奏整个乐谱
          </FooterPanel>
          <FooterPanel title="乐谱编码">
            乐谱使用 ABC Notation 编码格式，详细的标准请阅读官方给出的学习资源
          </FooterPanel>
          <FooterPanel title="运行原理">
            钢琴声音基于 Web Audio 进行纯物理合成，数学原理和代码实现可以参考给出的链接
          </FooterPanel>
        </div>

        <div className="grid gap-3 sm:justify-items-end">
          <FooterLink href={articleUrl} label="相关数学原理" />
          <FooterLink href={repositoryUrl} label="源代码仓库" />
          <FooterLink href={abcUrl} label="乐谱编码格式" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
