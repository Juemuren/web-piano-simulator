import presetsData from './ABCPresets.json';

export interface ABCPreset {
  name: string;
  path: string;
}

export const ABCPresets = presetsData as ABCPreset[];
