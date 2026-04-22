import presetsData from './ABCPresets.json';

export interface ABCPreset {
  T: string;
  M: string;
  L: string;
  K: string;
  Q: number;
  body: string;
}

export const presets: ABCPreset[] = presetsData as ABCPreset[];

export function formatPresetToABC(preset: ABCPreset): string {
  return `T: ${preset.T}
M: ${preset.M}
L: ${preset.L}
K: ${preset.K}
Q: ${preset.Q}
${preset.body}`;
}

export function formatHeaderToABC(header: { T: string; M: string; L: string; K: string; Q: number }): string {
  return `T: ${header.T}
M: ${header.M}
L: ${header.L}
K: ${header.K}
Q: ${header.Q}
`;
}
