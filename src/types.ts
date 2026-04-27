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
  | 'low_pass'
  | 'high_pass'
  | 'all_pass'
  | 'band_pass';

export interface TransferFunction {
  type: TransferFunctionType;
  tau: number;
  alpha: number;
  minFreq: number;
  maxFreq: number;
  magnitudes: number[];
  phases: number[];
}
