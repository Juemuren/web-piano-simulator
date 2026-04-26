import { AudioEngine } from '../audio/AudioEngine';
import { type MidiPitch, type MidiPitches } from 'abcjs';

export class ABCPlayer {
  private audioEngine: AudioEngine;
  private onNoteStart?: (pitch: number) => void;
  private onNoteEnd?: (pitch: number) => void;

  constructor(audioEngine: AudioEngine, onNoteStart?: (pitch: number) => void, onNoteEnd?: (pitch: number) => void) {
    this.audioEngine = audioEngine;
    this.onNoteStart = onNoteStart;
    this.onNoteEnd = onNoteEnd;
  }

  playSinglePitch(midiPitch: MidiPitch) {
    const { pitch, duration, volume, cents } = midiPitch

    this.onNoteStart?.(pitch);
    this.audioEngine.playNote(pitch, duration, volume, cents);
    setTimeout(() => {
      this.onNoteEnd?.(pitch);
    }, duration * 1000);
  };

  play(midiPitches: MidiPitches) {
    midiPitches.forEach(midiPitch => {
      this.playSinglePitch(midiPitch)
    })
  }
}
