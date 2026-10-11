# claude-conf

Przenośna konfiguracja Claude Code (Windows / Linux / macOS).

## Zawartość

- `statusline.js` — pasek statusu: user@host | katalog | (gałąź git) | model |
  progress bar okna kontekstu (zielony < 100k, pomarańczowy 100k–400k, czerwony > 400k) |
  suma tokenów sesji | koszt.
- `install.js` — instalator: kopiuje `statusline.js` do `~/.claude/` i dopisuje wpis
  `statusLine` do `~/.claude/settings.json` (reszta ustawień zostaje, przed zmianą robi
  kopię `settings.json.bak-<data>`). Można go uruchamiać wielokrotnie — służy też do aktualizacji.

## Instalacja / aktualizacja

Wymaga Node 18+. Repo nie jest klonowane — pobierane są tylko potrzebne pliki.

Linux / macOS / Windows (ta sama komenda w bash, Git Bash i PowerShell — na Windowsie użyj `curl.exe`):

```bash
curl -fsSL https://raw.githubusercontent.com/Sofia-D4L/claude-conf/main/install.js | node - https://raw.githubusercontent.com/Sofia-D4L/claude-conf/main
```

Z lokalnego checkoutu:

```bash
node install.js
```

Wynikowy wpis w `settings.json`:

```json
"statusLine": { "type": "command", "command": "node ~/.claude/statusline.js" }
```

Uwaga: `raw.githubusercontent.com` działa bez logowania tylko dla repo publicznego.
