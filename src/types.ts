export type TimbrePreset = 'ethereal' | 'metallic' | 'normal' | 'custom';

export interface Timbre {
  type: TimbrePreset;
  amplitudes: number[];
}

export type TransferFunctionPreset = 'delay' | 'single_echo' | 'multi_echo' | 'lowpass' | 'highpass' | 'allpass' | 'custom';

export interface TransferFunction {
  type: TransferFunctionPreset;
  tau: number;
  alpha: number;
  fc: number;
  magnitudes: number[];
  phases: number[];
}

export interface ABCNote {
  pitch: number;
  duration: number;
  startTime: number;
  isRest?: boolean;
}
