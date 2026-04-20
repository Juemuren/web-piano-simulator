import React, { useEffect } from 'react';
import { AudioEngine } from './AudioEngine';

interface PianoProps {
  audioEngine: AudioEngine;
}

const Piano: React.FC<PianoProps> = ({ audioEngine }) => {

  useEffect(() => {
    audioEngine.init();
  }, [audioEngine]);

  const playNote = (note: number) => {
    audioEngine.playNote(note, 2); // 播放 2 秒
  };

  // 简单键盘：C4 到 C5
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
      {keys.map((key) => (
        <button
          key={key.note}
          onClick={() => playNote(key.note)}
          className={`w-1/13 h-37.5 border border-black ${
            key.label.includes('#') ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
};

export default Piano;