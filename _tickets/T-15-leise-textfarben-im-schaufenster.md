# T-15 · Die leisen Textfarben einmal mit Augen prüfen

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation | ready | ~45 min | Sichtprüfung, keine Code-Änderung erwartet | — |

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
| 1 | `make check-themes` | Ausgabe endet mit „Alle harten Grenzwerte eingehalten"; genau fünf weiche Hinweise (`aurora`, `classic`, `forest`, `ocean`, `slate` auf `--surface-raised`) | ✅¹ | |
| 2 | Schaufenster → Themes, je `aurora`, `classic`, `forest`, `meadow`, `mono`, `ocean`, `sepia` | Beschriftungen und Hinweistexte lesbar, ohne zu **Fließtext** zu werden — sie sollen leiser wirken als die Werte daneben | ➖² | |
| 3 | dieselbe Seite, `paper` und `slate` | dito — die beiden größten Verschiebungen (`slate` +10 %, `paper` −11 %) | ◑³ | |
| 4 | Schaufenster → Komponenten, Statuszeile in `classic`, `ocean`, `slate`, `forest`, `mono`, `paper` | „powered by", Trennpunkte und Versionsangabe lesbar | ➖ | |
| 5 | Schaufenster → Komponenten, Hauptknopf in `classic` und `paper` | Text **auf** der Akzentfläche lesbar (dort wurde `--accent` verschoben, nicht `--accent-contrast`) | ➖⁴ | |
| 6 | Menü oder Popover in `aurora`, `classic`, `forest`, `ocean`, `slate` | die bewusst stehengelassene Schwäche: leiser Text auf `--surface-raised` (3.70–4.16:1) — **erträglich oder doch nachzubessern?** | ➖⁵ | |

> ¹ **(CC):** live gegen `src/styles/tokens.css` (2026-08-18). Exit 0, dreizehn
> Themes, exakt die fünf erwarteten Hinweise.
> ² **(CC):** ➖ nicht angesehen — das ist der Kern dieses Tickets.
> ³ **(CC):** ◑ beide wurden in StockPortfolio (T-27, 2026-08-16) im Browser
> angesehen und waren lesbar sowie erkennbar leiser. Das war die App, nicht das
> Schaufenster — der Gegencheck hier steht aus.
> ⁴ **(CC):** ➖ nur gerechnet: `classic` 3.64 → 4.51, `paper` 4.42 → 4.52.
> ⁵ **(CC):** ➖ Entscheidung aus T-27 übernommen, nie nachgesehen. Begründung
> dort: Gegen `raised` mitzulösen hebt `muted` so weit an, dass es mit
> `--text-secondary` verschmilzt (bei `forest` blieben 8 % Abstand, bei `slate`
> rund 4 %) — dann gibt es keine leise Stufe mehr, nur zwei fast gleiche.

```bash
# #1 — muss „Alle harten Grenzwerte eingehalten" melden
make check-themes

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

- [ ] Verify-Zeilen 2 bis 5 vom Menschen bestätigt
- [ ] Zeile 6 beantwortet — weicher Hinweis bleibt stehen **oder** eigenes Ticket
      für `--surface-raised`
- [ ] Fällt bei der Sichtprüfung etwas durch: Korrektur **gerechnet**
      (`theme-tokens.py`), nicht als Hex-Wert getippt

### Side-Effects

Keine erwartet — das Ticket prüft, es ändert nichts. Wird doch nachgebessert,
wirkt jede Änderung sofort in allen Apps, die das Fundament beziehen.

### Auflösung

<!-- Wird zuletzt gefüllt. -->
