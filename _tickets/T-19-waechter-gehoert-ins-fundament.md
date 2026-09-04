# T-19 · Der Wächter gehört ins Fundament

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (Deliverable) + StockPortfolio (Folgeticket) | ready | ~2 h | `src/` **wird erweitert** — neue öffentliche Fläche | — |

**Löst:** Zwei Apps führen denselben Wächter gegen direkten `localStorage`-Zugriff
— StockPortfolio seit Längerem, ux-foundation seit T-18. Die Repo-Regel ist
eindeutig: Sobald eine zweite App dasselbe braucht, zieht es um, nicht beim
dritten Mal.

<!--
  Repo:     ux-foundation (Deliverable). StockPortfolio zieht in einem eigenen Ticket nach.
  Status:   ready | in-progress | blocked | done
  Scope:    Erweitert die ausgelieferte Fläche des Pakets um einen Test-Einstiegspunkt.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ bestätigt mit Einschränkung (Fußnote) ·
◑ teilweise (Fußnote) · ➖ keine Live-Verifikation (nur Unit/Review).
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make test` · `make typecheck` · `make lint` · `npm run build` | alle vier grün, Exit-Codes einzeln geprüft | ✅¹ | |
| 2 | `src/eslint/index.js` + `index.d.ts` | der Runtime-Export ist **JavaScript**, die Typen liegen daneben | ➖² | |
| 3 | `package.json` | `./eslint` mit `types`/`default`; **keine** neuen Abhängigkeiten | ➖³ | |
| 4 | `eslint.config.js` | das Repo bewacht sich über `make lint`; die Ausnahme läuft über `ignores`, nicht über abgeschaltete Regeln | ➖⁴ | |
| 5 | vier Skript-Mutanten + Template-Mutant gegen `npx eslint` | jeder wird gemeldet, mit Datei und Zeile | ✅⁵ | |
| 6 | `src/composables/safeStorage.ts` gegen `npx eslint` | **kein** Fund — die Ausnahme greift | ✅⁵ | |
| 7 | `npm pack --dry-run` | beide Dateien liegen im Tarball | ✅⁶ | |
| 8 | `tests/restrictedGlobals.spec.ts` | die erzeugten Regeln finden und übersehen am echten Linter, was sie sollen | ✅⁷ | |
| 9 | Selbstimport unter **Node 20 und Node 26** | der veröffentlichte Subpath lädt in **beiden** | ✅⁸ | |
| 10 | derselbe Test, Abschnitt „Mehrere Sperren" | zwei Sperren in einem Aufruf verlieren einander nicht | ✅⁹ | |
| 11 | derselbe Test, `Reflect.apply` / `Object.assign` / `Object.is` | **kein** Fund — dort ist Argument 2 kein Eigenschaftsname | ✅¹⁰ | |

> ¹ **(CC):** 24 Dateien / 710 Tests, Exit-Codes einzeln geprüft:
> `test:0 typecheck:0 lint:0 build:0`.
>
> ² **(CC):** gelesen. Der Grund steht im Kopf der Datei: Eine
> `eslint.config.js` lädt Node direkt, und ältere Fassungen führen kein
> TypeScript aus.
>
> ³ **(CC):** gelesen: `"./eslint": { "types": …d.ts, "default": …js }`. Es
> kommt keine Abhängigkeit dazu — der Helfer gibt Daten zurück und importiert
> nichts.
>
> ⁴ **(CC):** gelesen — zwei Regelblöcke (Skripte, SFC) und `ignores` für den
> geschützten Zugang. **Kein** `allowDirectGlobal` mehr: Das schaltete drei
> ESLint-Regeln vollständig ab und hätte auch Einschränkungen getroffen, die
> eine App unabhängig gesetzt hat.
>
> ⁵ **(CC):** alle fünf Mutanten ausgeführt, nicht behauptet — Punktnotation,
> Klammernotation, `Reflect.get`, `Reflect.deleteProperty`, Template. Jeder
> ergibt genau einen Fund; der Template-Mutant erscheint als
> `App.vue:141:25 … vue/no-restricted-syntax`. `safeStorage.ts` bleibt im selben
> Lauf ohne Fund. Danach über `git checkout --` zurückgenommen, Arbeitsbaum
> sauber. **Ein erster Durchlauf meldete fälschlich null Funde** — mein
> `grep`-Muster übersah die Backticks in der Meldung. Der Wächter war in
> Ordnung, meine Prüfung nicht.
>
> ⁶ **(CC):** `npm pack --dry-run` listet `src/eslint/index.js` (5.1 kB) und
> `src/eslint/index.d.ts` (1.3 kB); 29 Dateien insgesamt.
>
> ⁷ **(CC):** 34 Fälle über den echten Linter — darunter die drei Fehlalarme
> aus Runde 2: `Reflect.get(config, …)`, `Object.defineProperty(config, …)` und
> ein anderer Eigenschaftsname melden jetzt **nichts**. Der Test stellt zudem
> sicher, dass keine Meldung ohne Regel-Kennung durchgeht; ein Parse-Fehler
> zählte sonst als Fund.
>
> ⁸ **(CC):** unter `/opt/homebrew/Cellar/node@20/20.20.2/bin/node` **und**
> unter Node 26.8.1 ausgeführt, beide über Nodes Selbstreferenz. Vor dem Umbau
> war der Import unter Node 20 mit `ERR_UNKNOWN_FILE_EXTENSION: .ts`
> abgebrochen — meine Zeile in Runde 2 war nur wegen der lokalen Fassung grün.
>
> ⁹ **(CC):** `noDirectGlobals([storage, fetch])` meldet beide. Vor dem Umbau
> überschrieb ein zweiter Aufruf den ersten still, und die Speicher-Sperre war
> weg.
>
> ¹⁰ **(CC):** die drei Fehlalarme aus Runde 3, nachgestellt und behoben. Der
> Selektor prüft jetzt zusätzlich die **Methode**; neun positive Signaturen
> stehen als Gegenstück daneben, von `Reflect.get` bis `Object.hasOwn`.

### Kurz-Testblock

```bash
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation"
make test        # #1, #8, #10
make typecheck   # #1
make lint        # #1, #4 — hier läuft der Wächter
npm run build    # #1
```

Für **#6** — was landet wirklich im Paket:

```bash
npm pack --dry-run 2>&1 | grep eslint          # #7
```

Für **#9** unter **beiden** Node-Fassungen — die neuere allein beweist nichts:

```bash
node --input-type=module \
  -e "console.log(Object.keys(await import('@mmit/ux-foundation/eslint')))"
