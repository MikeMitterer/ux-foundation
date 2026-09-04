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
- `handoff_commit`: `3bae27d`
- `review_round`: `5`
- `owner`: `claude`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-18-schaufenster-greift-am-fundament-vorbei.md`
- `last_reviewed_commit`: `3bae27d`
- `last_reviewed_round`: `5`
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

**T-18 · Review-Runde 5 · Changes requested für Handoff `3bae27d`**

Die Funktion und der Wächter haben keinen offenen Laufzeitbefund mehr: Mein
isolierter Produktmutant mit
`Reflect.get(window, 'localStorage')?.getItem(STORAGE_KEY)` wird jetzt rot und
meldet exakt `useTheme.ts:25`; die harmlose Gegenrichtung bleibt grün.

1. **Mittel — das neue Evidenzinventar und das Ticket widersprechen ihrer
   eigenen Zählung.** `_tickets/CLAUDE-REVIEW-PATTERNS.md:195-227` sagt „vier
   Review-Runden" und „alle sieben Fehler", listet unter „Der Wächter" aber
   acht Fehler (1–8). Im Ticket heißt der Abschnitt weiterhin „Sieben Fehler";
   dort fehlt der Template-Ausfall als eigener Listenpunkt, obwohl die
   Klammernotation und `Reflect.get` danach nummeriert sind. Das ist unmittelbar
   wieder das gerade aufgenommene Muster „Ticket-Evidenz veraltet" und verletzt
   zusätzlich die Repo-Regel **„Keine Zahl zweimal"**. Bitte veränderliche
   Summenzahlen aus Einleitung, Überschrift und Fließtext entfernen; die
   nummerierte Liste bleibt die Quelle. Das vollständige T-18-Inventar muss
   außerdem den bestätigten Verfahrensfehler „Ticketzahlen, Fundstellen und Rat
   blieben über Handoffs alt" selbst enthalten — er fehlt derzeit in
   „Verfahren".

2. **Mittel — der Testcode trägt erneut Geschichte und Urteile, obwohl dafür
   jetzt Ticket und Pattern-Datei existieren.**
   `tests/storageAccess.spec.ts:1-30,79-126,314-350` erzählt mehrfach, warum
   frühere Fassungen scheiterten, welche
   Grenze „ehrlich" sei und was ein Wächter grundsätzlich abdecke. `AGENTS.md`
   trennt ausdrücklich: Code hält urteilsfreie Mechanik, der Skill Urteile;
   Regeln werden nicht mehrfach erzählt. Bitte den Testkopf und die
   Funktionsdokumentation auf Mechanik, Ein-/Ausgabe und nötige AST-Kontexte
   kürzen. Historie, Lehren und Begründungen bleiben im Ticket beziehungsweise
   in `CLAUDE-REVIEW-PATTERNS.md`; ein knapper Verweis darauf genügt.

3. **Niedrig — ein Test sollte eine bekannte Blindstelle nicht als erwünschtes
   Verhalten festschreiben.** `tests/storageAccess.spec.ts:341-350` erwartet
   ausdrücklich, dass `window['local' + 'Storage']` **nicht** erkannt wird.
   Damit würde eine spätere, unschädliche Verbesserung des Wächters rot und die
   heutige Einschränkung zum Vertrag. Nicht-Erkennung ist hier kein gewünschtes
   Produktverhalten, sondern eine akzeptierte Grenze. Bitte die Einschränkung
   im Ticket/Inventar dokumentieren, aber nicht per `toEqual([])` konservieren.
   Eine negative Gegenprobe soll harmlose Prosa vor Fehlalarmen schützen, nicht
   eine echte Umgehung vor künftiger Erkennung.

**Unabhängig ausgeführt:** `make test` (24 Dateien / 695 Tests),
`make typecheck`, `make lint`, `npm run build` — alle Exit-Code 0; nur der
bekannte Chunk-Hinweis bleibt. `git diff --check` ist sauber. Der
`Reflect.get`-Produktmutant lief isoliert und wurde wie erwartet rot.

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
