# claude-conf

Przenośna konfiguracja Claude Code (Windows / Linux / macOS).

## Zawartość

- `statusline.js` — pasek statusu: user@host | katalog | (gałąź git) | model |
  progress bar okna kontekstu (zielony < 100k, pomarańczowy 100k–400k, czerwony > 400k) |
  suma tokenów sesji | koszt. Wymaga tylko Node.

## Instalacja na nowym komputerze

```bash
git clone <URL-repo> ~/projects/claude-conf
```

Następnie dopisz do `~/.claude/settings.json` (tylko ten wpis — `settings.json` nie jest
synchronizowany, bo zawiera ustawienia specyficzne dla maszyny):

```json
"statusLine": { "type": "command", "command": "node ~/projects/claude-conf/statusline.js" }
```

Ten sam wpis działa na Windowsie (Git Bash / PowerShell) i na Linuksie.

## Aktualizacja

```bash
git -C ~/projects/claude-conf pull
```
