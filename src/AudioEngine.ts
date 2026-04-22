import type {
  TransferFunction, TransferFunctionPreset,
  Timbre, TimbrePreset
} from "./types";

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private currentTimbre: Timbre = AudioEngine.generatePresetTimbre('normal', 0.5);
  private currentTransferFunction: TransferFunction = AudioEngine.generatePresetTransferFunction('delay', 0, 0, 440);
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];

  constructor() {
    // 初始化
  }

  // 生成预设音色
  static generatePresetTimbre(type: Exclude<TimbrePreset, 'custom'>, lambda?: number): Timbre {
    const harmonics = 10;
    const amplitudes: number[] = [];
    for (let n = 1; n <= harmonics; n++) {
      let amp = 0;
      switch (type) {
        case 'ethereal':
          amp = (1 / (n * n)) * Math.abs(Math.sin((n * Math.PI) / 2));
          break;
        case 'metallic':
          amp = 1 / n;
          break;
        case 'normal':
          amp = (1 / (n * n)) * Math.abs(Math.sin(n * Math.PI * (lambda ?? 0.5)));
          break;
      }
      amplitudes.push(amp);
    }
    const maxAmp = Math.max(...amplitudes, 1);
    const normalized = amplitudes.map(a => a / maxAmp);
    return { type, amplitudes: normalized };
  }

  // 生成预设传递函数
  static generatePresetTransferFunction(type: Exclude<TransferFunctionPreset, 'custom'>, tau: number = 0, alpha: number = 0, fc: number = 440): TransferFunction {
    const { magnitudes, phases } = AudioEngine.computeTransferFunctionForHarmonics(type, tau, alpha, fc, 440);

    return {
      type,
      tau,
      alpha,
      fc,
      magnitudes,
      phases,
    };
  }

  private static computeTransferFunctionForHarmonics(
    type: Exclude<TransferFunctionPreset, 'custom'>,
    tau: number,
    alpha: number,
    fc: number,
    baseFreq: number,
    harmonics: number = 10,
  ): { magnitudes: number[]; phases: number[] } {
    const magnitudes: number[] = [];
    const phases: number[] = [];
    const tau_s = tau / 1000;

    for (let n = 1; n <= harmonics; n++) {
      const freq = baseFreq * n;
      let mag = 1;
      let phaseDeg = 0;

      switch (type) {
        case 'delay': {
          mag = 1;
          phaseDeg = AudioEngine.normalizeAngle(-360 * tau_s * freq);
          break;
        }
        case 'single_echo': {
          const arg = 2 * Math.PI * tau_s * freq;
          const cosArg = Math.cos(arg);
          const sinArg = Math.sin(arg);
          mag = Math.sqrt(1 + alpha * alpha + 2 * alpha * cosArg);
          phaseDeg = -Math.atan2(alpha * sinArg, 1 + alpha * cosArg) * 180 / Math.PI;
          break;
        }
        case 'multi_echo': {
          const arg2 = 2 * Math.PI * tau_s * freq;
          const cosArg2 = Math.cos(arg2);
          const sinArg2 = Math.sin(arg2);
          mag = 1 / Math.sqrt(1 + alpha * alpha - 2 * alpha * cosArg2);
          phaseDeg = -Math.atan2(alpha * sinArg2, 1 - alpha * cosArg2) * 180 / Math.PI;
          break;
        }
        case 'lowpass': {
          mag = freq <= fc ? 1 : 0;
          phaseDeg = 0;
          break;
        }
        case 'highpass': {
          mag = freq >= fc ? 1 : 0;
          phaseDeg = 0;
          break;
        }
        case 'allpass': {
          const arg3 = 2 * Math.PI * tau_s * freq;
          const cosArg3 = Math.cos(arg3);
          const sinArg3 = Math.sin(arg3);
          mag = 1;
          phaseDeg = AudioEngine.normalizeAngle(-360 * tau_s * freq - 2 * Math.atan2(alpha * sinArg3, 1 - alpha * cosArg3) * 180 / Math.PI);
          break;
        }
      }

      magnitudes.push(mag);
      phases.push(phaseDeg);
    }

    return { magnitudes, phases };
  }

  static normalizeAngle = (angle: number) => (((angle % 360) + 540) % 360) - 180;

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
    const tf = this.currentTransferFunction;
    const type = tf.type;
    if (type === 'custom') {
      return {
        magnitudes: this.currentTransferFunction.magnitudes,
        phases: this.currentTransferFunction.phases,
      };
    }
    return AudioEngine.computeTransferFunctionForHarmonics(type, tf.tau, tf.alpha, tf.fc, baseFreq, this.currentTimbre.amplitudes.length);
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