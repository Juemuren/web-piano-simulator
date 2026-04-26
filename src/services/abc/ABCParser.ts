import { parseOnly } from 'abcjs';

export class ABCParser {
  public beatsPerMeasure: number;
  public isEmpty: boolean;

  constructor() {
    this.beatsPerMeasure = 1;
    this.isEmpty = true;
  }

  parse(abcString: string) {
    const tunes = parseOnly(abcString);
    const tune = tunes?.[0];
    if (!tune) return null;
    this.beatsPerMeasure = tune.getBeatsPerMeasure();
    this.isEmpty = tune.lines.length === 0
  }
}