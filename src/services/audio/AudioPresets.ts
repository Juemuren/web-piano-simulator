import type {
  TransferFunction,
  TransferFunctionType,
  Timbre,
  TimbreType,
} from '../../types';

export const normalizeAngle = (angle: number) =>
  (((angle % 360) + 540) % 360) - 180;

export function getTimbrePreset(
  type: Exclude<TimbreType, 'custom'>,
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

  const maxAmp = Math.max(...amplitudes);
  const normalized = amplitudes.map((a) => a / maxAmp);
  return { type, amplitudes: normalized };
}

export function getTransferFunctionPreset(
  type: TransferFunctionType,
  tau: number,
  alpha: number,
  fc: number,
  baseFreq: number,
  harmonics: number = 10,
): TransferFunction {
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
        phaseDeg = normalizeAngle(-360 * tau_s * freq);
        break;
      }
      case 'single_echo': {
        const arg = 2 * Math.PI * tau_s * freq;
        const cosArg = Math.cos(arg);
        const sinArg = Math.sin(arg);
        mag = Math.sqrt(1 + alpha * alpha + 2 * alpha * cosArg);
        phaseDeg =
          (-Math.atan2(alpha * sinArg, 1 + alpha * cosArg) * 180) / Math.PI;
        break;
      }
      case 'multi_echo': {
        const arg2 = 2 * Math.PI * tau_s * freq;
        const cosArg2 = Math.cos(arg2);
        const sinArg2 = Math.sin(arg2);
        mag = 1 / Math.sqrt(1 + alpha * alpha - 2 * alpha * cosArg2);
        phaseDeg =
          (-Math.atan2(alpha * sinArg2, 1 - alpha * cosArg2) * 180) / Math.PI;
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
        phaseDeg = normalizeAngle(
          -360 * tau_s * freq -
            (2 * Math.atan2(alpha * sinArg3, 1 - alpha * cosArg3) * 180) /
              Math.PI,
        );
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
    fc,
    magnitudes,
    phases,
  };
}
