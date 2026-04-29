import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type AbcElem,
  type NoteTimingEvent,
  type TuneObject,
  renderAbc,
  TimingCallbacks,
} from 'abcjs';
import { ABCPresets, getAbcPreset } from '../services/abc/ABCPresets';
import { AudioEngine } from '../services/audio/AudioEngine';
import { ABCPlayer } from '../services/abc/ABCPlayer';
import ControlPanel from './shared/ControlPanel';
import ControlSelect from './shared/ControlSelect';

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

export default function ABCNotationPlayer({
  audioEngine,
  onNoteStart,
  onNoteEnd,
  onStop,
}: ABCNotationPlayerProps) {
  const [abcPlayer] = useState(
    () => new ABCPlayer(audioEngine, onNoteStart, onNoteEnd),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(-1);
  const [abcContent, setAbcContent] = useState('');
  const visualObjRef = useRef<TuneObject>(null);
  const timingCallbacksRef = useRef<TimingCallbacks | null>(null);
  const lastClickedNoteRef = useRef<LastClickedNote | null>(null);

  const removeHighlight = () => {
    document
      .querySelectorAll('.abcjs-highlight')
      .forEach((el) => el.classList.remove('abcjs-highlight'));
  };

  const addHighlight = (elements: HTMLElement[]) => {
    elements.forEach((element) => {
      element.classList.add('abcjs-highlight');
    });
  };

  const getSelectedBeat = (abcElem: AbcElem) => {
    const currentSelectedNote = abcElem.currentTrackWholeNotes ?? 0;
    const beatLength = visualObjRef.current?.getBeatLength() ?? 1;

    if (Array.isArray(currentSelectedNote)) {
      return currentSelectedNote[0] / beatLength;
    }
    return currentSelectedNote / beatLength;
  };

  const getSelectedIndex = () => {
    const selectedElement = document.querySelector('.abcjs-note_selected');
    return parseInt(selectedElement?.getAttribute('data-index') || '0');
  };

  const handleStop = useCallback(() => {
    if (timingCallbacksRef.current) {
      timingCallbacksRef.current.stop();
    }
    setIsPlaying(false);
    onStop();
    removeHighlight();
  }, [timingCallbacksRef, onStop]);

  const handlePlay = useCallback(() => {
    onStop();
    removeHighlight();
    if (timingCallbacksRef.current) {
      timingCallbacksRef.current.stop();
      timingCallbacksRef.current.start(
        lastClickedNoteRef.current?.beats,
        'beats',
      );
      setIsPlaying(true);
    }
  }, [onStop]);

  useEffect(() => {
    lastClickedNoteRef.current = null;
  }, [abcContent]);

  useEffect(() => {
    const clickListener = (abcElem: AbcElem) => {
      if (visualObjRef.current) {
        const now = performance.now();
        const clickedIndex = getSelectedIndex();
        const prevClickedNote = lastClickedNoteRef.current;
        lastClickedNoteRef.current = {
          index: clickedIndex,
          beats: getSelectedBeat(abcElem),
          clickedAt: now,
        };
        if (
          prevClickedNote?.index === clickedIndex &&
          now - prevClickedNote.clickedAt <= DOUBLE_CLICK_INTERVAL_MS
        ) {
          handleStop();
          handlePlay();
          return;
        }
        if (abcElem.midiPitches && abcElem.midiPitches.length > 0) {
          abcPlayer.play(
            abcElem.midiPitches,
            visualObjRef.current?.millisecondsPerMeasure() / 1000,
          );
        }
      }
    };

    const eventCallback = (ev: NoteTimingEvent | null) => {
      removeHighlight();
      if (!ev) {
        setIsPlaying(false);
        return;
      }
      ev.elements?.forEach((noteGroup) => {
        addHighlight(noteGroup);
      });
      if (ev.midiPitches) {
        abcPlayer.play(ev.midiPitches, ev.millisecondsPerMeasure / 1000);
      }
      return 'continue';
    };

    visualObjRef.current = renderAbc('abcjs-paper', abcContent, {
      responsive: 'resize',
      add_classes: true,
      clickListener,
    })[0];
    visualObjRef.current.setUpAudio({});
    setHasNotes(visualObjRef.current.lines.length > 0);

    timingCallbacksRef.current = new TimingCallbacks(visualObjRef.current, {
      eventCallback,
    });
  }, [abcContent, abcPlayer, handleStop, handlePlay]);

  return (
    <ControlPanel>
      <div className="flex flex-col mb-3 gap-3">
        <ControlSelect
          value={selectedPresetIndex}
          onChange={async (e) => {
            const index = parseInt(e.target.value);
            setSelectedPresetIndex(index);
            if (index >= 0) {
              const content = await getAbcPreset(index);
              setAbcContent(content);
              if (isPlaying) handleStop();
            } else {
              setAbcContent('');
            }
            if (isPlaying) handleStop();
          }}
        >
          <option value={-1}>自定义</option>
          {ABCPresets.map((name, index) => (
            <option key={index} value={index}>
              {name}
            </option>
          ))}
        </ControlSelect>
      </div>

      <textarea
        id="abc-input"
        value={abcContent}
        onChange={(e) => {
          setAbcContent(e.target.value);
          setSelectedPresetIndex(-1);
          if (isPlaying) handleStop();
        }}
        placeholder="输入乐谱或选择预设"
        className="
          w-full h-48 p-3 mb-4 text-sm resize-none
          bg-app-surface-muted/75 dark:bg-app-surface-muted-dark/60
          border border-app-border/80 dark:border-app-border-dark/70
          focus:outline-none focus:ring-2 focus:ring-app-accent/50
        "
      />

      <div className="flex justify-center">
        {hasNotes && (
          <button
            onClick={isPlaying ? handleStop : handlePlay}
            className={`
              w-full py-2 text-app-on-accent rounded-2xl transition-colors
              ${isPlaying ? 'bg-app-danger hover:bg-app-danger-strong' : 'bg-app-success hover:bg-app-success-strong'}
            `}
          >
            {isPlaying ? '停止播放' : '开始播放'}
          </button>
        )}
      </div>

      <div
        id="abcjs-paper"
        className="
          w-full mt-4 rounded-3xl shadow-sm
          border border-app-border/40 dark:border-app-border-dark/80
          bg-app-surface/90 dark:bg-app-surface-dark/60
        "
      />
    </ControlPanel>
  );
}
