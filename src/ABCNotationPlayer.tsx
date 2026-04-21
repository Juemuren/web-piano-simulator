import { useState, useEffect, useMemo, useRef } from 'react';
import { renderAbc } from 'abcjs';
import { ABCParser } from './ABCParser';
import { ABCPlayer } from './ABCPlayer';
import { AudioEngine } from './AudioEngine';

interface ABCNotationPlayerProps {
  audioEngine: AudioEngine;
  onNoteStart: (pitch: number) => void;
  onNoteEnd: (pitch: number) => void;
  onStop: () => void;
}

const defaultABCInput = `X: 1
T: 示例
M: 4/4
L: 1/4
K: C
Q: 120
C C G G | A A G2 | F F E E | D D C2 ||`

export default function ABCNotationPlayer({ audioEngine, onNoteStart, onNoteEnd, onStop }: ABCNotationPlayerProps) {
  const [abcInput, setAbcInput] = useState(defaultABCInput);
  const [abcPlayer] = useState(() => new ABCPlayer(audioEngine, onNoteStart, onNoteEnd));
  const [isPlaying, setIsPlaying] = useState(false);
  const notationRef = useRef<HTMLDivElement | null>(null);

  const parsedScore = useMemo(() => {
    return ABCParser.parse(abcInput);
  }, [abcInput]);

  useEffect(() => {
    if (!notationRef.current) return;

    notationRef.current.innerHTML = '';

    if (parsedScore) {
      renderAbc(notationRef.current, abcInput, {
        responsive: 'resize',
        add_classes: true
      });
    }
  }, [parsedScore, abcInput]);

  const handlePlay = () => {
    if (parsedScore) {
      abcPlayer.play(parsedScore);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    abcPlayer.stop();
    setIsPlaying(false);
    onStop();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(abcPlayer.isCurrentlyPlaying());
    }, 100);
    return () => clearInterval(interval);
  }, [abcPlayer]);

  useEffect(() => {
    return () => {
      abcPlayer.stop();
      onStop();
    };
  }, [abcPlayer, onStop]);

  return (
    <div className="w-full max-w-4xl">
      <div className="w-full sm:w-auto p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
        <div className="mb-4">
          <textarea
            id="abc-input"
            value={abcInput}
            onChange={(e) => setAbcInput(e.target.value)}
            placeholder='输入乐谱'
            className="w-full h-48 p-3 border border-slate-700 rounded-3xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {parsedScore && (
            <>
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPlaying ? '播放中...' : '播放'}
              </button>

              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
              >
                停止
              </button>
            </>
          )}
        </div>

        {parsedScore && (
          <div
            ref={notationRef}
            className="mt-4 w-full overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-950/80"
          />
        )}
      </div>
    </div>
  );
}