export type TimbreType =
  | 'ethereal'
  | 'metallic'
  | 'pure'
  | 'bright'
  | 'normal'
  | 'soft'
  | 'realistic'
  | 'custom';

export interface Timbre {
  type: TimbreType;
  amplitudes: number[];
}

export type TransferFunctionType =
  | 'delay'
  | 'single_echo'
  | 'multi_echo'
  | 'lowpass'
  | 'highpass'
  | 'allpass';

export interface TransferFunction {
  type: TransferFunctionType;
  tau: number;
  alpha: number;
  fc: number;
  magnitudes: number[];
  phases: number[];
}
