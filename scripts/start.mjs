/**
 * En Render, `RENDER=true` → sirve el build estatico (puerto PORT, 0.0.0.0).
 * En local → `ng serve` para desarrollo.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const onRender = process.env.RENDER === 'true' || process.env.RENDER === '1';

if (onRender) {
  await import('./render-spa-server.mjs');
} else {
  const child = spawn('pnpm', ['exec', 'ng', 'serve'], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });
  child.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
  child.on('exit', (code, signal) => {
    if (signal) process.exit(1);
    process.exit(code ?? 0);
  });
}
