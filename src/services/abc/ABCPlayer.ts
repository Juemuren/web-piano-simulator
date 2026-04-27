import { AudioEngine } from '../audio/AudioEngine';
import { type MidiPitches } from 'abcjs';

export class ABCPlayer {
  private audioEngine: AudioEngine;
  private onNoteStart?: (pitch: number) => void;
  private onNoteEnd?: (pitch: number) => void;

  constructor(
    audioEngine: AudioEngine,
    onNoteStart?: (pitch: number) => void,
    onNoteEnd?: (pitch: number) => void,
  ) {
    this.audioEngine = audioEngine;
    this.onNoteStart = onNoteStart;
    this.onNoteEnd = onNoteEnd;
  }

  play(midiPitches: MidiPitches, secondsPerDuration: number) {
    midiPitches.forEach(({ pitch, duration, volume, cents }) => {
      const correctDuration = duration * secondsPerDuration;

      this.onNoteStart?.(pitch);
      this.audioEngine.playNote(pitch, correctDuration, volume, cents);
      setTimeout(() => {
        this.onNoteEnd?.(pitch);
      }, correctDuration * 1000);
    });
  }
}