/opt/homebrew/Cellar/node@20/20.20.2/bin/node --input-type=module \
  -e "console.log(Object.keys(await import('@mmit/ux-foundation/eslint')))"
```

Für **#5** und **#6** von Hand: einen Zugriff in `useTheme.ts` einbauen,
`npx eslint showcase/src/composables/useTheme.ts --no-cache` laufen lassen,
danach `git checkout --`. `npx eslint src/composables/safeStorage.ts` muss
stumm bleiben.

---

## Details

### Kontext / Ziel

Der Wächter aus T-18 entstand über **acht nachgewiesene Umgehungen**: Textsuche
gegen Parser, übersprungene Vue-Templates, der Name als Zeichenkette in
Klammernotation, `Reflect.get`. Er lag als Testdatei im Schaufenster.

StockPortfolio hat denselben Test — und zwar in der **naiven** Fassung, die T-18
widerlegt hat:

```ts
/localStorage\s*\??\.\s*(getItem|setItem|removeItem|clear|key)/
```

Der findet nur Methodenaufrufe. Durch fallen `window.localStorage ?? null`
(ausgerechnet der Fall, der in der Regelbegründung steht), `window['localStorage']`,
`Reflect.get(window, 'localStorage')`, `const { localStorage } = window` und
`localStorage.length`. Sein Kommentar-Filter verwirft zudem nur Zeilen, die mit
`//`, `*` oder `/*` **beginnen**.

Es geht also nicht um Aufräumen, sondern darum, dass eine App einen Wächter
führt, der zu wenig findet, während nebenan der gehärtete liegt.

### Runde 1 nahm den falschen Weg — und das ist der Kern dieses Tickets

Die erste Fassung war ein eigener Scanner: Dateibaum ablaufen, mit dem
TypeScript-Parser lesen, Vue-Templates selbst traversieren, Fundstellen
formatieren. Codex hat das in Runde 1 grundsätzlich zurückgewiesen, und die
Gegenprobe gibt ihm recht.

**Der entscheidende Fall ist die Sichtbarkeit.** Ein Prüfer, der nur den
Syntaxbaum liest, kennt keine Bindungen:

```ts
function load(localStorage: Storage) {
  return localStorage.getItem('k')   // kein globaler Zugriff — trotzdem gemeldet
}
```

