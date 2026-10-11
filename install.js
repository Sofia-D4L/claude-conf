#!/usr/bin/env node
// Installs claude-conf into Claude Code (Windows / Linux / macOS, needs Node 18+):
//  1. puts statusline.js into ~/.claude/
//  2. adds the statusLine entry to ~/.claude/settings.json (other settings are kept)
//
// From GitHub (no clone):
//   curl -fsSL https://raw.githubusercontent.com/<login>/claude-conf/main/install.js | node - https://raw.githubusercontent.com/<login>/claude-conf/main
// From a local checkout:
//   node install.js
const fs = require('fs');
const os = require('os');
const path = require('path');

const FILES = ['statusline.js'];

const claudeDir = path.join(os.homedir(), '.claude');
const settingsPath = path.join(claudeDir, 'settings.json');
const statusLine = { type: 'command', command: 'node ~/.claude/statusline.js' };

// Local run: files sit next to this script. Piped run (node -): download from base URL.
const baseUrl = (process.argv[2] || process.env.CLAUDE_CONF_URL || '').replace(/\/+$/, '');
const localDir = require.main && require.main.filename ? path.dirname(require.main.filename) : null;

async function getFile(name) {
  const local = localDir && path.join(localDir, name);
  if (!baseUrl && local && fs.existsSync(local)) return fs.readFileSync(local);
  if (!baseUrl) throw new Error('Podaj bazowy URL plików: ... | node - <URL>');
  const res = await fetch(`${baseUrl}/${name}`);
  if (!res.ok) throw new Error(`Nie udało się pobrać ${baseUrl}/${name}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function updateSettings() {
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    const raw = fs.readFileSync(settingsPath, 'utf8');
    try {
      settings = raw.trim() ? JSON.parse(raw) : {};
    } catch (e) {
      throw new Error(`Nie można sparsować ${settingsPath}: ${e.message}. Popraw plik ręcznie.`);
    }
    if (JSON.stringify(settings.statusLine) === JSON.stringify(statusLine)) {
      console.log('statusLine w settings.json jest już ustawiony.');
      return;
    }
    const backup = `${settingsPath}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    fs.copyFileSync(settingsPath, backup);
    console.log(`Kopia zapasowa: ${backup}`);
    if (settings.statusLine) console.log(`Zastępuję istniejący statusLine: ${JSON.stringify(settings.statusLine)}`);
  }
  settings.statusLine = statusLine;
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log(`Zapisano statusLine w ${settingsPath}`);
}

(async () => {
  fs.mkdirSync(claudeDir, { recursive: true });
  for (const name of FILES) {
    const dest = path.join(claudeDir, name);
    fs.writeFileSync(dest, await getFile(name));
    console.log(`Zainstalowano ${dest}`);
  }
  updateSettings();
  console.log('Gotowe. Uruchom ponownie Claude Code, jeśli pasek się nie pojawi.');
})().catch((e) => { console.error(e.message); process.exit(1); });
