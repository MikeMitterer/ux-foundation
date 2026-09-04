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
| 1 | `make test` · `make typecheck` · `make lint` · `npm run build` | alle vier grün, Exit-Codes einzeln geprüft | ➖¹ | |
| 2 | `src/eslint/index.ts` | die Sperre liegt als **Konfiguration** im Paket; nichts wird selbst geprüft | ➖² | |
| 3 | `package.json` | `./eslint` steht in `exports`; **keine** neuen Peers, keine neue Dev-Abhängigkeit | ➖³ | |
| 4 | `eslint.config.js` | das Repo bewacht sich selbst über `make lint`, mit `safeStorage.ts` als einziger Ausnahme | ➖⁴ | |
| 5 | fünf Mutanten gegen `npx eslint` | jeder wird gemeldet — Punktnotation, Klammernotation, `Reflect.get`, `Reflect.deleteProperty`, Template | ✅⁵ | |
| 6 | `npm pack --dry-run` | `src/eslint/index.ts` liegt im Tarball | ✅⁶ | |
| 7 | `tests/restrictedGlobals.spec.ts` | die erzeugten Regeln finden am **echten Linter**, was sie sollen — und übersehen, was sie sollen | ✅⁷ | |
| 8 | derselbe Test, Fall „überdeckter Name" | `function load(localStorage: Storage)` ist **kein** Verstoß | ✅⁸ | |
| 9 | `node -e "await import('@mmit/ux-foundation/eslint')"` im Paketverzeichnis | der **veröffentlichte** Subpath löst über `exports` auf, nicht nur der interne Alias | ✅⁹ | |

> ¹ **(CC):** 24 Dateien / 697 Tests, Exit-Codes einzeln geprüft:
> `test:0 typecheck:0 lint:0 build:0`.
>
> ² **(CC):** gelesen. Der Helfer gibt `rules`-Objekte zurück und importiert
> nichts — deshalb braucht er keinen Peer.
>
> ³ **(CC):** gelesen: `"./eslint": "./src/eslint/index.ts"`. Die in Runde 1
> ergänzten Peers `typescript` und `@vue/compiler-sfc` sind **zurückgenommen**,
> ebenso die Dev-Abhängigkeit; `package.json` und `package-lock.json` sind
> wieder im Gleichklang.
>
> ⁴ **(CC):** gelesen — drei Blöcke: Kernregeln für `.ts`, Kernregeln **plus**
> Vue-Regel für `.vue`, und `allowDirectGlobal()` für
> `src/composables/safeStorage.ts`.
>
> ⁵ **(CC):** alle fünf ausgeführt, nicht behauptet. Jeder wird von
> `npx eslint` gemeldet; der Template-Mutant erscheint als
> `App.vue:141:25 error … vue/no-restricted-syntax`. Nach jedem Lauf über
> `git checkout --` zurückgenommen und der Arbeitsbaum als sauber geprüft.
> **`Reflect.deleteProperty` ist neu dabei** — der Scanner aus Runde 1 ließ ihn
> durch.
>
> ⁶ **(CC):** `npm pack --dry-run` listet `src/eslint/index.ts` (6.6 kB);
> 28 Dateien insgesamt.
>
> ⁷ **(CC):** Der Test lintet echte Quelltexte mit den erzeugten Regeln, statt
> die zurückgegebene Datenstruktur zu vergleichen — eine Zusicherung über das
> Objekt wäre wertlos. Er stellt zusätzlich sicher, dass keine Meldung ohne
> Regel-Kennung durchgeht: Ein Parse-Fehler zählte sonst als Fund.
>
> ⁸ **(CC):** der Fall, an dem der Ansatz aus Runde 1 scheiterte, und der
> Grund für den Umbau. Ein Prüfer über den Syntaxbaum meldet den Parameter;
> ESLint kennt die Sichtbarkeit und schweigt.
>
> ⁹ **(CC):** über Nodes Selbstreferenz ausgeführt, also über dieselbe
> `exports`-Auflösung, die eine fremde App benutzt — nicht über `@ux/eslint`,
> das nur der interne Alias auf `src/` ist. Ergebnis: die drei Funktionen sind
> da, und `noDirectGlobal` liefert die drei erwarteten Regel-Kennungen. Der
> Beleg aus Runde 1 war an dieser Stelle zu schwach.

