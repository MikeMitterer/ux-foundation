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

- `phase`: `codex_reviewing`
- `ticket`: `T-19-waechter-gehoert-ins-fundament.md`
- `handoff_commit`: `a4e82cf`
- `review_round`: `1`
- `owner`: `codex`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `last_reviewed_commit`: `e678c54`
- `last_reviewed_round`: `6`
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

*(leer)*

## OUTBOX → Codex

**T-19 · Runde 1 · Handoff-Commit `a4e82cf`**

**Ziel:** Der in T-18 gehärtete Wächter zieht ins Paket. Auslöser ist die
Hausregel: StockPortfolio führt denselben Test seit Längerem, ux-foundation seit
T-18 — sobald eine zweite App dasselbe braucht, zieht es um.

**Es geht nicht um Aufräumen.** StockPortfolios Fassung sucht
`/localStorage\s*\??\.\s*(getItem|setItem|removeItem|clear|key)/`, also nur
Methodenaufrufe. Durch fallen `window.localStorage ?? null` — ausgerechnet der
Fall aus der Regelbegründung —, `window['localStorage']`, `Reflect.get(…)`,
`const { localStorage } = window` und `localStorage.length`. Ihr Kommentarfilter
verwirft zudem nur Zeilen, die mit `//`, `*` oder `/*` **beginnen**.

**Neu und wichtig: Dieses Ticket erweitert die ausgelieferte Fläche.** Bisher
galt in dieser Reihe „`src/` bleibt unberührt"; hier kommt bewusst etwas hinzu.
Der Abschnitt `Side-Effects` im Ticket ist entsprechend länger als sonst.

**Geänderte Flächen**

| Was | Wo |
|---|---|
| Der Wächter als ausgelieferter Code | `src/testing/directAccess.ts` (neu) |
| Einstiegspunkt | `src/testing/index.ts` (neu), `exports["./testing"]` |
| Optionale Peers | `typescript`, `@vue/compiler-sfc` in `peerDependenciesMeta` |
| Repo-Wächter nutzt den Helfer | `tests/storageAccess.spec.ts` (von 19 Fällen auf 2) |
| Semantik über die öffentliche Schnittstelle | `tests/directAccess.spec.ts` (neu) |

**Tests:** 25 Dateien / 688 Tests. Vier Tore, Exit-Codes einzeln geprüft:
`test:0 typecheck:0 lint:0 build:0`.

**Die Zusicherung, die zählt:** Der Umzug hat an der Erkennung nichts verloren.
**Alle vier Mutanten aus T-18** ausgeführt — gerade, Klammernotation,
`Reflect.get`, Template —, jeder wird rot und nennt die echte Zeile. Danach je
über `git checkout --` zurückgenommen und der Arbeitsbaum als sauber geprüft.

**Der Punkt, an dem dieses Ticket einer App wehtun könnte**, ist Zeile #7 und
steht deshalb auf `⚠️`: Der Haupt-Einstiegspunkt darf die optionalen Peers nicht
anfordern. Statisch bewiesen — `src/index.ts` erwähnt `testing` nicht, und
`typescript`/`@vue/compiler-sfc` werden in `src/` ausschließlich unter
`testing/` importiert. **Nicht** geprüft ist eine echte Installation ohne die
beiden; dafür bräuchte es eine App, die das Paket frisch zieht, und das gehört
ins Folgeticket bei StockPortfolio.

**Nicht in diesem Ticket:** StockPortfolios Umstellung. Das Deliverable liegt
hier, die andere App bekommt ihr eigenes Ticket in ihrem eigenen Repo.

**Ein Hinweis zum Branch:** `t-19-…` ist von `t-18-…` abgezweigt, nicht von
`master` — der gehärtete Wächter entstand dort und ist noch nicht integriert.
Bewusste Stapelung: Die Integrationsentscheidung für T-18 gehört Mike, und ich
nehme sie nicht vorweg. Ein Merge von T-19 bringt beide mit.

**Review-Fragen**

1. **Der Einstiegspunkt heißt `./testing` und liegt unter `src/testing/`.**
   Damit ist er Teil der öffentlichen Zusage und kann nicht mehr still
   verschwinden. Trägst du den Ort mit, oder gehört so etwas eher in ein eigenes
   Paket?
2. **Zwei exportierte Funktionen**, `findDirectAccess` und
   `findDirectAccessInFile`. Die zweite existiert für den Selbstcheck. Ist das
   die richtige Aufteilung, oder sollte der Selbstcheck Teil der ersten sein —
   etwa als Zusicherung, dass jede `allow`-Datei mindestens einen Treffer hat?
3. **Rückgabe sind formatierte Zeichenketten** (`pfad:zeile → inhalt`) statt
   Objekte. Das macht `toEqual([])` unmittelbar lesbar, verhindert aber
   Filtern. Für einen Wächter halte ich das für richtig; siehst du einen Fall,
   in dem eine App die Struktur bräuchte?

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
