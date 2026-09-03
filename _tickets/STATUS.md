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
- `ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `handoff_commit`: `2175058`
- `review_round`: `1`
- `owner`: `codex`
- `updated_at`: `2026-09-03`
- `last_reviewed_ticket`: —
- `last_reviewed_commit`: —
- `last_reviewed_round`: `0`
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

*(leer)*

## OUTBOX → Codex

**T-17 · Runde 1 · Handoff-Commit `2175058`**

**Ziel:** Das Schaufenster bekommt Englisch als zweite Sprache samt Umschalter.
Anlass war, dass sich nichts vorführen ließ, was am Sprachwechsel hängt — auch
der gemergte Notifier-Fix aus `fcd088c` nicht.

**Scope:** ausschließlich `showcase/` plus ein neuer Test unter `tests/`.
**`src/` ist unberührt** — kein Paket-Modul angefasst, `files` in der
`package.json` liefert ohnehin nur `src/`. Für einbindende Apps ändert sich
nichts.

**Geänderte Flächen**

| Was | Wo |
|---|---|
| Englischer Katalog, an `MessageSchema` gebunden | `showcase/src/i18n/en.ts` (neu) |
| Zweite Sprache registriert, `LOCALE_IDS`, `Legacy=false` als Typargument | `showcase/src/i18n/index.ts` |
| Sprache als Zustand, `persistLocale` nur bei echter Wahl | `showcase/src/composables/useLocale.ts` (neu) |
| Umschalter `DE \| EN` statt Auswahlliste | `showcase/src/components/ShowcaseTopbar.vue` |
| Naive-Locale zieht mit (`deDE`↔`enGB`), Reiter-Schlüssel geändert | `showcase/src/App.vue` |
| Sichtbare Texte in den Katalog | `ComponentsView`, `TypographyView`, `SwatchGrid`, `TokensView`, `DemoNav`, `ThemesView`, `PatternsView` |
| Katalog-Test (Platzhalter, Klammeraffen, Leerstellen) | `tests/showcaseMessages.spec.ts` (neu) |

**Tests:** `make test` 21 Dateien / 663 Tests grün, `make typecheck` und
`make lint` grün. Die Gegenprobe zum Typ ist tatsächlich gelaufen (Schlüssel
entfernt → `TS2741`, danach byte-gleich zurückgenommen).

**Live-Evidenz:** Zeilen 1–12 und 14–16 der Verify-Matrix sind am laufenden
Schaufenster geprüft, Zahlen und Beobachtungen stehen als Fußnoten im Ticket.

**Bekannte Lücken — bitte nicht als Versäumnis lesen, sie stehen so im Ticket:**

- **#13 ➖** — Fenster ließ sich in meiner Umgebung nicht verkleinern
  (`resize_window` meldet Erfolg, `innerWidth` bleibt 1614). Nach zwei
  Versuchen abgebrochen. Bleibt für Mike.
- **#8 ⚠️** — die Naive-Locale ist verdrahtet, aber das Schaufenster zeigt
  **keine** von Naive selbst gestellte Zeichenkette. Nichts zu sehen, weder
  richtig noch falsch.

**Ausdrückliche Review-Fragen**

1. **Der Reiter-Schlüssel.** Ich habe `:key="${locale}-${activeArea}"` auf
   `:key="activeArea"` reduziert und das Nachrechnen des Schiebebalkens auf
   `syncBarPosition()` in einem `watch` umgestellt. Begründung im Ticket unter
   „Der Befund unterwegs". Übersehe ich einen Fall, in dem der Sprachwechsel
   doch einen Neuaufbau braucht — etwa eine Ansicht, die Breiten beim Einhängen
   misst? Ich habe Bereichswechsel und Balkenlage gemessen (#14, #16), aber
   nicht jede Ansicht einzeln.
2. **Die Endonyme sind weg.** Erste Fassung hatte „Deutsch"/„English", auf
   Mikes Ansage jetzt `DE`/`EN` aus `id.toUpperCase()`. Damit gibt es keine
   Liste von Sprachnamen mehr. Trägt das auch bei einer dritten Sprache, oder
   handle ich mir das bei `pt`/`pt-BR` wieder ein?
3. **`legacy: false` als drittes Typargument.** Ohne es verbreitert TypeScript
   das `legacy: false` zu `boolean` und tippt `i18n.global` als Legacy-Instanz.
   Ist das der übliche Weg, oder gibt es einen saubereren?
4. **Der Katalog-Test.** Er prüft Schlüssel (redundant zum Typ, aber mit
   besserer Fehlermeldung), Platzhalter, `@` und Leerstellen. Fehlt eine
   Klasse Fehler, die zwei Kataloge auseinanderlaufen lässt?

**Zwei Nebenbefunde, nicht angefasst** (stehen ausführlich im Ticket):
`showcase/src/composables/useTheme.ts` greift direkt auf `localStorage` zu statt
über `safeStorage`; `AGENTS.md` ist eine byte-gleiche, ungetrackte Kopie von
`CLAUDE.md`.
