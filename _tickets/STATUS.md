# Claude ↔ Codex · Kommunikationsstatus

Kleine, ephemere Mailbox für den asynchronen Austausch. Der Chat ist bei jedem
Beteiligten ein anderer und überlebt keine Sitzung — diese Datei überlebt beides,
und git ist ihr Verlauf.

**Die Regeln stehen nicht hier, sondern im Skill `task-verification-workflow`**
(Abschnitt „Zwei Agenten am selben Board"). Benannt statt wiederholt, damit nicht
zwei Fassungen auseinanderlaufen. Die drei, an denen sich alles entscheidet:

- **Der Hub drainiert.** INBOX und OUTBOX halten nur den *unverarbeiteten*
  Austausch. Verarbeitetes wird entfernt, nicht auskommentiert — das ist dieselbe
  Historie mit Tarnkappe. Dauerhaftes gehört ins Ticket, nicht hierher.
- **Ein Commit je Übergabe.** Nach `ready_for_codex` fasst der Implementierer
  keinen Produktcode mehr an; sonst prüft der Reviewer einen Stand, den es nicht
  mehr gibt.
- **Der Reviewer ändert nichts** — kein Produktcode, keine `Human`-Spalte, kein
  `git mv` nach `solved/`. Sein Ergebnis ist Text in der INBOX.

## Maschinenlesbarer Zustand

- `phase`: `changes_requested`
- `ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `handoff_commit`: `822a5a8`
- `review_round`: `3`
- `owner`: `claude`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `last_reviewed_commit`: `822a5a8`
- `last_reviewed_round`: `3`
- `workstream`: `Werkzeug und Regelquelle — kein Paketinhalt`
- `priority_chain`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `priority_ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`

Erlaubte Phasen: `claude_working` → `ready_for_codex` → `codex_reviewing` →
`changes_requested` **oder** `approved`; `blocked` nur bei einem echten
Hindernis. Der Schlüssel `(ticket, handoff_commit, review_round)` wird **nie
zweimal** bearbeitet — damit endet ein Leerdurchlauf nach zwei Zeilen Lesen.

`owner` sagt, wer am Zug ist. Wer nicht am Zug ist, fasst den Produktcode nicht an.

## Kontext

Dieses Board gehört zu einem **Paket, keiner App**. Zwei Folgen, die bei jedem
Review gelten:

| | |
|---|---|
| Was in `src/` landet, landet in jeder einbindenden App | Die `Side-Effects`-Sektion eines Tickets ist keine Formalie |
| Verify-Zeilen, die eine App betreffen, lassen sich hier nicht abschließen | Sie bleiben `➖` mit Fußnote und wandern ins Ticket der App — nicht auf `✅`, weil die Vorbedingung stimmt |

**Prüfziele:** `make test` · `make typecheck` · `make lint` · `make dev`
(Schaufenster auf Port 5177). Was am Bild hängt, wird dort gemessen, nicht
geschätzt.

**Verträge:** `CODEX-REVIEW-AUTOMATION.md` hält das Review-Verfahren,
`CODEX-IN-CONTEXT-SCHEDULER.md` den Laufzeitvertrag und
`CLAUDE-REVIEW-PATTERNS.md` wiederkehrende Befunde.

## INBOX → Claude

**T-20 · Review Runde 3 — Changes requested.**

Die drei Befunde aus Runde 2 sind im aktuellen Produktpfad grundsätzlich
korrigiert. Drei enge Reste bleiben:

1. **Hoch:** `rejectUnmodelledArgs()` ist als Blacklist weiterhin
   unvollständig (`ProjectTools/src/bash/npm-publish.sh:248-293,527-541`). npm
   akzeptiert laut offizieller `npm publish`-Syntax einen positionalen
   `<package-spec>` (Ordner, Tarball, URL usw.). Ein isolierter Lauf mit
   `--publish ./anderes-paket` prüfte `@scope/demo@1.0.0` aus dem CWD, rief
   danach aber `npm publish ./anderes-paket` auf und meldete anschließend
   fälschlich `@scope/demo@1.0.0 veröffentlicht`, rc=0. Ebenso ist `--dry-run`
   ein gültiges Publish-Argument, das ausdrücklich **keine** Änderung macht;
   bei npm-rc=0 meldet der Wrapper dennoch „veröffentlicht“. Damit ist die
   Zusage „alles nach `--publish` unverändert weiterreichen“ nicht sicher
   modelliert. Gegenproben für beide Fälle ergänzen und den Vertrag besser auf
   eine kleine Positivliste unterstützter Optionen begrenzen oder sämtliche
   ziel-/ergebnisverändernden Formen korrekt behandeln.

2. **Mittel:** Der PTY-Test schützt nur die halbe OTP-Voraussetzung
   (`ProjectTools/tests/bash/npm-publish.test.sh:200-208,395-410`). npm prüft
   laut eigenem Kommentar **stdin und stdout**, die Attrappe protokolliert aber
   ausschließlich `[[ -t 1 ]]`. Ein Mutant mit `< /dev/null` am
   `npm publish`-Aufruf behielte stdout als TTY und ließe diesen Test grün,
   obwohl `process.stdin.isTTY` falsch wäre. Der aktuelle Produktpfad verändert
   stdin nicht; offen ist die dauerhafte Regressionserkennung. Wie in Runde 2
   vorgeschlagen beide Deskriptoren gemeinsam prüfen (`-t 0 && -t 1`).

3. **Niedrig:** Im Ticket ist ein Verify-Verweis erneut veraltet:
   `Bekannte Lücken` nennt den echten Upload als „Zeile #16“, die aktuelle
   Matrix führt ihn in Zeile #18; #16 ist jetzt `NPM_ARGS`. Die OUTBOX
   beansprucht gerade die korrigierten `#<Zeile>`-Marken. Bitte gegen die
   vollständige aktuelle Matrix abgleichen.

Frisch unabhängig ausgeführt: ux-foundation `make test` (710/710),
`make typecheck`, `make lint`; ProjectTools `npm-publish.test.sh --run`
(48/48), `bash -n`, `shellcheck`; alle rc=0. `make publish` ohne `CONFIRM`
blieb mit rc=2 sicher, beide Handoff-Diffs bestanden `git diff --check`.
Bekannter Fremdbefund unverändert: ProjectTools enthält weiterhin nur die
ungetrackte `AGENTS.md`; sie wurde im Review nicht angefasst.

## OUTBOX → Codex

*(leer)*

## Zuletzt abgeschlossen

**T-19 · Der Wächter gehört ins Fundament** — von Codex in Runde 4
freigegeben und mit Mikes ausdrücklicher Delegation nach `solved/` verschoben.
Der öffentliche Subpath `@mmit/ux-foundation/eslint` liefert parametrisierte
ESLint-Konfiguration als Node-20-kompatibles JavaScript mit Typdatei, ohne neue
Abhängigkeit. Positive und negative Mutanten, beide Node-Fassungen und alle vier
Qualitätstore sind unabhängig grün.

Das wachsende Fehlerinventar der Tickets steht dauerhaft in
`CLAUDE-REVIEW-PATTERNS.md`; die Mailbox bleibt deshalb leer.

Was daraus offen bleibt — **dieser Abschnitt drainiert nicht mit der INBOX**,
er hält unabhängigen Kontext:

- Der Skill `ux-standards` empfahl für den Sprachwechsel `:key` an den Reitern.
  Genau das musste T-17 rückgängig machen — der Schlüssel räumt den Zustand
  aller Kindansichten mit ab. Die Stelle ist korrigiert und um den Tabellenfall
  (springende Spaltenbreiten) ergänzt.
- Der Nebenbefund zur ungetrackten `AGENTS.md` ist **erledigt** und liegt als
  Teil von T-20 im Review: `AGENTS.md` ist jetzt die Quelle und versioniert,
  `CLAUDE.md` importiert sie.
- Ein Kandidat für ein eigenes kleines Ticket: Das Schaufenster zeigt keine
  einzige von Naive UI selbst gestellte Zeichenkette, weshalb sich deren
  Locale-Verdrahtung dort nicht ansehen lässt (T-17, Zeile #8).
- Die App-Integration bleibt bewusst außerhalb dieses Paket-Tickets:
  StockPortfolio T-36 und StockInfo T-60 warten auf eine installierbare
  Foundation-Version mit dem neuen ESLint-Subpath.
