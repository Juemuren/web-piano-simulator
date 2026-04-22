import { useState, useEffect, useMemo, useRef } from 'react';
import { type TuneObject, renderAbc, TimingCallbacks } from 'abcjs';
import { ABCParser } from '../services/abc/ABCParser';
import { ABCPlayer } from '../services/abc/ABCPlayer';
import { AudioEngine } from '../services/audio/AudioEngine';
import { type ABCPreset, presets, formatHeaderToABC } from '../services/abc/ABCPresets';

interface ABCNotationPlayerProps {
  audioEngine: AudioEngine;
  onNoteStart: (pitch: number) => void;
  onNoteEnd: (pitch: number) => void;
  onStop: () => void;
}

export default function ABCNotationPlayer({ audioEngine, onNoteStart, onNoteEnd, onStop }: ABCNotationPlayerProps) {
  const [abcPlayer] = useState(() => new ABCPlayer(audioEngine, onNoteStart, onNoteEnd));
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ABCPreset | null>(null);
  const [header, setHeader] = useState({ T: '', M: '4/4', L: '1/4', K: 'C', Q: 120 });
  const [body, setBody] = useState('');
  const notationRef = useRef<HTMLDivElement | null>(null);
  const visualObjRef = useRef<TuneObject>(null);
  const timingCallbacksRef = useRef<TimingCallbacks | null>(null);

  const headerFields = [
    { label: '标题', key: 'T' as keyof typeof header, type: 'text' as const, placeholder: '' },
    { label: '节拍', key: 'M' as keyof typeof header, type: 'text' as const, placeholder: '4/4' },
    { label: '默认音符长度', key: 'L' as keyof typeof header, type: 'text' as const, placeholder: '1/4' },
    { label: '调号', key: 'K' as keyof typeof header, type: 'text' as const, placeholder: 'C' },
    { label: '速度', key: 'Q' as keyof typeof header, type: 'number' as const, placeholder: '120' },
  ];

  const abcInputMemo = useMemo(() => formatHeaderToABC(header) + body, [header, body]);

  const parsedScore = useMemo(() => {
    return ABCParser.parse(abcInputMemo);
  }, [abcInputMemo]);

  useEffect(() => {
    if (!notationRef.current) return;

    notationRef.current.innerHTML = '';

    if (parsedScore) {
      const visualObjs = renderAbc(notationRef.current, abcInputMemo, {
        responsive: 'resize',
        add_classes: true
      });
      visualObjRef.current = visualObjs[0];

      timingCallbacksRef.current = new TimingCallbacks(visualObjRef.current, {
        eventCallback: (ev) => {
          if (!ev) return;

          const lastSelection = document.querySelectorAll('.abcjs-highlight');
          lastSelection.forEach(el => el.classList.remove('abcjs-highlight'));

          if (ev.elements) {
            ev.elements.forEach((noteGroup: Element[]) => {
              noteGroup.forEach((element: Element) => {
                element.classList.add('abcjs-highlight');
              });
            });
          }
          return "continue"
        }
      });
    }
  }, [parsedScore, abcInputMemo]);

  const handlePlay = () => {
    if (parsedScore && timingCallbacksRef.current) {
      abcPlayer.play(parsedScore);
      timingCallbacksRef.current.start();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    abcPlayer.stop();
    if (timingCallbacksRef.current) {
      timingCallbacksRef.current.stop();
    }
    setIsPlaying(false);
    onStop();

    const lastSelection = document.querySelectorAll('.abcjs-highlight');
    lastSelection.forEach(el => el.classList.remove('abcjs-highlight'));
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

        <div className="flex flex-1 mb-4 justify-evenly flex-wrap">
          <div className="flex flex-col items-center">
            <span className="text-xs mb-1 font-medium text-slate-600 dark:text-slate-400">预设</span>
            <select
              value={selectedPreset ? presets.indexOf(selectedPreset) : -1}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                if (index >= 0) {
                  const preset = presets[index];
                  setSelectedPreset(preset);
                  setHeader({ T: preset.T, M: preset.M, L: preset.L, K: preset.K, Q: preset.Q });
                  setBody(preset.body);
                } else {
                  setSelectedPreset(null);
                }
              }}
              className="w-30 p-1 border border-slate-700 bg-slate-100 dark:bg-slate-900 rounded"
            >
              <option value={-1}>自定义</option>
              {presets.map((preset, index) => (
                <option key={index} value={index}>{preset.T}</option>
              ))}
            </select>
          </div>
          {headerFields.map(field => (
            <div key={field.key} className="flex flex-col items-center">
              <span className="text-xs mb-1 font-medium text-slate-600 dark:text-slate-400">{field.label}</span>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={header[field.key] || ''}
                onChange={(e) => {
                  const value = field.type === 'number' ? parseInt(e.target.value) : e.target.value;
                  setHeader(prev => ({ ...prev, [field.key]: value }));
                  setSelectedPreset(null);
                }}
                className="w-20 p-1 border border-slate-700 bg-slate-100 dark:bg-slate-900 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-colors"
              />
            </div>
          ))}
        </div>

        <textarea
          id="abc-input"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setSelectedPreset(null);
          }}
          placeholder='输入乐谱或选择预设'
          className="w-full h-48 p-3 mb-4 border text-sm border-slate-700 bg-slate-100 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        />

        <div className="flex justify-center">
          {parsedScore && (
            <button
              onClick={isPlaying ? handleStop : handlePlay}
              className={`px-4 py-2 text-white rounded-2xl transition-colors ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isPlaying ? '停止播放' : '开始播放'}
            </button>
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