import { AudioEngine } from './AudioEngine';
import type { ABCScore } from './types';

export class ABCPlayer {
  private audioEngine: AudioEngine;
  private isPlaying = false;
  private currentTimeoutIds: number[] = [];

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  play(score: ABCScore): void {
    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    this.currentTimeoutIds = [];

    for (const note of score.notes) {
      const timeoutId = window.setTimeout(() => {
        if (this.isPlaying) {
          this.audioEngine.playNote(note.pitch, note.duration * 2);
        }
      }, note.startTime * 1000);
      this.currentTimeoutIds.push(timeoutId);
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