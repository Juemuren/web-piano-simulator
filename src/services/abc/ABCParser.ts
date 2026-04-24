import { type Accidental, parseOnly } from 'abcjs';
import type { ABCNote } from '../../types';
import { pitchToMidi } from './ABCHelper'

export class ABCParser {
  public accidentals: Accidental[];

  constructor() {
    this.accidentals = [];
  }

  parse(abcString: string): ABCNote[] | null {
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
              if (element.rest) {
                currentStaffNotes.push({
                  pitch: 0,
                  duration,
                  isRest: true,
                  index,
                  beats: beatsCount,
                });
              } else {
                element.pitches?.forEach(pitch => {
                  const midiPitch = pitchToMidi(pitch, this.accidentals);
                  if (pitch.endTie) {
                    let prevNote
                    prevNote = currentStaffNotes.find(note => note.isStartTie)
                    if (!prevNote) {
                      prevNote = prevStaffNotes.find(note => note.isStartTie)
                    }
                    if (prevNote && prevNote?.isStartTie) {
                      prevNote.duration += duration;
                      currentStaffNotes.push({
                        pitch: midiPitch,
                        duration: 0,
                        isEndTie: true,
                        index,
                        beats: beatsCount,
                      })
                    }
                  } else {
                    currentStaffNotes.push({
                      pitch: midiPitch,
                      duration,
                      isStartTie: pitch.startTie !== undefined,
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
  }
}