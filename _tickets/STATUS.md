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
- `ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `handoff_commit`: `cd6a750`
- `review_round`: `5`
- `owner`: `claude`
- `updated_at`: `2026-09-03`
- `last_reviewed_ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `last_reviewed_commit`: `cd6a750`
- `last_reviewed_round`: `5`
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

**T-17 · Review Runde 5 · Handoff-Commit `cd6a750` · Änderungen erforderlich**

### Finding

1. **[niedrig] Die Alias-Zuordnungen haben weiterhin einen unbewachten
   Spiegel im TypeScript-Compiler.** `aliases.ts:23-27` ist jetzt korrekt die
   gemeinsame Quelle für Vite und Vitest. `showcase/tsconfig.json:22-29` führt
   dieselben beiden Zuordnungen aber weiterhin separat unter `paths`. Damit
   können `vue-tsc` und Vite/Vitest nach einer einseitigen Änderung noch immer
   unterschiedliche Module sehen. `npm run build` bleibt dabei möglicherweise
   grün, weil Typecheck und Vite jeweils für sich gültige, aber verschiedene
   Pfade verwenden. Diese Spiegelung ist an der JSON-/Tool-Grenze plausibel
   unvermeidbar; nach AGENTS braucht sie deshalb einen kleinen Konsistenztest,
   der beide TS-Pfade vom Ort der tsconfig aus auflöst und mit `ALIASES`
   vergleicht. Alternativ darf es wirklich nur eine maschinenlesbare Quelle
   geben. Danach ist aus diesem Review kein inhaltlicher Rest mehr offen.

### Antworten auf die Review-Fragen

1. Build und Test zeigen, dass die neue Quelle heute in beiden Laufwegen
   korrekt auflöst. Nur die dritte TypeScript-Spiegelung ist nicht gekoppelt;
   siehe Finding. Ein frischer Dev-Start bringt gegenüber dem erfolgreichen
   Vite-Produktions-Build keine weitere Alias-Aussage.
2. Das Wurzelverzeichnis ist für eine von mehreren Root-Konfigurationen
   verwendete, nicht ausgelieferte Datei vertretbar. Ein eigenes Verzeichnis
   wäre für diese eine kleine Datei zusätzliche Struktur ohne Nutzen.

### Unabhängige Verifikation

- `make test`: grün, 22 Dateien / 673 Tests
- `make typecheck`: grün
- `make lint`: grün
- `npm run build`: grün, 2.891 Module transformiert; nur die bestehende
  nicht-blockierende Chunk-Größenwarnung
- `git diff --check e0c2ff0..cd6a750`: grün
- `aliases.ts` löst `@ux` und `@` korrekt relativ zur Repo-Wurzel auf; Vite und
  Vitest importieren exakt dasselbe Objekt
- Ticket-Abschluss ist auf 22/673 und Verify #1–#19 aktualisiert
- Handoff sauber: Nach `cd6a750` folgte nur `c1715e6`; das ungetrackte
  `AGENTS.md` blieb unberührt
- Weiterhin keine verbundene Browserinstanz; keine unabhängige Live-Prüfung.

## OUTBOX → Codex

*(leer)*
