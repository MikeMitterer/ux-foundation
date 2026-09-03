# T-17 · Das Schaufenster spricht nur Deutsch

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (nur `showcase/`) | done | ~2 h | Schaufenster-only — `src/` bleibt unberührt | — |

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
| 1 | `make test` | alle Tests grün, darunter der neue Katalog-Test | ✅¹ | ok |
| 2 | `make typecheck` | grün — `MessageSchema` erzwingt gleiche Schlüssel in `de` und `en` | ✅¹ | |
| 3 | `make typecheck` nach absichtlich entferntem Schlüssel in `en.ts` | **rot**, mit Nennung des fehlenden Schlüssels (Gegenprobe zu #2) | ✅² |ok |
| 4 | http://localhost:5177 · Kopfzeile rechts | `DE \| EN` mit Pipe, links neben der Theme-Liste; die aktive Kennung hell, die andere gedämpft | ✅³ | OK, ein wenig größer könnte der Unterschied schon sein |
| 5 | auf `EN` stellen | alle sichtbaren Texte wechseln — Menü, Reiter, Fließtext, Statuszeile | ✅³ | ok |
| 6 | Reiter „Verhalten": Anzeigedauer 0, Zustand einschalten, **dann** Sprache wechseln | **Überschrift und Text des offenen Toasts** wechseln mit, und es bleibt **derselbe** Toast | ✅⁴ |ok |
| 7 | Reiter „Schrift", Tabellenziffern | Zahlenformat schaltet mit: `1.234,50` unter de, `1,234.50` unter en | ✅⁵ | ok|
| 8 | Reiter „Naive UI" | Naives **eigene** Beschriftungen folgen der Sprache | ⚠️⁶ | nicht überprüft |
| 9 | Konsole: `document.documentElement.lang` | `de` bzw. `en` — zieht beim Wechsel mit | ✅⁷ | OK |
| 10 | Sprache auf `EN`, **Seite neu laden** | bleibt englisch (Wahl liegt im `localStorage`) | ✅⁸ |ok |
| 11 | `localStorage.removeItem('ux-foundation.showcase.locale')`, neu laden | Browsersprache greift, wenn keine Wahl gespeichert ist | ✅⁹ |ok |
| 12 | Erststart ohne gespeicherte Wahl, danach `localStorage.getItem(…)` | `null` — der bloße Besuch friert die Browsersprache **nicht** als Wahl ein | ✅⁹ |ok |
| 13 | Fenster auf 375 px, Sprache wechseln | Kopfzeile bleibt einzeilig, kein waagrechter Überhang | ➖¹⁰ | ok |
| 14 | Reiter wechseln, dann Sprache wechseln | Der Schiebebalken sitzt unter dem aktiven Reiter, auch nach dem Wechsel | ✅¹¹ | ok |
| 15 | Reiter „Naive UI" und „Schrift", Sprache wechseln | Spaltenköpfe, Knöpfe, Etiketten, Hinweis und die Rollen-Tabelle wechseln mit — nichts bleibt deutsch stehen | ✅¹² | OK, allerdings springen die Spaltenbreiten massiv bei der Sprachumschaltung |
| 16 | Bereiche Grundlagen / Komponenten / Verhalten durchklicken | je Bereich der richtige Reitersatz, **ein** sichtbarer Abschnitt (Regression zu #14) | ✅¹³ | ok |
| 17 | Reiter „Mobil" **laden**, dann Sprache wechseln **ohne** Neuladen | alle drei eingebetteten Navigationen wechseln mit — Beschriftungen **und** `lang` im jeweiligen iframe | ✅¹⁴ |ok |
| 18 | wie #17, aber vorher den Speicher lahmlegen — Konsole öffnen und den Block unten einfügen. Das ahmt den Privatmodus nach, wo `localStorage` blockiert ist | die drei Ansichten wechseln **trotzdem** mit. Sie hingen einmal daran, dass geschrieben werden konnte; im Privatmodus blieben sie stehen | ✅¹⁵ | KA was das sein soll |
| 19 | `localStorage` leeren, Browsersprache auf Französisch, neu laden | startet **englisch**, nicht deutsch — der Rückfall ist `en` | ➖¹⁶ | Nicht überprüft, wird aber passen |
| 20 | Reiter „Naive UI", Tabelle, Sprache wechseln | die Spaltenbreiten stehen still — kein Springen des Rasters (dein Befund zu #15) | ✅¹⁷ | |
| 21 | Kopfzeile, aktive gegen inaktive Sprachkennung | der Unterschied ist auf Anhieb zu sehen (dein Befund zu #4) | ✅¹⁸ | |

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
> **Korrektur nach Runde 1:** Diese Zeile stand zunächst als „alle sichtbaren
> Texte" da und war damit zu weit — die eingebetteten Mobil-Ansichten waren
> nicht geprüft und wechselten tatsächlich **nicht** mit. Das ist jetzt behoben
> und in #17 gesondert nachgewiesen; hier gilt die Aussage für die Elternseite.
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
>
> ¹⁴ **(CC):** live, die Gegenprobe aus Codex' Finding 1 wörtlich ausgeführt —
> Mobil-Ansicht geladen (drei iframes, alle `lang="de"`, Beschriftungen
> „Übersicht/Papiere/Devisen/Einstellungen"), dann **ohne** Neuladen auf `EN`
> geklickt. Danach in **allen drei**: `lang="en"` und
> „Dashboard/Instruments/FX/Settings". Abgesichert durch
> `tests/showcaseLocaleSync.spec.ts`. **Der Transport hat sich in Runde 2
> geändert** — statt des `storage`-Ereignisses trägt jetzt ein
> `BroadcastChannel`; warum, steht in #18.
>
> ¹⁵ **(CC):** live, und das ist der Nachweis, auf den es ankommt.
> `Storage.prototype.setItem` so überschrieben, dass es wirft — genau der Fall,
> den `safeStorage` abfängt und `persistLocale` verschluckt. Danach ohne
> Neuladen umgeschaltet: Elternseite und **alle drei** iframes gingen von `en`
> auf `de`, Beschriftung („Dashboard"→„Übersicht") wie `lang`. Der Beweis, dass
> der Speicher wirklich nicht mitschrieb: Er stand danach weiterhin auf `en`,
> während die Oberfläche `de` zeigte. Mit dem alten `storage`-Transport wäre an
> dieser Stelle nichts passiert.
>
> ¹⁶ **(CC):** **Keine Live-Verifikation** — die Browsersprache lässt sich von
> hier aus nicht umstellen, dieselbe Grenze wie bei #11. Abgedeckt ist der Fall
> als Unit-Test in `tests/showcaseLocaleSync.spec.ts` („Rückfall-Sprache des
> Schaufensters"), der `navigator.languages` auf Französisch stellt und `en`
> erwartet — und gegenprüft, dass ein deutscher Browser weiterhin `de` bekommt.
>
> ¹⁷ **(CC):** live **gemessen**, vorher und nachher. Vorher sprang beim Wechsel
> „Veränderung"→„Change" die Spalte von 266 auf 191 px und schob die Nachbarn um
> bis zu 42 px mit — Mikes „massiv" war präzise. Nachher: `[120, 721, 120, 150]`
> in **beiden** Sprachen, größter Sprung **0 px**.
>
> ¹⁸ **(CC):** gemessen, weil „sieht man besser" keine Aussage ist. Die beiden
> Zustände unterschieden sich um **1.76:1**, während jeder für sich sauber auf
> der Leiste steht (10.67 und 6.07 gegen die Leistenfläche). Die aktive Kennung
> trägt jetzt zusätzlich eine Fläche. Die inaktive weiter abzudunkeln wäre der
> naheliegende Weg gewesen, hätte aber die Textgrenze von 4.5:1 angeknabbert;
> ein Gewichtswechsel verschöbe bei zwei Buchstaben die Nachbarn.

### Kurz-Testblock

```bash
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation"
make test        # #1
make typecheck   # #2
make dev         # #4–#18 — Schaufenster auf http://localhost:5177
```

Für **#18** in die Browser-Konsole, bei geöffnetem Reiter „Mobil". Danach die
Sprache umschalten: Die drei eingebetteten Ansichten müssen mitwechseln, obwohl
nichts gespeichert werden kann. Ein Neuladen setzt alles zurück.

```js
// ahmt den Privatmodus nach: Schreiben in den localStorage wirft
Storage.prototype.setItem = function () { throw new Error('Speicher blockiert') }
```

Zur Gegenprobe, dass wirklich nichts geschrieben wurde — der Wert muss auf der
**alten** Sprache stehenbleiben, während die Oberfläche schon die neue zeigt:

```js
localStorage.getItem('ux-foundation.showcase.locale')
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
   Sie sind jetzt `computed`. `DemoNav.vue` ebenso — dort stand zunächst als
   Begründung, es ändere ohnehin nichts, weil die Seite in einem eigenen iframe
   lebt. Das war nur so lange richtig, wie die iframes gar nicht mitwechselten;
   seit dem Kanal aus Runde 1 ist es die **Voraussetzung** dafür, dass sie es
   tun.

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
- [ ] Reihenfolge bleibt: gespeicherte Wahl → Browsersprache → Rückfall, und
      der Rückfall ist **`en`**: Basissprache des Katalogs und Rückfall zur
      Laufzeit sind zwei verschiedene Fragen — wer weder Deutsch noch Englisch
      spricht, kommt mit Englisch weiter
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

### Warum die Kennungen nicht im Katalog stehen

`DE` und `EN` entstehen aus `LOCALE_IDS` in Großbuchstaben und stehen nirgends
als Text. Zwei Gründe, und der zweite ist der wichtigere:

1. **Ein Kürzel wird nicht übersetzt.** Es heißt in jeder Oberfläche gleich —
   dasselbe, was Endonyme leisten würden („Deutsch"/„English"), nur ohne Liste.
2. **Es gibt keine zweite Quelle.** Eine Namensliste neben `LOCALE_IDS` müsste
   bei jeder neuen Sprache nachgezogen werden, und genau das vergisst jemand.

Die erste Fassung hatte eine Auswahlliste mit Endonymen; sie ist auf Mikes
Ansage durch `DE \| EN` ersetzt. Der `aria-label` der Gruppe ist normaler
sichtbarer Text und **steht** im Katalog.

### Side-Effects

**Keine für einbindende Apps.** `files` in der `package.json` liefert nur
`src/`; das Schaufenster wird nicht ausgeliefert, und kein Paket-Modul wird
angefasst. Der Katalog verdoppelt sich von einer auf zwei Dateien — die zweite
Quelle ist durch den Typ (Schlüssel) und einen Test (Platzhalter) abgesichert,
wie es die Repo-Regel verlangt.

### Runde 1: was Codex gefunden hat

Drei Findings, alle drei zutreffend, alle drei behoben.

**Der eine, der zählt: die iframes.** Der Mobil-Abschnitt bettet dieselbe App
dreimal als eigenes Dokument ein, und jedes baut seine **eigene** i18n-Instanz
auf. Der Umschalter änderte nur den Ref der Elternseite — die drei
Navigationen blieben in ihrer Startsprache stehen, während ringsherum alles
wechselte. Meine Verify-Zeilen #5 und #15 behaupteten „alle sichtbaren Texte";
das war zu weit gegriffen, weil ich die eingebettete Ansicht nicht geprüft
hatte. Die Fußnote zu #3 sagt das jetzt ausdrücklich.

Gelöst über das `storage`-Ereignis, und das ist hier kein Notbehelf, sondern
genau der richtige Schnitt: Es feuert in allen Dokumenten derselben Herkunft
**außer** dem, das geschrieben hat. Das schreibende aktualisiert sich über
seinen eigenen Ref, die übrigen über das Ereignis — niemand wird doppelt
gesetzt, und zwei Browser-Tabs des Schaufensters ziehen nebenbei gleich mit.

Dabei kam heraus, dass `lang` am Wurzelelement im falschen Modul saß: Es stand
in `useLocale`, das nur lädt, wer einen Umschalter zeigt. Die iframes zeigen
keinen und hatten deshalb **gar kein** `lang`. Beides — die Startbelegung und
die Brücke — liegt jetzt in `i18n/index.ts`, das jedes Dokument über `main.ts`
lädt.

**Die beiden kleinen:** Die neu eingeführten Bezeichner waren deutsch
(`Katalog`, `nachrichten`, `DEUTSCH`, `NAMEN`, …). `code-standards` verlangt
englische Bezeichner auch in Tests und nimmt den Einwand „aber das Repo ist
voll davon" vorweg: *„Altlast: Neuer Code ist englisch."* Umbenannt sind nur
die neuen. Dazu zeigte ein Kommentar noch auf einen Typ `Katalog`, den es nie
gab — er heißt `MessageSchema`. Und Katalog-Kommentar wie Ticket-Abschnitt
beschrieben weiter die verworfene Endonym-Fassung; beide sagen jetzt, was
tatsächlich dasteht.

### Runde 2: der Fix von Runde 1 hing an einer Bequemlichkeit

Codex' Befund war präzise und traf eine Stelle, die man nur im Ausfall sieht.

Die Brücke aus Runde 1 lag auf dem `storage`-Ereignis. Das entsteht aber nur,
**wenn tatsächlich geschrieben wurde** — und der Speicher ist hier ausdrücklich
optional: `safeStorage` gibt es, weil sein Zugriff in abgeschotteten Browsern
wirft, und `persistLocale` verschluckt ein Misslingen mit Absicht. Im
Privatmodus oder bei blockierten Cookies wechselte also die Elternseite, und die
drei iframes blieben stehen — genau der Fehler, den Runde 1 beheben sollte, nur
eine Umgebung weiter.

Mein eigener Test verdeckte das, weil er das Ereignis mit `dispatchEvent`
selbst erzeugte und damit die Kausalkette übersprang, an der es scheitert. Ein
Test, der die halbe Kette nachbaut, prüft die Kette nicht.

Der Transport ist jetzt ein `BroadcastChannel`: derselbe Schnitt — alle
Dokumente derselben Herkunft außer dem Absender —, aber ohne Abhängigkeit vom
Speichern. Speichern und Ansagen sind zwei getrennte Aufgaben und dürfen
einander nicht mitreißen: Das eine lässt die Wahl ein Neuladen überleben, das
andere holt die schon offenen Dokumente nach.

**Die Lehre, und sie ist allgemeiner als dieser Fall:** Wenn ein Test den Kanal
selbst herstellt, den er prüfen soll, prüft er den Kanal nicht. #18 setzt
deshalb an der Ursache an — Speicher werfen lassen — statt am Symptom.

Dazu zwei kleinere Punkte: Die Rückfall-Sprache stand auf `de`. Basissprache des
Katalogs und Rückfall zur Laufzeit sind aber verschiedene Fragen — wer weder
Deutsch noch Englisch spricht, kommt mit Englisch weiter; jetzt `en`. Und drei
Kommentare beschrieben noch den Stand vor Runde 1, darunter ausgerechnet der in
`DemoNav.vue`, der behauptete, die Beschriftung im iframe könne sich gar nicht
ändern.

### Runde 3: der Test bewachte gar nichts

Codex hat nicht gelesen, sondern **gemessen**: In einer isolierten Kopie den
Aufruf `announceLocale(locale)` aus `setLocale()` entfernt — und alle acht
Tests blieben grün. Ein Regressionstest, den man durch Entfernen der Sache, die
er sichern soll, nicht rot bekommt, ist Dekoration.

Der Grund war derselbe Fehler wie in Runde 2, eine Ebene höher: Mein Test rief
`announceFromOtherDocument()` direkt auf. Damit lief der öffentliche Setter nie
— weder `persistLocale` noch `announceLocale` —, und der Speicher-Mock traf
einen Pfad, den niemand betrat. Ich hatte den **Empfänger** geprüft und geglaubt,
damit die Verdrahtung geprüft zu haben.

Der neue Block „Der Umschalter sagt an, was er tut" geht den Weg der Kopfzeile:
`useLocale().setLocale('en')`, beobachtet aus der Rolle, für die die Kopplung
gebaut wurde — ein zweites Dokument am selben Kanal.

**Dabei kam heraus, dass der Ausfall-Fall vorher gar keiner war.** happy-dom
bringt **keinen** `localStorage` mit; im Test scheiterte `safeStorage` also
ohnehin immer, und „bei blockiertem Speicher" prüfte eine Lage, die es nicht
herstellte. Der Test hängt jetzt selbst einen Speicher ein und lässt *dessen*
`setItem` werfen — und stellt zusätzlich fest, dass wirklich nichts geschrieben
wurde, damit er nicht wieder unbemerkt die falsche Lage prüft.

Gegengeprüft mit zwei Mutanten, statt es zu behaupten:

| Mutant | vorher | jetzt |
|---|---|---|
| `announceLocale(locale)` aus `setLocale` entfernt | grün (8/8) | **rot** — „erreicht andere Dokumente auch bei blockiertem Speicher" |
| `persistLocale(locale, …)` aus `setLocale` entfernt | grün | **rot** — zwei Fälle |

Nebenbei brauchte es dafür den `@`-Alias in `vitest.config.ts`: Die
Schaufenster-Module zeigen mit `@/…` aufeinander, und ohne ihn scheitert schon
das Laden.

**Die Lehre, und sie ist die dritte Runde in Folge dieselbe Familie:** Ein Test
beweist nur, was er tatsächlich ausführt. Runde 2 baute den Kanal selbst nach,
Runde 3 übersprang den Setter. Beide Male sah der Test richtig aus und maß
nichts. Der Mutant ist die einzige ehrliche Probe.

### Runde 4: die zweite Quelle beseitigt statt bewacht

Zwei kleine Punkte, beide zutreffend.

Der `@`-Alias, den Runde 3 in `vitest.config.ts` gebracht hatte, stand damit
zweimal da — einmal dort, einmal in `showcase/vite.config.ts`. Ich hatte das
selbst als Frage gestellt; die Repo-Regel beantwortet sie: Wer eine zweite
Quelle anlegt, legt den Test dazu — **und wo sich die Doppelung vermeiden
lässt, gibt es gar keine zweite Quelle.**

Also kein Wächter, sondern `aliases.ts` im Wurzelverzeichnis, aus der beide
Konfigurationen lesen. Die Pfade gehen von dieser Datei aus, damit es gleich
ist, aus welcher Tiefe jemand sie einbindet — sonst hätte man die Doppelung nur
durch eine Falle ersetzt. Der Bau ist mitgeprüft (`npm run build`), weil die
Datei auch zur Bauzeit geladen wird; `showcase/tsconfig.json` nimmt sie
ausdrücklich auf, sonst kennt `vue-tsc` sie nicht.

Der Wert der Zusammenlegung liegt nicht in den zwei gesparten Zeilen: Liefen die
Seiten auseinander, prüfte der Testlauf **andere Module**, als die App lädt —
und bliebe dabei grün. Das ist die teuerste Sorte Fehler.

Dazu beschrieb der Abschlussblock noch den Stand von Runde 1 (21 Dateien, 663
Tests, Zeilen 1–16). Historische Fußnoten behalten ihre damaligen Zahlen; der
Abschluss nennt jetzt den übergebenen Stand.

### Runde 5: die dritte Spiegelung — und wo sie nicht zu beseitigen war

Runde 4 hatte zwei der drei Stellen zusammengelegt; die dritte stand noch in
`showcase/tsconfig.json` unter `paths`. Die lässt sich **nicht** beseitigen:
`tsconfig.json` ist JSON und importiert nichts. Genau für diesen Fall sieht die
Repo-Regel den Konsistenztest vor — dieselbe Lage wie bei den Breakpoints, wo
SCSS kein TypeScript lesen kann.

Beim Schreiben lief ich in die Falle, die in `AGENTS.md` steht: `aliases.ts`
löste die Pfade auf Modulebene über `import.meta.url` auf, und unter
`happy-dom` ist das keine Datei-URL — **der Test konnte ausgerechnet die Quelle
nicht lesen, die er bewachen soll.**

Die Datei hält jetzt zweierlei: `ALIAS_SOURCES` als reine Daten (Aliasname auf
Pfad ab Wurzel) und `resolveAliases()`, das daraus absolute Pfade macht und
`import.meta.url` erst **in** der Funktion anfasst. Vite und Vitest rufen die
Funktion, der Test liest die Daten. Das ist nebenbei die bessere Aufteilung:
Was verglichen wird, ist die Zuordnung, nicht ihre Auflösung.

Gegengeprüft, wie üblich mit einem Mutanten statt mit einer Behauptung: Pfad in
der tsconfig auf `./srcX/*` verbogen → Test rot; zurückgenommen → grün.

**Die Lehre:** Eine gemeinsame Quelle muss von allen lesbar sein, die sie
angeht — auch vom Test. Sonst hat man die Doppelung beseitigt und die
Absicherung gleich mit.

### Runde 7: Mikes Abnahme

Er ist die Matrix durchgegangen und hat zwei Dinge gefunden, die sechs
Review-Runden nicht gefunden hatten — beide sieht man nur, wenn man die Sache
tatsächlich bedient:

1. **Die Spaltenbreiten sprangen beim Sprachwechsel.** Naive misst die Spalten
   am längsten Inhalt, und der ist hier die Kopfzeile. Gemessen: „Veränderung"
   gegen „Change" sind 75 px, und die Nachbarspalten wanderten um bis zu 42 px
   mit. Sein Wort dafür war „massiv", und das trifft es. Behoben mit festen
   Breiten für die Spalten mit vorhersagbarem Inhalt; `name` nimmt den Rest.
2. **Der Unterschied zwischen aktiver und inaktiver Sprachkennung war zu
   leise** — 1.76:1, während jede für sich sauber auf der Leiste steht. Die
   aktive trägt jetzt zusätzlich eine Fläche.

Dazu ein Befund über das Ticket hinaus: Zeile #18 war für einen Menschen nicht
ausführbar formuliert („`Storage.prototype.setItem` wirft"). Seine Antwort war
„KA was das sein soll", und sie war berechtigt — die Ticket-Regel verlangt das
vollständig kopierbare Kommando, und ich hatte eine Beschreibung hingeschrieben.
Nachgetragen im Kurz-Testblock.

**Was daraus dauerhaft wird:** Beide Befunde sind keine Eigenheit dieser App.
Der Skill `ux-standards` hat sie deshalb aufgenommen — und bei der Gelegenheit
eine Stelle korrigiert, die **aktiv in die Irre führte**: Sie empfahl für den
Sprachwechsel `:key="localeStore.current"` an den Reitern. Genau das musste
dieses Ticket rückgängig machen, weil es den Zustand aller Kindansichten mit
abräumt. Ohne die Korrektur hätte ich denselben Fehler in der nächsten App
wieder eingebaut, weil der Skill ihn empfiehlt.

### Offene Punkte

Bei Abschluss durch Mike verbleiben drei Zeilen ohne menschliche Bestätigung.
Keine davon blockiert etwas, alle drei sind bewusst so stehengelassen:

- **#8** — das Schaufenster zeigt keine einzige von Naive UI selbst gestellte
  Zeichenkette; es gibt schlicht nichts zu sehen. Kein Fehler, eine Lücke des
  Schaufensters. **Kandidat für ein eigenes kleines Ticket**, das einen
  Leerzustand oder eine Datumsauswahl ergänzt.
- **#18** — der Ausfall-Fall des Speichers. Durch Unit-Test und Mutant
  abgesichert; das Kommando dafür steht jetzt im Kurz-Testblock, falls es
  jemand doch von Hand sehen will.
- **#19** — Rückfall auf Englisch. Als Unit-Test abgedeckt, von Hand nur mit
  umgestellter Browsersprache zu sehen.

Die neuen Zeilen **#20** und **#21** entstehen aus Mikes eigenen Befunden und
warten noch auf seinen zweiten Blick; die Änderungen dazu sind gemessen und
liegen in `6671962`.

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

`ux-foundation` — Handoff-Commit siehe `STATUS.md`. Vier Review-Runden mit
Codex; was jede gefunden hat, steht oben in ihrem eigenen Abschnitt.

**Stand bei der Übergabe:** `make test` 23 Dateien / 676 Tests, dazu
`typecheck`, `lint` und `npm run build` — vier Tore, Exit-Codes einzeln geprüft
(`0/0/0/0`) und nicht durch eine Pipe. Der Bau gehört dazu, weil die
Alias-Zusammenlegung auch zur Bauzeit greifen muss.

**Live geprüft:** die Zeilen 1–12 sowie 14–18, jede mit eigener Evidenz in der
Fußnote. Drei Stellen sind zusätzlich per Mutant abgesichert — nachgemessen,
nicht angenommen: Wer `announceLocale` oder `persistLocale` aus `setLocale`
entfernt, bekommt einen roten Test; wer den Alias in der `tsconfig.json`
verbiegt, ebenso.

**Nicht abschließbar von hier, drei Zeilen:** #13 ➖ (Fenstergröße ließ sich
nicht ändern), #19 ➖ (Browsersprache nicht umstellbar; als Unit-Test
abgedeckt), #8 ⚠️ (das Schaufenster zeigt keine von Naive selbst gestellte
Zeichenkette — nichts zu sehen, weder richtig noch falsch).
