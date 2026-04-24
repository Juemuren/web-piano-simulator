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

      const allNotes: ABCNote[] = [];
      let globalTime = 0;

      tune.lines?.forEach(line => {
        const lineNotes: ABCNote[] = [];
        let lineMaxTime = 0;

        line.staff?.forEach(staff => {
          staff.voices?.forEach(voice => {
            let voiceTime = 0;
            voice.forEach(element => {
              if (element.el_type === 'note') {
                const rawDuration = typeof element.duration === 'number' ? element.duration : 1;
                const duration = durationToSeconds(rawDuration, meterDen, tempo);
                if (element.pitches && element.pitches.length > 0) {
                  element.pitches.forEach(pitch => {
                    const midiNote = pitchToMidi(pitch, this.accidentals);
                    lineNotes.push({
                      pitch: midiNote,
                      duration,
                      startTime: globalTime + voiceTime,
                      isRest: false
                    });
                  });
                } else if (element.rest) {
                  lineNotes.push({
                    pitch: 0,
                    duration,
                    startTime: globalTime + voiceTime,
                    isRest: true
                  });
                }
                voiceTime += duration;
                lineMaxTime = Math.max(lineMaxTime, voiceTime);
              }
            });
          });
        });

        allNotes.push(...lineNotes);
        globalTime += lineMaxTime;
      });

      return allNotes
    } catch (error) {
      console.error('Error parsing ABC notation:', error);
      return null;
    }
  }
}