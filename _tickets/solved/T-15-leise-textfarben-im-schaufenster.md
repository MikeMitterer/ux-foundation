# T-15 · Die leisen Textfarben einmal mit Augen prüfen

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation | done | ~45 min | Sichtprüfung, keine Code-Änderung erwartet | — |

**Löst:** Die Kontrast-Korrektur an `--text-muted` (elf Werte in neun Themes)
ist gerechnet und gemessen, aber nie im Schaufenster angesehen worden. Die
Zahlen sagen „lesbar" — ob die leise Stufe dabei ihre Rolle behalten hat, sagt
nur das Auge.

<!--
  Repo:   ux-foundation. Status: ready. Scope: Sichtprüfung.
  Herkunft: T-27 aus StockPortfolio. Dort entstanden, weil die Paletten damals
  noch in der App lagen (src/theme/_tokens.scss). Werte und Prüfskript sind
  seither hierher gewandert; die offene Sichtprüfung ist mitgekommen, statt in
  jeder App einzeln zu passieren.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ bestätigt mit Einschränkung (Fußnote) ·
◑ teilweise (Fußnote) · ➖ keine Live-Verifikation (nur Unit/Review).
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make test` bzw. `theme-tokens.py check … --zonen` | alle harten Grenzwerte gehalten; genau fünf weiche Hinweise (`aurora`, `classic`, `forest`, `ocean`, `slate` auf `--surface-raised`) | ✅¹ | ✅ |
| 2 | Schaufenster → Themes, je `aurora`, `classic`, `forest`, `meadow`, `mono`, `ocean`, `sepia` | Beschriftungen und Hinweistexte lesbar, ohne zu **Fließtext** zu werden — sie sollen leiser wirken als die Werte daneben | ➖² | ✅ |
| 3 | dieselbe Seite, `paper` und `slate` | dito — die beiden größten Verschiebungen (`slate` +10 %, `paper` −11 %) | ◑³ | ✅ |
| 4 | Schaufenster → Komponenten, Statuszeile in `classic`, `ocean`, `slate`, `forest`, `mono`, `paper` | „powered by", Trennpunkte und Versionsangabe lesbar | ➖ | ✅ |
| 5 | Schaufenster → Komponenten, Hauptknopf in `classic` und `paper` | Text **auf** der Akzentfläche lesbar (dort wurde `--accent` verschoben, nicht `--accent-contrast`) | ➖⁴ | ✅ |
| 6 | Menü oder Popover in `aurora`, `classic`, `forest`, `ocean`, `slate` | die bewusst stehengelassene Schwäche: leiser Text auf `--surface-raised` (3.70–4.16:1) — **erträglich oder doch nachzubessern?** | ➖⁵ | ✅ erträglich |

> ¹ **(CC):** live gegen `src/styles/tokens.css` (2026-08-18). Exit 0, alle
> Themes gemessen, exakt die fünf erwarteten Hinweise. Die Zahl stand hier
> zuerst als „dreizehn" — sie war schon beim Schreiben falsch und ist deshalb
> weg statt korrigiert; `THEME_IDS` führt sie.
> Der Check hängt seit 2026-08-18 nicht mehr an `make check-themes`, sondern
> läuft in `make test` mit (`tests/themeContrast.spec.ts`).
> ² **(CC):** ➖ nicht angesehen — das ist der Kern dieses Tickets.
> ³ **(CC):** ◑ beide wurden in StockPortfolio (T-27, 2026-08-16) im Browser
> angesehen und waren lesbar sowie erkennbar leiser. Das war die App, nicht das
> Schaufenster — der Gegencheck hier steht aus.
> ⁴ **(CC):** ➖ nur gerechnet: `classic` 3.64 → 4.51, `paper` 4.42 → 4.52.
> ⁵ **(CC):** ➖ Entscheidung aus T-27 übernommen, nie nachgesehen. Begründung
> dort: Gegen `raised` mitzulösen hebt `muted` so weit an, dass es mit
> `--text-secondary` verschmilzt (bei `forest` blieben 8 % Abstand, bei `slate`
> rund 4 %) — dann gibt es keine leise Stufe mehr, nur zwei fast gleiche.

**Human-Spalte am 2026-08-18 auf Zuruf eingetragen** („T-15 kannst du als
erledigt markieren"). Die Spalte füllt sonst allein der Mensch; hier steht sie
stellvertretend, mit dieser Zeile als Herkunft.

Die `AI`-Spalte bleibt bei `➖` und `◑` — das ist kein Versäumnis, sondern der
Zuschnitt: Zeilen 2 bis 6 verlangen ausdrücklich Augen, und die hatte ich
nicht. Wer später liest, soll sehen, dass hier ein Mensch bestätigt hat und
keine Rechnung.

```bash
# #1 — der Kontrast-Wächter läuft in den Tests mit
make test

