import { useCallback, useState } from 'react';
import { AudioEngine } from './services/audio/AudioEngine';
import Piano from './components/Piano';
import TimbreSelector from './components/TimbreSelector';
import TransferFunctionSelector from './components/TransferFunctionSelector';
import ABCNotationPlayer from './components/ABCNotationPlayer';
import SynthesizerSettings from './components/Synthesizer';
import CollapsibleSection from './components/CollapsibleSection';
import Footer from './components/Footer';

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
      <section className="min-h-screen grow bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto flex w-full flex-col justify-center gap-5">
          <div className="mx-auto w-full max-w-4xl text-center xl:max-w-5xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">钢琴模拟器</h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400 sm:text-lg">点击琴键演奏音符</p>
          </div>

          <div className="flex w-full flex-col items-center gap-4 xl:flex-row xl:items-start xl:justify-center">
            <div className="w-full max-w-4xl xl:max-w-md xl:flex-1">
              <CollapsibleSection title="谐波合成器">
                <SynthesizerSettings
                  audioEngine={audioEngine}
                />
              </CollapsibleSection>
            </div>
            <div className="w-full max-w-4xl xl:max-w-md xl:flex-1">
              <CollapsibleSection title="音色调节器">
                <TimbreSelector
                  audioEngine={audioEngine}
                />
              </CollapsibleSection>
            </div>
            <div className="w-full max-w-4xl xl:max-w-md xl:flex-1">
              <CollapsibleSection title="传函修改器">
                <TransferFunctionSelector
                  audioEngine={audioEngine}
                />
              </CollapsibleSection>
            </div>
          </div>
          <div className="mx-auto w-full max-w-4xl">
            <CollapsibleSection title="乐谱编辑器">
              <ABCNotationPlayer
                audioEngine={audioEngine}
                onNoteStart={handleNoteStart}
                onNoteEnd={handleNoteEnd}
                onStop={handleStopPlayingNotes}
              />
            </CollapsibleSection>
          </div>

          <div className="w-full rounded-lg bg-white/80 shadow-md ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-800 sm:px-0 xl:px-6">
            <Piano audioEngine={audioEngine} playingNotes={playingNotes} />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default App
