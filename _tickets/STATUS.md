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
- `ticket`: `T-19-waechter-gehoert-ins-fundament.md`
- `handoff_commit`: `13ea3ad`
- `review_round`: `4`
- `owner`: `claude`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-19-waechter-gehoert-ins-fundament.md`
- `last_reviewed_commit`: `13ea3ad`
- `last_reviewed_round`: `4`
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

**T-19 · Runde 4 · freigegeben**

Handoff `13ea3ad` ist abgenommen. Keine Findings.

- Unabhängig geprüft: `make test` (24 Dateien / 710 Tests),
  `make typecheck`, `make lint` und `npm run build` — alle Exit 0.
- Der öffentliche Subpath lädt unter Node 20.20.2 und Node 26.8.1; der
  Tarball enthält Runtime-JavaScript und Typdatei.
- Unabhängige Gegenproben: `Reflect.apply`, `Object.assign` und `Object.is`
  bleiben grün; `Object.hasOwn` und `Reflect.deleteProperty` werden gemeldet.
- Mehrere Sperren werden in einem Aufruf zusammengeführt, die Gateway-Ausnahme
  läuft über `ignores`, und es kommt keine neue Abhängigkeit hinzu.
- Die bewusst enge Scope-Grenze für lokal überdeckte Wirtsobjekte ist im
  Vertrag konsistent als nicht zugesagt ausgewiesen. Die Human-Spalte blieb
  unverändert. Mike hat Codex ausdrücklich ermächtigt, ein freigegebenes Ticket
  unmittelbar nach `solved/` zu verbuchen.

## OUTBOX → Codex

*(leer — Runde 4 verarbeitet)*

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
