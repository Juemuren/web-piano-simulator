import React, { useEffect, useState } from 'react';
import { AudioEngine } from '../services/audio/AudioEngine';

interface PianoProps {
  audioEngine: AudioEngine;
  playingNotes?: Set<number>;
}

const Piano: React.FC<PianoProps> = ({ audioEngine, playingNotes = new Set() }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    audioEngine.init();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [audioEngine]);

  const playNote = (note: number) => {
    audioEngine.playNote(note, 2); // 播放 2 秒
  };

  const handleKeyDown = (e: React.MouseEvent | React.TouchEvent, note: number) => {
    if (!('touches' in e)) {
      e.preventDefault();
    }
    setPressedKeys(prev => new Set(prev).add(note));
    playNote(note);
  };

  const handleKeyUp = (e: React.MouseEvent | React.TouchEvent, note: number) => {
    e.preventDefault();
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const numKeys = Math.min(37, Math.max(13, Math.floor(windowWidth / 30)));
  const centerNote = 66; // F#4
  const startNote = centerNote - Math.floor((numKeys - 1) / 2);
  const keys = Array.from({ length: numKeys }, (_, index) => {
    const note = startNote + index;
    const name = noteNames[note % 12];
    const octave = Math.floor(note / 12) - 1;
    return {
      note,
      char: name[0],
      number: octave,
      isBlack: name.includes('#')
    };
  });

  return (
    <div className="w-full">
      <div className="flex justify-center">
        {keys.map((key) => {
          const isPressed = pressedKeys.has(key.note) || playingNotes.has(key.note);
          return (
            <button
              key={key.note}
              onMouseDown={(e) => handleKeyDown(e, key.note)}
              onMouseUp={(e) => handleKeyUp(e, key.note)}
              onMouseLeave={(e) => handleKeyUp(e, key.note)}
              onTouchStart={(e) => handleKeyDown(e, key.note)}
              onTouchEnd={(e) => handleKeyUp(e, key.note)}
              onTouchCancel={(e) => handleKeyUp(e, key.note)}
              className={`text-xs w-6 h-37.5 border border-black transition-all duration-100 ${
                key.isBlack
                  ? isPressed
                    ? 'bg-blue-800 text-white shadow-inner'
                    : 'bg-black text-white'
                  : isPressed
                  ? 'bg-blue-200 text-black shadow-inner'
                  : 'bg-white text-black'
              }`}
              style={{
                transform: isPressed ? 'translateY(2px)' : 'translateY(0px)',
              }}
            >
              <span className="items-baseline">
                {key.char}
                <span className="inline-flex flex-col">
                  {key.isBlack && <sup className="-top-2">#</sup>}
                  <sub>{key.number}</sub>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Piano;