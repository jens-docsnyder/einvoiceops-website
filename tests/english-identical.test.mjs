// With no language ready, the real build must be byte-identical to the English baseline build.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, buildReal, withBuildLock } from './_lib/site.mjs';

const BASELINE = process.env.BASELINE_DIST;
const skip = !BASELINE
  ? 'BASELINE_DIST is not set: point it at the English baseline build folder to run this test'
  : !existsSync(BASELINE)
    ? `BASELINE_DIST does not exist: ${BASELINE}`
    : false;

test('npm run build output is identical to the English baseline', { skip }, async () => {
  const result = await withBuildLock(() => {
    const build = buildReal();
    const diff = spawnSync('diff', ['-r', path.join(ROOT, 'dist'), BASELINE], { encoding: 'utf8' });
    return { build, diff };
  });
  assert.equal(result.build.status, 0, `npm run build failed:\n${result.build.output.slice(-1500)}`);
  assert.equal(result.diff.status, 0, `dist differs from the baseline:\n${(result.diff.stdout + result.diff.stderr).slice(0, 3000)}`);
  assert.equal(result.diff.stdout, '', 'diff -r printed output');
});
