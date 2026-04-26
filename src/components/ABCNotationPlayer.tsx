import { useState, useEffect, useRef, useCallback } from 'react';
import { type AbcElem, type TuneObject, renderAbc, TimingCallbacks } from 'abcjs';
import { AudioEngine } from '../services/audio/AudioEngine';
import { ABCPlayer } from '../services/abc/ABCPlayer';
import { presets } from '../services/abc/ABCPresets';

interface ABCNotationPlayerProps {
  audioEngine: AudioEngine;
  onNoteStart: (pitch: number) => void;
  onNoteEnd: (pitch: number) => void;
  onStop: () => void;
}

const DOUBLE_CLICK_INTERVAL_MS = 500;

interface LastClickedNote {
  index: number;
  beats: number;
  clickedAt: number;
}

export default function ABCNotationPlayer({ audioEngine, onNoteStart, onNoteEnd, onStop }: ABCNotationPlayerProps) {
  const [abcPlayer] = useState(() => new ABCPlayer(audioEngine, onNoteStart, onNoteEnd));
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasNotes, setHasNotes] = useState(false)
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(-1);
  const [abcContent, setAbcContent] = useState('');
  const visualObjRef = useRef<TuneObject>(null);
  const timingCallbacksRef = useRef<TimingCallbacks | null>(null);
  const lastClickedNoteRef = useRef<LastClickedNote | null>(null);

  const removeHighlight = () => {
    document.querySelectorAll('.abcjs-highlight')
      .forEach(el => el.classList.remove('abcjs-highlight'))
  }

  const addHighlight = (elements: HTMLElement[]) => {
    elements.forEach(element => {
      element.classList.add('abcjs-highlight');
    });
  }

  const getSelectedBeat = (abcElem: AbcElem) => {
    const currentSelectedNote = abcElem.currentTrackWholeNotes ?? 0;
    const beatLength = visualObjRef.current?.getBeatLength() ?? 1;

    if (Array.isArray(currentSelectedNote)) {
      return currentSelectedNote[0] / beatLength;
    }
    return currentSelectedNote / beatLength;
  }

  const getSelectedIndex = () => {
    const selectedElement = document.querySelector('.abcjs-note_selected');
    return parseInt(selectedElement?.getAttribute('data-index') || '0');
  }

  const handleStop = useCallback(() => {
    if (timingCallbacksRef.current) {
      timingCallbacksRef.current.stop();
    }
    setIsPlaying(false);
    onStop();
    removeHighlight()
  }, [timingCallbacksRef, onStop]);

  const handlePlay = () => {
    if (timingCallbacksRef.current) {
      timingCallbacksRef.current.stop();
      timingCallbacksRef.current.start(lastClickedNoteRef.current?.beats, 'beats');
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const visualObjs = renderAbc('abcjs-paper', abcContent, {
      responsive: 'resize',
      add_classes: true,
      clickListener: (abcElem) => {
        if (visualObjRef.current) {
          const now = performance.now();
          const clickedIndex = getSelectedIndex();
          const prevClickedNote = lastClickedNoteRef.current;
          lastClickedNoteRef.current = {
            index: clickedIndex,
            beats: getSelectedBeat(abcElem),
            clickedAt: now
          };

          if (
            prevClickedNote?.index === clickedIndex &&
            now - prevClickedNote.clickedAt <= DOUBLE_CLICK_INTERVAL_MS
          ) {
            handleStop()
            handlePlay()
            return
          }

          if (abcElem.midiPitches && abcElem.midiPitches.length > 0) {
            abcPlayer.play(abcElem.midiPitches)
          }
        }
      },
    });
    visualObjRef.current = visualObjs[0];
    visualObjRef.current.setUpAudio({})
    setHasNotes(visualObjRef.current.lines.length > 0)

    timingCallbacksRef.current = new TimingCallbacks(visualObjRef.current, {
      eventCallback: (ev) => {
        if (!ev) {
          removeHighlight()
          setIsPlaying(false)
          return
        };
        removeHighlight()
        ev.elements?.forEach(noteGroup => {
          addHighlight(noteGroup)
        });
        if (ev.midiPitches) {
          abcPlayer.play(ev.midiPitches)
        }
        return "continue"
      }
    });
  }, [abcContent, abcPlayer, handleStop]);

  return (
    <div className="w-full max-w-4xl">
      <div className="w-full sm:w-auto p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
        <div className="flex flex-col mb-3 gap-3">
          <select
            value={selectedPresetIndex}
            onChange={async (e) => {
              const index = parseInt(e.target.value);
              setSelectedPresetIndex(index);
              if (index >= 0) {
                const preset = presets[index];
                const response = await fetch(preset.path);
                const content = await response.text();
                setAbcContent(content);
                if (isPlaying) handleStop();
              } else {
                setAbcContent('');
              }
              if (isPlaying) handleStop();
            }}
            className="
                w-full rounded-2xl border border-slate-700 px-3 py-2
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25
                dark:bg-slate-800/70 dark:text-slate-100
              "
          >
            <option value={-1}>自定义</option>
            {presets.map((preset, index) => (
              <option key={index} value={index}>{preset.name}</option>
            ))}
          </select>
        </div>

        <textarea
          id="abc-input"
          value={abcContent}
          onChange={(e) => {
            setAbcContent(e.target.value);
            setSelectedPresetIndex(-1);
            if (isPlaying) handleStop();
          }}
          placeholder='输入乐谱或选择预设'
          className="w-full h-48 p-3 mb-4 border text-sm border-slate-700 bg-slate-100 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        />

        <div className="flex justify-center">
          {hasNotes && (
            <button
              onClick={isPlaying ? handleStop : handlePlay}
              className={`px-4 py-2 text-white rounded-2xl transition-colors ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isPlaying ? '停止播放' : '开始播放'}
            </button>
          )}
        </div>

        <div
          id='abcjs-paper'
          className="mt-4 w-full overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-950/80"
        />
      </div>
    </div>
  );
}
