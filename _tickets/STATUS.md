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

- `phase`: `approved`
- `ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `handoff_commit`: `41d6366`
- `review_round`: `6`
- `owner`: `mike`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `last_reviewed_commit`: `41d6366`
- `last_reviewed_round`: `6`
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

*(leer)*

## Zuletzt abgeschlossen

**T-20 · Veröffentlichungsweg und Regelquelle** — von Codex in Runde 6 ohne
Findings freigegeben. **Wartet auf Mike:** `Human`-Spalte, Umzug nach `solved/`
und der Push beider Repos stehen aus; nichts davon habe ich angefasst.

`make publish` läuft über `npm-publish.sh` in ProjectTools statt über ein
nacktes `npm publish`. Der Anlass war ein `409 Conflict`, dessen mitgelieferte
Erklärung nicht zutraf und dessen eigentliche Frage — *ist es trotzdem
hochgekommen?* — von Hand beantwortet werden musste. `AGENTS.md` ist seither
die versionierte Quelle der Repo-Regeln, `CLAUDE.md` importiert sie.

Sechs Runden, in jeder echte Befunde, keiner davon falsch. Die Vertragsgrenzen
stehen im Kopf des Scripts und in der README von ProjectTools; die Belege
dafür — dreizehn Mutanten — im Ticket.

Was daraus offen bleibt — **dieser Abschnitt drainiert nicht mit der INBOX**,
er hält unabhängigen Kontext:

- **Der erste echte Upload steht noch aus** (Ticket, Zeile #18). Der neue Weg
  hat noch nie etwas hochgeladen; die Veröffentlichung von `0.7.1` lief über
  das alte Makefile. Der nächste `make publish CONFIRM=yes` ist der erste
  Volllauf — und die erste Probe auf die OTP-Abfrage, deren Voraussetzung
  getestet ist, nicht deren Dialog.
- **`0.7.0` ist verbrannt.** Die Registry geht von `0.6.0` direkt auf `0.7.1`.
- **Beide Repos sind nicht gepusht** — ux-foundation und ProjectTools.
- **Kandidat für ein eigenes Ticket in ProjectTools:**
  `pkg-link.test.sh --run` hat 1/17 rot (`--example`: `PACKAGE_ROOT` unbound).
  Von Codex als Baseline-Befund gefunden, gehört nicht zu T-20.
- **In ProjectTools liegt eine ungetrackte `AGENTS.md`** — dieselbe Situation,
  die T-20 hier aufgelöst hat.
- Der Skill `ux-standards` empfahl für den Sprachwechsel `:key` an den Reitern.
  Genau das musste T-17 rückgängig machen — der Schlüssel räumt den Zustand
  aller Kindansichten mit ab. Die Stelle ist korrigiert und um den Tabellenfall
  (springende Spaltenbreiten) ergänzt.
- Ein Kandidat für ein eigenes kleines Ticket: Das Schaufenster zeigt keine
  einzige von Naive UI selbst gestellte Zeichenkette, weshalb sich deren
  Locale-Verdrahtung dort nicht ansehen lässt (T-17, Zeile #8).
- Die App-Integration bleibt bewusst außerhalb dieses Paket-Tickets:
  StockPortfolio T-36 und StockInfo T-60 warten auf eine installierbare
  Foundation-Version mit dem neuen ESLint-Subpath.
