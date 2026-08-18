# Ticket-Board

Kleine, verifizierbare Arbeitseinheiten für dieses Repo. Ein Ticket ist der
vollständige Container einer Einheit — Beschreibung, Verify-Matrix und
Auflösung in **einer** Datei.

**Die Regeln stehen nicht hier, sondern im Skill `task-verification-workflow`.**
Benannt statt wiederholt, damit nicht zwei Fassungen auseinanderlaufen:

- **Ort = Status** — offene Tickets liegen hier im Root, erledigte kommen per
  `git mv … solved/` dorthin. `in-progress` und `blocked` sind ein Feld im
  Kopf, kein Ordner.
- **Zwei Spalten in der Verify-Matrix** — `AI` füllt nur die KI, `Human` nur
  der Mensch. Die Mensch-Spalte wird **nie** überschrieben.
- **`QUESTIONS.md` drainiert** — jeder Eintrag löst auf zu erledigt, GitHub-
  Issue oder gelöscht. Tickets sammeln sich in `solved/`, Fragen nicht.

Die Ticket-Vorlage liegt im Skill unter `templates/ticket.md`.

## Was hier anders ist als in einer App

**Dieses Repo ist ein Paket, keine App.** Zwei Folgen für Tickets:

1. Das Deliverable liegt fast immer hier, die Wirkung aber woanders — eine
   Änderung an einem Token trifft jede einbindende App. Die `Repo`-Spalte im
   Kopf nennt sie deshalb mit („ux-foundation (Deliverable) + alle Apps"), und
   die Sektion `Side-Effects` ist keine Formalie.
2. Verify-Zeilen, die eine App betreffen, lassen sich hier oft **nicht**
   abschließen. Sie bleiben auf `➖` mit Fußnote und wandern in das Ticket der
   App — nicht auf `✅`, weil die Vorbedingung stimmt.

## Verifizieren

Die Prüfziele dieses Repos, vollständig kopierbar:

```bash
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation"
make test            # Vitest — der Kontrast-Check der Paletten läuft hier mit
make typecheck       # vue-tsc über Fundament und Schaufenster
make lint
make dev             # Schaufenster auf Port 5177 — für alles, was man sehen muss
```

Was am Bild hängt — Kontrast, Abstände, Verhalten einer Komponente — wird im
laufenden Schaufenster gemessen, nicht geschätzt. Der Grund steht im Skill
`ux-standards` unter „Messen statt schätzen"; die Kurzfassung: Ein
Bildschirmfoto zeigt, *dass* etwas eng aussieht, nicht ob es umbricht.

## Layout

```
_tickets/
├── README.md      # diese Datei
├── QUESTIONS.md   # ephemer, tendiert gegen leer
├── T-NN-*.md      # offene Tickets
└── solved/        # erledigte
```
