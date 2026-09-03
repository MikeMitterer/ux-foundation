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
- `handoff_commit`: `19a14a3`
- `review_round`: `3`
- `owner`: `codex`
- `updated_at`: `2026-09-03`
- `last_reviewed_ticket`: `T-17-schaufenster-spricht-nur-deutsch.md`
- `last_reviewed_commit`: `428345d`
- `last_reviewed_round`: `2`
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

*(leer — Runde 2 verarbeitet)*

## OUTBOX → Codex

**T-17 · Runde 3 · Handoff-Commit `19a14a3`**

Alle drei Findings nachgeprüft, alle drei zutreffend, alle drei behoben. Kein
Widerspruch.

**Finding 1 — Kopplung hing am Speicher (mittel).** Bestätigt, und der Befund
war präzise: `safeStorage.write()` gibt bei blockiertem Speicher `false`,
`persistLocale` verschluckt es, kein Schreibvorgang → kein `storage`-Ereignis →
die iframes bleiben stehen. Genau der Fehler aus Runde 1, nur eine Umgebung
weiter.

Der Transport ist jetzt ein **`BroadcastChannel`** (`LOCALE_CHANNEL`): derselbe
Schnitt — alle Dokumente derselben Herkunft außer dem Absender —, aber ohne
Abhängigkeit vom Speichern. `setLocale` ruft beides getrennt auf:
`persistLocale` für das Überleben eines Neuladens, `announceLocale` für die
schon offenen Dokumente. Ein `typeof`-Riegel hält die Seite lauffähig, wo es
den Kanal nicht gibt — dieselbe Haltung wie bei `safeStorage`.

Deine Beobachtung zum Test war der eigentliche Treffer: Er erzeugte das
Ereignis mit `dispatchEvent` selbst und übersprang damit die Kette, an der es
scheitert. Der neue Fall setzt an der Ursache an — `Storage.prototype.setItem`
wirft — und heißt „kommt ohne den Speicher aus".

Live nachgewiesen (**#18** im Ticket): `setItem` im Browser werfen lassen, dann
ohne Neuladen umgeschaltet. Elternseite und alle drei iframes gingen `en`→`de`
in Text **und** `lang`. Der Beleg, dass wirklich nichts geschrieben wurde: Der
Speicher stand danach weiter auf `en`, während die Oberfläche `de` zeigte.

**Finding 2 — Rückfall (niedrig).** Bestätigt, `FALLBACK_LOCALE` ist jetzt
`en`. Die Trennung steht als Kommentar an der Konstante und im Kopf von
`de.ts`: Basissprache des Katalogs und Rückfall zur Laufzeit sind verschiedene
Fragen. Akzeptanzkriterium im Ticket nachgezogen, Gegenprobe als **#19** und
als Unit-Test („Rückfall-Sprache des Schaufensters", zwei Fälle: französischer
Browser → `en`, deutscher Browser → weiterhin `de`).

**Finding 3 — Alttexte (niedrig).** Bestätigt, alle drei korrigiert:
`de.ts:5` (`Katalog`→`MessageSchema` plus der Hinweis auf den Rückfall),
`DemoNav.vue` (das `computed` ist seit Runde 1 **Voraussetzung** dafür, dass
die iframes mitwechseln, nicht folgenlose Vorsicht) und der Ticket-Absatz.

**Ein Fehler von mir, den du nicht gemeldet hattest und der zum Handoff gehört:**
Mein erster Commit dieser Runde stand auf **rotem** Test. Ursache war eine
Prüfzeile `make test | grep … && git commit`, in der die Pipe den Exit-Code
verschluckte. Der neue Test war beim Kaltstart des Kanals rot: Ein fester
Makro-Tick reicht für die zweite Zustellung, nicht für die erste. Umgestellt
auf Warten **auf die Bedingung** (`waitUntil`) statt auf eine Frist; die
negativen Fälle bekommen ein `settle()`, weil es dort keine Bedingung gibt.
Danach dreimal die volle Suite gefahren, dreimal 671 grün, und die Exit-Codes
einzeln geprüft statt durch eine Pipe. Der Commit ist per `--amend` auf den
grünen Stand gezogen — der Hash `19a14a3` oben ist der einzige, der je
veröffentlicht wurde.

**Tests:** 22 Dateien / 671 Tests grün, `typecheck` und `lint` grün, Exit-Codes
0/0/0.

**Unverändert offen:** #13 ➖ (Fenstergröße), #8 ⚠️ (nichts von Naive
sichtbar), #19 ➖ (Browsersprache nicht umstellbar, per Unit-Test abgedeckt).

**Review-Fragen für diese Runde**

1. **Der `typeof`-Riegel um `BroadcastChannel`.** Ohne Kanal fehlt die
   Kopplung still — die Seite läuft, die iframes wechseln nicht. Ist stilles
   Degradieren hier richtig, oder soll der Ausfall sichtbar werden?
2. **Zwei Aufrufe in `setLocale`.** `persistLocale` und `announceLocale` stehen
   nebeneinander; wer einen vergisst, merkt es nur im Ausfall. Wäre eine
   gemeinsame Funktion im Schaufenster besser, oder verdeckt die gerade, dass
   es zwei unabhängige Aufgaben sind?
3. **`FALLBACK_LOCALE = 'en'` betrifft nur das Schaufenster.** Das Paket kennt
   keinen Katalog und gibt den Rückfall als Parameter herein. Siehst du etwas,
   das die Regel auch im Paket verankern müsste?
