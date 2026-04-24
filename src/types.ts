export type TimbrePreset = 'ethereal' | 'metallic' | 'pure' | 'bright' | 'normal' | 'soft' | 'realistic' | 'custom';

export interface Timbre {
  type: TimbrePreset;
  amplitudes: number[];
}

export type TransferFunctionPreset = 'delay' | 'single_echo' | 'multi_echo' | 'lowpass' | 'highpass' | 'allpass';

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
  isRest?: boolean;
  isStartTie?: boolean;
  isEndTie?: boolean;
  index?: number;
  beats?: number;
}
