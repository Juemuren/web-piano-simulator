import { type Accidental, type AccidentalName } from 'abcjs';

export interface ABCPitch {
  pitch?: number;
  name?: string;
  accidental?: AccidentalName;
}

export function pitchToMidi(pitch: ABCPitch, accidentals: Accidental[]): number {
  const defaultNotes = 60 // C4
  const octave_offset = [0, 2, 4, 5, 7, 9, 11];
  const currentNotes = pitch?.pitch ?? defaultNotes
  const octave = Math.floor(currentNotes / 7);
  const idx = ((currentNotes % 7) + 7) % 7;
  const correctedPos = octave * 12 + octave_offset[idx];

  const accidentalMap: Record<string, number> = {};
  accidentals.forEach(({ acc, note }) => {
    const accChange = semitoneShift(acc)
    accidentalMap[note.toLowerCase()] = accChange;
  });

  let accChange = 0;
  if (pitch?.accidental) {
    accChange = semitoneShift(pitch.accidental)
  } else {
    const noteName = pitch?.name?.[0]?.toLowerCase() ?? 'c';
    accChange = accidentalMap[noteName] || 0;
  }

  return defaultNotes + correctedPos + accChange;
}

export function semitoneShift(acc: AccidentalName): number {
  let change = 0;
  switch (acc) {
    case 'sharp': change = 1; break;
    case 'flat': change = -1; break;
    case 'dblsharp': change = 2; break;
    case 'dblflat': change = -2; break;
    case 'natural': change = 0; break;
    default: break;
  }
  return change
}
