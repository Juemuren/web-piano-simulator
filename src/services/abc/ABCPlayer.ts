import { AudioEngine } from '../audio/AudioEngine';
import type { ABCPitch } from '../../types';

export class ABCPlayer {
  private audioEngine: AudioEngine;
  private onNoteStart?: (pitch: number) => void;
  private onNoteEnd?: (pitch: number) => void;

  constructor(audioEngine: AudioEngine, onNoteStart?: (pitch: number) => void, onNoteEnd?: (pitch: number) => void) {
    this.audioEngine = audioEngine;
    this.onNoteStart = onNoteStart;
    this.onNoteEnd = onNoteEnd;
  }

  play(note: ABCPitch) {
    this.onNoteStart?.(note.pitch);
    this.audioEngine.playNote(note.pitch, note.duration);
    setTimeout(() => {
      this.onNoteEnd?.(note.pitch);
    }, (note.duration) * 1000);
  }
}