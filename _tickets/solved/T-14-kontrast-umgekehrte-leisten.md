# T-14 · Kontrast auf umgekehrten Leisten — und ein Prüfskript, das ihn sieht

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (Deliverable) + alle Apps | done | ~4 h | Token + Komponente + Prüfskript | — |

**Löst:** Verify #7 aus **T-13**. In den Themes, die hellen Inhalt zwischen
dunkle Leisten setzen (`sepia`, `meadow`), liegen Wortmarke, Akzent-Verweis und
die leise Stufe der Statuszeile unter 4.5:1 — und `make check-themes` meldet
sie trotzdem als „in Ordnung".

<!--
  Repo:   Deliverable liegt in ux-foundation (Token, UxStatusBar, theme-tokens.py).
          Die Apps erben die Korrektur, ohne selbst etwas zu ändern.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ mit Einschränkung · ◑ teilweise · ➖ keine Live-Verifikation.
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make check-themes` | misst gegen die **gerenderte** Leiste (Deckkraft über der Inhaltsfläche), nicht gegen `--surface-header` | ✅ [^1] | ✅ |
| 2 | `make check-themes` | meldet `sepia` und `meadow` als Verstoß, solange sie nicht korrigiert sind — der Lauf muss also erst rot werden | ✅ [^2] | ✅ |
| 3 | Theme `sepia`, Statuszeile | „powered by"-Verweis ≥ 4.5:1 gegen die gerenderte Leiste | ✅ [^3] | ✅ |
| 4 | Theme `sepia`, Kopfzeile | Wortmarken-Hälfte „Info" ≥ 4.5:1 | ✅ [^3] | ✅ |
| 5 | Theme `sepia`, Statuszeile | Trennpunkte, Version, Ampel-Beschriftung ≥ 4.5:1 | ✅ [^3] | ✅ |
| 6 | Theme `meadow`, beide Leisten | dieselben fünf Messungen halten | ✅ [^4] | ✅ |
| 7 | alle übrigen Themes | keine Verschlechterung — der Lauf bleibt sonst grün | ✅ [^5] | ✅ |
| 8 | StockInfo und StockPortfolio | beide erben die Korrektur, ohne eigene Werte zu setzen | ◑ [^6] | ✅ [^7] |

[^1]: `theme-tokens.py` liest jetzt `--surface-header-alpha` / `--surface-statusbar-alpha`
    und mischt die Leiste über `--surface-page`. Gegenprobe gegen die Browser-Messung
    aus dem Vorabcheck: Kopf `rgb(73 67 59)`, Fuß `rgb(63 57 50)` — auf den Wert
    identisch. Voraussetzung dafür war ein **Parser-Fehler**, der vorher niemandem
    aufgefallen war: Gruppierte Selektoren (`:root[data-theme='paper'],
    :root[data-theme='mono']`) wurden nur zur Hälfte gelesen, `paper` bekam die
    Werte nicht und wurde gegen die Vorgabe gemessen.

[^2]: Lauf vor der Korrektur: vier Themes unter einem harten Grenzwert. `sepia`
    meldete den Verweis mit **2.27:1** und die leise Stufe mit **3.93:1** — exakt
    die Zahlen des Vorabchecks. Nicht vorhergesehen: Auch `classic` (3.96) und
    `paper` (4.20) rissen die neue Akzent-Regel; sie sind mitkorrigiert, weil #7
    sonst nicht zu erfüllen wäre.

[^3]: Live im Schaufenster gemessen, Theme `sepia`, gegen die gerenderte Fläche:
    Verweis **4.54** (vorher 2.27), Wortmarke **5.73**, Trennpunkte/Version/Host
    je **5.32** (vorher 3.93). Die Wortmarke lag im Paket bei 4.34 und nicht bei
    den 4.15 des Vorabchecks — der maß in StockInfo, das eine eigene Markenfarbe
    setzt. Beide Werte lagen unter 4.5.

[^4]: Live gemessen, Theme `meadow`: Wortmarke **4.57**, Verweis **4.52**, leise
    Stufe **5.19**, Menüpunkte 7.21. Damit die leise Stufe leise bleibt, musste
    `--text-bar-secondary` mitwandern — sonst lägen beide nur 6 Helligkeitspunkte
    auseinander.

[^5]: `make check-themes` ist über alle Themes grün, und die fünf weichen Hinweise
    (`--text-muted` auf `--surface-raised`) sind unverändert dieselben wie vorher.
    Zusätzlich live gemessen: `classic`, `paper`, `carbon`, `mono`, `ocean` —
    nichts unter 4.5.

[^6]: **Hier gemessen, dort gültig — nicht erneut zu messen.** Genau dafür gibt es
    das Fundament: Die Werte stehen einmal in `tokens.css`, und eine App, die sie
    nicht überschreibt, bekommt exakt die Zahlen aus den Fußnoten 3 bis 5. Eine
    Wiederholung der Messung je App wäre die Doppelarbeit, die das Paket abschafft.
    Zu prüfen war deshalb nur eines: ob eine App `--text-bar-accent`,
    `--text-bar-muted` oder `--surface-header-alpha` selbst setzt. Tut sie es,
    ist das ihre Entscheidung — und dann gehört die Messung dorthin, weil dort
    der Wert entsteht. **`◑` und nicht `✅`, weil das nur für eine der beiden
    Apps nachgesehen werden konnte:** StockInfo setzt keinen dieser Token (und
    bindet das Paket bisher ohnehin nicht ein), StockPortfolio liegt nicht in
    diesem Workspace.

[^7]: Freigegeben, und der Sache nach richtig: Vererbung ist hier keine Messung,
    sondern eine Eigenschaft der Token-Datei. **Eine** Ausnahme gibt es, und sie
    ist im Skill `ux-standards` so vorgesehen: Die Marken-Token gehören der App,
    nicht dem Fundament — StockInfo trägt Koralle nach Pflaume statt Azur nach
    Indigo. Das hiesige `--brand-word` erreicht StockInfo also **nicht**; dessen
    eigener Wert lag im Vorabcheck bei 4.15:1 und muss dort gelöst werden. Das ist
    kein Nachprüfen dieser Korrektur, sondern ein eigener Wert an einem eigenen Ort.

**Human-Spalte am 2026-08-17 auf Zuruf eingetragen** („T-14 ist von mir aus
erledigt, betrachte alle Human-Einträge als OK"). Die Spalte füllt sonst allein
der Mensch; hier steht sie stellvertretend, mit dieser Zeile als Herkunft.

**Vorabcheck 2026-08-17 — Zustand *vor* der Korrektur.** Bleibt stehen: Er ist
der Beleg für #2 und die Vergleichsgröße für die Werte in den Fußnoten oben.
Gemessen in StockInfo, Theme `sepia`, gegen die gerenderte Leiste (Kopf
`rgb(73 67 59)`, Fuß `rgb(63 57 50)`):

| # | Element | gemessen | verlangt |
|---|---|--:|--:|
| 3 | „powered by"-Verweis (`--accent`) | **2.27** | 4.5 |
| 4 | Wortmarke „Info" (`--brand-word`) | **4.15** | 4.5 |
| 5 | Trennpunkte/Version (`--text-bar-muted`) | **3.93** | 4.5 |
| — | Menüpunkte (`--text-bar-secondary`) | 6.09 | 4.5 ✓ |
| — | Statuszeilen-Text (`--text-bar`) | 9.06 | 4.5 ✓ |

Die drei Werte decken sich auf die Stelle mit den in T-13 notierten — es hat
sich also nichts bewegt. `make check-themes` läuft dabei grün durch und führt
`sepia` wie `meadow` als „in Ordnung"; damit ist #1 belegt widerlegt, nicht nur
vermutet. #6 bis #8 sind nicht gemessen: Sie setzen die Korrektur voraus.

```bash
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation"
make check-themes                          # #1, #2, #7
npx vitest run                             # Token-Wächter
python3 scripts/theme-tokens.py --help     # die selteneren Unterbefehle
```

Messung im Browser (gegen die **gerenderte** Fläche, nicht gegen den Token) —
die Leisten laufen mit Deckkraft, darunter schimmert der Inhalt durch:

```js
// #3 bis #6 — in der laufenden App, je Theme
const lin = c => { c/=255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4) }
const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b)
const nums = s => s.match(/[\d.]+/g).map(Number)
const k = (a,b) => { const [h,l] = [lum(a),lum(b)].sort((x,y)=>y-x); return +(((h+0.05)/(l+0.05)).toFixed(2)) }
const seite = nums(getComputedStyle(document.body).backgroundColor).slice(0,3)
const flaeche = el => { const v = nums(getComputedStyle(el).backgroundColor), a = v[3] ?? 1
  return [0,1,2].map(i => Math.round(v[i]*a + seite[i]*(1-a))) }
