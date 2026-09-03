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
- `handoff_commit`: `75485ae`
- `review_round`: `1`
- `owner`: `codex`
- `updated_at`: `2026-09-03`
- `last_reviewed_ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `last_reviewed_commit`: `4dd5732`
- `last_reviewed_round`: `6`
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

*(leer)*

## OUTBOX → Codex

**T-18 · Runde 1 · Handoff-Commit `75485ae`**

**Ziel:** `showcase/src/composables/useTheme.ts` griff direkt auf den
`localStorage` zu, mit eigenem `try`/`catch`, statt `safeStorage` aus dem Paket
zu nehmen. Der Befund stammt aus Mikes Abnahme von T-17.

**Scope:** `showcase/src/composables/useTheme.ts` und ein neuer Test.
**`src/` ist unberührt** — `safeStorage` war bereits exportiert
(`src/index.ts:68`), es kommt nichts Neues an die öffentliche Fläche.

**Kein Fehler im Verhalten, und das ist der Punkt.** Der alte Code fing den Wurf
korrekt ab und tat funktional dasselbe. Eine *richtige* Kopie verursacht keinen
Fehler, also drängt nichts auf ihre Ablösung — sie überlebt länger als eine
falsche. Die Entstehung erklärt sie: Die Datei ist eine Stunde **älter** als
`safeStorage` (11:40 gegen 12:46 am selben Tag) und wurde seither nie wieder
angefasst, weshalb „was man ohnehin anfasst, zieht mit" nie auslöste.

**Geänderte Flächen**

| Was | Wo |
|---|---|
| Ablösung durch `safeStorage.read`/`.write`, eigenes `try`/`catch` entfällt | `showcase/src/composables/useTheme.ts` |
| Wächter gegen direkten Zugriff in beiden Quellbäumen | `tests/storageAccess.spec.ts` (neu) |

**Tests:** 24 Dateien / 678 Tests. Vier Tore, Exit-Codes einzeln geprüft:
`test:0 typecheck:0 lint:0 build:0`.

**Live-Evidenz:** alle sieben Verify-Zeilen, Zahlen in den Fußnoten. Beide
Ausfallpfade sind im Browser gefahren — Schreiben wirft und Zugriff wirft —,
jeweils mit der Gegenprobe, dass wirklich nichts geschrieben wurde.

**Der Wächter war dreimal falsch, bevor er stimmte.** Alle drei Fehler ließen
ihn **grün** aussehen: Der Ausdruck schloss `window.localStorage` aus (Punkt im
Riegel), er suchte nur Eigenschaftszugriffe und übersah damit sowohl
`?.getItem` als auch das nackte `window.localStorage ?? null` in `safeStorage`
selbst, und das Entfernen der Kommentare schluckte Zeilenumbrüche, sodass er die
falsche Zeile meldete. Aufgedeckt hat alle drei derselbe zweite Test — der, der
prüft, ob die Ausnahme überhaupt gesehen wird. Steht ausführlich im Ticket.

**Bekannte Einschränkung:** Live geprüft ist der Schreibweg. Der Leseweg beim
**Aufbau** der App ließ sich von hier nicht blockieren — der Riegel müsste vor
dem ersten Skript stehen. Abgedeckt durch `tests/safeStorage.spec.ts` im Paket.

**Ein Fehler beim Arbeiten, den ich melde statt zu verschweigen:** Beim ersten
Mutanten-Lauf habe ich mit `git checkout --` zurückgesetzt, bevor die Ablösung
committet war — und damit meine eigene Änderung mitgerissen. `git checkout --`
stellt HEAD her, nicht den Stand von vorhin. Reihenfolge ab jetzt: erst
committen, dann mutieren.

**Review-Fragen**

1. **Die Ausnahmeliste des Wächters hat genau einen Eintrag.** Wächst sie, ist
   der Test falsch und nicht der Code — so steht es im Ticket. Siehst du einen
   berechtigten zweiten Fall, den ich vorwegnehmen müsste?
2. **Das Entfernen der Kommentare** ist eine Handarbeit (Blockkommentare,
   HTML-Kommentare, Zeilenkommentare außer nach `:` wegen `https://`). Fällt
   dir ein Muster ein, an dem sie falsch liegt — etwa `localStorage` in einer
   Zeichenkette oder in einem Template-Literal?
3. **`safeStorage.write` liefert `true`/`false`, und ich werte es nicht aus.**
   Begründet im Code: Misslingt es, gilt der Anstrich nur für diese Sitzung.
   Trägst du das mit, oder gehört dem Nutzer eine Rückmeldung?
