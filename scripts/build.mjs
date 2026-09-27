import { mkdir, copyFile, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

await rm('dist', { recursive: true, force: true });
await mkdir(dirname('dist/index.html'), { recursive: true });
await copyFile('src/index.html', 'dist/index.html');
console.log('Build OK: src/index.html -> dist/index.html');
