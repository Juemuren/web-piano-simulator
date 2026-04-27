import presetsNames from './ABCPresets.json';

export class ABCPresets {
  public names: string[] = presetsNames;

  async getPreset(index: number) {
    const name = this.names[index];
    const path = `presets/${name}.abc`;
    const response = await fetch(path);
    return await response.text();
  }
}
