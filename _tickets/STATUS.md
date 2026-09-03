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
- `ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `handoff_commit`: `e0c2ff0`
- `review_round`: `4`
- `owner`: `codex`
- `updated_at`: `2026-09-03`
- `last_reviewed_ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `last_reviewed_commit`: `19a14a3`
- `last_reviewed_round`: `3`
- `workstream`: `showcase_i18n`
- `priority_chain`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `priority_ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`

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

**T-17 · Runde 4 · Handoff-Commit `e0c2ff0`**

Beide Findings bestätigt und behoben. Finding 1 war ein sauberer Treffer, und
du hast ihn richtig gemessen statt gelesen.

**Finding 1 — der Test bewachte den Empfänger, nicht die Verdrahtung.**
Bestätigt. Mein Test rief `announceFromOtherDocument()` direkt auf; damit lief
`setLocale` nie, und der Speicher-Mock traf einen Pfad, den niemand betrat.

Der neue Block „Der Umschalter sagt an, was er tut" geht den Weg der Kopfzeile:
`useLocale().setLocale('en')`, beobachtet aus der Rolle, für die die Kopplung
gebaut wurde — ein zweites Dokument am selben Kanal. Cleanup läuft über
`afterEach` und setzt Speicher **und** offene Kanäle zurück, auch nach einem
gescheiterten `expect`.

**Beim Umbau kam heraus, dass der Ausfall-Fall vorher gar keiner war:**
happy-dom bringt **keinen** `localStorage` mit (nachgemessen: `window.localStorage`
ist `undefined`). `safeStorage` scheiterte im Test also ohnehin immer, und „bei
blockiertem Speicher" prüfte eine Lage, die es nicht herstellte — der Mock auf
`Storage.prototype.setItem` war doppelt wirkungslos. Der Test hängt jetzt selbst
einen Speicher ein, lässt *dessen* `setItem` werfen und stellt zusätzlich fest,
dass wirklich nichts geschrieben wurde. Ohne diese zweite Zusicherung könnte er
erneut unbemerkt die falsche Lage prüfen.

**Deinen Mutanten gegengeprüft, plus einen zweiten** — ausgeführt, nicht
behauptet:

| Mutant | vor `e0c2ff0` | jetzt |
|---|---|---|
| `announceLocale(locale)` aus `setLocale` entfernt | grün (8/8) | **rot** — „erreicht andere Dokumente auch bei blockiertem Speicher" |
| `persistLocale(locale, …)` aus `setLocale` entfernt | grün | **rot** — zwei Fälle |

Dafür brauchte es den `@`-Alias in `vitest.config.ts`: Die Schaufenster-Module
zeigen mit `@/…` aufeinander, und ohne ihn scheitert schon das Laden. Der Grund
steht als Kommentar an der Stelle.

**Finding 2 — deutscher Bezeichner.** Bestätigt, `{ irgendwas: true }` →
`{ unexpected: true }`.

**Ein Vorfall, der zum Handoff gehört:** Beim Zurücknehmen der Mutanten schlug
mein `cp -f` fehl — `cp` ist hier interaktiv aliased und überschreibt trotz
`-f` nicht, meldete das aber nur in einer Zeile, die zwischen den Testausgaben
unterging. Die Quelldatei stand danach **mutiert** auf der Platte, mit beiden
Aufrufen entfernt. Aufgefallen ist es, weil ich den Zustand danach noch einmal
gegen `git` geprüft habe statt gegen meine eigene Sicherungskopie;
wiederhergestellt per `git checkout --`. Lehre für mich: Zum Zurücknehmen eines
Eingriffs ist git die Quelle, nicht eine Kopie in `/tmp`.

**Tests:** 22 Dateien / 673 Tests grün. Exit-Codes einzeln geprüft, nicht durch
eine Pipe: `test:0 typecheck:0 lint:0`.

**Unverändert offen, alle drei für Mike:** #13 ➖ (Fenstergröße), #8 ⚠️ (nichts
von Naive sichtbar), #19 ➖ (Browsersprache nicht umstellbar, per Unit-Test
abgedeckt).

**Review-Fragen für diese Runde**

1. **Reicht der Mutanten-Satz?** Ich habe die beiden Aufrufe in `setLocale`
   geprüft. Siehst du einen dritten Eingriff, der grün bliebe — etwa im
   Empfänger in `i18n/index.ts` (Riegel auf `isLocaleId`, das Setzen von
   `lang`)?
2. **Der eingehängte Speicher im Test.** Er ist ein Handnachbau; `safeStorage`
   hat mit `fakeStorage()` in `tests/safeStorage.spec.ts` bereits einen. Lohnt
   ein gemeinsamer Helfer, oder ist das die Abstraktion für genau zwei Fälle,
   die KISS verbietet?
3. **`vitest.config.ts` führt jetzt zwei Aliase, die `showcase/vite.config.ts`
   ebenfalls führt.** Das ist eine zweite Quelle ohne Test. Soll die
   Test-Konfiguration die Aliase aus der Schaufenster-Konfiguration importieren,
   oder ist die Doppelung hier die kleinere Sünde?
