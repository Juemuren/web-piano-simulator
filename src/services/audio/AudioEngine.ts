import type { TransferFunction, Timbre } from '../../types';
import { getTimbrePreset, getTransferFunctionPreset } from './AudioPresets';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private timbre: Timbre = getTimbrePreset('ethereal', 0.5);
  private transferFunction: TransferFunction = getTransferFunctionPreset(
    'delay',
    0,
    0,
    20,
    20000,
    440,
  );

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
    this.timbre = timbre;
  }

  getTimbre(): Timbre {
    return this.timbre;
  }

  setTransferFunction(tf: TransferFunction) {
    this.transferFunction = tf;
  }

  getTransferFunction(): TransferFunction {
    return this.transferFunction;
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

  getDecayTime(): number {
    return this.decayTime;
  }

  setDecayTime(value: number) {
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

  getBaseFreq(pitch: number, cents: number) {
    return 440 * Math.pow(2, (pitch + cents / 100 - 69) / 12);
  }

  getTargetGain(timbreAmp: number, transferMag: number, volume: number) {
    return timbreAmp * transferMag * (volume / 127) * this.volumeRatio;
  }

  getDelaySeconds(phaseDeg: number, freq: number) {
    return phaseDeg / (360 * freq);
  }

  async playNote(
    pitch: number,
    duration: number,
    volume: number = 100,
    cents: number = 0,
  ) {
    await this.ensureAudioContextRunning();
    if (!this.audioContext) return;

    const baseFreq = this.getBaseFreq(pitch, cents);
    const harmonics = this.timbre.amplitudes.length;
    const transferFunction = this.transferFunction;
    const { magnitudes, phases } = getTransferFunctionPreset(
      transferFunction.type,
      transferFunction.tau,
      transferFunction.alpha,
      transferFunction.minFreq,
      transferFunction.maxFreq,
      baseFreq,
      harmonics,
    );

    for (let n = 1; n <= harmonics; n++) {
      const freq = baseFreq * n;

      const timbreAmp = this.timbre.amplitudes[n - 1] || 0;
      const transferMag = magnitudes[n - 1] || 0;
      const targetGain = this.getTargetGain(timbreAmp, transferMag, volume);

      const phaseDeg = phases[n - 1] || 0;
      const delaySeconds = this.getDelaySeconds(phaseDeg, freq);

      const now = this.audioContext.currentTime;
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

      const oscillatorNode = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillatorNode.type = this.oscillatorType;
      oscillatorNode.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(this.silenceGain, startTime);
      gainNode.gain.exponentialRampToValueAtTime(attackGain, attackEnd);
      gainNode.gain.exponentialRampToValueAtTime(decayGain, decayEnd);
      gainNode.gain.exponentialRampToValueAtTime(sustainGain, sustainEnd);
      gainNode.gain.exponentialRampToValueAtTime(this.silenceGain, stopTime);

      oscillatorNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillatorNode.onended = () => {
        oscillatorNode.disconnect();
        gainNode.disconnect();
      };

      oscillatorNode.start(startTime);
      oscillatorNode.stop(stopTime);
    }
  }
}
