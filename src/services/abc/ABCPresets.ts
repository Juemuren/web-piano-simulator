import presetsNames from './ABCPresets.json';

export const ABCPresets = presetsNames;

export async function getAbcPreset(index: number) {
  const name = ABCPresets[index];
  const path = `presets/${name}.abc`;
  const response = await fetch(path);
  return await response.text();
}
