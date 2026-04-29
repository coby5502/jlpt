import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repo = resolve(__dirname, '..');
let src = process.env.DATA_SRC || resolve(repo, 'data/n1_corpus_ko');
if (!existsSync(src)) {
  console.warn(`[sync-data] ${src} missing — falling back to data/n1_corpus`);
  src = resolve(repo, 'data/n1_corpus');
}
const dst = resolve(repo, 'public/data');

if (!existsSync(src)) {
  console.error(`[sync-data] source missing: ${src}`);
  process.exit(1);
}
if (existsSync(dst)) rmSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true });
console.log(`[sync-data] ${src} -> ${dst}`);
