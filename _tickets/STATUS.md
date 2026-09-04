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

- `phase`: `ready_for_codex`
- `ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `handoff_commit`: `97e281c`
- `review_round`: `1`
- `owner`: `codex`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-19-waechter-gehoert-ins-fundament.md`
- `last_reviewed_commit`: `13ea3ad`
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

*(leer)*

## OUTBOX → Codex

**T-20 · Veröffentlichungsweg und Regelquelle** — Runde 1.

**Besonderheit dieser Übergabe, bitte zuerst lesen:** Beide Änderungen
entstanden auf Mikes direkte Ansage **ohne Ticket** und liegen bereits auf
`master`. Das Ticket ist also nachgereicht, und die Prüffläche ist keine
einzelne Commit-Klammer, sondern **drei Commits in zwei Repos**:

| Repo | Commit | Fläche |
|---|---|---|
| ux-foundation | `d114268` | `CLAUDE.md` → Importzeile, `AGENTS.md` erstmals versioniert |
| ux-foundation | `5519f8e` | `Makefile`, Target `publish` |
| ProjectTools | `ebcf059` | `npm-login.sh` → `npm-publish.sh` (`git mv` + Ausbau), `README.md` |

`handoff_commit` trägt den ux-foundation-Stand `97e281c`; der ProjectTools-Teil
liegt unter `${DEV_LOCAL}/DevBash/Production/ProjectTools` auf `master`,
Kopf `40b1973`. **Nichts davon ist gepusht.**

**Ziel:** `make publish` soll die drei bekannten Stolperstellen selbst abräumen
statt sie als kryptische Registry-Meldung durchzureichen — nicht angemeldet,
Version liegt schon oben, `409 Conflict — Failed to save packument`.

**Scope:** Kein Paketinhalt. `src/` und `files` sind unberührt, einbindende
Apps sehen nichts davon. Keine neue Abhängigkeit in beiden Repos.

**Checks:** `make test` (710/24), `make typecheck`, `make lint` — je einzeln
ausgewertet, alle grün. `bash -n` und `shellcheck -S warning` ohne Befund.

**Live-Evidenz:** Verify-Zeilen #2–#5 und #13 sind echte Läufe, #6–#8 nur mit
einer `npm`-Attrappe (`⚠️`, Fußnote ⁶). Zeile #11 ist ausdrücklich `➖`: **Der
neue Weg hat noch nie etwas hochgeladen** — Mikes erfolgreiche
Veröffentlichung von `0.7.1` lief noch über das alte Makefile.

**Korrektur:** Meine erste Diagnose gegenüber Mike („die `401` ist ein
Anmeldeproblem") ist vermutlich falsch; Begründung im Ticket. Nachprüfen lässt
es sich nicht mehr, weil meine eigenen `npm`-Aufrufe beim Untersuchen das
Debug-Log aus dem Zehnerfenster geschoben haben.

**Fünf ausdrückliche Review-Fragen** stehen am Ende des Tickets. Die beiden,
an denen mir am meisten liegt: die Erkennung der `409` per `grep` auf der
Ausgabe (Fehlalarm möglich), und dass `isVersionPublished` „Registry nicht
erreichbar" und „Version nicht vorhanden" nicht unterscheidet.

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
