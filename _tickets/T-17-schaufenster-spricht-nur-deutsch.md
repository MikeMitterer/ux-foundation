# T-17 · Das Schaufenster spricht nur Deutsch

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (nur `showcase/`) | in-progress | ~2 h | Schaufenster-only — `src/` bleibt unberührt | — |

**Löst:** Das Schaufenster hat genau einen Katalog und keinen Umschalter. Damit
lässt sich alles, was am Sprachwechsel hängt, hier **nicht** vorführen — und
genau das ist der Zweck dieser App. Sichtbar wurde es an `fcd088c`: Der Fix
„Überschrift folgt der Sprache" ist gemergt, aber im Schaufenster nicht zu sehen.

<!--
  Repo:     ux-foundation (Deliverable). Kein App-Repo betroffen — siehe Side-Effects.
  Status:   ready | in-progress | blocked | done
  Scope:    Schaufenster-only. Das Paket selbst wird nicht angefasst.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ bestätigt mit Einschränkung (Fußnote) ·
◑ teilweise (Fußnote) · ➖ keine Live-Verifikation (nur Unit/Review).
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make test` | alle Tests grün, darunter der neue Platzhalter-Test der Kataloge | ➖ | |
| 2 | `make typecheck` | grün — der Katalog-Typ erzwingt gleiche Schlüssel in `de` und `en` | ➖ | |
| 3 | `make typecheck` nach absichtlich entferntem Schlüssel in `en.ts` | **rot**, mit Nennung des fehlenden Schlüssels (Gegenprobe zu #2) | ➖ | |
| 4 | http://localhost:5177 · Kopfzeile rechts | zweite Auswahlliste neben der Theme-Liste, Beschriftung „Deutsch" / „English" (Endonyme, nicht übersetzt) | ➖ | |
| 5 | http://localhost:5177 · auf „English" stellen | alle sichtbaren Texte wechseln — Menü, Reiter, Fließtext, Statuszeile | ➖ | |
| 6 | http://localhost:5177 · Reiter „Verhalten", Toast öffnen, **dann** Sprache wechseln | **Überschrift und Text des offenen Toasts** wechseln mit — das ist der Fix aus `fcd088c` | ➖ | |
| 7 | http://localhost:5177 · Reiter „Eigene", Spalten Bestand/Ziel | Zahlenformat schaltet mit: `1.234,5` unter de, `1,234.5` unter en | ➖ | |
| 8 | http://localhost:5177 · Reiter „Naive UI", Dialog öffnen | Naives eigene Beschriftungen folgen der Sprache (nicht „Confirm" in deutscher Oberfläche) | ➖ | |
| 9 | Browser-Konsole: `document.documentElement.lang` | `de` bzw. `en` — zieht beim Wechsel mit | ➖ | |
| 10 | Sprache auf „English", **Seite neu laden** | bleibt englisch (Wahl liegt im `localStorage`) | ➖ | |
| 11 | `localStorage.removeItem('ux-foundation.showcase.locale')`, Browsersprache auf Englisch, neu laden | startet englisch — Browsersprache greift, wenn keine Wahl gespeichert ist | ➖ | |
| 12 | Erststart ohne gespeicherte Wahl, danach `localStorage.getItem('ux-foundation.showcase.locale')` | `null` — der bloße Besuch friert die Browsersprache **nicht** als Wahl ein | ➖ | |
| 13 | http://localhost:5177 · Fenster unter 768 px, Sprache wechseln | Kopfzeile bleibt einzeilig, beide Listen passen nebeneinander | ➖ | |
| 14 | http://localhost:5177 · Reiter „Themes", Sprache wechseln | Der Schiebebalken unter dem aktiven Reiter sitzt richtig (der `key` an `locale` greift) | ➖ | |

<!-- Fußnoten der AI-Spalte hier -->

### Kurz-Testblock

```bash
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation"
make test        # #1
make typecheck   # #2
make dev         # #4–#14 — Schaufenster auf http://localhost:5177
```

Für #3 die Gegenprobe von Hand — sie ist der einzige Beweis, dass der Typ
tatsächlich hält, statt nur dazustehen:

```bash
# einen Schlüssel aus en.ts entfernen, prüfen, zurücknehmen
make typecheck   # muss rot werden und den Schlüssel nennen
git checkout showcase/src/i18n/en.ts
```

---

## Details

### Kontext / Ziel

Das Schaufenster ist Werkzeug, nicht Auslieferung: Ein Fehler fällt hier in
Sekunden auf, in einer echten App erst Wochen später. Für alles Sprachabhängige
gilt das bisher **nicht**, weil es nur Deutsch gibt — die Erkennung
(`detectLocale`, `persistLocale`) wird zwar aus dem Paket bezogen, aber nie
ausgeübt, und der frisch gemergte Notifier-Fix ist unsichtbar.

Der Umschalter steht **in der Kopfzeile**, entgegen der Regel aus `ux-standards`
(„Sprachumschalter gehört in die Einstellungen"). Der Grund ist derselbe wie
beim Theme-Umschalter, der dort schon steht: Diese App handelt vom Vorführen —
man wechselt beim Prüfen ständig, nicht zweimal im Leben. Das Schaufenster hat
zudem keine Einstellungsseite. Die Ausnahme steht als Kommentar an der Stelle,
damit sie niemand für Nachlässigkeit hält.

### Akzeptanzkriterien

- [ ] `showcase/src/i18n/en.ts` — englischer Katalog, gleiche Struktur wie `de.ts`
- [ ] Ein Typ erzwingt die Schlüsselgleichheit beider Kataloge; fehlt einer, ist
      `make typecheck` rot (nicht erst der Browser)
- [ ] Ein Test prüft, dass jede englische Nachricht **dieselben Platzhalter**
      trägt wie die deutsche (`{count}`, `{n}`, `{max}`) — das kann der Typ nicht
- [ ] Umschalter in der Kopfzeile, rechts bei den Nicht-Navigations-Elementen
- [ ] Naive UI zieht mit: `deDE`/`enGB` und `dateDeDE`/`dateEnGB`
- [ ] `document.documentElement.lang` zieht mit (über `persistLocale`)
- [ ] Reihenfolge bleibt: gespeicherte Wahl → Browsersprache → `de`
- [ ] Die drei `notify`-Aufrufe in `PatternsView.vue` geben `title` als
      **Funktion** herein — sonst bleibt der Fix aus `fcd088c` unsichtbar

### Warum `enGB` und nicht `enUS`

`ux-standards` nennt es ausdrücklich: Ein Datum als `08/11/2026` ist für alle
außer den USA eine Falle. Naive UI liefert beides; genommen wird `enGB`.

Die **Zahlen** laufen über den Locale-Schlüssel von vue-i18n, also `de` und
`en`. Für Zahlen sind `de`/`de-AT` und `en`/`en-GB` identisch (`1.234,5` gegen
`1,234.5`), der Unterschied liegt nur im Datum — und Datumsangaben zeigt im
Schaufenster ausschließlich Naive UI, das seine eigene Locale bekommt. Deshalb
bleiben die Katalog-Schlüssel zweibuchstabig; sie müssen es sogar, weil
`browserLocale()` die Browsersprache auf ihren ersten Teil abbildet und ein
Schlüssel `de-AT` damit nie träfe.

### Warum die Sprachnamen nicht im Katalog stehen

„Deutsch" und „English" sind **Endonyme** — jede Sprache in ihrem eigenen Namen,
und damit unabhängig von der gerade aktiven. Übersetzt man sie, steht in der
englischen Oberfläche „German" für einen Eintrag, den ein deutscher Leser
auswählen will; genau er versteht ihn dann nicht mehr. Sie liegen deshalb als
Konstante neben der Sprachliste, nicht als Katalog-Eintrag. Der `aria-label` des
Umschalters ist normaler sichtbarer Text und **steht** im Katalog.

### Side-Effects

**Keine für einbindende Apps.** `files` in der `package.json` liefert nur
`src/`; das Schaufenster wird nicht ausgeliefert, und kein Paket-Modul wird
angefasst. Der Katalog verdoppelt sich von einer auf zwei Dateien — die zweite
Quelle ist durch den Typ (Schlüssel) und einen Test (Platzhalter) abgesichert,
wie es die Repo-Regel verlangt.

### Auflösung

Wird zuletzt gefüllt.
