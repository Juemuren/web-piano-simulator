import { AudioEngine } from '../audio/AudioEngine';
import type { ABCNote } from '../../types';

export class ABCPlayer {
  private audioEngine: AudioEngine;
  private onNoteStart?: (pitch: number) => void;
  private onNoteEnd?: (pitch: number) => void;

  constructor(audioEngine: AudioEngine, onNoteStart?: (pitch: number) => void, onNoteEnd?: (pitch: number) => void) {
    this.audioEngine = audioEngine;
    this.onNoteStart = onNoteStart;
    this.onNoteEnd = onNoteEnd;
  }

  play(note: ABCNote) {
    if (note.isRest || note.isEndTie) {
      return;
    }
    this.onNoteStart?.(note.pitch);
    this.audioEngine.playNote(note.pitch, note.duration);
    setTimeout(() => {
      this.onNoteEnd?.(note.pitch);
    }, (note.duration) * 1000);
  }
}