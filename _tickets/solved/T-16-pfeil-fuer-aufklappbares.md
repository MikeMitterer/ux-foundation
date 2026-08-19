# T-16 · Ein Pfeil für alles Aufklappbare

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (Deliverable) + StockInfo + StockPortfolio | done | ~90 min | Neue Komponente + Ablösung der vier Kopien | — |

**Löst:** Jede aufklappbare Fläche in beiden Apps zeichnet ihren eigenen Pfeil.
Vier Kopien, kein gemeinsamer Ort — und sie sind bereits auseinandergelaufen.

<!--
  Repo: ux-foundation (Deliverable). Status: done.
  Herkunft: Sichtprüfung der StockInfo-Schublade (2026-08-18). Der Pfeil dort
  klebte am unteren Rand der Zeile; beim Beheben kam heraus, dass es denselben
  Pfeil noch dreimal gibt.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ bestätigt mit Einschränkung (Fußnote) ·
◑ teilweise (Fußnote) · ➖ keine Live-Verifikation (nur Unit/Review).
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

| # | Where | Look for | AI | Human                                      |
|---|---|---|:--:|--------------------------------------------|
| 1 | `make test` im Fundament | `UxCaret`-Tests grün, restliche Suite unverändert grün | ✅¹ | ok                                         |
| 2 | `make typecheck && make lint` im Fundament | beides sauber | ✅ | ok                                         |
| 3 | Schaufenster → Eigene Komponenten (`http://localhost:5177`) | beide Bewegungen zu sehen: `flip` kippt um 180°, `turn` dreht um 90° | ✅² | ok                                         |
| 4 | Schaufenster, Pfeil in **beiden** Zuständen | die Form bleibt mittig im Kasten — sie wandert beim Drehen nicht nach oben oder unten | ⚠️³ | ok                                         |
| 5 | StockInfo → Assets, Tabellenzeile auf- und zuklappen | Pfeil mittig in der Zeile, gleiche Größe wie vorher | ✅⁴ | ok                                         |
| 6 | StockInfo unter `md` → Kartenliste, „mehr"/„weniger" | derselbe Pfeil wie in der Tabelle | ✅⁵ | ok                                         |
| 7 | StockPortfolio → Dashboard, KPI-Karte aufklappen | Pfeil kippt um 180°, Deckkraft und Hover wie bisher | ➖⁶ | ok                                         |
| 8 | StockPortfolio → Dashboard, Gruppenkopf und Abschnitt „Assetklassen" | Pfeil dreht zur Seite (nicht kippt), Deckkraft und Hover wie bisher | ➖⁶ | ok                                         |
| 9 | `grep -rn "chevron" src` in beiden Apps | keine handgezeichneten Pfeile mehr übrig | ✅⁷ | nicht verifiziert - aber als OK abgenommen |

> ¹ **(CC):** 138 Tests grün (vorher 135), davon 6 neue für `UxCaret` und 3 für
> die `(i)`-Fassung von `UxInfoHint`.
> ² **(CC):** live auf `http://localhost:5177/#/own`, Block „Pfeil für
> Aufklappbares" mit Umschalter — beide Bewegungen im selben Zustand
> nebeneinander.
> ³ **(CC):** ⚠️ **nicht mit Augen im Schaufenster geprüft**, sondern zweifach
> gerechnet: Ein Test rechnet die Symmetrie des Pfads nach (Mittelpunkt 12/12),
> und in StockInfo gemessen ergab der Versatz zur Zeilenmitte 0,4 px —
> geschlossen wie geöffnet. Das ist Evidenz für die Geometrie, nicht für den
> optischen Eindruck. Zeile bleibt für den Menschen offen.
> ⁴ **(CC):** live, `http://localhost:5173/#/assets`. Größe 15,2 px (vorher
> 11,2), Versatz zur Zeilenmitte 0,4 px in beiden Zuständen.
> ⁵ **(CC):** live unter `md` angesehen, Karte „EUNL.DE" auf- und zugeklappt.
> ⁶ **(CC):** ➖ **nicht angesehen.** Das Depot enthält eine Position, das
> Dashboard zeigt aber den Leerzustand — ohne KPI-Karten und Gruppenköpfe sind
> die Pfeile dort nicht sichtbar. Beispieldaten zu laden hätte die Depotdaten
> verändert und wurde deshalb unterlassen. Belegt ist nur: Tests (512, davon 2
> neue), `vue-tsc` und ESLint sauber, und ein statischer Wächter, der
> handgezeichnete Pfeile ausschließt.
> ⁷ **(CC):** In StockPortfolio als Test verankert
> (`tests/caretUsage.spec.ts`) statt als einmaliger `grep` — er sucht den
> Pfeil-Pfad per Muster und prüft gegen, dass `UxCaret` tatsächlich vorkommt.
> In StockInfo entfiel die lokale `RowCaret.vue` ersatzlos.

```bash
# #1, #2 — Fundament
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation" && make test && make typecheck && make lint

# #3, #4 — Schaufenster
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation" && make dev   # http://localhost:5177

# #5, #6 — StockInfo
cd "${DEV_LOCAL}/DevWeb/Production/StockInfo/dashboard" && npm run dev   # http://localhost:5173/#/assets

# #7, #8 — StockPortfolio
cd "${DEV_LOCAL}/DevWeb/Production/StockPortfolio" && npm run dev

# #9 — nichts Handgezeichnetes mehr
grep -rn "chevron" "${DEV_LOCAL}/DevWeb/Production/StockInfo/dashboard/src" \
                   "${DEV_LOCAL}/DevWeb/Production/StockPortfolio/src"
```

