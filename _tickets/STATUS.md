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
- `handoff_commit`: `2ff2445`
- `review_round`: `2`
- `owner`: `claude`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `last_reviewed_commit`: `2ff2445`
- `last_reviewed_round`: `2`
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

**T-20 · Review Runde 2 — Changes requested.**

Die sechs Befunde aus Runde 1 sind in der Implementierung grundsätzlich
adressiert. Drei Reste verhindern die Freigabe:

1. **Hoch:** Vor-/Nachprüfung und Upload können verschiedene Registries
   verwenden (`ProjectTools/src/bash/npm-publish.sh:235-236,361`; Aufruf aus
   ux-foundation `Makefile:95`). `resolveRegistry()` berücksichtigt nur
   `publishConfig`, Scope- und globale Konfiguration; zugleich wird alles nach
   `--publish` unverändert an npm gereicht. Bei
   `--registry=https://override.example.test/` prüft das Script daher die
   Default-Registry, während `npm publish` in die Override-Registry schreibt.
   Isolierte Attrappe: `whoami` und `view` liefen mit
   `https://default.example.test/`, der Upload mit
   `--registry=https://override.example.test/`; rc war trotzdem 0. Dadurch
   kann eine Version fälschlich als belegt/frei gelten und die Nachkontrolle
   am falschen Ort stattfinden. Gegenprobe ergänzen und entweder
   zielverändernde Argumente ausdrücklich ablehnen oder dieselbe effektive
   Registry für alle Schritte ermitteln.

2. **Hoch:** `versionState()` behauptet weiterhin in nicht feststellbaren
   Fällen `absent` (`npm-publish.sh:238-255`). Zwei Pfade sind betroffen:
   Bei rc=0 wird ein JSON-Parsefehler genauso behandelt wie „gültige Liste,
   Zielversion fehlt“; eine Attrappe mit stdout `not-json` und rc=0 ergab
   `ist noch frei`, rc=0. Außerdem ist E404 nicht eindeutig „Paket noch nie
   veröffentlicht“: npms eigene Meldung lautet sinngemäß „nicht gefunden
   oder keine Zugriffsberechtigung“, und schon der Scriptkopf beschreibt 404
   als Verschleierung eines Zugangsproblems. Ein angemeldeter, aber für das
   Paket nicht berechtigter Benutzer erhält so ebenfalls eine falsche grüne
   Auskunft. Parsefehler müssen `unknown` bleiben; E404 darf ohne zusätzlich
   belastbaren Nachweis nicht als sichere Verfügbarkeit formuliert werden.
   Beide Unterscheidungen brauchen Regressionstests.

3. **Mittel:** Der neue stdout-Test schützt die behauptete TTY-Garantie nicht
   (`ProjectTools/tests/bash/npm-publish.test.sh:202-215,274-283`). Der
   Test-Harness leitet stdout des gesamten Scripts selbst in `out.txt`; die
   npm-Attrappe hat dort also in jedem Fall **kein** stdout-TTY. Dass ihre
   Marke später in der Datei steht, erkennt den konkreten
   Command-Substitution-Mutanten, aber etwa eine `tee`-Pipeline würde den Test
   ebenfalls bestehen und npm trotzdem `process.stdout.isTTY === false`
   geben. Die echte Eigenschaft lässt sich ohne Upload mit einer Attrappe
   unter einem PTY prüfen (`[[ -t 0 && -t 1 ]]`); mein isolierter PTY-Lauf des
   aktuellen Produktpfads ergab `PUBLISH_STDOUT_TTY=yes`. Bitte das als
   dauerhafte Gegenprobe verdrahten und die Aussage „OTP bleibt möglich“ erst
   daran knüpfen.

Unabhängig frisch ausgeführt: ux-foundation `make test` (710/710),
`make typecheck`, `make lint`; ProjectTools `npm-publish.test.sh --run`
(31/31), `bash -n`, `shellcheck`; alle rc=0. `make publish` ohne `CONFIRM`
blieb mit rc=2 sicher. Echter `--status` meldete angemeldet als `mmit` und
`0.7.1` veröffentlicht, rc=0. `git diff --check` war in beiden Handoff-Diffs
sauber. Bekannter Fremdbefund unverändert: ProjectTools hat weiterhin nur die
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
