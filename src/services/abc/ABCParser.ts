import { parseOnly } from 'abcjs';
import type { ABCNote, ABCScore } from '../../types';

interface ABCPitch {
  pitch?: number;
  name?: string;
  verticalPos?: number;
  accidental?: string | number;
}

export class ABCParser {
  static parse(abcString: string): ABCScore | null {
    try {
      const tunes = parseOnly(abcString);
      const tune = tunes?.[0];
      if (!tune) return null;
      const title = tune.metaText?.title ?? '';
      const tempo = tune.metaText?.tempo?.bpm ?? 120;
      const staff = tune.lines?.[0]?.staff?.[0];
      const key = staff?.key?.root ?? 'C';
      const meterValue = staff?.meter?.value?.[0];
      const meter = meterValue && meterValue.num && meterValue.den ? `${meterValue.num}/${meterValue.den}` : '4/4';

      const notes: ABCNote[] = [];
      let currentTime = 0;
      const voice = tune.lines
        ?.flatMap(line => line.staff?.[0].voices?.[0])
        .filter(el => el !== undefined);

      if (voice) {
        for (const element of voice) {
          if (element.el_type === 'note' && element.pitches && element.pitches.length > 0) {
            const pitch = element.pitches[0];
            const midiNote = this.pitchToMidi(pitch);
            const rawDuration = typeof element.duration === 'number' ? element.duration : 1;
            const meterDen = meterValue?.den ?? 8
            const duration = this.durationToSeconds(rawDuration, meterDen, tempo);

            notes.push({
              pitch: midiNote,
              duration,
              startTime: currentTime
            });

            currentTime += duration;
          }
        }
      }

      return {
        title,
        key,
        meter,
        notes,
        tempo
      };
    } catch (error) {
      console.error('Error parsing ABC notation:', error);
      return null;
    }
  }

  private static pitchToMidi(pitch: ABCPitch): number {
    const correctVerticalPos = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 25, 26, 28, 30, 32, 33, 35, 37, 39, 41, 43, 45, 47, 48];
    const correctedPos = correctVerticalPos[pitch.verticalPos || 0] || 0;

    let accValue = 0;
    if (typeof pitch.accidental === 'string') {
      switch (pitch.accidental) {
        case 'sharp': accValue = 1; break;
        case 'flat': accValue = -1; break;
        case 'dblsharp': accValue = 2; break;
        case 'dblflat': accValue = -2; break;
        case 'quartersharp': accValue = 0.5; break;
        case 'quarterflat': accValue = -0.5; break;
        case 'natural': accValue = 0; break;
        default: accValue = 0;
      }
    } else if (typeof pitch.accidental === 'number') {
      accValue = pitch.accidental;
    }

    return 60 + correctedPos + accValue;
  }

  private static durationToSeconds(duration: number, meterDen: number, tempo: number): number {
    const secondsPerWholeNote = 60 / tempo;
    // 音符时长 = 音符初始时长 * 拍号分母 * 单位音符时长
    const result = duration * meterDen * secondsPerWholeNote;
    return Math.max(result, 0.1);
  }
}