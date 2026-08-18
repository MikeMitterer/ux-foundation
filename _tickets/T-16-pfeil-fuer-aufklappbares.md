# T-16 · Ein Pfeil für alles Aufklappbare

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (Deliverable) + StockInfo + StockPortfolio | in-progress | ~90 min | Neue Komponente + Ablösung der vier Kopien | — |

**Löst:** Jede aufklappbare Fläche in beiden Apps zeichnet ihren eigenen Pfeil.
Vier Kopien, kein gemeinsamer Ort — und sie sind bereits auseinandergelaufen.

<!--
  Repo: ux-foundation (Deliverable). Status: in-progress.
  Herkunft: Sichtprüfung der StockInfo-Schublade (2026-08-18). Der Pfeil dort
  klebte am unteren Rand der Zeile; beim Beheben kam heraus, dass es denselben
  Pfeil noch dreimal gibt.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ bestätigt mit Einschränkung (Fußnote) ·
◑ teilweise (Fußnote) · ➖ keine Live-Verifikation (nur Unit/Review).
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make test` im Fundament | `UxCaret`-Tests grün, restliche Suite unverändert grün | | |
| 2 | `make typecheck && make lint` im Fundament | beides sauber | | |
| 3 | Schaufenster → Eigene Komponenten (`http://localhost:5177`) | beide Bewegungen zu sehen: `flip` kippt um 180°, `turn` dreht um 90° | | |
| 4 | Schaufenster, Pfeil in **beiden** Zuständen | die Form bleibt mittig im Kasten — sie wandert beim Drehen nicht nach oben oder unten | | |
| 5 | StockInfo → Assets, Tabellenzeile auf- und zuklappen | Pfeil mittig in der Zeile, gleiche Größe wie vorher | | |
| 6 | StockInfo unter `md` → Kartenliste, „mehr"/„weniger" | derselbe Pfeil wie in der Tabelle | | |
| 7 | StockPortfolio → Dashboard, KPI-Karte aufklappen | Pfeil kippt um 180°, Deckkraft und Hover wie bisher | | |
| 8 | StockPortfolio → Dashboard, Gruppenkopf und Abschnitt „Assetklassen" | Pfeil dreht zur Seite (nicht kippt), Deckkraft und Hover wie bisher | | |
| 9 | `grep -rn "chevron" src` in beiden Apps | keine handgezeichneten Pfeile mehr übrig | | |

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

<!-- Commits, wenn erledigt -->
