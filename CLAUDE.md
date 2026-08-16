# Arbeiten an diesem Repo

Das hier ist ein **Paket, keine App**. Was hinzukommt, landet in jeder App, die
es einbindet — und was fehlerhaft ist, ebenso.

## Drei Orte, drei Zuständigkeiten

Der wichtigste Satz dieser Datei, weil das Auseinanderlaufen genau hier beginnt:

| Ort | Hält | Hält **nicht** |
|---|---|---|
| **Der Code hier** | Werte und urteilsfreie Mechanik — Farb-Token, Skalen, Reset, Schriften, Symbole, Komponenten, Composables | Begründungen für Gestaltungsregeln |
| **Skill `ux-standards`** | Urteile — warum die Einstellungen links stehen, warum kein Hamburger, warum kein Gewicht 700 | Zahlen, Token-Listen, API-Namen |
| **Diese Datei** | nur, was für die Arbeit **an diesem Repo** gilt | alles, was schon in einem der beiden steht |

Daraus folgen zwei Regeln, die beim Schreiben von Kommentaren und Doku gelten:

- **Keine Zahl zweimal.** Ein Kommentar, der „die sechs Themes" sagt, ist beim
  siebten falsch — und war es hier zwischenzeitlich, bei dreizehn. Wo eine Zahl
  nötig scheint, verweise auf die Stelle, die sie führt (`THEME_IDS`).
- **Keine Regel zweimal.** Steht sie im Skill, wird sie hier nicht wiederholt,
  sondern höchstens benannt. Zwei Fassungen derselben Regel driften.

## Was ins Paket darf

Zwei Bedingungen, beide müssen erfüllt sein:

1. **Es enthält kein Urteil.** Ein Wert, ein Mechanismus, eine Form — keine
   Entscheidung darüber, wie eine App zu bedienen sein soll. Entscheidungen
   gehören in den Skill und brauchen einen Menschen, der sie liest.
2. **Es kennt die App nicht.** Keine Stores, kein `useI18n()`, kein Router.
   Sichtbare Texte kommen als Prop herein — ein Paket hat keinen Katalog, und
   ein fest verdrahtetes Wort ist in der zweiten Sprache sofort falsch.

Was nur **eine** App braucht, bleibt dort. Sobald eine zweite dasselbe braucht,
zieht es um — nicht beim dritten Mal.

## Befehle

```bash
make dev            # Schaufenster, Port 5177
make test           # Vitest
make typecheck      # vue-tsc über Fundament und Schaufenster
make lint
make check-themes   # alle Paletten gegen die Grenzwerte, Exit-Code 1 bei Verstoß
make help           # der Rest
```

Das Schaufenster unter `showcase/` ist **Werkzeug, kein Bestandteil der
Auslieferung** (`files` in der `package.json` enthält nur `src/`). Sein Nutzen:
Ein Fehler in einer Palette fällt dort in Sekunden auf, in einer echten App erst
Wochen später. Wer etwas hinzufügt, zeigt es dort.

## Tests halten die Quellen zusammen

Dieses Repo führt bewusst ein paar Tests, die keinen Code prüfen, sondern
**Übereinstimmung** — sie sind der Ersatz für Disziplin:

- `tests/themes.spec.ts` — `THEME_IDS` gegen `styles/tokens.css`, samt der
  Token, die jedes Theme setzen muss.
- `tests/breakpoints.spec.ts` — `BREAKPOINTS` gegen die `$bp-*` in
  `styles/_shared.scss`. Beide Quellen sind unvermeidlich, SCSS kann kein
  TypeScript lesen; auseinanderlaufen dürfen sie trotzdem nicht.

**Wer eine zweite Quelle anlegt, legt im selben Zug den Test dazu.** Ohne ihn
ist es keine Spiegelung, sondern eine Kopie mit Verfallsdatum. Das gilt auch für
`references/themes.md` im Skill: erzeugt mit `theme-tokens.py export`, niemals
von Hand — bei Abweichung gilt `tokens.css`.

## Fallen in diesem Repo

- **`import.meta.url` in Tests wirft.** Sie laufen unter `happy-dom`, dort ist
  die Modul-Adresse keine Datei-URL. Dateien über `process.cwd()` auflösen.
- **Das Paket liefert Quellen aus, kein Bündel.** Deshalb braucht jede
  einbindende App `optimizeDeps: { exclude: [...] }` — sonst versucht Vite
  vorzubündeln und stolpert über die `.vue`-Dateien.
- **`_shared.scss` darf kein CSS erzeugen.** Es wird über `additionalData` in
  jede Komponente eingespielt; jede Regel darin läge sonst einmal je Komponente
  im Bündel.
- **Naive UI ist eine optionale Peer-Dependency.** Wer die Brücke nicht braucht,
  installiert es nicht — Code hier darf das nicht voraussetzen.
- **Die Token sind die Quelle, Naive UI der Verbraucher.** Nie umgekehrt.

## Veröffentlichen

Private Registry, deshalb `access: restricted` in der `package.json` — ohne die
Angabe legt npm bei einem `@scope` standardmäßig ein **öffentliches** Paket an.

Ein Registry-Token gehört in einem Docker-Build über einen
BuildKit-Secret-Mount hinein, **nie** als `ARG` oder `ENV`: Sonst steht es für
immer in einem Image-Layer, auch wenn eine spätere Zeile es löscht.
