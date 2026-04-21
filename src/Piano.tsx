import React, { useEffect, useState } from 'react';
import { AudioEngine } from './AudioEngine';

interface PianoProps {
  audioEngine: AudioEngine;
}

const Piano: React.FC<PianoProps> = ({ audioEngine }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  useEffect(() => {
    audioEngine.init();
  }, [audioEngine]);

  const playNote = (note: number) => {
    audioEngine.playNote(note, 2); // 播放 2 秒
  };

  const handleMouseDown = (note: number) => {
    setPressedKeys(prev => new Set(prev).add(note));
    playNote(note);
  };

  const handleMouseUp = (note: number) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  // 从C4 到 C5 的简单键盘
  const keys = [
    { note: 60, label: 'C4' },
    { note: 61, label: 'C#4' },
    { note: 62, label: 'D4' },
    { note: 63, label: 'D#4' },
    { note: 64, label: 'E4' },
    { note: 65, label: 'F4' },
    { note: 66, label: 'F#4' },
    { note: 67, label: 'G4' },
    { note: 68, label: 'G#4' },
    { note: 69, label: 'A4' },
    { note: 70, label: 'A#4' },
    { note: 71, label: 'B4' },
    { note: 72, label: 'C5' },
  ];

  return (
    <div className="w-full flex flex-wrap">
      {keys.map((key) => {
        const isPressed = pressedKeys.has(key.note);
        const isBlack = key.label.includes('#');
        return (
          <button
            key={key.note}
            onMouseDown={() => handleMouseDown(key.note)}
            onMouseUp={() => handleMouseUp(key.note)}
            onMouseLeave={() => handleMouseUp(key.note)}
            className={`text-xs sm:text-sm w-1/13 h-37.5 border border-black transition-all duration-100 ${
              isBlack
                ? isPressed
                  ? 'bg-gray-800 text-white shadow-inner'
                  : 'bg-black text-white'
                : isPressed
                ? 'bg-gray-200 text-black shadow-inner'
                : 'bg-white text-black'
            }`}
            style={{
              transform: isPressed ? 'translateY(2px)' : 'translateY(0px)',
            }}
          >
            {key.label}
          </button>
        );
      })}
    </div>
  );
};

export default Piano;