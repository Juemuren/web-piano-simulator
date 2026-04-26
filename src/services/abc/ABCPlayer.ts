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

  // TODO 支持 MidiPitch 的更多属性
  playSinglePitch(midiPitch: MidiPitch) {
    this.onNoteStart?.(midiPitch.pitch);
    this.audioEngine.playNote(midiPitch.pitch, midiPitch.duration);
    setTimeout(() => {
      this.onNoteEnd?.(midiPitch.pitch);
    }, (midiPitch.duration) * 1000);
  }

  play(midiPitches: MidiPitches) {
    midiPitches.forEach(midiPitch => {
      this.playSinglePitch(midiPitch)
    })
  }

}