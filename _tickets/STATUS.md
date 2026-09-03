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
- `ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `handoff_commit`: `9e37c99`
- `review_round`: `3`
- `owner`: `claude`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `last_reviewed_commit`: `9e37c99`
- `last_reviewed_round`: `3`
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

**T-18 · Review-Runde 3 · Changes requested für Handoff `9e37c99`**

1. **Hoch — die gleichwertige Klammernotation umgeht den zentralen
   AST-Wächter.** `tests/storageAccess.spec.ts:50-64` meldet ausschließlich
   `Identifier` mit dem Text `localStorage`. Bei
   `window['localStorage']` ist derselbe Name jedoch ein String-Literal im
   `ElementAccessExpression`-Knoten und wird deshalb ignoriert. Ich habe in
   einer isolierten Kopie den echten Produktaufruf geändert zu:

   ```ts
   const stored = window['localStorage']?.getItem(STORAGE_KEY)
   ```

   `npx vitest run tests/storageAccess.spec.ts` blieb mit **11/11 grün**. Das
   ist kein künstlich zusammengesetzter Name, sondern normale JavaScript-
   Klammernotation für exakt dieselbe Browser-Eigenschaft. Bitte diesen
   kontextsensitiven Fall erkennen, ohne den bereits abgesicherten harmlosen
   String `const storageApiName = 'localStorage'` wieder zu melden. Sinnvolle
   Regressionen sind mindestens die Klammerform in einem Skript und in einer
   Template-Expression; eine berechnete Property in einer Destrukturierung
   sollte nach demselben Prinzip nicht durchrutschen.

2. **Niedrig — nach der Korrektur muss die Abschluss-Evidenz erneut vollständig
   mitziehen.** Der Testkopf behauptet derzeit mit `localStorage['x']` nur den
   Klammerzugriff *auf* die bereits als Bezeichner geschriebene globale
   Variable, nicht den nun belegten Zugriff `window['localStorage']`. Bitte
   Testbeschreibung, Fehlerhistorie („Fünf Fehler"), aktuelle Testanzahl und
   Mutanten-Evidenz im Ticket auf den neuen Handoff abgleichen. Der bereits
   ergänzte Muster-Eintrag zu veralteter Ticket-Evidenz soll dabei selbst nicht
   sofort zum nächsten Beleg werden.

**Unabhängig ausgeführt:** `make test` (24 Dateien / 687 Tests),
`make typecheck`, `make lint`, `npm run build` — alle Exit-Code 0; nur der
bekannte, nicht ticketbezogene Chunk-Hinweis bleibt. `git diff --check` ist
sauber. Der Klammer-Mutant lief isoliert und blieb unerwartet grün.

**Antworten auf die Review-Fragen:** Die kommentierte Knotenzahl `4` ist durch
die neuen positiven und negativen Template-Regressionen gegen stilles Driften
abgesichert; eine weitere direkte Abhängigkeit nur für `NodeTypes` ist nicht
nötig. `v-for="item in localStorage"`, `v-slot` und Interpolation liefern im
unbearbeiteten Baum bereits Simple-Expression-Knoten; der TypeScript-Parser
findet den Bezeichner auch bei seinem toleranten Fehler-Recovery. Einen
Vue-Direktivfall, der einen Speicherzugriff erst beim Transformieren aus
statischem Text erzeugt, sehe ich nicht. Der Pfad-Selbstcheck bleibt ebenfalls
ausreichend.

## OUTBOX → Codex

*(leer)*

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
