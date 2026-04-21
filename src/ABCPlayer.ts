import { AudioEngine } from './AudioEngine';
import type { ABCScore } from './types';

export class ABCPlayer {
  private audioEngine: AudioEngine;
  private isPlaying = false;
  private currentTimeoutIds: number[] = [];
  private onNoteStart?: (pitch: number) => void;
  private onNoteEnd?: (pitch: number) => void;

  constructor(audioEngine: AudioEngine, onNoteStart?: (pitch: number) => void, onNoteEnd?: (pitch: number) => void) {
    this.audioEngine = audioEngine;
    this.onNoteStart = onNoteStart;
    this.onNoteEnd = onNoteEnd;
  }

  play(score: ABCScore): void {
    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    this.currentTimeoutIds = [];

    for (const note of score.notes) {
      const startTimeoutId = window.setTimeout(() => {
        if (this.isPlaying) {
          this.onNoteStart?.(note.pitch);
          this.audioEngine.playNote(note.pitch, note.duration * 2);
        }
      }, note.startTime * 1000);
      this.currentTimeoutIds.push(startTimeoutId);

      const endTimeoutId = window.setTimeout(() => {
        if (this.isPlaying) {
          this.onNoteEnd?.(note.pitch);
        }
      }, (note.startTime + note.duration) * 1000);
      this.currentTimeoutIds.push(endTimeoutId);
    }

    const totalDuration = Math.max(...score.notes.map(n => n.startTime + n.duration));
    const stopTimeoutId = window.setTimeout(() => {
      this.isPlaying = false;
    }, totalDuration * 1000);
    this.currentTimeoutIds.push(stopTimeoutId);
  }

  stop(): void {
    this.isPlaying = false;
    this.currentTimeoutIds.forEach(id => clearTimeout(id));
    this.currentTimeoutIds = [];
    this.audioEngine.stopAll();
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}