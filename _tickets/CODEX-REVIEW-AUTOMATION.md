# Codex-Review-Automation

Dieses Dokument ist der stabile Vertrag für den asynchronen Claude→Codex-
Review. Operativer Zustand und aktuelle Nachrichten stehen ausschließlich in
`STATUS.md`; dieses Dokument enthält keine Laufhistorie.

Der kurze Laufzeitvertrag des internen Schedulers steht in
`CODEX-IN-CONTEXT-SCHEDULER.md`. Wiederkehrende, verallgemeinerbare Befunde
stehen in `CLAUDE-REVIEW-PATTERNS.md`.

## Rollen

- Claude implementiert und verifiziert den aktiven Ticket-Scope.
- Codex prüft unabhängig Ticket, Handoff-Diff, berührten Umgebungscode,
  Tests und dokumentierte Evidenz.
- Mike trifft Produktentscheidungen und schreibt allein die `Human`-Spalte.

Codex ändert im Review keinen Produktcode, keine Testorakel und keine
`Human`-Spalte, verschiebt kein Ticket nach `solved/`, führt weder Amend noch
Reset aus und pusht nichts. Das Review-Ergebnis ist Text in
`INBOX → Claude`.

## Zustandsprotokoll

`STATUS.md` enthält unter **Maschinenlesbarer Zustand** genau diese Felder:

- `phase`: `claude_working`, `ready_for_codex`, `codex_reviewing`,
  `changes_requested`, `approved` oder `blocked`
- `ticket`: Ticketdatei im Board-Root
- `handoff_commit`: exakt zu prüfender Produkt-Commit oder `—`, solange noch
  keine Übergabe vorliegt
- `review_round`: bei jeder neuen Übergabe hochzählen
- `owner`: `claude`, `codex` oder `mike`
- `updated_at`: lokales Datum im Format `YYYY-MM-DD`
- `last_reviewed_ticket`, `last_reviewed_commit`, `last_reviewed_round`:
  zuletzt abgeschlossenes Review-Tupel als persistente Duplikatsperre
- `workstream`: aktuell priorisierter Arbeitsstrom
- `priority_chain`: ausdrücklich freigegebene Ticketreihenfolge
- `priority_ticket`: genau das Ticket, das jetzt bearbeitet werden darf

Der eindeutige Review-Schlüssel ist
`(ticket, handoff_commit, review_round)`. Derselbe Schlüssel wird nie zweimal
bearbeitet. `ticket` muss bei einer Übergabe `priority_ticket` entsprechen und
in `priority_chain` vorkommen.

## Übergabe durch Claude

`ready_for_codex` steht zuletzt. Claude arbeitet in dieser Reihenfolge:

1. Ticket-Inhalt und Produktänderungen fertigstellen und als genau einen
   Handoff-Commit committen.
2. Die relevanten Checks sowie alle beanspruchten Live-Prüfungen ausführen und
   die AI-Spalte ehrlich mit Evidenz aktualisieren.
3. Eine alte, verarbeitete INBOX leeren und die OUTBOX vollständig schreiben:
   Ziel, Scope, Handoff-Commit, geänderte Flächen, Tests, Live-Evidenz, bekannte
   Lücken und ausdrückliche Review-Fragen.
4. Zuletzt `handoff_commit`, `review_round`, `phase: ready_for_codex`,
   `owner: codex` und `updated_at` setzen und diese reine
   Kommunikationsänderung sofort committen.

Nach Schritt 4 verändert Claude weder Produktcode noch `STATUS.md`, bis Codex
geantwortet hat. Ein unfertiger Zwischenstand oder eine Frage ist keine
Review-Übergabe. Fehlt eine echte Produktentscheidung, gilt `blocked` mit
`owner: mike`.

## Claim und Review durch Codex

Codex beginnt nur, wenn alle Vorbedingungen gelten:

- `phase` ist `ready_for_codex` und `owner` ist `codex`.
- Ticket, Priorität und Kette sind konsistent.
- Der Handoff-Commit existiert und entspricht der OUTBOX.
- Das Tupel unterscheidet sich von `last_reviewed_*`.
- Die Übergabe ist committed; nach dem Handoff gibt es keinen fremden
  Produkt-Commit und keine unklare parallele Produktänderung.

Danach setzt Codex `phase: codex_reviewing`, behält `owner: codex` und
committet den Claim als reine Kommunikationsänderung. Geprüft werden:

1. Ticketziel, Scope und Nicht-Ziele gegen den vollständigen Handoff-Diff.
2. Die Repo-Regeln aus `AGENTS.md` und die einschlägigen Skills, insbesondere
   `task-verification-workflow`, `code-standards` und `ux-standards`.