---

## Das Problem

**Vier Kopien desselben Pfeils**, gefunden am 2026-08-18:

| Ort | Zeichen | Strichstärke | Größe | Deckkraft | Bewegung |
|---|---|---|---|---|---|
| StockInfo, Tabellenzeile | `⌄` (U+2304) | — | 0.7 rem | 1 | 180° |
| StockInfo, Kartenliste | `⌄` (U+2304) | — | geerbt | 1 | 180° |
| StockPortfolio, `KpiCard` | SVG | 2.5 | 0.75 rem | 0.4 | 180° |
| StockPortfolio, `PositionGroupHeader` | SVG | 2.5 | 0.75 rem | 0.5 | −90° |
| StockPortfolio, `DashboardView` | SVG | 2 | 0.875 rem | 1 | −90° |

Der SVG-Pfad ist in allen drei SVG-Fassungen identisch (`M6 9l6 6 6-6`) — sie
sind also voneinander abgeschrieben und danach einzeln verstellt worden. Genau
der Verlauf, den ux-standards unter „Sobald eine zweite App dasselbe braucht"
beschreibt: Die Kopie, die man beim zweiten Mal duldet, ist beim dritten Mal
schon auseinandergelaufen.

## Die Glyphen-Falle

StockInfo verwendete das **Zeichen** `⌄` statt einer Form. Das hat zwei Folgen,
die man einer Messung nicht ansieht:

1. Das Zeichen sitzt tief in seinem Em-Quadrat. Der **Kasten** war mit 0,7 px
   praktisch mittig — das Zeichen darin klebte am unteren Rand. Wer den Kasten
   misst, findet den Fehler nicht.
2. Gedreht um 180° kippt dasselbe Zeichen von unten nach **oben**. Eine feste
   optische Korrektur kann deshalb immer nur einen der beiden Zustände treffen.

Deshalb ist die Form im Fundament ein SVG, dessen Pfad symmetrisch um die
Kastenmitte liegt (x 6…18, y 9…15, Mitte also 12/12). Die Drehung verschiebt
sie damit nicht — das ist die Eigenschaft, die Zeile #4 prüft.

## Zwei Bewegungen, nicht eine

Die vier Fundstellen benutzen den Pfeil für zwei verschiedene Aussagen, und
beide sind berechtigt:

- **`flip`** — zu zeigt nach unten, offen nach oben. Der Pfeil sagt: *hier geht
  etwas auf*. So in der StockInfo-Zeile und in der KPI-Karte.
- **`turn`** — offen zeigt nach unten, zu zur Seite. Der Pfeil sagt: *hier
  hängt etwas darunter*. So im Gruppenkopf und am Abschnitt „Assetklassen".

Eine der beiden zur einzigen zu erklären wäre keine Vereinheitlichung, sondern
ein Bedeutungsverlust. Die Komponente kennt deshalb beide.

## Side-Effects

- Beide Apps hängen an `@mmit/ux-foundation` — die Komponente kommt mit dem
  nächsten Versionssprung dort an.
- Deckkraft, Hover und Farbe bleiben beim **Aufrufer**: Die KPI-Karte dimmt
  ihren Pfeil auf 0.4 und hellt ihn beim Überfahren der Karte auf, StockInfo
  färbt ihn im Akzent. Das ist Sache der Umgebung, nicht des Symbols — die
  Komponente zeichnet in `currentColor`.

## Auflösung

**Aus vier Kopien wurde eine Form.** `UxCaret` liegt im Fundament, zeichnet in
`currentColor` und kennt beide Bewegungen — `flip` für *hier geht etwas auf*,
`turn` für *hier hängt etwas darunter*. Beide Fundstellen-Paare behalten damit
ihre Aussage, statt sie einer Vereinheitlichung zu opfern.

Die Glyphe `⌄` ist verschwunden. Der Pfad liegt symmetrisch um die Kastenmitte
(12/12), womit die Drehung ihn nicht mehr verschiebt — der eigentliche Grund,
warum die StockInfo-Schublade am Anfang schief aussah, und die Eigenschaft, die
Zeile #4 rechnerisch belegt.

Die Rückkehr der Kopien ist in StockPortfolio als Test verankert
(`tests/caretUsage.spec.ts`), nicht als einmaliger `grep`: Er sucht den
Pfeil-Pfad per Muster und prüft gegen, dass `UxCaret` vorkommt. In StockInfo
entfiel die lokale `RowCaret.vue` ersatzlos, dort gibt es nichts mehr zu
bewachen.

**Zeilen #7 und #8 hat die KI nie gesehen** (`➖`) — das Dashboard zeigte den
Leerzustand, und Beispieldaten zu laden hätte die Depotdaten verändert. Sie sind
vom Menschen abgenommen, ebenso #9. Das bleibt so stehen: Die KI-Spalte
behauptet nicht nachträglich, was sie nicht geprüft hat.

**Commits:**

| Repo | Commit | |
|---|---|---|
| ux-foundation | `e904b68` | `feat(components)`: UxCaret — ein Pfeil für alles Aufklappbare |
| StockInfo | `d913827` | `refactor(dashboard)`: Pfeil und Erklärzeichen kommen aus dem Fundament |
| StockPortfolio | `60316f0` | `refactor(ui)`: Pfeile kommen aus dem Fundament statt dreimal von Hand |

Ausgeliefert mit **0.3.0**; beide Apps hängen inzwischen an einer neueren
Fassung (StockInfo 0.4.0, StockPortfolio 0.5.0), der Weg ins Ziel ist also
gegangen.
