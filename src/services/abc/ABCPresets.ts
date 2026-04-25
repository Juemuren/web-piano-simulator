import presetsData from './ABCPresets.json';

export interface ABCPreset {
  name: string;
  path: string;
}

export const presets: ABCPreset[] = presetsData as ABCPreset[];
