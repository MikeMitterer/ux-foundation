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
- `handoff_commit`: `0ff55db`
- `review_round`: `4`
- `owner`: `claude`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `last_reviewed_commit`: `0ff55db`
- `last_reviewed_round`: `4`
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

**T-20 · Review Runde 4 — Änderungen angefordert.**

Die TTY-Nachbesserung trägt: Die Attrappe prüft jetzt stdin und stdout unter
dem echten PTY, und Mutant L greift genau an dieser Zusage an. Zwei Befunde
bleiben:

1. **Die Positivliste lässt ein verbotenes Token als Wert durch — ausgerechnet
   `--dry-run` kann dadurch zu einem echten Upload werden.** In
   `npm-publish.sh:301–305` wird nach jeder Wertoption das nächste Token
   ungeprüft konsumiert. Deshalb akzeptiert der Wrapper
   `--publish --otp --dry-run`, obwohl `--dry-run` nicht erlaubt ist. npm
   11.19.0 bestätigt die gefährliche Semantik ohne Interpretation:
   `npm config get dry-run --otp --dry-run` ergibt `false`,
   `npm config get otp --otp --dry-run` ergibt `--dry-run`. Eine kontrollierte
   Gegenprobe begann folgerichtig mit `Publishing to …` statt einem Dry-Run;
   sie wurde vor dem Upload abgebrochen, anschließend ergab der Registry-Abruf
   für das eindeutige Wegwerf-Paket `404`. Bitte Werte nicht nur auf
   Vorhandensein am Listenende prüfen, sondern ein weiteres Options-Token dort
   ablehnen (ebenso leere `--option=`-Werte, soweit sie keinen gültigen Vertrag
   haben), und den konkreten Fall dauerhaft testen. Die aktuelle Suite bleibt
   dabei mit 59/59 grün und bewacht diese Lücke daher nicht.
2. **Der dauerhafte Tickettext beschreibt weiter den widerlegten alten
   Vertrag.** In `T-20-veroeffentlichungsweg-und-regelquelle.md:176–188` stehen
   weiterhin „Fünf Grenzen“, eine Tabelle ohne Positivliste, die alte
   Einzelaussage zu Scope-Registries/Workspaces sowie „Alles nach `--publish`
   geht unverändert … weiter“. Das widerspricht Script, README und der neuen
   Matrix. Bitte den Abschnitt auf die Positivliste umstellen und gemäß
   Repo-Regel die erneut duplizierte Anzahl entfernen.

**Unabhängig grün:** ux-foundation `make test` (710/710), `make typecheck`,
`make lint`; ProjectTools `npm-publish.test.sh --run` (59/59), `bash -n`,
`shellcheck -S warning`; `make publish` ohne `CONFIRM` endet mit Make-`rc=2`.
Beide Repos sind diff-sauber; in ProjectTools bleibt nur die bekannte
ungetrackte `AGENTS.md`.

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
