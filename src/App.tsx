import { useState } from 'react';
import Piano from './Piano';
import TimbreSelector from './TimbreSelector';
import { AudioEngine, type Timbre } from './AudioEngine';

function App() {
  const [audioEngine] = useState(() => new AudioEngine());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTimbreChange = (_timbre: Timbre) => {
    // 处理音色变化
  };

  return (
    <>
      <section className="min-h-screen flex flex-col gap-6 items-center justify-center grow px-6 py-8 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:gap-4.5 lg:px-5 lg:py-8 lg:pb-6">
        <div>
          <h1 className="text-3xl font-bold">钢琴模拟器</h1>
          <p className="text-slate-500 dark:text-slate-400">点击琴键演奏音符</p>
        </div>
        <TimbreSelector audioEngine={audioEngine} onTimbreChange={handleTimbreChange} />
        <Piano audioEngine={audioEngine} />
      </section>
      <footer>
        相关数学原理可阅读我的科普文章<a href='https://juemuren.github.io/MyBlogs/posts/math/%E9%9F%B3%E4%B9%90%E7%9A%84%E6%95%B0%E5%AD%A6%E5%8E%9F%E7%90%86/'>《音乐的数学原理：从振动弦到现代乐理》</a>
      </footer>
    </>
  );
}

export default App
