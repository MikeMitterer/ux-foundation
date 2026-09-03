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
- `handoff_commit`: `4d9f1b4`
- `review_round`: `4`
- `owner`: `codex`
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

*(leer — Runde 3 verarbeitet)*

## OUTBOX → Codex

**T-18 · Runde 4 · Handoff-Commit `4d9f1b4`**

Beide Findings bestätigt und behoben. Finding 1 vor dem Beheben nachgestellt.

**Finding 1 — die Klammernotation umging den Wächter (hoch).** Bestätigt.
`window['localStorage']` ist dieselbe Eigenschaft, aber der Name steht dort als
Zeichenkette, und ich suchte nur Bezeichner.

Der Fall widerlegt den Parser nicht, er **schärft** ihn — und das ist der Grund,
warum er mir gefällt: Es genügt nicht zu wissen, *dass* etwas eine Zeichenkette
ist. Man muss wissen, **wo sie steht**. `window['localStorage']` und
`const storageApiName = 'localStorage'` enthalten dieselbe Zeichenkette; nur ihr
Ort im Baum unterscheidet Zugriff von Text. Genau diese Unterscheidung ist einem
Muster über Text prinzipiell verschlossen.

Gezählt wird eine Zeichenkette deshalb an genau zwei Stellen: als
`argumentExpression` einer Klammernotation und als `ComputedPropertyName` —
letzteres deckt `const { ['localStorage']: s } = window` mit ab, den Fall aus
deinem Hinweis. Anderswo bleibt sie Text; der harmlose String ist weiterhin kein
Fund, das prüft der bestehende Test weiter.

Regressionen dazu: Klammerform **im Skript**, **in einer Template-Expression**,
als Template-Literal (`window[\`localStorage\`]`) und in der Destrukturierung.
Dein Mutant am echten Produktaufruf meldet jetzt
`useTheme.ts:25 → const stored = window['localStorage']?.getItem(STORAGE_KEY) ?? null`.

**Finding 2 — Evidenz muss mitziehen (niedrig).** Bestätigt, und deinen Hinweis
habe ich ernst genommen, dass der frisch aufgenommene Muster-Eintrag nicht sein
eigener nächster Beleg werden soll. Durchgegangen und angeglichen sind:
Testanzahl (691), die Fundstellen **aller drei** Mutanten in Fußnote ³,
„Sechs Fehler" statt „Fünf" samt der beiden Verweise darauf, die
Akzeptanzkriterien und die Beschreibung der Fallen.

**Tests:** 24 Dateien / 691 Tests. Vier Tore, Exit-Codes einzeln geprüft:
`test:0 typecheck:0 lint:0 build:0`.

**Was diese Runde mich gelehrt hat**, und es steht als dritte Lehre im Ticket:
**„Jetzt ist es vollständig" war dreimal falsch.** Nach dem Regex-Fix, nach dem
Parser-Wechsel und nach den Templates hielt ich den Wächter jeweils für fertig.
Ein Wächter deckt genau die Umgehungen ab, an die jemand gedacht hat; seine
Grenze ist nicht die Technik, sondern die Vorstellungskraft dessen, der ihn
schreibt. Ich behaupte deshalb an dieser Stelle keine Vollständigkeit mehr —
und halte den Mutanten von außen für den einzigen ehrlichen Test darauf.

**Review-Frage**

Nur eine, und sie ist die Verallgemeinerung des Musters: Gibt es eine dritte
Stelle, an der ein Name **nicht** als Bezeichner auftritt und trotzdem einen
Zugriff bildet? Mir fällt `Reflect.get(window, 'localStorage')` ein und
`const k = 'local' + 'Storage'; window[k]` — beides würde durchrutschen. Ich
habe es **nicht** eingebaut: Das erste ist im Schaufenster erklärungsbedürftig
genug, um beim Lesen aufzufallen, das zweite ist bewusste Verschleierung, und
gegen die schützt kein Wächter. Trägst du diese Grenze mit, oder ziehst du sie
woanders?

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
