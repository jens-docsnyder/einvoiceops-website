#!/usr/bin/env node
/**
 * verify.js — source verification helper for einvoiceops research items
 *
 * Usage:  node scripts/verify.js <CC>
 *   e.g.  node scripts/verify.js BE
 *   or    npm run verify BE
 *
 * For each open research item:
 *   - prints the description and opens the source URL in your browser
 *   - prompts: (y) confirmed / (n) not found / (s) skip / (q) quit
 *
 * On confirm (y):
 *   - removes the item from src/content/research/<CC>.yaml
 *   - decrements unresolved_high or unresolved_amber in the country frontmatter
 *   - if all items are resolved: sets last_verified to today and confidence_summary to green
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { execSync } from 'child_process';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ── Args ─────────────────────────────────────────────────────────────────────

const code = process.argv[2]?.toUpperCase();
if (!code) {
  console.error('\nUsage: node scripts/verify.js <CC>  (e.g. BE, DE, NL)\n');
  process.exit(1);
}

// ── File paths ────────────────────────────────────────────────────────────────

const researchPath = join(ROOT, 'src', 'content', 'research', `${code}.yaml`);
const countryPath  = join(ROOT, 'src', 'content', 'countries', `${code}.md`);

// ── Load research YAML ────────────────────────────────────────────────────────

let research;
try {
  research = yamlLoad(readFileSync(researchPath, 'utf8'));
} catch {
  console.error(`\nNo research file found for ${code}.\nExpected: ${researchPath}\n`);
  process.exit(1);
}

if (!research.items || research.items.length === 0) {
  console.log(`\nNo open items for ${code}. Nothing to verify.\n`);
  process.exit(0);
}

// ── Sort items: high priority first ──────────────────────────────────────────

const sorted = [...research.items].sort((a, b) => {
  if (a.priority === 'high' && b.priority !== 'high') return -1;
  if (b.priority === 'high' && a.priority !== 'high') return  1;
  return 0;
});

// ── Readline prompt helper ────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

// ── Display helpers ───────────────────────────────────────────────────────────

const HR  = '─'.repeat(68);
const COL = 66; // wrap column for description text

function wrap(text, indent = '  ') {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line.length + word.length + 1 > COL) {
      lines.push(indent + line.trimEnd());
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  }
  if (line.trim()) lines.push(indent + line.trimEnd());
  return lines.join('\n');
}

function printItem(item, idx, total) {
  console.log('\n' + HR);
  const badge = item.priority === 'high' ? 'HIGH  🔴' : 'AMBER 🟡';
  console.log(`\n  [${idx}/${total}]  ${badge}   type: ${item.type}\n`);
  console.log(wrap(item.description));
  if (item.source_url) {
    console.log(`\n  URL: ${item.source_url}`);
  } else {
    console.log('\n  URL: none — use search terms in description above');
  }
}

// ── Main loop ─────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n${'═'.repeat(68)}`);
  console.log(`  Verify: ${code}  —  ${sorted.length} open item${sorted.length !== 1 ? 's' : ''}`);
  console.log(`  (y) confirmed   (n) not found   (s) skip   (q) quit`);
  console.log(`${'═'.repeat(68)}`);

  const confirmed = new Set(); // stores item.description strings for confirmed items
  let notFoundCount = 0;
  let skippedCount  = 0;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    printItem(item, i + 1, sorted.length);

    if (item.source_url) {
      try {
        execSync(`open "${item.source_url}"`, { stdio: 'ignore' });
        console.log('  [opened in browser]');
      } catch {
        console.log('  [could not auto-open — copy URL above]');
      }
    }

    let answer = '';
    while (!['y', 'n', 's', 'q'].includes(answer)) {
      answer = (await ask('\n  confirmed? (y/n/s/q): ')).trim().toLowerCase();
    }

    if (answer === 'q') {
      console.log('\n  Quit — no changes written.\n');
      rl.close();
      process.exit(0);
    }
    if (answer === 'y') confirmed.add(item.description);
    if (answer === 'n') notFoundCount++;
    if (answer === 's') skippedCount++;
  }

  rl.close();

  // ── Write changes ───────────────────────────────────────────────────────────

  if (confirmed.size === 0) {
    console.log('\n' + HR);
    console.log('\n  No items confirmed. Nothing written.\n');
    return;
  }

  const resolvedHigh  = research.items.filter(i => confirmed.has(i.description) && i.priority === 'high').length;
  const resolvedAmber = research.items.filter(i => confirmed.has(i.description) && i.priority === 'amber').length;
  const remaining     = research.items.filter(i => !confirmed.has(i.description));

  // Write updated research YAML
  const updatedResearch = { country_code: research.country_code, items: remaining };
  writeFileSync(researchPath, yamlDump(updatedResearch, {
    lineWidth:    -1,
    quotingType:  '"',
    noRefs:       true,
  }));

  // Update country frontmatter
  let md = readFileSync(countryPath, 'utf8');

  if (resolvedHigh > 0) {
    md = md.replace(/^(unresolved_high:\s*)(\d+)$/m, (_, prefix, val) =>
      `${prefix}${Math.max(0, parseInt(val) - resolvedHigh)}`
    );
  }
  if (resolvedAmber > 0) {
    md = md.replace(/^(unresolved_amber:\s*)(\d+)$/m, (_, prefix, val) =>
      `${prefix}${Math.max(0, parseInt(val) - resolvedAmber)}`
    );
  }

  // If all items resolved: update last_verified and confidence_summary
  if (remaining.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    md = md.replace(/^(last_verified:\s*)(.*)$/m, `$1${today}`);
    md = md.replace(/^(confidence_summary:\s*)(.*)$/m, `$1green`);
  }

  writeFileSync(countryPath, md);

  // ── Summary ─────────────────────────────────────────────────────────────────

  console.log('\n' + HR);
  console.log(`\n  ${code} — session complete\n`);
  console.log(`  Confirmed (removed) : ${confirmed.size}  (${resolvedHigh} high, ${resolvedAmber} amber)`);
  console.log(`  Not found           : ${notFoundCount}`);
  console.log(`  Skipped             : ${skippedCount}`);
  console.log(`  Still open          : ${remaining.length}`);

  if (remaining.length === 0) {
    console.log(`\n  All items resolved.`);
    console.log(`  last_verified → today  |  confidence_summary → green`);
  }

  console.log(`\n  Next: git commit -m "[${code}] AMBER-RESOLVED: ..."\n`);
}

run().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
