import type { TransferFunction, Timbre } from '../../types';
import {
  computeTransferFunction,
  generatePresetTimbre,
  generatePresetTransferFunction,
} from './AudioPresets';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private currentTimbre: Timbre = generatePresetTimbre('ethereal', 0.5);
  private currentTransferFunction: TransferFunction =
    generatePresetTransferFunction('delay', 0, 0, 2000);
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];

  private oscillatorType: OscillatorType = 'sine';
  private volumeRatio: number = 0.2;
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
    return this.volumeRatio;
  }

  setVolume(value: number) {
    this.volumeRatio = value;
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

  getBaseFreq(pitch: number) {
    return 440 * Math.pow(2, (pitch - 69) / 12);
  }

  getTargetGain(timbreAmp: number, transferMag: number, volume: number) {
    return timbreAmp * transferMag * this.volumeRatio * (volume / 127);
  }

  getDelaySecond(phaseDeg: number, freq: number) {
    return phaseDeg / (360 * freq);
  }

  async playNote(
    pitch: number,
    duration: number,
    volume: number,
    cents: number = 0,
  ) {
    await this.ensureAudioContextRunning();
    if (!this.audioContext) return;

    const baseFreq = this.getBaseFreq(pitch + cents / 100);
    const harmonics = this.currentTimbre.amplitudes.length;
    const transferFunction = this.currentTransferFunction;
    const { magnitudes, phases } = computeTransferFunction(
      transferFunction.type,
      transferFunction.tau,
      transferFunction.alpha,
      transferFunction.fc,
      baseFreq,
      this.currentTimbre.amplitudes.length,
    );

    for (let n = 1; n <= harmonics; n++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const now = this.audioContext.currentTime;

      const freq = baseFreq * n;
      osc.frequency.setValueAtTime(freq, now);
      osc.type = this.oscillatorType;

      const timbreAmp = this.currentTimbre.amplitudes[n - 1] || 0;
      const transferMag = magnitudes[n - 1] || 0;
      const targetGain = this.getTargetGain(timbreAmp, transferMag, volume);

      const phaseDeg = phases[n - 1] || 0;
      const delaySeconds = this.getDelaySecond(phaseDeg, freq);

      const startTime = Math.max(0, now + delaySeconds);
      const attackEnd = startTime + this.attackTime;
      const decayEnd = attackEnd + this.decayTime / Math.sqrt(n);
      const sustainEnd = decayEnd + duration;
      const stopTime = sustainEnd + this.releaseTime / Math.sqrt(n);

      const attackGain = Math.max(targetGain, this.silenceGain);
      const decayGain = Math.max(
        attackGain * this.sustainGain,
        this.silenceGain,
      );
      const sustainGain = Math.max(
        decayGain / Math.sqrt(1 + n),
        this.silenceGain,
      );

      gain.gain.setValueAtTime(this.silenceGain, startTime);
      gain.gain.exponentialRampToValueAtTime(attackGain, attackEnd);
      gain.gain.exponentialRampToValueAtTime(decayGain, decayEnd);
      gain.gain.exponentialRampToValueAtTime(sustainGain, sustainEnd);
      gain.gain.exponentialRampToValueAtTime(this.silenceGain, stopTime);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      this.activeOscillators.push(osc);
      this.activeGains.push(gain);

      osc.onended = () => {
        this.activeOscillators = this.activeOscillators.filter(
          (active) => active !== osc,
        );
        this.activeGains = this.activeGains.filter((active) => active !== gain);
        osc.disconnect();
        gain.disconnect();
      };

      osc.start(startTime);
      osc.stop(stopTime);
    }
  }
}