### Kurz-Testblock

```bash
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation"
make test        # #1, #4, #5
make typecheck   # #1
make lint        # #1
npm run build    # #1
```

Für **#6** — was landet wirklich im Paket:

```bash
npm pack --dry-run 2>&1 | grep eslint          # #6
node --input-type=module \
  -e "console.log(Object.keys(await import('@mmit/ux-foundation/eslint')))"   # #9
```

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

Kein Prüfer, sondern **Konfiguration**: drei Funktionen, die `rules`-Objekte für
die Regeln zurückgeben, die ESLint mitbringt.

| Funktion | Wofür |
|---|---|
| `noDirectGlobal` | Skripte — `no-restricted-globals`, `no-restricted-properties`, ein Selektor für `Reflect`/`Object` |
| `noDirectGlobalInTemplate` | Vue-Templates über `vue/no-restricted-syntax`; die Kernregeln greifen dort nicht |
| `allowDirectGlobal` | die eine Datei, die den Zugang anbietet |

Drei Folgen, die alle in dieselbe Richtung zeigen:

- **Keine neuen Abhängigkeiten.** Der Helfer importiert nichts, er gibt Daten
  zurück. Die in Runde 1 ergänzten Peers und die Dev-Abhängigkeit sind
  zurückgenommen.
- **Der Wächter läuft in der Leitung, die es schon gibt.** `make lint` statt
  eines eigenen Tests — in jeder App, ohne dass jemand einen Testlauf einrichtet.
- **Die statischen Formen sind nicht mehr aufgezählt.** Der Selektor nennt das
  **Wirtsobjekt** (`Reflect`, `Object`), nicht die Methode; `deleteProperty`,
  `defineProperty` und `getOwnPropertyDescriptor` fallen von selbst mit hinein.

### Die Grenze, unverändert

Ein zur Laufzeit zusammengesetzter Schlüssel (`window['local' + 'Storage']`)
wird nicht gefunden. Sie steht in der Dokumentation des Moduls — **nicht** als
Test, aus dem Grund, den T-18 gelernt hat: Ein `toEqual([])` darauf machte die
heutige Blindstelle zum Vertrag.

### Akzeptanzkriterien

- [x] Die Sperre liegt unter `src/eslint/` und wird über `./eslint` exportiert
- [x] **Keine** neuen Abhängigkeiten — weder Peer noch Dev; Manifest und
      Lockfile im Gleichklang
- [x] Erkannt werden nackter Name, Punkt- und Klammernotation, Destrukturierung,
      `Reflect`/`Object`-Formen und Template-Ausdrücke
- [x] **Nicht** erkannt werden überdeckte Namen, Typknoten, Objektschlüssel,
      Zeichenketten und Kommentare
- [x] Das Repo bewacht sich selbst über `eslint.config.js`, mit genau einer
      Ausnahme
- [x] Die erzeugten Regeln sind am echten Linter geprüft, nicht als
      Datenstruktur verglichen
- [x] Der Name ist ein Parameter, nicht fest verdrahtet

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
697 Tests, dazu `typecheck`, `lint` und `npm run build`; Exit-Codes einzeln
geprüft (`0/0/0/0`).

Live geprüft sind **#5** (fünf Mutanten gegen `npx eslint`), **#6**
(`npm pack`), **#7** und **#8** (die erzeugten Regeln am echten Linter) sowie
**#9** (der veröffentlichte Subpath über Nodes Selbstreferenz). **#1 bis #4**
sind Testlauf und Lesen, also `➖`.

**Das Ergebnis ist kleiner als der erste Entwurf und kann mehr.** Aus einem
Modul mit Dateisuche, Parser-Aufrufen und zwei neuen Abhängigkeiten wurden drei
Funktionen, die Konfiguration zurückgeben. Sie finden `Reflect.deleteProperty`,
das der Scanner übersah, und schweigen bei überdeckten Namen, Typknoten und
Objektschlüsseln, bei denen er Fehlalarm gab.
