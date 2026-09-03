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
- `owner`: `mike`
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

*(leer — Runde 6 verarbeitet, Freigabe erteilt)*

## OUTBOX → Codex

*(leer — T-17 ist durch)*

## An Mike · T-17 wartet auf deine Verifikation

**Freigegeben nach sechs Review-Runden**, letzter Stand `4dd5732`. Die Arbeit
liegt auf `t-17-schaufenster-spricht-nur-deutsch`, **nicht** auf `master` und
nicht gepusht.

`make test` 23 Dateien / 676 Tests, dazu `typecheck`, `lint` und
`npm run build` — Exit-Codes einzeln geprüft: `0/0/0/0`.

### Was du siehst, wenn du `make dev` startest

Oben rechts steht `DE | EN`. Der Rest der Verify-Matrix im Ticket ist von mir
live geprüft und mit Zahlen belegt; **drei Zeilen konnte ich nicht schließen**,
und nur die brauchen dich:

| # | Was | Warum ich es nicht konnte |
|---|---|---|
| **13** | Fenster auf 375 px ziehen, Sprache wechseln: Kopfzeile bleibt einzeilig, kein waagrechter Überhang | Das Fenster ließ sich von hier nicht verkleinern — `resize_window` meldet Erfolg, `innerWidth` bleibt 1614 |
| **19** | Browsersprache auf eine ohne Katalog stellen (z.B. Französisch), `localStorage` leeren, neu laden: startet **englisch** | Browsersprache von hier nicht umstellbar; als Unit-Test abgedeckt |
| **8** | Naives **eigene** Beschriftungen folgen der Sprache | Das Schaufenster zeigt derzeit keine einzige davon — nichts zu sehen, weder richtig noch falsch |

Zeile #8 ist kein Fehler dieses Tickets, sondern eine Lücke des Schaufensters:
Alle sichtbaren Texte kommen aus unserem Katalog, Datumsauswahl und
Blätterleiste gibt es nicht. Wenn dir das einen Nachtrag wert ist, wäre ein
kleines eigenes Ticket der Ort dafür.

### Der interessanteste Fund, falls du nur eines ansiehst

Reiter **Verhalten**: Anzeigedauer auf 0, „Kurse fehlen" einschalten, dann bei
**offenem** Toast die Sprache wechseln. Überschrift und Text ziehen mit, und es
bleibt derselbe Toast. Das ist der Fix aus `fcd088c`, den man vorher nicht
sehen konnte — und er war zwischenzeitlich unsichtbar, weil der Reiter-Schlüssel
die ganze Ansicht neu aufbaute und den Zustand mitriss. Steht im Ticket unter
„Der Befund unterwegs".

### Zwei Nebenbefunde, bewusst nicht angefasst

1. `showcase/src/composables/useTheme.ts` greift **direkt** auf `localStorage`
   zu statt über `safeStorage` — ausgerechnet im Schaufenster, das das Paket
   vorführen soll.
2. `AGENTS.md` ist eine byte-gleiche, **ungetrackte** Kopie von `CLAUDE.md`.
   Zwei Dateien, derselbe Regeltext; ein Symlink löste es. Deine Entscheidung.

### Was noch offen ist, wenn du zufrieden bist

`git mv` des Tickets nach `solved/`, die `Human`-Spalte und der Merge auf
`master` gehören dir. Ich habe nichts davon angefasst.
