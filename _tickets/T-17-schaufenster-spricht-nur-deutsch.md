# T-17 · Das Schaufenster spricht nur Deutsch

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (nur `showcase/`) | ready | ~2 h | Schaufenster-only — `src/` bleibt unberührt | — |

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
| 1 | `make test` | alle Tests grün, darunter der neue Katalog-Test | ✅¹ | |
| 2 | `make typecheck` | grün — `MessageSchema` erzwingt gleiche Schlüssel in `de` und `en` | ✅¹ | |
| 3 | `make typecheck` nach absichtlich entferntem Schlüssel in `en.ts` | **rot**, mit Nennung des fehlenden Schlüssels (Gegenprobe zu #2) | ✅² | |
| 4 | http://localhost:5177 · Kopfzeile rechts | `DE \| EN` mit Pipe, links neben der Theme-Liste; die aktive Kennung hell, die andere gedämpft | ✅³ | |
| 5 | auf `EN` stellen | alle sichtbaren Texte wechseln — Menü, Reiter, Fließtext, Statuszeile | ✅³ | |
| 6 | Reiter „Verhalten": Anzeigedauer 0, Zustand einschalten, **dann** Sprache wechseln | **Überschrift und Text des offenen Toasts** wechseln mit, und es bleibt **derselbe** Toast | ✅⁴ | |
| 7 | Reiter „Schrift", Tabellenziffern | Zahlenformat schaltet mit: `1.234,50` unter de, `1,234.50` unter en | ✅⁵ | |
| 8 | Reiter „Naive UI" | Naives **eigene** Beschriftungen folgen der Sprache | ⚠️⁶ | |
| 9 | Konsole: `document.documentElement.lang` | `de` bzw. `en` — zieht beim Wechsel mit | ✅⁷ | |
| 10 | Sprache auf `EN`, **Seite neu laden** | bleibt englisch (Wahl liegt im `localStorage`) | ✅⁸ | |
| 11 | `localStorage.removeItem('ux-foundation.showcase.locale')`, neu laden | Browsersprache greift, wenn keine Wahl gespeichert ist | ✅⁹ | |
| 12 | Erststart ohne gespeicherte Wahl, danach `localStorage.getItem(…)` | `null` — der bloße Besuch friert die Browsersprache **nicht** als Wahl ein | ✅⁹ | |
| 13 | Fenster auf 375 px, Sprache wechseln | Kopfzeile bleibt einzeilig, kein waagrechter Überhang | ➖¹⁰ | |
| 14 | Reiter wechseln, dann Sprache wechseln | Der Schiebebalken sitzt unter dem aktiven Reiter, auch nach dem Wechsel | ✅¹¹ | |
| 15 | Reiter „Naive UI" und „Schrift", Sprache wechseln | Spaltenköpfe, Knöpfe, Etiketten, Hinweis und die Rollen-Tabelle wechseln mit — nichts bleibt deutsch stehen | ✅¹² | |
| 16 | Bereiche Grundlagen / Komponenten / Verhalten durchklicken | je Bereich der richtige Reitersatz, **ein** sichtbarer Abschnitt (Regression zu #14) | ✅¹³ | |

> ¹ **(CC):** `make test` 21 Dateien / 663 Tests grün, `make typecheck` und
> `make lint` ohne Ausgabe (2026-09-03). Der neue `tests/showcaseMessages.spec.ts`
> steuert 518 Prüfungen bei — Schlüsselgleichheit, Platzhalter, Klammeraffen,
> leere Einträge.
>
> ² **(CC):** Gegenprobe tatsächlich ausgeführt, nicht behauptet:
> `caretToggle` aus `en.ts` entfernt → `TS2741: Property 'caretToggle' is
> missing`. Danach zurückgenommen und per `diff` gegen die Sicherung geprüft,
> dass die Datei byte-gleich ist.
>
> ³ **(CC):** live gegen http://localhost:5177 (2026-09-03, Theme `mangolila`).
> Beim Wechsel wandern Menü (`Grundlagen`→`Basics`), Reiter, Fließtext und
> Statuszeile (`Beispiel-Depot, 6 Positionen`→`Example portfolio, 6 positions`).
>
> ⁴ **(CC):** live, mit Zusicherung an jedem Schritt — Anzeigedauer `0`,
> Schalter `aria-checked=true`, Toast „Kurse fehlen / 3 Kurse konnten nicht
> geladen werden." → nach Klick auf `EN`: „Quotes missing / 3 quotes could not
> be loaded.", `anzahl: 1` (also nachgezogen, nicht neu aufgesprungen), Schalter
> weiterhin `true`. **Der erste Anlauf schlug fehl** — siehe „Der Befund
> unterwegs" unten; ohne die Änderung am Reiter-Schlüssel ist die Zeile rot.
>
> ⁵ **(CC):** live gemessen: `["1.234,50","88,25","100.000,00","7,50"]` unter
> `de` gegen `["1,234.50","88.25","100,000.00","7.50"]` unter `en`.
>
> ⁶ **(CC):** **Nicht beobachtbar, deshalb kein ✅.** Die Verdrahtung ist da und
> gelesen (`naiveLocale`/`naiveDateLocale` schalten `deDE`↔`enGB`), aber das
> Schaufenster zeigt derzeit **keine einzige** Zeichenkette, die Naive UI selbst
> stellt: Knöpfe, Platzhalter und Dialogtexte kommen alle aus unserem Katalog,
> Datumsauswahl und Blätterleiste gibt es nicht. Es gibt also nichts zu sehen —
> weder richtig noch falsch. Das ist eine Lücke des Schaufensters, kein Fehler
> dieses Tickets; ein eigenes Ticket könnte einen Leerzustand oder eine
> Datumsauswahl ergänzen, an dem es sichtbar wird.
>
> ⁷ **(CC):** live gelesen — `de` bzw. `en`, gesetzt über `persistLocale`.
>
> ⁸ **(CC):** live — vor dem Neuladen `{sprache: en, gespeichert: en}`, danach
> unverändert, aktiver Knopf `EN` (`aria-pressed=true`).
>
> ⁹ **(CC):** live — Speicher geleert, `navigator.languages` ist
> `["de-DE","de","en-US","en","af"]`, Neustart ergibt `de` (erster Teil zählt,
> `de-DE`→`de`) und `localStorage` bleibt `null`. Der Rest der Reihenfolge ist
> in `tests/localeDetection.spec.ts` abgedeckt.
>
> ¹⁰ **(CC):** **Keine Live-Verifikation.** Das Fenster ließ sich in dieser
> Umgebung nicht verkleinern — `resize_window` meldet Erfolg, `window.innerWidth`
> bleibt bei 1614 und `outerWidth` meldet 0. Nach zwei Versuchen abgebrochen
> statt weiter zu probieren. Was ich sagen kann, ist nur eine Rechnung, kein
> Messwert: Die beiden Knöpfe belegen zusammen rund 78 px, die abgelöste
> Auswahlliste war auf 6.5 rem (104 px) festgelegt — die Zeile ist also
> **schmaler** geworden, kann an dieser Stelle daher nicht schlechter umbrechen
> als vorher. Bitte am echten Fenster nachsehen.
>
> ¹¹ **(CC):** live **gemessen**, nicht geschätzt: Balken gegen aktiven Reiter,
> Versatz 0 px in beiden Sprachen; beim Wechsel wandert er von links 212 / breit
> 66 („Behaviour") auf links 203 / breit 63 („Verhalten").
>
> ¹² **(CC):** live — Spaltenköpfe `["Symbol","Name","Wert","Veränderung"]` →
> `["Symbol","Name","Value","Change"]`, Knöpfe bis `Tertiär`→`Tertiary`,
> Etiketten `OK/Knapp/Außerhalb` → `OK/Near/Out of range`, Hinweis samt Titel,
> und die sechs Zeilen der Rollen-Tabelle in beide Richtungen.
>
> ¹³ **(CC):** live — Grundlagen 5 Reiter, Komponenten 2, Verhalten 2; nach
> Abklingen der Animation genau **ein** sichtbarer Abschnitt und
> `scrollWidth − clientWidth = 0`. Während der Animation stehen kurz zwei
> Abschnitte im Dokument, das ist Naives Übergang und war vorher genauso.

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

### Der Befund unterwegs: der Reiter-Schlüssel fraß den Zustand

Der interessanteste Teil dieses Tickets stand nicht in seinem Auftrag.

Zeile #6 — der offene Toast folgt der Sprache — war beim ersten Anlauf **rot**,
obwohl der Fix aus `fcd088c` gemergt ist und seine Unit-Tests grün sind. Die
Meldung blieb englisch, während die Seite deutsch wurde.

Die Ursache lag nicht im Notifier. `App.vue` trug an den Reitern

```
:key="`${locale}-${activeArea}`"
```

Die Sprache im Schlüssel baut bei jedem Wechsel die **ganze Reiterfläche** neu
auf. Damit stirbt der Zustand *in* den Ansichten mit: Der Schalter „Kurse
fehlen" sprang zurück auf aus, das Composable wurde abgeräumt, und der Toast,
den man noch sah, war ein verwaister ohne Anker. Gemessen: nach dem Wechsel
stand `aria-checked` des Schalters auf `false`.

Der Schlüssel war seinerseits ein Fix — Naive rechnet den Schiebebalken nur beim
Einhängen, und nach einem Sprachwechsel stand er neben der Beschriftung. Zwei
richtige Absichten, die einander aufheben: Der eine Fix macht den anderen
unsichtbar.

Aufgelöst über das gezieltere Werkzeug: `syncBarPosition()` an einer Referenz
auf die Reiter, ausgelöst von einem `watch` auf die Sprache, nach `nextTick`.
Derselbe Effekt ohne Abriss. Der Bereich bleibt im Schlüssel — dort ist der
Neuaufbau gewollt, weil der ganze *Satz* an Reitern tauscht.

**Die Lehre fürs nächste Mal:** Ein `key`, der auf einen globalen Zustand hört,
ist kein lokaler Eingriff. Er wirkt auf alles darunter, und was er zerstört,
sieht man an der Stelle nicht, an der man ihn schreibt.

### Was unterwegs dazukam

Drei Erweiterungen auf Mikes Ansage während der Arbeit, alle im Schaufenster:

1. **Der Umschalter ist kein Dropdown.** Zuerst als `NSelect` mit Endonymen
   („Deutsch"/„English") gebaut, auf Ansage ersetzt durch `DE \| EN` mit Pipe.
   Sachlich der bessere Bau: Bei zwei Sprachen kostet eine Liste zwei Klicks für
   etwas, das mit einem geht, und sie verbirgt die Alternative. Die Beschriftung
   ist jetzt die Kennung in Großbuchstaben und braucht deshalb **keine** Liste
   von Sprachnamen mehr — eine zweite Quelle weniger.
2. **Alle sichtbaren Texte in den Katalog.** Ein Sweep über `showcase/src`
   förderte zwei Nester zutage: die Spaltenköpfe und Etiketten in
   `ComponentsView.vue` und die Rollen-Tabelle in `TypographyView.vue`, die
   halb übersetzt war — Kopfzeile aus dem Katalog, Inhalt fest verdrahtet
   deutsch. Dazu das `'Ag'` in `SwatchGrid.vue`, das jetzt als Prop hereinkommt,
   weil die Komponente den Katalog nicht kennen soll.
3. **Beschriftungen als Wert waren der eigentliche Fehler dahinter.**
   `columns` und `selectOptions` standen als Konstante und wären auch mit
   Katalog-Schlüsseln nach einem Sprachwechsel eingefroren geblieben — dieselbe
   Klasse Fehler wie die Toast-Überschrift, die dieses Ticket ausgelöst hat.
   Sie sind jetzt `computed`. `DemoNav.vue` ebenso, obwohl es dort heute nichts
   ändert (eigener iframe) — als Vorbild, das niemand falsch abschreibt.

Nicht beauftragt, aber im selben Zug erledigt, weil es sonst in **zwei**
Katalogen veraltet wäre: Die Zahl der Paletten stand als Wort im Text
(„Dreizehn Paletten"). Sie kommt jetzt aus `THEME_IDS.length` — und war schon
falsch, es sind **vierzehn**.

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

### Offene Punkte

- **Zeile #13 ist ungeprüft** — das Fenster ließ sich hier nicht verkleinern.
  Der einzige Punkt, der ohne echten Bildschirm nicht abzuschließen ist.
- **Zeile #8 bleibt ⚠️**, solange das Schaufenster keine einzige von Naive UI
  selbst gestellte Zeichenkette zeigt. Kein Fehler, eine Lücke — Kandidat für
  ein eigenes kleines Ticket.

### Nebenbefunde, nicht angefasst

Beide außerhalb des Scopes, beide gemeldet statt still behoben:

1. **`showcase/src/composables/useTheme.ts` greift direkt auf `localStorage` zu**
   (eigenes `try`/`catch`), statt `safeStorage` aus dem Paket zu nehmen — genau
   die Kopie, die `ux-standards` und `AGENTS.md` untersagen. Ausgerechnet im
   Schaufenster, das das Paket vorführen soll. Eigenes Ticket wert.
2. **`AGENTS.md` ist eine byte-gleiche Kopie von `CLAUDE.md`** und ungetrackt.
   Zwei Dateien, derselbe Regeltext — „Keine Regel zweimal" gilt auch für die
   Datei, die diese Regel aufschreibt. Ein Symlink löste es; die Entscheidung
   gehört Mike, deshalb hier nur notiert.

### Auflösung

`ux-foundation` — Handoff-Commit siehe `STATUS.md`. `make test` (21 Dateien,
663 Tests), `make typecheck` und `make lint` grün. Live geprüft sind die Zeilen
1–12 und 14–16; #13 blieb ➖ (Fenstergröße), #8 ⚠️ (nichts zu sehen).
