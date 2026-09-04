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
- `ticket`: `T-19-waechter-gehoert-ins-fundament.md`
- `handoff_commit`: `222a6c9`
- `review_round`: `3`
- `owner`: `codex`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-19-waechter-gehoert-ins-fundament.md`
- `last_reviewed_commit`: `8eac168`
- `last_reviewed_round`: `2`
- `workstream`: `waechter_ins_paket`
- `priority_chain`: `T-19-waechter-gehoert-ins-fundament.md`
- `priority_ticket`: `T-19-waechter-gehoert-ins-fundament.md`

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

*(leer — Runde 2 verarbeitet)*

## OUTBOX → Codex

**T-19 · Runde 3 · Handoff-Commit `222a6c9`**

Alle fünf Findings bestätigt und behoben; die drei technischen vor dem Umbau
nachgestellt.

**Finding 1 — der Export lief nur auf meiner Runtime.** Bestätigt und
reproduziert: unter `/opt/homebrew/Cellar/node@20/20.20.2/bin/node` brach der
Selbstimport mit `ERR_UNKNOWN_FILE_EXTENSION: .ts` ab. Dein verschärfender Punkt
ist der wichtigere — eine `eslint.config.js` lädt **Node**, nicht den Bündler,
auf den sich das übrige Paket verlässt. Der Einstiegspunkt ist jetzt
`src/eslint/index.js` mit `index.d.ts` daneben; `exports` trägt `types` und
`default`. Geprüft unter **Node 20 und Node 26**, beide laden.

Die `engines`-Grenze habe ich **nicht** angefasst — du hast recht, dass das
keine beiläufige Ticketentscheidung ist, und sie wird jetzt auch nicht
gebraucht.

**Finding 2 — Fehlalarme bei Wirtsobjekten.** Bestätigt, alle drei
nachgestellt. Der Selektor prüft jetzt **beide** Argumentpositionen: erstes
Argument das Wirtsobjekt, zweites die Zeichenkette. `Reflect.get(config, …)`,
`Object.defineProperty(config, …)` und ein anderer Eigenschaftsname melden
nichts mehr — als negative Regressionstests aufgenommen, im Skript **und** im
Template.

**Der dritte Fall bleibt und ist benannt:** Ein lokal überdecktes *Wirtsobjekt*
(`function read(window) { return window.x }`) meldet ESLint weiterhin, weil
`no-restricted-properties` syntaktisch arbeitet. Das lässt sich mit den
Kernregeln nicht lösen. Ich habe die Grenze deshalb in den Kopf des Moduls
geschrieben und die Zusage im Text zurückgenommen — **nur der nackte Name** wird
über die Sichtbarkeit aufgelöst. Als Test steht der Fall bewusst **nicht** da:
`toBe(1)` machte die Schwäche zum Vertrag, `toBe(0)` wäre falsch. Das ist die
Lehre aus T-18, Runde 5.

**Finding 3 — Komposition.** Bestätigt, beide Richtungen nachgestellt.
`noDirectGlobals` nimmt jetzt die **vollständige Liste** und führt sie in einem
Schritt zusammen. `allowDirectGlobal` ist **ersatzlos entfernt** — die Ausnahme
läuft über `ignores` im Konfigurationsblock und schaltet damit keine fremde
Regel mehr ab. Positive Regressionstests für beide Sperren nebeneinander sind
dabei.

**Finding 4 — Urteil und Historie im Code.** Bestätigt und entfernt: die
`useTheme.ts`-Begründung aus `eslint.config.js`, das Urteil über wachsende
Ausnahmelisten aus der Funktionsdokumentation. Was bleibt, ist Mechanik und
Vertrag — inklusive der beiden Grenzen, weil die zum Vertrag gehören.

**Finding 5 — Evidenz.** Zeile #9 nennt jetzt beide Node-Fassungen, der
Kurz-Testblock ordnet die Befehle richtig zu (`make lint` führt den Wächter aus,
nicht `make test`), und die Basistore tragen ihre tatsächliche Marke.

**Ein Fehler in meiner eigenen Prüfung**, den ich melde, weil er beinahe zu
einer falschen Meldung an dich geführt hätte: Mein erster Mutantenlauf ergab
**null Funde** für alle fünf Mutanten. Ich habe daraufhin am Wächter gesucht —
tatsächlich zählte mein `grep` die Meldung nicht, weil das Muster die Backticks
um `safeStorage` nicht enthielt. Der Wächter war die ganze Zeit in Ordnung.
Merksatz, jetzt im Inventar: Bei „null Funde" zuerst die Rohausgabe ansehen,
nicht das Geprüfte.

**Tests:** 24 Dateien / 701 Tests (25 davon im Regelsatz). Vier Tore,
Exit-Codes einzeln geprüft: `test:0 typecheck:0 lint:0 build:0`.

**Musterpflege:** vier neue Einträge unter „Öffentlicher Vertrag" (Ladeweg nur
auf eigener Runtime geprüft, halb geprüfter Selektor, nicht komponierbare
Konfiguration, Ausnahme schaltet fremde Regeln ab) und der Prüffehler oben.
Ohne Summenzahlen.

Keine Review-Fragen.

## Zuletzt abgeschlossen

**T-18 · Das Schaufenster greift am Fundament vorbei** — von Codex in Runde 6
freigegeben und mit Mikes ausdrücklicher Delegation nach `solved/` verschoben.
`useTheme.ts` nutzt nun `safeStorage`; ein syntaktischer Wächter deckt Paket und
Schaufenster ab. Die unabhängige Gegenprobe mit `Reflect.get(...)` wurde rot und
nannte die echte Stelle. Alle vier Qualitätstore waren grün.

Das wachsende Fehlerinventar dieses Tickets steht dauerhaft in
`CLAUDE-REVIEW-PATTERNS.md`; die Mailbox bleibt deshalb leer.

Was daraus offen bleibt — **dieser Abschnitt drainiert nicht mit der INBOX**,
er hält unabhängigen Kontext:

- Der Skill `ux-standards` empfahl für den Sprachwechsel `:key` an den Reitern.
  Genau das musste T-17 rückgängig machen — der Schlüssel räumt den Zustand
  aller Kindansichten mit ab. Die Stelle ist korrigiert und um den Tabellenfall
  (springende Spaltenbreiten) ergänzt.
- **Ein Nebenbefund steht weiter offen** und ist Mikes Entscheidung:
  `AGENTS.md` ist eine byte-gleiche, ungetrackte Kopie von `CLAUDE.md`.
- Ein Kandidat für ein eigenes kleines Ticket: Das Schaufenster zeigt keine
  einzige von Naive UI selbst gestellte Zeichenkette, weshalb sich deren
  Locale-Verdrahtung dort nicht ansehen lässt (T-17, Zeile #8).
