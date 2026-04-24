import { type Accidental, parseOnly } from 'abcjs';
import type { ABCNote } from '../../types';
import { pitchToMidi } from './ABCHelper'

export class ABCParser {
  public accidentals: Accidental[];

  constructor() {
    this.accidentals = [];
  }

  parse(abcString: string): ABCNote[] | null {
    try {
      const tunes = parseOnly(abcString);
      const tune = tunes?.[0];
      if (!tune) return null;
      const beatPerMinute = tune.metaText?.tempo?.bpm ?? 120;
      const meterDen = tune.getMeterFraction()?.den ?? 8;
      this.accidentals = tune.getKeySignature()?.accidentals ?? []

      const allNotes: ABCNote[] = [];
      const staffNotes = new Map<number, ABCNote[]>();
      const beatsCountMap = new Map<number, number>();
      let index = 0;

      tune.lines?.forEach(line => {
        line.staff?.forEach((staff, staffIndex) => {
          const prevStaffNotes = staffNotes.get(staffIndex) ?? [];
          let beatsCount = beatsCountMap.get(staffIndex) ?? 0;
          const currentStaffNotes: ABCNote[] = [];

          staff.voices?.forEach(voice => {
            voice.forEach(element => {
              if (element.el_type === 'note') {
                const rawDuration = element.duration;
                const beats = rawDuration * meterDen
                const duration = beats * 60 / beatPerMinute;
                if (element.pitches && element.pitches.length > 0) {
                  element.pitches.forEach(pitch => {
                    const midiNote = pitchToMidi(pitch, this.accidentals);
                    if (pitch.endTie) {
                      let prevNote
                      if (currentStaffNotes.length > 0) {
                        prevNote = currentStaffNotes.at(-1)
                      } else {
                        prevNote = prevStaffNotes.at(-1)
                      }
                      if (prevNote) {
                        prevNote.duration += duration;
                        currentStaffNotes.push({
                          pitch: midiNote,
                          duration: 0,
                          hasStartTie: pitch.startTie !== undefined,
                          hasEndTie: true,
                          index,
                          beats: beatsCount,
                        })
                      }
                    } else if (element.rest) {
                      currentStaffNotes.push({
                        pitch: 0,
                        duration,
                        isRest: true,
                        index,
                        beats: beatsCount,
                      });
                    } else {
                      currentStaffNotes.push({
                        pitch: midiNote,
                        duration,
                        isRest: false,
                        hasStartTie: pitch.startTie !== undefined,
                        index,
                        beats: beatsCount,
                      });
                    }
                  });
                }
                index++;
                beatsCount += beats;
              }
            });
            staffNotes.set(staffIndex, currentStaffNotes);
            beatsCountMap.set(staffIndex, beatsCount)
          });
          allNotes.push(...currentStaffNotes);
        });
      });

      return allNotes
    } catch (error) {
      console.error('Error parsing ABC notation:', error);
      return null;
    }
  }
}