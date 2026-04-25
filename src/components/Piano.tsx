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
    audioEngine.playNote(note, 1);
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

  const whiteKeyWidth = 30;
  const blackKeyWidth = 24;
  const whiteKeyHeight = 160;
  const blackKeyHeight = 100;
  const avgKeyWidth = 20
  const maxNumKeys = 85 // C1 -> C8
  const minNumKeys = 13 // C4 -> C5
  const centerNote = 66; // F#4

  const numKeys = Math.min(maxNumKeys, Math.max(minNumKeys, Math.floor(windowWidth / avgKeyWidth)));
  const startNote = centerNote - Math.floor((numKeys - 1) / 2);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const whiteKeys = [];
  const blackKeys = [];
  for (let index = 0; index < numKeys; index++) {
    const note = startNote + index;
    const name = noteNames[note % 12];
    const octave = Math.floor(note / 12) - 1;
    const keyInfo = {
      note,
      char: name[0],
      number: octave,
    };
    
    if (name.includes('#')) {
      const whiteKeyIndex = whiteKeys.length;
      blackKeys.push({ ...keyInfo, position: whiteKeyIndex });
    } else {
      whiteKeys.push(keyInfo);
    }
  }

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="relative inline-block" style={{ height: whiteKeyHeight }}>
        <div className="flex">
          {whiteKeys.map((key) => {
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
                className={`text-xs border border-gray-400 transition-all duration-100 ${
                  isPressed
                    ? 'bg-blue-200 text-black shadow-inner'
                    : 'bg-white text-black'
                }`}
                style={{
                  width: whiteKeyWidth,
                  height: whiteKeyHeight,
                  transform: isPressed ? 'translateY(2px)' : 'translateY(0px)',
                }}
              >
                <span className="flex flex-col items-center justify-end h-full pb-2">
                  <span>{key.char}<sub>{key.number}</sub></span>
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="flex absolute top-0 left-0">
          {blackKeys.map((key) => {
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
                className={`text-xs border border-gray-600 transition-all duration-100 ${
                  isPressed
                    ? 'bg-blue-800 text-white shadow-inner'
                    : 'bg-black text-white'
                }`}
                style={{
                  width: blackKeyWidth,
                  height: blackKeyHeight,
                  position: 'absolute',
                  left: key.position * whiteKeyWidth - blackKeyWidth / 2,
                  transform: isPressed ? 'translateY(2px)' : 'translateY(0px)',
                  zIndex: 10,
                }}
              >
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Piano;