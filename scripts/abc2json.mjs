import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import abcjs from 'abcjs';
const { parseOnly } = abcjs;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const input = process.argv[2];
if (!input || extname(input) !== '.abc') {
  process.console.error('need abc file');
  process.exit(1);
}
const inputPath = resolve(repoRoot, input);
const outputPath = resolve(
  repoRoot,
  process.argv[3] ?? inputPath.replace(/\.[^/.]+$/, '.json'),
);

const source = readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n');

const parseObject = parseOnly(source);
const result = JSON.stringify(parseObject[0].lines, null, 2);

writeFileSync(outputPath, result, 'utf8');
