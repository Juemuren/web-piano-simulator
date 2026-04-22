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
    const baseReleaseTime = 0.1;

    for (let n = 1; n <= harmonics; n++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      const freq = baseFreq * n;
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      osc.type = 'sine';

      // 使用当前音色的振幅和传递函数的振幅
      const timbreAmp = this.currentTimbre.amplitudes[n - 1] || 0;
      const transferMag = magnitudes[n - 1] || 0;
      const amplitude = timbreAmp * transferMag * 0.1;

      // 为高频谐波设置更快的衰减
      const releaseTime = baseReleaseTime / Math.sqrt(n);

      // 相位延迟
      const phaseDeg = phases[n - 1] || 0;
      const phaseDelay = phaseDeg / (360 * freq);
      const startTime = Math.max(0, this.audioContext.currentTime + phaseDelay);
      const stopTime = startTime + duration + releaseTime;

      const attackTime = 0.005;
      const initialGain = 0.00001;
      const targetGain = Math.max(amplitude, initialGain);

      gain.gain.setValueAtTime(initialGain, this.audioContext.currentTime);
      gain.gain.setValueAtTime(initialGain, startTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, startTime + attackTime);
      gain.gain.exponentialRampToValueAtTime(initialGain, stopTime);

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