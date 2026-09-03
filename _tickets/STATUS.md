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

- `phase`: `approved`
- `ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `handoff_commit`: `4dd5732`
- `review_round`: `6`
- `owner`: `claude`
- `updated_at`: `2026-09-03`
- `last_reviewed_ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `last_reviewed_commit`: `4dd5732`
- `last_reviewed_round`: `6`
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

**T-17 · Review Runde 6 · Handoff-Commit `4dd5732` · Freigegeben**

Keine Findings. Der letzte offene Konsistenzpunkt ist geschlossen:
`ALIAS_SOURCES` ist die gemeinsame Datenquelle für Vite und Vitest, und der
unvermeidbare JSON-Spiegel in `showcase/tsconfig.json` wird durch
`tests/aliases.spec.ts` vollständig bewacht — sowohl Alias-Menge als auch
aufgelöste Zielverzeichnisse.

### Unabhängige Verifikation

- `make test`: grün, 23 Dateien / 676 Tests
- `make typecheck`: grün
- `make lint`: grün
- `npm run build`: grün, 2.891 Module transformiert; nur die bekannte,
  nicht-blockierende Chunk-Größenwarnung
- `git diff --check cd6a750..4dd5732`: grün
- Negativprobe in isolierter `/tmp`-Kopie: TypeScript-Pfad für `@` von
  `./src/*` auf `./srcX/*` geändert; der gezielte Alias-Test wird korrekt rot
  (1 fehlgeschlagen / 2 grün) und nennt Soll- und Ist-Verzeichnis
- Die vorherige Setter-Gegenprobe bleibt belastbar: Ohne
  `announceLocale(locale)` wird der Sync-Test rot
- Handoff sauber: Nach `4dd5732` folgte nur `976b93a`; das ungetrackte
  `AGENTS.md` blieb unberührt

### Restrisiken / Human-Handoff

- #13 bleibt ehrlich `➖`: 375-px-Fenster nicht live geprüft.
- #19 bleibt ehrlich `➖`: nicht unterstützte Browsersprache nicht live
  umstellbar, aber per Unit-Test abgedeckt.
- #8 bleibt ehrlich `⚠️`: Das Showcase zeigt keine eigene Naive-UI-Zeichenkette,
  an der die Locale visuell prüfbar wäre.
- Dieser Codex-Chat hatte weiterhin keine verbundene Browserinstanz; Claudes
  dokumentierte Live-Evidenz konnte daher nicht unabhängig wiederholt werden.

Diese offenen, korrekt markierten Human-/Darstellungspunkte blockieren die
inhaltliche Freigabe nicht. Claude kann den Abschluss für Mike vorbereiten;
Human-Spalte und Verschieben nach `solved/` bleiben bei Mike.

## OUTBOX → Codex

*(leer)*
