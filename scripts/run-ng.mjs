#!/usr/bin/env node
/**
 * Carga .env en process.env y ejecuta Angular CLI con --define para inyectar
 * valores en tiempo de bundling (sin generar archivos fuente).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadDotEnv(envPath);

const forwarded = process.argv.slice(2);
if (forwarded.length === 0) {
  console.error('Uso: node scripts/run-ng.mjs <argumentos de ng...>');
  process.exit(1);
}

const isBuild = forwarded[0] === 'build';
const isDevConfig =
  forwarded.includes('--configuration=development') ||
  forwarded.some((a) => a.startsWith('--configuration=development,'));

const production = isBuild && !isDevConfig;

const apiBaseUrl = production
  ? (process.env.DONIDELI_API_BASE_URL ?? '')
  : (process.env.DONIDELI_API_BASE_URL ?? 'http://127.0.0.1:8000');

/** Origen del servidor WB (chat): desarrollo → local; producción → Fly salvo que lo sobreescribas. */
const wsOrigin = production
  ? (process.env.DONIDELI_WS_COLLABORATION_ORIGIN ??
    'https://wb-donideli.fly.dev')
  : (process.env.DONIDELI_WS_COLLABORATION_ORIGIN ??
    'http://127.0.0.1:8080');

const definePairs = [
  ['__DONIDELI_PRODUCTION__', production ? 'true' : 'false'],
  ['__DONIDELI_API_BASE_URL__', JSON.stringify(apiBaseUrl)],
  ['__DONIDELI_WS_COLLABORATION_ORIGIN__', JSON.stringify(wsOrigin)],
];

const defineArgs = definePairs.flatMap(([k, v]) => ['--define', `${k}=${v}`]);

const result = spawnSync('pnpm', ['exec', 'ng', ...forwarded, ...defineArgs], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
