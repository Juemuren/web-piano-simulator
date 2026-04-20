export class AudioEngine {
  private audioContext: AudioContext | null = null;

  constructor() {
    // 初始化 AudioContext
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
  }

  // 计算频率：MIDI 音符号到频率
  getFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // 播放音符
  playNote(note: number, duration: number = 1) {
    if (!this.audioContext) return;

    const baseFreq = this.getFrequency(note);
    const harmonics = 5; // 有限谐波
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    for (let n = 1; n <= harmonics; n++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.frequency.setValueAtTime(baseFreq * n, this.audioContext.currentTime);
      osc.type = 'sine'; // 余弦波

      // 振幅：简单衰减
      const amplitude = 1 / (n * n);
      gain.gain.setValueAtTime(amplitude * 0.1, this.audioContext.currentTime); // 调整音量
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

  // 停止所有声音（简化）
  stopAll() {
    if (this.audioContext) {
      this.audioContext.suspend();
    }
  }
}