Das ist nicht ein Loch neben anderen, sondern zeigt, dass die API etwas anderes
tat, als ihr Name versprach: Sie fand **Namensvorkommen**, keine Globalzugriffe.
Dazu kamen Fehlalarme auf reinen Typknoten und Objektschlüsseln, still
übersprungene Dateiendungen (`.js`, `.tsx`, `.mts`) und eine unvollständige
Liste statischer Zugriffsformen — `Reflect.deleteProperty` fehlte.

**Gemessen gegen ESLint**, gleiche Fallmatrix, beide Richtungen:

| Fall | ESLint | Scanner aus Runde 1 |
|---|---|---|
| `window['localStorage']` | Fund | Fund |
| Destrukturierung | Fund | Fund |
| `Reflect.deleteProperty` | Fund | **übersehen** |
| `function load(localStorage)` | kein Fund | **Fehlalarm** |
| `interface O { localStorage: boolean }` | kein Fund | **Fehlalarm** |
| `{ localStorage: false }` | kein Fund | **Fehlalarm** |

ESLint kann das, weil es eine Sichtbarkeitsanalyse hat. Die nachzubauen wäre
kein Detail, sondern ein zweiter Linter — und beide Repos führen bereits einen.

### Was jetzt ausgeliefert wird

Kein Prüfer, sondern **Konfiguration**: zwei Funktionen, die `rules`-Objekte für
die Regeln zurückgeben, die ESLint mitbringt.

| Funktion | Wofür |
|---|---|
| `noDirectGlobals` | Skripte — `no-restricted-globals`, `no-restricted-properties`, Selektoren für `Reflect`/`Object` |
| `noDirectGlobalsInTemplates` | Vue-Templates über `vue/no-restricted-syntax`; die Kernregeln greifen dort nicht |

Beide nehmen die **vollständige Liste** der Sperren entgegen. Das ist kein
Geschmack, sondern nötig: Die Funktionen belegen feste Regel-Kennungen, und zwei
Aufrufe nebeneinander überschrieben einander — die erste Sperre verschwand
lautlos.

Eine Datei vom Verbot auszunehmen geschieht über `ignores` im
Konfigurationsblock, **nicht** über abgeschaltete Regeln. Der frühere
`allowDirectGlobal`-Weg setzte drei ESLint-Regeln auf `off` und traf damit auch
Einschränkungen, die eine App unabhängig gesetzt hatte.

### Runde 2 hatte drei Löcher im Vertrag

Der Ansatz stimmte, die Umsetzung nicht. Alle drei sind nachgestellt worden:

1. **Der Export lief nur auf meiner Node-Fassung.** `exports` zeigte auf eine
   `.ts`-Datei; Node führt TypeScript erst ab Fassung 22 aus. Unter Node 20 —
   lokal vorhanden — brach der Import mit `ERR_UNKNOWN_FILE_EXTENSION` ab. Und
   eine `eslint.config.js` lädt **Node**, nicht ein Bündler. Ausgeliefert wird
   jetzt JavaScript, die Typen liegen daneben.
2. **Die statischen Selektoren prüften nur die Zeichenkette.**
   `Reflect.get(config, 'localStorage')` schlug an, obwohl `config` ein
   beliebiger lokaler Wert ist. Der Selektor prüft jetzt **beide**
   Argumentpositionen — erstes Argument das Wirtsobjekt, zweites die
   Zeichenkette.
3. **Die Konfiguration war nicht komponierbar.** Zwei Sperren nebeneinander
   überschrieben sich; die Ausnahme schaltete fremde Regeln mit ab.

### Die Grenzen, benannt statt behauptet

- **Nur der nackte Name wird über die Sichtbarkeit aufgelöst.** Ein lokal
  überdecktes *Wirtsobjekt* — `function read(window) { return window.x }` —
  meldet ESLint weiterhin, weil `no-restricted-properties` syntaktisch
  arbeitet. Das steht im Kopf des Moduls und ist **nicht** als Test
  festgeschrieben: Ein `toBe(1)` darauf machte die Schwäche zum Vertrag, ein
  `toBe(0)` wäre schlicht falsch. Das Akzeptanzkriterium sagt deshalb
  ausdrücklich „überdeckter **nackter** Globalname" — es darf die Grenze nicht
  gleichzeitig ausschließen und versprechen.
- **Ob Argument 2 ein Eigenschaftsname ist, entscheidet die Methode.** Der
  Selektor führt die Methoden deshalb auf. Das ist keine verfallende Kopie,
  sondern die Semantik der fremden API: `Reflect.apply` übergibt dort den
  `this`-Wert, `Object.assign` eine Quelle, `Object.is` einen Vergleichswert.
