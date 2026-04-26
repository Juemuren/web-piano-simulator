const articleUrl =
  'https://juemuren.github.io/MyBlogs/posts/math/%E9%9F%B3%E4%B9%90%E7%9A%84%E6%95%B0%E5%AD%A6%E5%8E%9F%E7%90%86/';
const repositoryUrl =
  'https://github.com/Juemuren/web-piano-simulator';
const abcUrl = 
  'https://abcnotation.com/'

function Footer() {
  return (
    <footer className="bg-white px-6 py-8 text-left text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      <div className="mx-auto grid w-full max-w-4xl gap-5 border-t border-slate-200 pt-6 dark:border-slate-800 sm:grid-cols-[1.15fr_0.85fr] sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            使用说明
          </p>
          <ul className="mt-2 text-base leading-7">
            <li>
              单击音符会选中并播放单个音符
            </li>
            <li>
              双击音符会从选中处开始演奏整个乐谱
            </li>
            <li>
              开始播放会从被选中音符处开始演奏整个乐谱
            </li>
          </ul>
        </div>

        <div className="grid gap-3 sm:justify-items-end">
          <a
            href={articleUrl}
            target="_blank"
            rel="noreferrer"
            className="group w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/30 sm:max-w-sm"
          >
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              相关数学原理
            </span>
          </a>

          <a
            href={repositoryUrl}
            className="group w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/30 sm:max-w-sm"
          >
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              源代码仓库
            </span>
          </a>
          <a
            href={abcUrl}
            className="group w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-red-300 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-red-500/60 dark:hover:bg-red-950/30 sm:max-w-sm"
          >
            <span className="block text-sm text-slate-500 dark:text-slate-400">
              乐谱编码格式
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
