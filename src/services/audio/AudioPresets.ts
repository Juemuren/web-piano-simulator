import type {
  TransferFunction, TransferFunctionPreset,
  Timbre, TimbrePreset
} from '../../types';

export const normalizeAngle = (angle: number) => (((angle % 360) + 540) % 360) - 180;

export function generatePresetTimbre(type: Exclude<TimbrePreset, 'custom'>, lambda?: number): Timbre {
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

export function computeTransferFunctionForHarmonics(
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
        phaseDeg = normalizeAngle(-360 * tau_s * freq);
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
        phaseDeg = normalizeAngle(-360 * tau_s * freq - 2 * Math.atan2(alpha * sinArg3, 1 - alpha * cosArg3) * 180 / Math.PI);
        break;
      }
    }

    magnitudes.push(mag);
    phases.push(phaseDeg);
  }

  return { magnitudes, phases };
}

export function generatePresetTransferFunction(
  type: Exclude<TransferFunctionPreset, 'custom'>,
  tau: number = 0,
  alpha: number = 0,
  fc: number = 440,
): TransferFunction {
  const { magnitudes, phases } = computeTransferFunctionForHarmonics(type, tau, alpha, fc, 440);
  return {
    type,
    tau,
    alpha,
    fc,
    magnitudes,
    phases,
  };
}
