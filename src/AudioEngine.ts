export interface Timbre {
  name: string;
  amplitudes: number[];
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private currentTimbre: Timbre = AudioEngine.generatePresetTimbre('normal', 0.5);

  constructor() {
    // 初始化
  }

  // 生成预设音色
  static generatePresetTimbre(type: 'ethereal' | 'metallic' | 'normal', lambda?: number): Timbre {
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
    return { name: type, amplitudes: normalized };
  }

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

  // 计算频率
  getFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // 播放音符
  playNote(note: number, duration: number = 1) {
    if (!this.audioContext) return;

    const baseFreq = this.getFrequency(note);
    const harmonics = this.currentTimbre.amplitudes.length;
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    for (let n = 1; n <= harmonics; n++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.frequency.setValueAtTime(baseFreq * n, this.audioContext.currentTime);
      osc.type = 'sine';

      // 使用当前音色的振幅
      const amplitude = this.currentTimbre.amplitudes[n - 1] || 0;
      gain.gain.setValueAtTime(amplitude * 0.1, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      oscillators.push(osc);
      gains.push(gain);
    }

    // 启动振荡器
    oscillators.forEach(osc => osc.start());
    oscillators.forEach(osc => osc.stop(this.audioContext!.currentTime + duration));
  }

  // 停止所有声音
  stopAll() {
    if (this.audioContext) {
      this.audioContext.suspend();
    }
  }
}