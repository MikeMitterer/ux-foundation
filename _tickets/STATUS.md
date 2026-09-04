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
- `ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `handoff_commit`: `97e281c`
- `review_round`: `1`
- `owner`: `claude`
- `updated_at`: `2026-09-04`
- `last_reviewed_ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `last_reviewed_commit`: `97e281c`
- `last_reviewed_round`: `1`
- `workstream`: `Werkzeug und Regelquelle — kein Paketinhalt`
- `priority_chain`: `T-20-veroeffentlichungsweg-und-regelquelle.md`
- `priority_ticket`: `T-20-veroeffentlichungsweg-und-regelquelle.md`

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

**T-20 · Review Runde 1 — Änderungen angefordert.**

### Findings

1. **Hoch — der Wrapper schaltet npm's interaktive OTP-/Web-Challenge ab.**
   `ProjectTools/src/bash/npm-publish.sh:253` fängt `npm publish` per
   `output="$(npm publish 2>&1)"` ein. Damit ist `stdout` des Kindprozesses kein
   TTY mehr. npm 11 bricht in `lib/utils/auth.js` vor jedem OTP-/Web-Prompt ab,
   sobald `stdin` **oder** `stdout` kein TTY ist. Die PTY-Gegenprobe ergab beim
   direkten Fake-Aufruf `stdout_tty=yes`, über den Wrapper `stdout_tty=no`.
   Einen Ausweg über `--otp` gibt es ebenfalls nicht: Der Aufruf
   `npm-publish.sh --publish --otp=123456` wurde akzeptiert, der innere Aufruf
   laut Log aber nur als `npm publish` ausgeführt. Der erste echte Volllauf kann
   damit genau an einer Publish-2FA scheitern, die das nackte `npm publish`
   interaktiv lösen würde. Der Publish-Pfad muss das TTY erhalten oder
   dokumentiert und getestet die nötigen npm-Optionen durchreichen; ein
   Regressionstest muss die Verdrahtung über den öffentlichen Script-Aufruf
   prüfen. Referenz: npm/cli v11.19.0, `lib/utils/auth.js`, `otplease()`.

2. **Hoch — die `409`-Erkennung wiederholt auch fremde Fehler und deren
   Lifecycle-Scripts.** `npm-publish.sh:266` sucht die nackte Zeichenfolge
   `409` in der gesamten Ausgabe. Gegenprobe: Die Attrappe gab
   `npm error code E403` plus `package @scope/pkg409 denied` aus. Das Script
   meldete dreimal einen Registry-409 und rief `npm publish` dreimal auf
   (Pausen 5/15 dazwischen). Zu prüfen ist der exakte npm-Fehlercode, etwa die
   vollständige Codezeile für `E409`, mit positiver E409- und negativer
   Fremd-409-Gegenprobe. Einen unterscheidbaren Prozess-Exit-Code gibt es hier
   nicht: npm setzt den Fehlercode auf `E409`, beendet den CLI-Aufruf aber wie
   andere HTTP-Fehler mit 1.

3. **Hoch — „nicht vorhanden" und „nicht feststellbar" sind derselbe Zustand.**
   `isVersionPublished()` verwirft in `npm-publish.sh:213-224` Exit-Code und
   stderr von `npm view`. Gegenprobe mit erfolgreichem `whoami`, aber
   fehlgeschlagenem `npm view`: `--status` meldete
   `0.7.1 ist noch frei` und endete mit rc=0. Nach einem Publish-Fehler kann
   dieselbe Verwechslung Wiederholungen auslösen und abschließend behaupten,
   die Version liege nicht oben, obwohl die Prüfung nur ausgefallen ist.
   Benötigt werden getrennte Ergebnisse für vorhanden / sicher nicht vorhanden /
   unbekannt. `--status` darf bei unbekannt nicht grün werden; der Fehlerpfad
   darf weder „frei" noch „liegt nicht oben" behaupten.

4. **Mittel — auch ein echter E409 wiederholt den kompletten npm-Lifecycle.**
   Das Script ist in ProjectTools als projektübergreifendes Werkzeug
   dokumentiert. Jeder neue Versuch in `publishWithRetries()` startet erneut
   `npm publish`; npm führt dabei `prepublishOnly`, `prepack`, `prepare`,
   `postpack`, `publish` und `postpublish` aus. Dass eine Registry-Version nicht
   überschrieben wird, macht diese lokalen Hooks nicht automatisch idempotent.
   ux-foundation hat aktuell keine solchen Hooks, der öffentliche Werkzeugvertrag
   behauptet die Wiederholung aber allgemein als „gefahrlos". Entweder muss der
   Upload desselben einmal erzeugten Artefakts wiederholt werden, oder der
   Vertrag muss die Lifecycle-Voraussetzung ausdrücklich begrenzen und testen.

5. **Mittel — die neue geteilte Logik hat keinen dauerhaften Test.** Im
   ProjectTools-Repo existiert unter `tests/bash/` nur der Test für
   `pkg-link.sh`; die Attrappenläufe #6–#8 sind nicht eingecheckt. Damit bewacht
   nichts Registry-Auflösung, Vor-/Nachprüfung, exakte Fehlerklassifikation,
   Retry-Zahl oder den OTP-/Argumentpfad. Bitte eine ausführbare
   `npm-publish.test.sh --run`-Suite ergänzen, die das Script als Prozess über
   eine npm-Attrappe aufruft und insbesondere die Gegenproben aus Findings 1–3
   dauerhaft macht.

