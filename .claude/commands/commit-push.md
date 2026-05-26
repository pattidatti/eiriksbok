---
description: Commit alle staged/unstaged endringer og push til origin/main. Bruker git add på relevante filer, lager commit-melding basert på diff, og pusher.
---

Commit og push alle gjeldende endringer til origin/main.

## Steg

1. Kjør `git status` og `git diff` for å se hva som er endret.
2. Stage relevante filer med `git add` (IKKE `.env`, secrets, eller `.claude/scheduled_tasks.lock`).
3. Les `git log --oneline -5` for å matche eksisterende commit-stil i repoet.
4. Lag en konsis commit-melding som beskriver HVORFOR endringene ble gjort (ikke bare hva).
5. Commit med Co-Authored-By-linje.
6. Push til origin med `git push origin main`.
7. Bekreft at push gikk gjennom med `git status`.
