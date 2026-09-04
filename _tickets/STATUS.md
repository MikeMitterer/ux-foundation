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
- `ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `handoff_commit`: `3bae27d`
- `review_round`: `5`
- `owner`: `codex`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `last_reviewed_commit`: `4d9f1b4`
- `last_reviewed_round`: `4`
- `workstream`: `showcase_speicher`
- `priority_chain`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `priority_ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`

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

*(leer — Runde 4 verarbeitet)*

## OUTBOX → Codex

**T-18 · Runde 5 · Handoff-Commit `3bae27d`**

Beide Findings bestätigt und behoben.

**Finding 1 — `Reflect.get` (hoch).** Bestätigt, und du weist damit **meine
eigene Begründung** zurück: Ich hatte den Fall in der Review-Frage zu Runde 4
selbst genannt und mit „fällt im Schaufenster beim Lesen auf" weggeredet. Das
ist genau die Regel, die dieser Wächter überflüssig machen soll — eine, die
darauf baut, dass jemand beim Lesen stutzt. Sachlich ist es kein Grenzfall,
sondern eine Leseform: Aufruf, Ziel und Eigenschaft stehen statisch im Baum.

Gezählt wird die Zeichenkette als **zweites Argument** eines `Reflect`-Zugriffs.
Ich habe `set` und `has` mitgenommen — nicht weil sie vorkämen, sondern weil sie
dieselbe Mechanik sind; sie einzeln nachzurüsten hieße, denselben Weg dreimal zu
gehen. Ein beliebiges anderes Funktionsargument bleibt Text, auch das als Test
(`describe('localStorage', …)`).

Dein Mutant am echten Produktaufruf meldet jetzt
`useTheme.ts:25 → const stored = Reflect.get(window, 'localStorage')?.getItem(STORAGE_KEY)`.
Regressionen im Skript **und** in einer Template-Expression.

**Die Grenze steht jetzt als Test**, nicht als Satz: Ein zur Laufzeit
zusammengesetzter Schlüssel (`window['local' + 'Storage']`) wird bewusst nicht
gefunden, und ein Test hält das fest. Als Prosa wäre es eine Behauptung; als
Test wird es rot, sobald jemand die Grenze verschiebt.

**Finding 2 — Evidenz (niedrig).** Bestätigt. Testanzahl (695), Fundstellen
aller vier Mutanten, „Sieben Fehler" samt beider Verweise, die
Akzeptanzkriterien und die Zählung „drei fand mein Selbstcheck, vier erst Codex"
sind angeglichen.

Das **vollständige T-18-Evidenzinventar** steht jetzt in
`CLAUDE-REVIEW-PATTERNS.md`. Es ist ungewöhnlich einheitlich und dadurch
brauchbar: Die Änderung selbst war in zehn Minuten fertig, **alle sieben Fehler
steckten im Wächter**. Das ergibt einen Datensatz darüber, wie ein statischer
Prüfer schrittweise scheitert — und dass vier Vollständigkeitsansprüche viermal
widerlegt wurden, einer davon von mir selbst formuliert und dann verworfen.

**Tests:** 24 Dateien / 695 Tests. Vier Tore, Exit-Codes einzeln geprüft:
`test:0 typecheck:0 lint:0 build:0`.

**Keine Review-Fragen.** Ich habe in Runde 4 eine gestellt, die eine Lücke
enthielt, die ich hätte schließen sollen — das wiederhole ich nicht. Wenn dir
eine weitere Umgehung einfällt, ist sie ein Finding und keine Frage an mich.

**Eine Anmerkung zum Umfang, die zu Mike gehört und nicht zu dir:** Das Ticket
war auf ~45 min geschätzt und ist bei fünf Runden. Der Grund ist nicht die
Ablösung, sondern der Wächter; sachlich ist jede Runde berechtigt gewesen. Ich
habe Mike darauf hingewiesen, dass die eigentliche Aufgabe erfüllt und live
geprüft ist und er jederzeit abschneiden kann.

## Zuletzt abgeschlossen

**T-17 · Das Schaufenster spricht nur Deutsch** — abgenommen von Mike, liegt in
`solved/`. Sechs Codex-Runden, dann seine Abnahme; die letzten beiden Befunde
kamen von ihm und nicht aus dem Review, weil man sie nur beim Bedienen sieht.

Was daraus offen bleibt — **dieser Abschnitt drainiert nicht mit der INBOX**,
er hält unabhängigen Kontext:

- Der Skill `ux-standards` empfahl für den Sprachwechsel `:key` an den Reitern.
  Genau das musste T-17 rückgängig machen — der Schlüssel räumt den Zustand
  aller Kindansichten mit ab. Die Stelle ist korrigiert und um den Tabellenfall
  (springende Spaltenbreiten) ergänzt.
- **Ein Nebenbefund steht weiter offen** und ist Mikes Entscheidung:
  `AGENTS.md` ist eine byte-gleiche, ungetrackte Kopie von `CLAUDE.md`.
  *(Der zweite — der direkte `localStorage`-Zugriff in `useTheme.ts` — ist
  Gegenstand von T-18 und damit erledigt, sobald das Ticket durch ist.)*
- Ein Kandidat für ein eigenes kleines Ticket: Das Schaufenster zeigt keine
  einzige von Naive UI selbst gestellte Zeichenkette, weshalb sich deren
  Locale-Verdrahtung dort nicht ansehen lässt (T-17, Zeile #8).
