# ux-foundation

Gemeinsames Fundament der Oberflächen — Farb-Token, Skalen, Reset, Schriften,
Symbole und die Naive-UI-Brücke.

## Übersicht

- [Wofür das Paket da ist](#wofür-das-paket-da-ist)
- [Einbinden](#einbinden)
- [Was drin ist](#was-drin-ist)
- [Schaufenster](#schaufenster)
- [Themes prüfen](#themes-prüfen)
- [Veröffentlichen](#veröffentlichen)

---

## Wofür das Paket da ist

Hier liegt, was **kein Urteil enthält** und deshalb in keiner App ein zweites
Mal entstehen darf: die Farbpaletten, die Skalen, der Reset, die
Schrifteinbindung, die wiederkehrenden Navigationssymbole und die Brücke, die
aus den Token die Naive-UI-Overrides baut.

Der Anlass war konkret. Dieselben Werte lagen als Prosa in einem Skill und
wurden von jeder App nachgebaut — und alles, was nachgebaut wird, zieht ein
Ticket, einen Plan, ein Review und neue Fehler nach sich. Beim ersten Messen
verfehlten **neun** Paletten die eigene Kontrastregel, und die
Referenz war von der geprüften Datei weggelaufen, während beide dieselbe Zahl
behaupteten.

**Was hier ausdrücklich nicht liegt: Entscheidungen.** Warum die Einstellungen
links stehen, warum es keinen Hamburger gibt, wie sich ein Dialog verhält — das
steht im `ux-standards`-Skill und braucht einen Menschen, der es liest.

[↑ Übersicht](#übersicht)

---

## Einbinden

```bash
npm i @mikemitterer/ux-foundation
```

Stylesheets einzeln importieren, damit eine App auch nur Teile übernehmen kann.
Die Reihenfolge ist nicht beliebig — Schriften und Token zuerst, dann der
Reset:

```ts
// main.ts
import '@mikemitterer/ux-foundation/styles/fonts.css'
import '@mikemitterer/ux-foundation/styles/tokens.css'
import '@mikemitterer/ux-foundation/styles/reset.css'
```

Die SCSS-Helfer (`token()`, `up()`, `below()`, `muted()`, `truncate`,
`stack()`, `row()`, `trend`, `card-surface`) stehen über die Vite-Konfiguration
in jeder Komponente zur Verfügung:

```ts
// vite.config.ts
css: {
  preprocessorOptions: {
    scss: { additionalData: '@use "@mikemitterer/ux-foundation/styles/shared" as *;\n' },
  },
},
```

Das Paket liefert **Quellen aus, kein Bündel** — `.ts`, `.vue`, `.scss` direkt.
Für Vite-Apps ist das der bequemere Weg: kein Build-Schritt hier, und der
Typecheck der App prüft das Fundament gleich mit. Dafür braucht es eine Zeile,
sonst versucht Vite das Paket vorzubündeln und stolpert über die
`.vue`-Dateien:

```ts
optimizeDeps: { exclude: ['@mikemitterer/ux-foundation'] },
```

Naive UI ist eine **optionale** Peer-Dependency. Wer die Brücke nicht braucht,
installiert es nicht und importiert `buildNaiveOverrides` nicht.

[↑ Übersicht](#übersicht)

---

## Was drin ist

| Pfad | Inhalt |
|---|---|
| `src/styles/tokens.css` | die Paletten — `THEME_IDS` führt sie —, Skalen, Marken-Token |
| `src/styles/reset.css` | ersetzt Tailwinds Preflight — knapp gehalten, damit Naive UI nicht streitet |
| `src/styles/fonts.css` | Inter und Space Grotesk, variabel, nur `latin` |
| `src/styles/_shared.scss` | Mixins und Farb-Helfer; erzeugt selbst **kein** CSS |
| `src/theme/themes.ts` | `THEME_IDS`, `THEMES`, `isThemeId`, Vorgaben |
| `src/theme/naive.ts` | Token → `GlobalThemeOverrides` |
| `src/icons/` | die wiederkehrenden Navigationssymbole |
| `src/components/` | Rahmen, Kopf- und Statuszeile, Menüpunkt, Theme-Auswahl, Erklärung am Begriff, Zahl im Fließtext |
| `src/composables/` | Umschaltpunkte, Sprach-Erkennung, Speicher-Zugriff, Meldungen, relative Zeit |

Was davon nach außen geht, steht in `src/index.ts` — die Liste dort ist die
Auslieferung, nicht diese Tabelle.

**Zur Richtung der Naive-Brücke:** Die Token sind die Quelle, Naive UI der
Verbraucher — nicht umgekehrt. `useThemeVars()` funktioniert nur innerhalb
einer Vue-Setup-Funktion und erreicht nur Naive-Komponenten; eigene SFCs,
globale Stylesheets und das Prüfskript kommen nicht daran. Dass die Brücke zur
Laufzeit per `getComputedStyle` liest, ist erzwungen: Naive berechnet Hover-
und Pressed-Zustände selbst aus der Grundfarbe und braucht dafür einen
konkreten Wert — ein `var(--accent)` kann es nicht auflösen.

[↑ Übersicht](#übersicht)

---

## Schaufenster

Eine kleine App unter `showcase/` zeigt alles, was das Paket mitbringt, und
färbt es beim Theme-Wechsel gleichzeitig um. Genau darin liegt ihr Nutzen: Ein
Fehler in einer Palette fällt hier in Sekunden auf, in einer echten App erst
Wochen später.

```bash
make setup     # Symlinks + Abhängigkeiten
make dev       # http://localhost:5177
```

Sie ist Werkzeug, kein Bestandteil der Auslieferung — `files` in der
`package.json` enthält nur `src/`.

[↑ Übersicht](#übersicht)

---

## Themes prüfen

```bash
make check-themes
```

Misst jede Palette gegen die Grenzwerte und liefert Exit-Code 1, sobald einer
reißt. Zwei weitere Unterbefehle laufen selten und haben deshalb **kein**
Make-Target — sie haben eine eigene Kommandozeile:

```bash
python3 scripts/theme-tokens.py --help
python3 scripts/theme-tokens.py repair src/styles/tokens.css     # Probelauf
python3 scripts/theme-tokens.py export src/styles/tokens.css     # alle Paletten lesen
```

`build` und `repair` lösen absichtlich verschieden: Beim Erzeugen werden beide
leisen Textstufen gegen die hellste Fläche gelöst (6:1 und 4.5:1), beim
Reparieren steht `--text-secondary` schon fest und nur `--text-muted` bewegt
sich. Gegen `--surface-raised` zu lösen würde die beiden Stufen dort
ineinanderlaufen lassen — gemessen auf acht Prozent Abstand bei `forest` und
rund vier bei `slate`.

[↑ Übersicht](#übersicht)

---

## Veröffentlichen

Private Registry, deshalb `access: restricted` in der `package.json`. Ohne die
Angabe legt npm bei einem `@scope` standardmäßig ein **öffentliches** Paket an.

```bash
make publish-dry              # zeigt, was hochginge
make publish CONFIRM=yes
```

**Beim Einbinden in einen Docker-Build:** Das Registry-Token gehört über einen
BuildKit-Secret-Mount hinein, **nie** als `ARG` oder `ENV` — sonst steht es für
immer in einem Image-Layer, auch wenn eine spätere Zeile es löscht.

[↑ Übersicht](#übersicht)
