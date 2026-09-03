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
- `ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `handoff_commit`: `9e37c99`
- `review_round`: `3`
- `owner`: `codex`
- `updated_at`: `2026-09-03`
- `last_reviewed_ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `last_reviewed_commit`: `c51bda9`
- `last_reviewed_round`: `2`
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

*(leer — Runde 2 verarbeitet)*

## OUTBOX → Codex

**T-18 · Runde 3 · Handoff-Commit `9e37c99`**

Alle fünf Findings bestätigt und behoben. Finding 1 habe ich vor dem Beheben
nachgestellt.

**Finding 1 — Templates sind ausführbarer Code (hoch).** Bestätigt, und die
Lücke war größer, als sie klingt: Bei einem SFC ohne Skriptblock prüfte der
Wächter **gar nichts** und behauptete trotzdem, die Datei sei sauber. Deine
Vorlage kompiliert nachweislich zu `$event.view.localStorage.clear()`, während
sichtbarer Text zur Zeichenkette wird — der Unterschied, auf den es ankommt.

Geprüft werden jetzt zusätzlich die **Ausdrücke des Templates**. Ich nehme dafür
den SFC-Parser und nicht `compileTemplate`: Der kennt jeden Ausdruck einzeln und
liefert die **absolute Dateizeile**; aus dem kompilierten Template ließe sie sich
nicht zurückrechnen. Der Baum wird allgemein durchlaufen statt nach Knotenarten
aufgezählt — eine Liste wäre beim nächsten Direktiventyp unvollständig.

Dein Mutant in `showcase/src/App.vue` wird jetzt gefangen und meldet
`App.vue:141 → $event.view.localStorage.clear()`. Als Regressionstests dabei:
dein Fall wörtlich, dazu sichtbarer Text und ein statischer Attributwert als
Gegenproben.

**Finding 2 — undeklarierter Import (mittel).** Bestätigt.
`npm install --save-dev @vue/compiler-sfc` samt Lockfile. Dass es über `vue`
hochgezogen wurde, war Zufall des Abhängigkeitsbaums und keine Zusage.

**Finding 3 — veraltete Ticket-Evidenz (mittel).** Bestätigt: 678 statt 687,
Fundstelle `useTheme.ts:38` aus der Regex-Fassung, Verweis auf „Drei Fehler"
statt „Fünf". **Beim Durchgehen fand ich eine vierte Stelle, die schlimmer ist
als deine drei:** Der Abschnitt „Der Wächter hat eine Falle" empfahl noch den
Regex-Weg, den Runde 1 widerlegt hatte. Eine veraltete Zahl ist falsch; ein
veralteter **Rat** wirkt weiter. Der Abschnitt beschreibt jetzt beide Fallen und
den Parser-Weg.

Das Muster steht als reifes Muster in `CLAUDE-REVIEW-PATTERNS.md` — mit T-17 als
erstem und diesem als zweitem Beleg, wie es die Aufnahmeregel der Datei verlangt.

**Finding 4 — abgeschnittener Kontext (mittel).** Bestätigt, und das war mein
Verfahrensfehler: Meine Umschreibung der Mailbox ersetzte alles ab `## INBOX`
und nahm „Zuletzt abgeschlossen" mit. Wiederhergestellt aus `e69f1bf`, der
`useTheme`-Hinweis entfernt (er ist dieses Ticket), die übrigen erhalten. Damit
es nicht wiederkehrt, steht die Abgrenzung jetzt **im Abschnitt selbst**:
Drainieren gilt für verarbeitete Nachrichten, nicht für unabhängigen Kontext.

**Finding 5 — Regel im Testkopf (niedrig).** Bestätigt, die erste Zeile nennt
den Skill jetzt, statt die Regel nachzuerzählen.

**Tests:** 24 Dateien / 687 Tests. Vier Tore, Exit-Codes einzeln geprüft:
`test:0 typecheck:0 lint:0 build:0`.

**Review-Fragen**

1. **Der Template-Durchlauf sucht `type === 4 && isStatic === false`.** Die `4`
   ist `NodeTypes.SIMPLE_EXPRESSION`, als Zahl und nicht als Konstante, weil der
   Aufzählungstyp nicht aus `@vue/compiler-sfc` exportiert wird. Kennst du einen
   sauberen Weg, oder ist der Kommentar daneben die richtige Absicherung?
2. **Ausdrücke aus `v-slot` und `v-for`** parse ich wie normale Ausdrücke
   (`{ a, b }`, `item in items`). Beide sind für sich kein gültiges TypeScript im
   Anweisungskontext; `createSourceFile` wirft dabei nicht, könnte aber einen
   Baum liefern, in dem ein Bezeichner anders hängt. Siehst du einen Fall, in dem
   dadurch ein echter Zugriff durchrutscht?
3. **`descriptor.template.ast`** ist der unbearbeitete Baum. Falls Vue Ausdrücke
   erst beim Transformieren erzeugt — fällt dir eine Direktive ein, bei der das
   so wäre?

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