- **Ein zur Laufzeit zusammengesetzter Schlüssel** (`window['local' + 'Storage']`)
  wird nicht gefunden.
- **`no-restricted-syntax` ist eine geteilte Regel-Kennung.** Nutzt die App sie
  selbst, muss sie ihre Einträge mit den erzeugten zusammenführen — das gilt für
  jedes `rules`-Objekt und steht in der Moduldokumentation.

### Akzeptanzkriterien

- [x] Die Sperre liegt unter `src/eslint/` und wird über `./eslint` exportiert
- [x] Der Runtime-Export ist **ausführbares JavaScript**; der Subpath lädt unter
      Node 20 **und** Node 26
- [x] **Keine** neuen Abhängigkeiten — weder Peer noch Dev
- [x] Erkannt werden nackter Name, Punkt- und Klammernotation, Destrukturierung,
      Template-Ausdrücke und die statischen Formen, **deren zweites Argument ein
      Eigenschaftsname ist** (`Reflect.get`, `Object.defineProperty`, …), am
      Wirtsobjekt
- [x] **Nicht** erkannt werden: der überdeckte **nackte** Globalname, Typknoten,
      Objektschlüssel, Zeichenketten, Kommentare, statische Formen an lokalen
      Werten und Methoden, bei denen Argument 2 kein Eigenschaftsname ist
      (`Reflect.apply`, `Object.assign`, `Object.is`)
- [ ] **Ausdrücklich nicht zugesagt:** ein überdecktes *Wirtsobjekt*
      (`function read(window) { … }`) wird weiterhin gemeldet — siehe „Die
      Grenzen"; das Kriterium darüber gilt nur für den nackten Namen
- [x] Mehrere Sperren in einem Aufruf verlieren einander nicht; die Ausnahme
      läuft über `ignores` und schaltet keine fremden Regeln ab
- [x] Das Repo bewacht sich selbst über `make lint`
- [x] Die erzeugten Regeln sind am echten Linter geprüft

### Nicht in diesem Ticket

**StockPortfolio zieht nicht hier um.** Das Deliverable liegt in
`ux-foundation`; die Umstellung der anderen App ist ihr eigenes Ticket in ihrem
eigenen Repo — so will es die Regel „ein Ticket lebt dort, wo das Deliverable
liegt". Dieses Ticket macht den Umzug nur möglich.

### Side-Effects

**Erstmals in dieser Ticketreihe betroffen: die ausgelieferte Fläche.** Bisher
galt „`src/` bleibt unberührt"; hier kommt bewusst etwas hinzu. Jede einbindende
App sieht den neuen Einstiegspunkt `./eslint`. Sie muss ihn nicht nutzen, aber
er ist Teil der öffentlichen Zusage und kann nicht mehr stillschweigend
verschwinden.

**Was hier ausdrücklich *nicht* passiert**, obwohl Runde 1 es vorsah: Es kommt
keine Abhängigkeit dazu. Der Helfer gibt Daten zurück und importiert nichts —
weder `typescript` noch `@vue/compiler-sfc`, weder als Peer noch als
Dev-Abhängigkeit. Der Punkt, an dem dieses Ticket einer App hätte wehtun können,
ist damit ersatzlos entfallen.

### Der Branch hängt an T-18

`t-19-…` ist von `t-18-…` abgezweigt, nicht von `master`: Der gehärtete Wächter
entstand dort und ist noch nicht integriert. Ein Merge von T-19 bringt beide
mit. Das ist eine bewusste Stapelung und keine Nachlässigkeit — die
Integrationsentscheidung für T-18 gehört Mike und wird hier nicht vorweggenommen.

### Auflösung

`ux-foundation` — Handoff-Commit siehe `STATUS.md`. `make test` 24 Dateien /
710 Tests, dazu `typecheck`, `lint` und `npm run build`; Exit-Codes einzeln
geprüft (`0/0/0/0`).

Live geprüft sind **#1**, **#5** bis **#11**. **#2 bis #4** sind Lesen, also
`➖`.

**Das Ergebnis ist kleiner als beide Vorentwürfe und kann mehr.** Aus einem
Modul mit Dateisuche, Parser und zwei Abhängigkeiten wurden zwei Funktionen, die
Konfiguration zurückgeben — ohne eine einzige neue Abhängigkeit, lauffähig auf
der ältesten zugesagten Node-Fassung, und mit einer Fehlalarmklasse weniger als
in Runde 2.
