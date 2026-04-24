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
      const staffNotes = new Map<number, ABCNote[]>();
      let globalTime = 0;
      let index = 0;

      tune.lines?.forEach(line => {
        let lineMaxTime = 0;

        line.staff?.forEach((staff, staffIndex) => {
          const prevStaffNotes = staffNotes.get(staffIndex) ?? [];
          const currentStaffNotes: ABCNote[] = [];

          staff.voices?.forEach(voice => {
            let voiceTime = 0;
            voice.forEach(element => {
              if (element.el_type === 'note') {
                const rawDuration = typeof element.duration === 'number' ? element.duration : 1;
                const duration = durationToSeconds(rawDuration, meterDen, tempo);
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
                          startTime: globalTime + voiceTime,
                          hasStartTie: pitch.startTie !== undefined,
                          hasEndTie: true,
                          index
                        })
                      }
                    } else if (element.rest) {
                      currentStaffNotes.push({
                        pitch: 0,
                        duration,
                        startTime: globalTime + voiceTime,
                        isRest: true,
                        index
                      });
                    } else {
                      currentStaffNotes.push({
                        pitch: midiNote,
                        duration,
                        startTime: globalTime + voiceTime,
                        isRest: false,
                        hasStartTie: pitch.startTie !== undefined,
                        index
                      });
                    }
                  });
                }
                index++;
                voiceTime += duration;
                lineMaxTime = Math.max(lineMaxTime, voiceTime);
              }
            });
            staffNotes.set(staffIndex, currentStaffNotes);
          });
          allNotes.push(...currentStaffNotes);
        });
        globalTime += lineMaxTime;
      });

      return allNotes
    } catch (error) {
      console.error('Error parsing ABC notation:', error);
      return null;
    }
  }
}