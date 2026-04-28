import type {
  TransferFunction,
  TransferFunctionType,
  Timbre,
  TimbreType,
} from '../../types';

function delayToArg(delay: number, freq: number) {
  return -2 * Math.PI * delay * freq;
}

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function normalizeDeg(angle: number) {
  return (((angle % 360) + 540) % 360) - 180;
}

function normalizeAmp(amplitudes: number[]) {
  const maxAmplitudes = Math.max(...amplitudes);
  if (maxAmplitudes === 0) return amplitudes.map(() => 0);
  return amplitudes.map((a) => a / maxAmplitudes);
}

export function getTimbrePreset(
  type: TimbreType,
  lambda: number = 0.5,
  sigma: number = 0.8,
  p: number = 1.5,
  harmonics: number = 10,
): Timbre {
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
      case 'pure':
        amp = 1 / (n * n);
        break;
      case 'bright':
        amp = (1 / n) * Math.abs(Math.sin((n * Math.PI) / 2));
        break;
      case 'normal':
        amp = (1 / (n * n)) * Math.abs(Math.sin(n * Math.PI * lambda));
        break;
      case 'soft':
        amp = Math.exp(-sigma * n);
        break;
      case 'realistic':
        amp = (1 / Math.pow(n, p)) * Math.exp(-sigma * n);
        break;
    }
    amplitudes.push(amp);
  }

  return { type, amplitudes: normalizeAmp(amplitudes) };
}

export function getTransferFunctionPreset(
  type: TransferFunctionType,
  tau: number,
  alpha: number,
  minFreq: number,
  maxFreq: number,
  baseFreq: number,
  harmonics: number = 10,
): TransferFunction {
  const magnitudes: number[] = [];
  const phases: number[] = [];
  const delay = tau / 1000;

  for (let n = 1; n <= harmonics; n++) {
    const freq = baseFreq * n;
    let mag = 1;
    let phaseDeg = 0;

    switch (type) {
      case 'delay': {
        mag = 1;
        const arg = delayToArg(delay, freq);
        phaseDeg = normalizeDeg(radToDeg(arg));
        break;
      }
      case 'single_echo': {
        const arg = delayToArg(delay, freq);
        const cosArg = Math.cos(arg);
        const sinArg = Math.sin(arg);
        mag = Math.sqrt(1 + alpha * alpha + 2 * alpha * cosArg);
        const phaseRad = Math.atan2(alpha * sinArg, 1 + alpha * cosArg);
        phaseDeg = radToDeg(phaseRad);
        break;
      }
      case 'multi_echo': {
        const arg = delayToArg(delay, freq);
        const cosArg = Math.cos(arg);
        const sinArg = Math.sin(arg);
        mag = 1 / Math.sqrt(1 + alpha * alpha - 2 * alpha * cosArg);
        const phaseRad = Math.atan2(alpha * sinArg, 1 - alpha * cosArg);
        phaseDeg = radToDeg(phaseRad);
        break;
      }
      case 'all_pass': {
        const arg = delayToArg(delay, freq);
        const cosArg = Math.cos(arg);
        const sinArg = Math.sin(arg);
        mag = 1;
        const phaseRad =
          arg + 2 * Math.atan2(alpha * sinArg, 1 - alpha * cosArg);
        phaseDeg = normalizeDeg(radToDeg(phaseRad));
        break;
      }
      case 'low_pass': {
        mag = freq <= maxFreq ? 1 : 0;
        phaseDeg = 0;
        break;
      }
      case 'high_pass': {
        mag = freq >= minFreq ? 1 : 0;
        phaseDeg = 0;
        break;
      }
      case 'band_pass': {
        mag = freq >= minFreq && freq <= maxFreq ? 1 : 0;
        phaseDeg = 0;
        break;
      }
    }

    magnitudes.push(mag);
    phases.push(phaseDeg);
  }

  return {
    type,
    tau,
    alpha,
    minFreq,
    maxFreq,
    magnitudes,
    phases,
  };
}