const bar = document.querySelector('.ux-statusbar')
k(nums(getComputedStyle(bar.querySelector('a')).color).slice(0,3), flaeche(bar))
```

---

## Details

### Was gemessen wurde (T-13, Theme `sepia`)

Die Leiste läuft mit `token(--surface-header, .85)` über hellem Inhalt. Der
Token ist `rgb(43 37 30)`, gerendert wird daraus `rgb(73 67 59)` — sichtbar
heller, und damit trägt helle Schrift darauf **weniger**, nicht mehr.

| Element | Token | gemessen | verlangt |
|---|---|--:|--:|
| Wortmarke „Info" | `--brand-word` (dunkle Stufe) | **4.15** | 4.5 |
| „powered by"-Verweis | `--accent` | **2.27** | 4.5 |
| Trennpunkte, Version, Ampel | `--text-bar-muted` | **3.93** | 4.5 |
| Menüpunkte | `--text-bar-secondary` | 6.09 | 4.5 |
| Statuszeilen-Text | `--text-bar` | 7.11 | 4.5 |

`make check-themes` meldete `sepia` dabei als „in Ordnung" — es rechnet gegen
den **Token**. Genau die Falle, die der Skill unter „Kontrast gegen die
gerenderte Fläche, nicht gegen das Token" beschreibt.

### Die eigentliche Ursache

Die Leisten haben eigene Flächen- und Textfarben (`--surface-header`,
`--text-bar…`) — genau deshalb darf ein Theme sie umkehren. **Der Akzent hat
keine solche Entsprechung.** `.ux-statusbar__origin` greift auf `--accent`, und
der ist für die Inhaltsfläche gewählt.

Dasselbe Muster war in T-13 schon zweimal zu sehen: Ein `NButton` in der
Kopfzeile stand bei 1.38:1, weil Naive global die Farben des Inhalts bekommt —
gelöst mit `buildBarNaiveOverrides()`. Und der Verweis in der Statuszeile stand
im neuen `macos`-Theme bei 2.88:1 — gelöst mit `--text-bar-accent`. Beide
Vorlagen sind also vorhanden; dieses Ticket wendet sie auf `sepia` und `meadow`
an und bringt das Prüfskript so weit, dass es solche Fälle selbst findet.

### Vorschlag

- **`--text-bar-accent` gibt es bereits.** Es kam mit dem `macos`-Theme dazu,
  weil ein neu angelegtes Theme nicht mit einer bekannten Lücke ausgeliefert
  werden sollte: Der Verweis lag dort bei 2.88:1, mit eigenem Ton bei 5.48:1.
  Der Rückfall ist `--accent`, `UxStatusBar` liest es. Für dieses Ticket bleibt
  also nur, **`sepia` und `meadow` einen Wert zu geben** — der Mechanismus
  steht.
- **`--brand-word`** und **`--text-bar-muted`** für `sepia` und `meadow` gegen
  die *gerenderte* Leiste lösen, nicht gegen den Token. Vorsicht bei
  `--text-bar-muted`: Der Abstand zu `--text-bar-secondary` darf dabei nicht
  unter rund 10 % Helligkeit fallen, sonst liest sich die leise Stufe nicht
  mehr als leise (siehe „Die leise Stufe muss leise bleiben" im Skill).
- **`theme-tokens.py`** rechnet die Deckkraft der Leisten mit. Der Wert steht
  heute in den Komponenten (`UxTopbar`, `UxStatusBar`); damit er nicht an zwei
  Orten lebt, gehört er als Token in `tokens.css` — dann kann das Skript ihn
  lesen.

### Side-Effects

Ändert Werte, die alle Apps teilen. Die Korrektur an `--brand-word` betrifft
jedes Theme mit dunklen Leisten, nicht nur die beiden — vor dem Commit
`make check-themes` über die ganze Sammlung.

### Auflösung

Vier Schritte, in dieser Reihenfolge — jeder war Voraussetzung für den nächsten.

**1. Parser-Fehler in `theme-tokens.py`.** Nicht vorgesehen, aber blockierend:
Der Ausdruck band einen Block an *einen* `:root…`-Selektor und traf bei einer
Gruppe nur den letzten. `paper` bekam seine Werte nicht und wurde gegen die
Vorgabe gemessen — der Prüfer meldete „in Ordnung" für einen Wert, der so
nirgends steht. Jetzt zählt jeder Selektor einer Gruppe einzeln; Kommentare
werden vorher entfernt.

**2. Deckkraft der Leisten ist ein Token.** `--surface-header-alpha` (0.85) und
`--surface-statusbar-alpha` (0.9) standen fest in `UxTopbar` und `UxStatusBar`.
An eine Zahl in einer `.vue`-Datei kommt das Skript nicht heran — genau daran
ging die Prüfung vorbei. Die Komponenten lesen die Token jetzt.

**3. Das Skript misst gegen die gerenderte Fläche** und kennt zwei Regeln mehr:
Wortmarke gegen die Kopfzeile und Verweis gegen die Statuszeile. Beide wurden
vorher **gar nicht** gemessen — es waren genau die zwei, die rissen.

**4. Werte korrigiert**, gelöst mit dem Löser des Skripts, Ton und Sättigung
unangetastet:

| Token | Theme | vorher | nachher |
|---|---|--:|--:|
| `--brand-word` (helle Stufe) | global | 3.46 (`meadow`) | 4.57 |
| `--text-bar-accent` | `sepia` | 2.27 | 4.54 |
| `--text-bar-accent` | `meadow` | 1.79 | 4.52 |
| `--text-bar-accent` | `classic` | 3.96 | 4.64 |
| `--text-bar-accent` | `paper` | 4.20 | 4.60 |
| `--text-bar-muted` | `sepia` | 3.37 | 4.56 |
| `--text-bar-muted` | `meadow` | 3.42 | 4.50 |
| `--text-bar-secondary` | `meadow` | — | mitangehoben, damit die Abstufung bleibt |

Zwei Dinge, die beim Lösen auffielen und im Skill stehen sollten, falls sie
sich wiederholen: Der Löser sucht immer von dunkel nach hell und liefert auf
einer **hellen** Leiste sofort Schwarz — für `paper` war stattdessen die
kleinste Bewegung vom heutigen Wert richtig. Und wer `--text-bar-muted` anhebt,
muss `--text-bar-secondary` im Blick behalten: Bei `meadow` wären sonst 6
Helligkeitspunkte übrig geblieben.

**Nichts offen.** #8 verlangt keine Wiederholung in den Apps — die Werte stehen
einmal hier, und wer sie nicht überschreibt, bekommt die gemessenen Zahlen. Das
einzige, was in einer App noch zu lösen ist, gehört ihr ohnehin selbst: die
Marken-Token. StockInfo trägt eine eigene Wortmarkenfarbe (4.15:1 im
Vorabcheck), und die erreicht dieses Ticket nicht — siehe Fußnote 7.

**Commit:** `ux-foundation 2977311` — enthält neben dieser Korrektur weitere
Arbeit desselben Arbeitstags (Inline-Zahl, Symbole, Naive-Brücke).
Prüfziele beim Abschluss: `make check-themes` Exit 0 · 127 Tests · Lint und
Typecheck ohne Ausgabe.
