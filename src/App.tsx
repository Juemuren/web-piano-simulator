import { useCallback, useState } from 'react';
import { AudioEngine } from './services/audio/AudioEngine';
import Piano from './components/Piano';
import TimbreAdjuster from './components/TimbreAdjuster';
import TransferFunctionModifier from './components/TransferFunctionModifier';
import ABCEditor from './components/ABCEditor';
import HarmonicSynthesizer from './components/HarmonicSynthesizer';
import CollapsibleSection from './components/CollapsibleSection';
import Footer from './components/Footer';

function App() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [playingNotes, setPlayingNotes] = useState<Set<number>>(new Set());

  const handleNoteStart = useCallback((pitch: number) => {
    setPlayingNotes((prev) => {
      const next = new Set(prev);
      next.add(pitch);
      return next;
    });
  }, []);

  const handleNoteEnd = useCallback((pitch: number) => {
    setPlayingNotes((prev) => {
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
      <section
        className="
          w-full mx-auto min-h-screen grow px-3
          flex flex-col justify-center gap-5
          bg-app-bg dark:bg-app-bg-dark
          text-app-text dark:text-app-text-dark
        "
      >
        <h1 className="text-3xl font-bold text-center">钢琴模拟器</h1>

        <div
          className="
          flex flex-col items-center gap-4
          xl:flex-row xl:items-start xl:justify-center"
        >
          <div className="w-full max-w-4xl">
            <CollapsibleSection title="谐波合成器">
              <HarmonicSynthesizer audioEngine={audioEngine} />
            </CollapsibleSection>
          </div>
          <div className="w-full max-w-4xl">
            <CollapsibleSection title="音色调节器">
              <TimbreAdjuster audioEngine={audioEngine} />
            </CollapsibleSection>
          </div>
          <div className="w-full max-w-4xl">
            <CollapsibleSection title="传递函数修改器">
              <TransferFunctionModifier audioEngine={audioEngine} />
            </CollapsibleSection>
          </div>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <CollapsibleSection title="乐谱编辑器">
            <ABCEditor
              audioEngine={audioEngine}
              onNoteStart={handleNoteStart}
              onNoteEnd={handleNoteEnd}
              onStop={handleStopPlayingNotes}
            />
          </CollapsibleSection>
        </div>

        <Piano audioEngine={audioEngine} playingNotes={playingNotes} />
      </section>
      <Footer />
    </>
  );
}

export default App;
