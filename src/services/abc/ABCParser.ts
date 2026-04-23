import { type Accidental, parseOnly } from 'abcjs';
import type { ABCNote } from '../../types';
import { pitchToMidi, durationToSeconds } from './ABCHelper'

export class ABCParser {
  public accidentals: Accidental[];

  constructor() {
    this.accidentals = []
  }

  parse(abcString: string): ABCNote[] | null {
    try {
      const tunes = parseOnly(abcString);
      const tune = tunes?.[0];
      if (!tune) return null;
      const tempo = tune.metaText?.tempo?.bpm ?? 120;
      const meterDen = tune.getMeterFraction()?.den ?? 8
      this.accidentals = tune.getKeySignature()?.accidentals ?? []

      const notes: ABCNote[] = [];
      let currentTime = 0;
      const voice = tune.lines
        ?.flatMap(line => line.staff?.[0].voices?.[0])
        .filter(el => el !== undefined);

      if (voice) {
        for (const element of voice) {
          if (element.el_type === 'note' && element.pitches && element.pitches.length > 0) {
            const rawDuration = typeof element.duration === 'number' ? element.duration : 1;
            const duration = durationToSeconds(rawDuration, meterDen, tempo);
            element.pitches.forEach(pitch => {
              const midiNote = pitchToMidi(pitch, this.accidentals);
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
}