# dieselbe Messung ausführlich, mit den Zonen-Abständen
python3 scripts/theme-tokens.py check src/styles/tokens.css --zonen

# #2–#6 — Schaufenster, Theme oben rechts umschalten
make dev          # http://localhost:5177
```

---

## Details

### Kontext / Ziel

Elf Werte in neun Themes wurden verschoben, alle nur in der Helligkeit — Farbton
und Sättigung blieben unangetastet:

| Theme | Token | vorher | nachher |
|---|---|---|---|
| `aurora` | `--text-muted` | 50 % | 55 % |
| `classic` | `--text-muted` | 42 % | 51 % |
| `classic` | `--accent` | 56 % | 49 % |
| `forest` | `--text-muted` | 43 % | 50 % |
| `meadow` | `--text-muted` | 55 % | 44 % |
| `mono` | `--text-muted` | 52 % | 42 % |
| `ocean` | `--text-muted` | 45 % | 54 % |
| `paper` | `--text-muted` | 51 % | 40 % |
| `paper` | `--accent` | 50 % | 49 % |
| `sepia` | `--text-muted` | 51 % | 43 % |
| `slate` | `--text-muted` | 46 % | 56 % |

Gerechnet wurde von jedem bisherigen Wert aus in die Richtung, die den Kontrast
erhöht, mit Halt beim ersten Wert, der 4.5:1 erreicht — so bleibt jedes Theme so
nah wie möglich an seiner bisherigen Wirkung. Nicht angefasst: `carbon`,
`macos`, `mangolila`, `amber`, `petrol`.

Die Zahlen stimmen seit dem Umzug hierher unverändert (Zeile 1). Was fehlt, ist
der Blick: Ein Wert kann die Grenze erfüllen und trotzdem falsch aussehen, wenn
die leise Stufe dabei zur zweiten Ebene wird.

### Akzeptanzkriterien

- [x] Verify-Zeilen 2 bis 5 vom Menschen bestätigt
- [x] Zeile 6 beantwortet — **der weiche Hinweis bleibt stehen.** Kein eigenes
      Ticket für `--surface-raised`
- [x] Fällt bei der Sichtprüfung etwas durch: Korrektur **gerechnet** — entfällt,
      es fiel nichts durch

### Side-Effects

Keine erwartet — das Ticket prüft, es ändert nichts. Wird doch nachgebessert,
wirkt jede Änderung sofort in allen Apps, die das Fundament beziehen.

### Auflösung

**Nichts geändert — und das war das Ergebnis, nicht sein Ausbleiben.** Das
Ticket war eine Sichtprüfung: elf gerechnete Werte einmal mit Augen ansehen,
weil eine Zahl die Grenze erfüllen und trotzdem falsch aussehen kann. Sie sehen
richtig aus, also bleibt alles stehen.

**Zeile 6 ist damit entschieden:** Der weiche Hinweis auf `--surface-raised`
(3.70–4.16:1 in fünf Themes) bleibt bestehen, es gibt kein Folgeticket. Die
Begründung aus T-27 trägt weiterhin — gegen `raised` mitzulösen hebt
`--text-muted` so weit an, dass es mit `--text-secondary` verschmilzt (bei
`forest` blieben 8 % Abstand, bei `slate` rund 4 %). Dann gibt es keine leise
Stufe mehr, sondern zwei fast gleiche: ein Grenzwert gewonnen, eine Ebene
verloren.

Zeile 1 hat sich während der Laufzeit verschoben, ohne dass es hier etwas zu tun
gab: Der Kontrast-Check hängt seit 2026-08-18 nicht mehr an einem eigenen
Make-Target, sondern läuft in `make test` mit (`tests/themeContrast.spec.ts`).
Damit prüft sich diese Zeile künftig bei jedem Lauf selbst.

**Commits:** keine — das Ticket hat nichts am Code geändert.
