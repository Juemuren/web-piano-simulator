import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import abcjs from 'abcjs';

const { parseOnly } = abcjs;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const voices = [
  { name: 'R1', minPitch: 6 },
  { name: 'R2', minPitch: 0 },
  { name: 'L1', minPitch: -3 },
  { name: 'L2', minPitch: Number.NEGATIVE_INFINITY },
];
const barsPerLine = 4;

const input = process.argv[2];
if (!input || extname(input) !== '.abc') {
  console.error('need abc file');
  process.exit(1);
}
const inputPath = resolve(repoRoot, input);
const outputPath = resolve(
  repoRoot,
  process.argv[3] ?? inputPath.replace(/\.[^/.]+$/, '-convert.abc'),
);

const source = readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n');
const tune = parseOnly(source)[0];

if (!tune) {
  console.error('failed to parse abc file');
  process.exit(1);
}

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);

  while (right !== 0) {
    const next = left % right;
    left = right;
    right = next;
  }

  return left;
}

function toFraction(value) {
  const denominator = 65536;
  const numerator = Math.round(value * denominator);
  const divisor = gcd(numerator, denominator);

  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function addFractions(left, right) {
  const numerator =
    left.numerator * right.denominator + right.numerator * left.denominator;
  const denominator = left.denominator * right.denominator;
  const divisor = gcd(numerator, denominator);

  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function divideFractions(left, right) {
  const numerator = left.numerator * right.denominator;
  const denominator = left.denominator * right.numerator;
  const divisor = gcd(numerator, denominator);

  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function parseDefaultNoteLength(abc) {
  const match = abc.match(/^L:\s*(\d+)\s*\/\s*(\d+)/m);

  if (match) {
    return {
      numerator: Number(match[1]),
      denominator: Number(match[2]),
    };
  }

  const meter = tune.getMeterFraction?.();
  const meterValue =
    meter && meter.den ? Number(meter.num) / Number(meter.den) : 4 / 4;

  return meterValue < 0.75
    ? { numerator: 1, denominator: 16 }
    : { numerator: 1, denominator: 8 };
}

const defaultNoteLength = parseDefaultNoteLength(source);

function renderDuration(duration) {
  const relative = divideFractions(duration, defaultNoteLength);

  return renderRelativeDuration(relative);
}

function renderRelativeDuration(relative) {
  if (relative.numerator === 1 && relative.denominator === 1) {
    return '';
  }

  if (relative.denominator === 1) {
    return String(relative.numerator);
  }

  if (relative.numerator === 1 && relative.denominator === 2) {
    return '/2';
  }

  if (relative.numerator === 1) {
    return `/${relative.denominator}`;
  }

  return `${relative.numerator}/${relative.denominator}`;
}

function multiplyFractions(left, right) {
  const numerator = left.numerator * right.numerator;
  const denominator = left.denominator * right.denominator;
  const divisor = gcd(numerator, denominator);

  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function subtractFractions(left, right) {
  const numerator =
    left.numerator * right.denominator - right.numerator * left.denominator;
  const denominator = left.denominator * right.denominator;
  const divisor = gcd(numerator, denominator);

  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function compareFractions(left, right) {
  return (
    left.numerator * right.denominator - right.numerator * left.denominator
  );
}

function shouldSplitDuration(relative) {
  if (compareFractions(relative, { numerator: 4, denominator: 1 }) > 0) {
    return true;
  }

  return relative.denominator === 2 && relative.numerator >= 5;
}

function splitDuration(duration) {
  let remaining = divideFractions(duration, defaultNoteLength);
  const chunks = [];

  while (shouldSplitDuration(remaining)) {
    const chunk =
      compareFractions(remaining, { numerator: 4, denominator: 1 }) > 0
        ? { numerator: 4, denominator: 1 }
        : { numerator: 2, denominator: 1 };

    chunks.push(multiplyFractions(chunk, defaultNoteLength));
    remaining = subtractFractions(remaining, chunk);
  }

  chunks.push(multiplyFractions(remaining, defaultNoteLength));

  return chunks;
}

function getVoiceName(pitch) {
  return voices.find((voice) => pitch >= voice.minPitch).name;
}

function isMusicLine(line) {
  return line.staff?.some((staff) => staff.voices?.length > 0);
}

function renderBar(type) {
  switch (type) {
    case 'bar_left_repeat':
      return '|:';
    case 'bar_right_repeat':
      return ':|';
    case 'bar_dbl_repeat':
      return '::';
    case 'bar_thin_thick':
      return '|]';
    case 'bar_thin_thin':
      return '||';
    case 'bar_invisible':
      return '';
    default:
      return '|';
  }
}

function dedupePitches(pitches) {
  const byName = new Map();

  for (const pitch of pitches) {
    const existing = byName.get(pitch.name);

    if (existing) {
      existing.tie ||= Boolean(pitch.startTie);
      continue;
    }

    byName.set(pitch.name, {
      name: pitch.name,
      tie: Boolean(pitch.startTie),
    });
  }

  return Array.from(byName.values());
}

function samePitches(left, right) {
  return (
    left.notes.length === right.notes.length &&
    left.notes.every((note, index) => note.name === right.notes[index].name)
  );
}

function canMerge(left, right) {
  if (left.kind === 'rest' || right.kind === 'rest') {
    return left.kind === 'rest' && right.kind === 'rest';
  }

  return left.tie && right.kind === 'note' && samePitches(left, right);
}

function mergeEvent(target, event) {
  if (target.length > 0 && canMerge(target.at(-1), event)) {
    const previous = target.at(-1);

    previous.duration = addFractions(previous.duration, event.duration);
    previous.tie = event.tie;
    previous.notes = event.notes.map((note) => ({ ...note }));
    return;
  }

  target.push(event);
}

function renderEventChunk(event, duration, tie) {
  const renderedDuration = renderDuration(duration);

  if (event.kind === 'rest') {
    return `x${renderedDuration}`;
  }

  if (event.notes.length === 1) {
    return `${event.notes[0].name}${renderedDuration}${tie ? '-' : ''}`;
  }

  return `[${event.notes
    .map((note) => `${note.name}${tie || note.tie ? '-' : ''}`)
    .join('')}]${renderedDuration}`;
}

function renderEvent(event) {
  if (event.kind === 'bar') {
    return [event.value];
  }

  const chunks = splitDuration(event.duration);

  return chunks.map((duration, index) =>
    renderEventChunk(event, duration, index < chunks.length - 1 || event.tie),
  );
}

function createRest(duration) {
  return {
    kind: 'rest',
    duration,
    notes: [],
    tie: false,
  };
}

function createNote(pitches, duration) {
  const notes = dedupePitches(pitches);

  return {
    kind: 'note',
    duration,
    notes,
    tie: notes.every((note) => note.tie),
  };
}

function convertElement(element, output) {
  if (element.el_type === 'bar') {
    const bar = { kind: 'bar', value: renderBar(element.type) };

    for (const voice of voices) {
      output.get(voice.name).push(bar);
    }

    return;
  }

  if (element.el_type !== 'note' || !element.duration) {
    return;
  }

  const duration = toFraction(element.duration);
  const pitchesByVoice = new Map(voices.map((voice) => [voice.name, []]));

  for (const pitch of element.pitches ?? []) {
    pitchesByVoice.get(getVoiceName(pitch.pitch)).push(pitch);
  }

  for (const voice of voices) {
    const pitches = pitchesByVoice.get(voice.name);
    const event =
      pitches.length > 0 ? createNote(pitches, duration) : createRest(duration);

    mergeEvent(output.get(voice.name), event);
  }
}

function collectEvents(lines) {
  const output = new Map(voices.map((voice) => [voice.name, []]));

  for (const line of lines) {
    if (!isMusicLine(line)) {
      continue;
    }

    for (const staff of line.staff) {
      for (const voice of staff.voices) {
        for (const element of voice) {
          convertElement(element, output);
        }
      }
    }
  }

  return output;
}

function splitMeasures(events) {
  const measures = [];
  let current = [];

  for (const event of events) {
    current.push(event);

    if (event.kind === 'bar') {
      measures.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    measures.push(current);
  }

  return measures;
}

function renderMeasure(measure) {
  let output = '';

  for (const event of measure) {
    const renderedEvents = renderEvent(event);

    if (event.kind === 'bar') {
      output = `${output.trimEnd()}${renderedEvents[0]}`;
      continue;
    }

    for (const rendered of renderedEvents) {
      output +=
        output === '' || output.endsWith('|') ? rendered : ` ${rendered}`;
    }
  }

  return output;
}

function convertLines(lines) {
  const eventsByVoice = collectEvents(lines);
  const measuresByVoice = new Map(
    voices.map((voice) => [
      voice.name,
      splitMeasures(eventsByVoice.get(voice.name)),
    ]),
  );
  const measureCount = Math.max(
    0,
    ...Array.from(measuresByVoice.values(), (measures) => measures.length),
  );
  const output = [];

  for (let start = 0; start < measureCount; start += barsPerLine) {
    for (const voice of voices) {
      const measures = measuresByVoice
        .get(voice.name)
        .slice(start, start + barsPerLine)
        .map(renderMeasure);

      if (measures.length > 0) {
        output.push(`[V:${voice.name}] ${measures.join(' ')}`);
      }
    }
  }

  return `${output.join('\n').replace(/\n+$/, '')}\n`;
}

const result = convertLines(tune.lines);

writeFileSync(outputPath, result, 'utf8');

console.log(`Converted body written to ${outputPath}`);
