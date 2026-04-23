import type { TransferFunction, Timbre } from '../../types';
import {
  computeTransferFunction,
  generatePresetTimbre,
  generatePresetTransferFunction,
} from './AudioPresets';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private currentTimbre: Timbre = generatePresetTimbre('ethereal', 0.5);
  private currentTransferFunction: TransferFunction = generatePresetTransferFunction('delay', 0, 0, 2000);
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];

  private oscillatorType: OscillatorType = 'sine';
  private volume: number = 0.2;
  private attackTime: number = 0.01;
  private decayTime: number = 0.4;
  private releaseTime: number = 0.3;
  private sustainGain: number = 0.4;
  private silenceGain: number = 0.00001;

  init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
  }

  setTimbre(timbre: Timbre) {
    this.currentTimbre = timbre;
  }

  getCurrentTimbre(): Timbre {
    return this.currentTimbre;
  }

  setTransferFunction(tf: TransferFunction) {
    this.currentTransferFunction = tf;
  }

  getCurrentTransferFunction(): TransferFunction {
    return this.currentTransferFunction;
  }

  getOscillatorType(): OscillatorType {
    return this.oscillatorType;
  }

  setOscillatorType(type: OscillatorType) {
    this.oscillatorType = type;
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(value: number) {
    this.volume = value;
  }

  getAttackTime(): number {
    return this.attackTime;
  }

  setAttackTime(value: number) {
    this.attackTime = value;
  }

  getDelayTime(): number {
    return this.decayTime;
  }

  setDelayTime(value: number) {
    this.decayTime = value;
  }

  getReleaseTime(): number {
    return this.releaseTime;
  }

  setReleaseTime(value: number) {
    this.releaseTime = value;
  }

  getSustainGain(): number {
    return this.sustainGain;
  }

  setSustainGain(value: number) {
    this.sustainGain = value;
  }

  getSilenceGain(): number {
    return this.silenceGain;
  }

  setSilenceGain(value: number) {
    this.silenceGain = value;
  }

  private async ensureAudioContextRunning(): Promise<void> {
    if (!this.audioContext) {
      this.init();
    }
    if (!this.audioContext) {
      return;
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    if (this.audioContext.state === 'closed') {
      this.init();
    }
  }

  getFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  async playNote(note: number, duration: number = 1) {
    await this.ensureAudioContextRunning();
    if (!this.audioContext) return;

    const baseFreq = this.getFrequency(note);
    const harmonics = this.currentTimbre.amplitudes.length;
    const transferFunction = this.currentTransferFunction
    const { magnitudes, phases } = computeTransferFunction(
      transferFunction.type,
      transferFunction.tau,
      transferFunction.alpha,
      transferFunction.fc,
      baseFreq,
      this.currentTimbre.amplitudes.length,
    );;

    for (let n = 1; n <= harmonics; n++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      const freq = baseFreq * n;
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      osc.type = this.oscillatorType;

      // 处理振幅
      const timbreAmp = this.currentTimbre.amplitudes[n - 1] || 0;
      const transferMag = magnitudes[n - 1] || 0;
      const amplitude = timbreAmp * transferMag * this.volume;

      // 处理相位
      const phaseDeg = phases[n - 1] || 0;
      const phaseDelay = phaseDeg / (360 * freq);

      // 高频谐波快速衰减
      const releaseTime = this.releaseTime / Math.sqrt(n);
      const decayTime = this.decayTime / Math.sqrt(n);

      const startTime = Math.max(0, this.audioContext.currentTime + phaseDelay);
      const stopTime = startTime + duration + decayTime + releaseTime;
      const targetGain = Math.max(amplitude, this.silenceGain);

      gain.gain.setValueAtTime(this.silenceGain, startTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, startTime + this.attackTime);
      gain.gain.exponentialRampToValueAtTime(this.sustainGain * targetGain, startTime + this.attackTime + decayTime);
      gain.gain.exponentialRampToValueAtTime(this.silenceGain, stopTime);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      this.activeOscillators.push(osc);
      this.activeGains.push(gain);

      osc.onended = () => {
        this.activeOscillators = this.activeOscillators.filter(active => active !== osc);
        this.activeGains = this.activeGains.filter(active => active !== gain);
        osc.disconnect();
        gain.disconnect();
      };

      osc.start(startTime);
      osc.stop(stopTime);
    }
  }
}