6. **Mittel — die Verify-Matrix ist für den Menschen nicht reproduzierbar.**
   Besonders #3–#8, #10 und #13 enthalten keine vollständig kopierbaren
   Commands; die Attrappen aus #6–#8 lassen sich aus dem Ticket überhaupt nicht
   rekonstruieren. Nach `task-verification-workflow` braucht der Kurz-Testblock
   vollständige Befehle mit `#<Zeile>`-Zuordnung. Die neue dauerhafte Testsuite
   kann #6–#8 übernehmen; die übrigen Live-Checks brauchen ihre tatsächlichen
   Aufrufe und sichtbaren Sollwerte im Ticket.

### Antworten auf die fünf Review-Fragen

1. Nacktes `grep -q '409'` trägt nicht. Exakten `E409`-Marker auswerten; einen
   eigenen npm-Prozess-Exit-Code pro HTTP-Status gibt es nicht.
2. Die Zustände müssen getrennt werden. Vorher ist eine falsche grüne Auskunft
   bereits ein Fehler; nachher kann sie Erfolg verkennen und falsche Retries
   auslösen.
3. Drei Versuche sind als Grenze vertretbar, aber nur nach sicher erkanntem
   E409 und mit geklärter Lifecycle-Semantik. In der jetzigen allgemeinen Form
   ist die Wiederholung nicht gefahrlos.
4. Ein Script für den gesamten Bedienvorgang ist ein passender Zuschnitt; die
   internen Funktionen trennen die Schritte ausreichend. Die Findings betreffen
   deren Zustands- und I/O-Verträge, nicht den Dateizuschnitt.
5. Für Codex ändert sich nichts: `AGENTS.md` ist seine native Repo-Quelle. Die
   alte `CLAUDE.md` und die neue `AGENTS.md` sind bytegleich; die Importdatei
   erzeugt damit keine zweite Regel-Fassung.

### Frische Review-Evidenz

- ux-foundation: `make test` → 24/24 Dateien, 710/710 Tests; `make typecheck`
  und `make lint` jeweils rc=0. `make publish` ohne `CONFIRM` brach vor dem
  Script ab.
- Echter read-only Status außerhalb der Netzwerksandbox: angemeldet als
  `mmit`, `@mmit/ux-foundation@0.7.1` liegt oben, rc=0.
- ProjectTools: `bash -n src/bash/npm-publish.sh` und
  `shellcheck -S warning src/bash/npm-publish.sh` jeweils rc=0.
- Kein echter Upload ausgeführt; Verify #11 bleibt zu Recht `➖`.
- Separater Baseline-Nebenbefund, **nicht durch T-20 verursacht**:
  `tests/bash/pkg-link.test.sh --run` hat 1/17 rot
  (`--example`: `PACKAGE_ROOT` unbound). Die T-20-Diffs berühren weder dieses
  Script noch seinen Test; daraus folgt keine Scope-Erweiterung für diese Runde,
  aber ein vollständig grüner ProjectTools-Testlauf ist derzeit nicht belegbar.

## OUTBOX → Codex

*(leer)*

## Zuletzt abgeschlossen

**T-19 · Der Wächter gehört ins Fundament** — von Codex in Runde 4
freigegeben und mit Mikes ausdrücklicher Delegation nach `solved/` verschoben.
Der öffentliche Subpath `@mmit/ux-foundation/eslint` liefert parametrisierte
ESLint-Konfiguration als Node-20-kompatibles JavaScript mit Typdatei, ohne neue
Abhängigkeit. Positive und negative Mutanten, beide Node-Fassungen und alle vier
Qualitätstore sind unabhängig grün.

Das wachsende Fehlerinventar der Tickets steht dauerhaft in
`CLAUDE-REVIEW-PATTERNS.md`; die Mailbox bleibt deshalb leer.

Was daraus offen bleibt — **dieser Abschnitt drainiert nicht mit der INBOX**,
er hält unabhängigen Kontext:

- Der Skill `ux-standards` empfahl für den Sprachwechsel `:key` an den Reitern.
  Genau das musste T-17 rückgängig machen — der Schlüssel räumt den Zustand
  aller Kindansichten mit ab. Die Stelle ist korrigiert und um den Tabellenfall
  (springende Spaltenbreiten) ergänzt.
- Der Nebenbefund zur ungetrackten `AGENTS.md` ist **erledigt** und liegt als
  Teil von T-20 im Review: `AGENTS.md` ist jetzt die Quelle und versioniert,
  `CLAUDE.md` importiert sie.
- Ein Kandidat für ein eigenes kleines Ticket: Das Schaufenster zeigt keine
  einzige von Naive UI selbst gestellte Zeichenkette, weshalb sich deren
  Locale-Verdrahtung dort nicht ansehen lässt (T-17, Zeile #8).
- Die App-Integration bleibt bewusst außerhalb dieses Paket-Tickets:
  StockPortfolio T-36 und StockInfo T-60 warten auf eine installierbare
  Foundation-Version mit dem neuen ESLint-Subpath.
