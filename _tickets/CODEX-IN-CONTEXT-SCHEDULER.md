# Codex-In-Context-Scheduler

Dies ist ausschließlich der Laufzeitvertrag für den internen Scheduler des
bestehenden Codex-Review-Chats. Das fachliche Verfahren steht in
`CODEX-REVIEW-AUTOMATION.md`.

## Starteintrag

| Feld | Wert |
|---|---|
| Name | `ux-foundation · Claude→Codex Review` |
| Projekt | `/Volumes/DevLocal/DevWeb/Production/ux-foundation` |
| Takt | exakt alle fünf Minuten |
| Zustandsdatei | `_tickets/STATUS.md` |
| Review-Vertrag | `_tickets/CODEX-REVIEW-AUTOMATION.md` |
| Mustersammlung | `_tickets/CLAUDE-REVIEW-PATTERNS.md` |

Startauftrag im bestehenden Codex-Review-Chat:

```text
Starte den In-Context-Scheduler aus
_tickets/CODEX-IN-CONTEXT-SCHEDULER.md.
```

## Laufzeitvertrag

- Mechanismus: eine dauerhaft laufende `functions.exec`-Zelle in diesem Chat;
  kein `/goal`, kein ChatGPT-Scheduled-Task und keine Desktop-Automation.
- Projekt: der aktuelle lokale Checkout unter dem Pfad aus dem Starteintrag;
  kein anderer Worktree.
- Startprüfung: Die Zelle sendet sofort `scheduler_started` mit Projektpfad und
  Zeitstempel per `notify(...)` und gibt mit `yield_control()` Kontrolle an den
  Chat zurück. Fehlt das Signal, wird sie beendet und einmal neu gestartet.
- Takt: Der erste reguläre Tick liegt fünf Minuten nach dem Start. Jeder weitere
  Termin wird aus dem zuvor geplanten Termin berechnet; verzögerte Ticks
  erzeugen weder Drift noch eine Serie sofortiger Nachhol-Ticks.
- Pro Tick wird ausschließlich der Block **Maschinenlesbarer Zustand** aus
  `STATUS.md` gelesen.
- Jeder Tick sendet `scheduler_heartbeat` mit Zeitstempel, Phase, Owner,
  Ticket, Handoff-Commit und Review-Runde per `notify(...)` und ruft danach
  `yield_control()` auf. Heartbeats ändern keine Datei und erzeugen keine
  Nachricht an Mike.
- Ist die Phase nicht `ready_for_codex`, endet die fachliche Verarbeitung nach
  dem Heartbeat still.
- Bei `ready_for_codex` müssen `owner: codex`, ein gesetzter Handoff-Commit,
  `ticket == priority_ticket` und die Mitgliedschaft des Tickets in
  `priority_chain` gelten.
- Erst wenn sich `(ticket, handoff_commit, review_round)` zusätzlich von
  `last_reviewed_*` unterscheidet, sendet die Zelle einen eindeutigen
  `review_handoff` und weckt denselben Chat für das Verfahren aus
  `CODEX-REVIEW-AUTOMATION.md`.
- Ein ungültiger Ready-Zustand erzeugt einmalig `handoff_invalid` mit dem
  konkreten Grund. Derselbe unveränderte Fehler wird nicht bei jedem Tick
  erneut gemeldet.
- Lesefehler oder ein ungültiges Zustandsformat werden ebenfalls einmalig und
  konkret gemeldet. Nach einer Erholung darf ein neuer Fehler wieder gemeldet
  werden.

## Gesundheit und Wiederanlauf

- Der steuernde Codex-Turn bleibt offen. Nach `yield_control()` wartet er mit
  `functions.wait` auf derselben Cell-ID weiter und sendet während der
  Überwachung keine Final-Antwort.
- `scheduler_started` belegt nur den Start. Erst ein regulärer Heartbeat und
  das anschließende fortgesetzte Warten belegen eine funktionierende
  Überwachung.
- Gesund bedeutet: Seit höchstens einem Takt plus kleiner Laufzeittoleranz kam
  ein Heartbeat. `Script running` ohne Heartbeat ist ein Defekt.
- Liefert die Zelle Completion, Fehler oder Abbruch, wird sie sofort einmal neu
  gestartet. Der alte Cell-Identifier wird danach nicht weiterverwendet.
- Bleibt ein erwarteter Heartbeat aus, wird die alte Zelle beendet und einmal
  neu gestartet. Mike wird nur informiert, wenn auch der Wiederanlauf kein
  `scheduler_started` liefert.
- Vor einer Ersatz-Zelle wird eine bekannte alte Zelle beendet. Zwei Scheduler
  dürfen nie dasselbe Tupel verarbeiten.
- Heartbeat und Wiederanlauf lösen kein Review aus. Maßgeblich bleibt allein ein
  neues, valides `ready_for_codex`-Tupel.

## Exit oder Compaction

Der Vertrag bleibt in dieser Datei erhalten; der Timer selbst lebt nur so
lange wie sein steuernder Chat-Turn. Nach Exit oder Compaction wird eine neue
Zelle mit Startprüfung und persistenter Deduplizierung aus `last_reviewed_*`
gestartet. Dazu wird erneut der Startauftrag oben verwendet.