3. Auswirkungen eines Paket-Diffs auf alle Verbraucher; app-spezifische Logik,
   sichtbare fest verdrahtete Texte und unnötige Peer-Annahmen sind Findings.
4. DRY und Sources of Truth mit projektweiter Suche, besonders bei Token,
   Katalogschlüsseln, Platzhaltern, Breakpoints und öffentlichen Typen.
5. Testtiefe: Ein Test muss den behaupteten Unterschied erzeugen. Bei neuen
   Wächtern wird nach Möglichkeit ein kleiner negativer Gegenlauf oder Mutant
   ausgeführt.
6. Verify-Matrix und Evidenz: Kein `✅`, wenn nur Review, Unit-Test oder eine
   ungemessene App-Wirkung vorliegt. Die `Human`-Spalte bleibt unberührt.
7. Mindestens `make test`, `make typecheck` und `make lint`; visuelle oder
   interaktive Kriterien zusätzlich im Schaufenster, sofern die verbundene
   Browserumgebung verfügbar ist. Nicht ausführbare Checks werden konkret als
   Lücke benannt.

Findings stehen zuerst, nach Schwere sortiert, jeweils mit Fundstelle,
Auswirkung und belastbarer Gegenprobe. Gibt es keine Findings, sagt Codex das
ausdrücklich und nennt Restrisiken sowie tatsächlich ausgeführte Checks.

## Abschluss einer Review-Runde

Codex entfernt die verarbeitete OUTBOX, schreibt das Ergebnis in
`INBOX → Claude` und aktualisiert `last_reviewed_*` auf das bearbeitete Tupel.

- Bei einem inhaltlichen Rest: `phase: changes_requested`, `owner: claude`.
- Ohne inhaltlichen Rest: `phase: approved`, `owner: claude`.
- Nur bei einem echten, nicht sicher auflösbaren Hindernis:
  `phase: blocked`, `owner: mike`.

Codex committet diese reine Kommunikationsänderung. Claude verarbeitet die
INBOX, entfernt sie aus dem Hub und bleibt für Korrekturen oder Abschluss am
Zug. Ein neues Review erhält eine neue Runde und einen neuen Handoff-Commit.

## Dauerhafte Review-Muster

Ein einzelner Ticketfehler bleibt im Ticket. Ein Muster kommt erst nach zwei
Belegen oder nach einer ausdrücklich falschen Vollständigkeitsbehauptung in
`CLAUDE-REVIEW-PATTERNS.md`. Jeder Eintrag nennt Erkennungsregel, Prüffrage und
Belege. Die Mustersammlung wird vor jedem inhaltlichen Review vollständig
gelesen.

## Startbefehle für beide Loops

### Codex-Loop

Codex besitzt hier kein `/loop`-Kommando. Sein Gegenstück ist der
In-Context-Scheduler aus einer dauerhaft laufenden `functions.exec`-Zelle.
Dieser Befehl wird im bestehenden Codex-Review-Chat eingegeben:

```text
Starte den In-Context-Scheduler aus
_tickets/CODEX-IN-CONTEXT-SCHEDULER.md.
```

Die Zelle prüft danach alle fünf Minuten `STATUS.md`. Erst bei einer neuen
validen Übergabe liest Codex dieses Dokument und
`CLAUDE-REVIEW-PATTERNS.md` vollständig. Der Chat-Turn bleibt währenddessen
offen; Details stehen in `CODEX-IN-CONTEXT-SCHEDULER.md`.

### Claude-Loop

Der Loop wird im bestehenden Claude-Arbeitschat gestartet, damit Branch und
lokaler Checkout identisch bleiben:

```text
/loop 5m Du bist Claude, der Implementierer im ux-foundation-Board. Beachte CLAUDE.md und die Skills task-verification-workflow, code-standards, git-conventions und ux-standards. Lies _tickets/STATUS.md und _tickets/CODEX-REVIEW-AUTOMATION.md. Der maschinenlesbare Zustand ist massgeblich. Ist owner nicht claude, veraendere keine Datei und melde nur Phase und Owner. Bei changes_requested verifiziere jedes Finding, korrigiere auf dem Ticket-Branch, fuehre die relevanten Checks und Live-Pruefungen aus und uebergib danach mit neuem Commit und neuer Runde. Bei claude_working setze die begonnene Ticketarbeit fort. Bei approved bereite den Abschluss fuer Mike vor, ohne die Human-Spalte zu schreiben oder das Ticket eigenmaechtig nach solved zu verschieben. Bei blocked veraendere nichts und melde den Entscheidungsbedarf. ready_for_codex wird immer zuletzt und sofort committed; danach weder Produktcode noch STATUS.md anfassen. Leerdurchlaeufe bleiben einzeilig.
```
