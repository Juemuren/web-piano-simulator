import type { TransferFunction, Timbre } from '../../types';
import {
  computeTransferFunctionForHarmonics,
  generatePresetTimbre,
  generatePresetTransferFunction,
} from './AudioPresets';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private currentTimbre: Timbre = generatePresetTimbre('normal', 0.5);
  private currentTransferFunction: TransferFunction = generatePresetTransferFunction('delay', 0, 0, 440);
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];

  private baseReleaseTime: number = 0.1;
  private oscillatorType: OscillatorType = 'sine';
  private amplitudeMultiplier: number = 0.1;
  private attackTime: number = 0.005;
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

  getBaseReleaseTime(): number {
    return this.baseReleaseTime;
  }

  setBaseReleaseTime(value: number) {
    this.baseReleaseTime = value;
  }

  getOscillatorType(): OscillatorType {
    return this.oscillatorType;
  }

  setOscillatorType(type: OscillatorType) {
    this.oscillatorType = type;
  }

  getAmplitudeMultiplier(): number {
    return this.amplitudeMultiplier;
  }

  setAmplitudeMultiplier(value: number) {
    this.amplitudeMultiplier = value;
  }

  getAttackTime(): number {
    return this.attackTime;
  }

  setAttackTime(value: number) {
    this.attackTime = value;
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

  // 计算传递函数对每个谐波的影响
  private computeTransferFunction(baseFreq: number): { magnitudes: number[], phases: number[] } {
      const transferFunction = this.currentTransferFunction
      if (transferFunction.type === 'custom') {
        return {
          magnitudes: transferFunction.magnitudes,
          phases: transferFunction.phases,
        };
      }
    
      return computeTransferFunctionForHarmonics(
        transferFunction.type,
        transferFunction.tau,
        transferFunction.alpha,
        transferFunction.fc,
        baseFreq,
        this.currentTimbre.amplitudes.length,
      );
  }

  // 计算频率
  getFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // 播放音符
  async playNote(note: number, duration: number = 1) {
    await this.ensureAudioContextRunning();
    if (!this.audioContext) return;

    const baseFreq = this.getFrequency(note);
    const harmonics = this.currentTimbre.amplitudes.length;
    const { magnitudes, phases } = this.computeTransferFunction(baseFreq);

    for (let n = 1; n <= harmonics; n++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      const freq = baseFreq * n;
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      osc.type = this.oscillatorType;

      // 使用当前音色的振幅和传递函数的振幅
      const timbreAmp = this.currentTimbre.amplitudes[n - 1] || 0;
      const transferMag = magnitudes[n - 1] || 0;
      const amplitude = timbreAmp * transferMag * this.amplitudeMultiplier;

      // 为高频谐波设置更快的衰减
      const releaseTime = this.baseReleaseTime / Math.sqrt(n);

      // 相位延迟
      const phaseDeg = phases[n - 1] || 0;
      const phaseDelay = phaseDeg / (360 * freq);

      const startTime = Math.max(0, this.audioContext.currentTime + phaseDelay);
      const stopTime = startTime + duration + releaseTime;
      const targetGain = Math.max(amplitude, this.silenceGain);

      gain.gain.setValueAtTime(this.silenceGain, startTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, startTime + this.attackTime);
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

      // 启动振荡器
      osc.start(startTime);
      osc.stop(stopTime);
    }
  }
}