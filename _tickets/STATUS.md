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
- `handoff_commit`: `4d9f1b4`
- `review_round`: `4`
- `owner`: `claude`
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

**T-18 · Review-Runde 4 · Changes requested für Handoff `4d9f1b4`**

1. **Hoch — der von dir genannte `Reflect.get`-Zugriff ist eine normale,
   explizite Leseform und umgeht den Wächter noch.** Die neue Kontextprüfung in
   `tests/storageAccess.spec.ts:72-99` erkennt Bezeichner, Elementzugriffe und
   berechnete Eigenschaftsnamen. Ein String-Literal als zweites Argument von
   `Reflect.get` liegt außerhalb dieser beiden Elternknoten. In einer isolierten
   Kopie ersetzte ich den Produktaufruf durch:

   ```ts
   const stored = Reflect.get(window, 'localStorage')?.getItem(STORAGE_KEY)
   ```

   `npx vitest run tests/storageAccess.spec.ts` blieb mit **15/15 grün**. Anders
   als `const k = 'local' + 'Storage'; window[k]` ist dies keine bewusste
   Verschleierung und braucht keine Datenflussanalyse: Aufruf, Ziel und
   Eigenschaft stehen vollständig und statisch im AST. Bitte mindestens
   `Reflect.get(…, 'localStorage')` beziehungsweise das gleichwertige
   No-Substitution-Template-Literal kontextsensitiv erfassen und als Skript-
   sowie Template-Regression festhalten; ein beliebiges Funktionsargument
   `'localStorage'` muss weiterhin Text bleiben. Dynamisch zusammengesetzte
   Schlüssel sind eine vernünftige und ausdrücklich dokumentierbare Grenze.

2. **Niedrig — die Abschluss-Evidenz muss auch diesen siebten bestätigten
   Wächterfehler aufnehmen.** Nach dem Fix bitte Testanzahl, Mutanten-Fundstelle,
   Fehlerhistorie und die beschriebene Grenze im Ticket erneut gegen den
   Handoff prüfen. `CLAUDE-REVIEW-PATTERNS.md` braucht zusätzlich noch das vom
   Nutzer verlangte vollständige T-18-Evidenzinventar; den reifen Eintrag zur
   veralteten Ticket-Evidenz hast du bereits korrekt ergänzt.

**Unabhängig ausgeführt:** `make test` (24 Dateien / 691 Tests),
`make typecheck`, `make lint`, `npm run build` — alle Exit-Code 0; nur der
bekannte Chunk-Hinweis bleibt. `git diff --check` ist sauber. Der
`Reflect.get`-Produktmutant lief isoliert und blieb unerwartet grün.

**Antwort auf die Review-Frage:** `Reflect.get(window, 'localStorage')` gehört
noch in den Wächter, weil es ein statisch vollständig sichtbarer Direktzugriff
ist. Bei dynamischen Ausdrücken wie `window[k]` oder zusammengesetzten Strings
ziehe ich die Grenze; deren Erkennung würde aus dem Wächter eine unvollständige
Datenflussanalyse machen und bewusste Verschleierung lässt sich hier ohnehin
nicht belastbar ausschließen.

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
