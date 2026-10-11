# claude-conf

Przenośna konfiguracja Claude Code (Windows / Linux / macOS), trzymana jako bare repo
z katalogiem domowym jako work tree — pliki lądują bezpośrednio w `~/.claude/`.

## Zawartość

- `.claude/statusline.js` — pasek statusu: user@host | katalog | (gałąź git) | model |
  progress bar okna kontekstu (zielony < 100k, pomarańczowy 100k–400k, czerwony > 400k) |
  suma tokenów sesji | koszt. Wymaga tylko Node.

## Instalacja na nowym komputerze

```bash
git clone --bare <URL-repo> ~/.claude-conf
alias claude-conf='git --git-dir=$HOME/.claude-conf --work-tree=$HOME'
claude-conf config status.showUntrackedFiles no
claude-conf checkout
```

PowerShell (Windows):

```powershell
git clone --bare <URL-repo> $HOME\.claude-conf
function claude-conf { git --git-dir=$HOME\.claude-conf --work-tree=$HOME @args }
claude-conf config status.showUntrackedFiles no
claude-conf checkout
```

Jeśli `checkout` zgłosi konflikt (plik już istnieje), przenieś istniejący plik albo użyj `claude-conf checkout -f`.

Następnie dopisz do `~/.claude/settings.json` (tylko ten wpis — `settings.json` nie jest
synchronizowany, bo zawiera ustawienia specyficzne dla maszyny):

```json
"statusLine": { "type": "command", "command": "node ~/.claude/statusline.js" }
```

## Codzienna praca

```bash
claude-conf status
claude-conf add ~/.claude/statusline.js
claude-conf commit -m "..."
claude-conf push
claude-conf pull
```

Alias warto dodać na stałe do `~/.bashrc` / `~/.zshrc` albo do profilu PowerShell (`$PROFILE`).
