#!/usr/bin/env node
// Claude Code status line — cross-platform (Windows / Linux / macOS), needs only Node.
// settings.json: "statusLine": {"type": "command", "command": "node ~/.claude/statusline.js"}
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ESC = '\x1b';
const GREEN = `${ESC}[32m`, ORANGE = `${ESC}[38;5;208m`, RED = `${ESC}[31m`, RESET = `${ESC}[0m`;
const BAR_WIDTH = 20;

function fmt(n) {
  if (n == null || isNaN(n)) return '?';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(n);
}

function gitBranch(cwd) {
  const run = (args) => {
    try {
      return execFileSync('git', ['--no-optional-locks', '-C', cwd, ...args], {
        stdio: ['ignore', 'pipe', 'ignore'], timeout: 1000,
      }).toString().trim();
    } catch { return ''; }
  };
  return run(['symbolic-ref', '--short', 'HEAD']) || run(['rev-parse', '--short', 'HEAD']);
}

// Cumulative session usage from the transcript, deduplicated by message id
function sessionTotals(transcriptPath) {
  const t = { in: 0, out: 0, cache: 0, lastCtx: 0 };
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return null;
  const seen = new Set();
  for (const line of fs.readFileSync(transcriptPath, 'utf8').split('\n')) {
    if (!line.includes('"usage"')) continue;
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    const m = e.message, u = m && m.usage;
    if (!u) continue;
    const key = m.id || e.uuid;
    if (seen.has(key)) continue;
    seen.add(key);
    const cache = (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
    t.in += u.input_tokens || 0;
    t.out += u.output_tokens || 0;
    t.cache += cache;
    t.lastCtx = (u.input_tokens || 0) + cache + (u.output_tokens || 0);
  }
  t.total = t.in + t.out + t.cache;
  return t;
}

function main(raw) {
  let j = {};
  try { j = JSON.parse(raw); } catch {}
  const parts = [];

  // Prompt-like segments: user@host, cwd, git branch
  parts.push(`${os.userInfo().username}@${os.hostname().toLowerCase()}`);
  const cwd = (j.workspace && j.workspace.current_dir) || j.cwd;
  if (cwd) {
    parts.push(path.basename(cwd));
    const branch = gitBranch(cwd);
    if (branch) parts.push(`(${branch})`);
  }

  if (j.model && j.model.display_name) parts.push(j.model.display_name);

  const totals = sessionTotals(j.transcript_path);

  // Context window progress bar: used / remaining
  const cw = j.context_window || {};
  let limit = cw.context_window_size || 0;
  if (!limit && cw.used_percentage > 0 && cw.total_input_tokens > 0) {
    limit = Math.round(cw.total_input_tokens * 100 / cw.used_percentage);
  }
  if (!limit) limit = 200000;
  const used = cw.total_input_tokens || (totals ? totals.lastCtx : 0);
  const color = used < 100000 ? GREEN : used <= 400000 ? ORANGE : RED;
  const filled = Math.min(BAR_WIDTH, Math.round(used / limit * BAR_WIDTH));
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
  const pct = Math.round(used / limit * 100);
  parts.push(`${color}${bar}${RESET} ${fmt(used)}/${fmt(limit)} (${pct}%)`);

  if (totals) parts.push(`session:${fmt(totals.total)}`);

  const cost = j.cost && j.cost.total_cost_usd;
  if (cost != null) parts.push('$' + Number(cost).toFixed(2));

  process.stdout.write(parts.join(' | '));
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { input += c; });
process.stdin.on('end', () => main(input));
