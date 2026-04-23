import { type Accidental, type AccidentalName, parseOnly } from 'abcjs';
import type { ABCNote } from '../../types';

interface ABCPitch {
  pitch?: number;
  name?: string;
  verticalPos?: number;
  accidental?: AccidentalName;
}

export class ABCParser {
  static parse(abcString: string): ABCNote[] | null {
    try {
      const tunes = parseOnly(abcString);
      const tune = tunes?.[0];
      if (!tune) return null;
      const tempo = tune.metaText?.tempo?.bpm ?? 120;
      const meterDen = tune.getMeterFraction()?.den ?? 8
      const accidentals = tune.getKeySignature()?.accidentals ?? []

      const notes: ABCNote[] = [];
      let currentTime = 0;
      const voice = tune.lines
        ?.flatMap(line => line.staff?.[0].voices?.[0])
        .filter(el => el !== undefined);

      if (voice) {
        for (const element of voice) {
          if (element.el_type === 'note' && element.pitches && element.pitches.length > 0) {
            const rawDuration = typeof element.duration === 'number' ? element.duration : 1;
            const duration = this.durationToSeconds(rawDuration, meterDen, tempo);
            element.pitches.forEach(pitch => {
              const midiNote = this.pitchToMidi(pitch, accidentals);
              notes.push({
                pitch: midiNote,
                duration,
                startTime: currentTime
              });
            });
            currentTime += duration;
          }
        }
      }

      return notes
    } catch (error) {
      console.error('Error parsing ABC notation:', error);
      return null;
    }
  }

  private static pitchToMidi(pitch: ABCPitch, accidentals: Accidental[]): number {
    const defaultNotes = 60 // C4
    const octave_offset = [0, 2, 4, 5, 7, 9, 11];
    const currentNotes = pitch?.verticalPos ?? defaultNotes
    const octave = Math.floor(currentNotes / 7);
    const idx = ((currentNotes % 7) + 7) % 7;
    const correctedPos = octave * 12 + octave_offset[idx];

    const accidentalMap: Record<string, number> = {};
    accidentals.forEach(({ acc, note }) => {
      const accChange = this.semitoneShift(acc)
      accidentalMap[note.toLowerCase()] = accChange;
    });

    let accChange = 0;
    if (pitch?.accidental) {
      accChange = this.semitoneShift(pitch.accidental)
    } else {
      const noteName = pitch?.name?.[0]?.toLowerCase() ?? 'c';
      accChange = accidentalMap[noteName] || 0;
    }

    return defaultNotes + correctedPos + accChange;
  }

  private static semitoneShift(acc: AccidentalName): number {
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

  private static durationToSeconds(duration: number, meterDen: number, tempo: number): number {
    const secondsPerBeats = 60 / tempo;
    const beatsForNotes = duration * meterDen
    // 音符时长 = 音符节拍数 * 每节拍秒数
    const result = beatsForNotes * secondsPerBeats;
    return Math.max(result, 0.1);
  }
}