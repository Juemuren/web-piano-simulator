import { useCallback, useState } from 'react';
import { AudioEngine } from './services/audio/AudioEngine';
import Piano from './components/Piano';
import TimbreSelector from './components/TimbreSelector';
import TransferFunctionSelector from './components/TransferFunctionSelector';
import ABCNotationPlayer from './components/ABCNotationPlayer';
import SynthesizerSettings from './components/Synthesizer';
import CollapsibleSection from './components/CollapsibleSection';

function App() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [playingNotes, setPlayingNotes] = useState<Set<number>>(new Set());

  const handleNoteStart = useCallback((pitch: number) => {
    setPlayingNotes(prev => {
      const next = new Set(prev);
      next.add(pitch);
      return next;
    });
  }, []);

  const handleNoteEnd = useCallback((pitch: number) => {
    setPlayingNotes(prev => {
      const next = new Set(prev);
      next.delete(pitch);
      return next;
    });
  }, []);

  const handleStopPlayingNotes = useCallback(() => {
    setPlayingNotes(new Set());
  }, []);

  return (
    <>
      <section className="min-h-screen flex flex-col gap-6 items-center justify-center grow px-6 py-8 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:gap-4.5 lg:px-5 lg:py-8 lg:pb-6">
        <div>
          <h1 className="text-3xl font-bold">钢琴模拟器</h1>
          <p className="text-slate-500 dark:text-slate-400">点击琴键演奏音符</p>
        </div>
        <CollapsibleSection title="谐波合成器">
          <SynthesizerSettings
            audioEngine={audioEngine}
          />
        </CollapsibleSection>
        <CollapsibleSection title="音色调节器">
          <TimbreSelector
            audioEngine={audioEngine}
          />
        </CollapsibleSection>
        <CollapsibleSection title="传函修改器">
          <TransferFunctionSelector
            audioEngine={audioEngine}
          />
        </CollapsibleSection>
        <CollapsibleSection title="乐谱编辑器">
          <ABCNotationPlayer
            audioEngine={audioEngine}
            onNoteStart={handleNoteStart}
            onNoteEnd={handleNoteEnd}
            onStop={handleStopPlayingNotes}
          />
        </CollapsibleSection>
        <Piano audioEngine={audioEngine} playingNotes={playingNotes} />
      </section>
      <footer>
        相关数学原理可阅读我的科普文章
        <a href='https://juemuren.github.io/MyBlogs/posts/math/%E9%9F%B3%E4%B9%90%E7%9A%84%E6%95%B0%E5%AD%A6%E5%8E%9F%E7%90%86/'
          className="text-blue-600 underline hover:text-blue-800">
        《音乐的数学原理：从振动弦到现代乐理》
        </a>
      </footer>
    </>
  );
}

export default App
