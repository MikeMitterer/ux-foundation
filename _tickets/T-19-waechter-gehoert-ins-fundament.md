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
| 2 | `src/testing/` | der Wächter liegt im Paket, nicht mehr nur im Test des Schaufensters | ➖² | |
| 3 | `package.json` | `./testing` steht in `exports`; `typescript` und `@vue/compiler-sfc` sind **optionale** Peers | ➖³ | |
| 4 | `tests/storageAccess.spec.ts` | prüft dieses Repo über den **ausgelieferten** Helfer, nicht über eine eigene Kopie | ➖⁴ | |
| 5 | Mutanten aus T-18, alle vier | Wächter rot, Datei und echte Zeile genannt — die Erkennung hat beim Umzug nichts verloren | ✅⁵ | |
| 6 | `npm pack --dry-run` | `src/testing/` liegt wirklich im Tarball | ✅⁶ | |
| 7 | Haupt-Einstiegspunkt und `src/` außerhalb von `testing/` | kein Import von `typescript` oder `@vue/compiler-sfc` — eine App ohne die optionalen Peers lädt weiter | ⚠️⁷ | |

> ¹ **(CC):** 25 Dateien / 688 Tests, Exit-Codes einzeln geprüft:
> `test:0 typecheck:0 lint:0 build:0`.
>
> ² **(CC):** gelesen — `src/testing/directAccess.ts` und `src/testing/index.ts`.
> Keine Live-Verifikation, das ist Struktur.
>
> ³ **(CC):** gelesen: `"./testing": "./src/testing/index.ts"` steht in
> `exports`; `typescript` und `@vue/compiler-sfc` stehen in
> `peerDependenciesMeta` auf `optional: true`, wie `naive-ui` es vormacht.
>
> ⁴ **(CC):** gelesen — die Datei importiert `findDirectAccess` aus
> `@ux/testing` und hält nur noch, was für dieses Repo gilt: die zwei Bäume und
> die eine erlaubte Datei. Die Semantik der Erkennung prüft
> `tests/directAccess.spec.ts` über die **öffentliche** Schnittstelle, mit
> echten Dateien in einem temporären Verzeichnis.
>
> ⁵ **(CC):** alle vier Mutanten aus T-18 ausgeführt, nicht behauptet. Jeder
> wird rot und nennt die echte Zeile:
> `useTheme.ts:25 → … window.localStorage?.getItem(…)`,
> `… window['localStorage']?.getItem(…)`,
> `… Reflect.get(window, 'localStorage')?.getItem(…)` und
> `App.vue:141 → $event.view.localStorage.clear()`. Nach jedem Lauf über
> `git checkout --` zurückgenommen und der Arbeitsbaum als sauber geprüft.
>
> ⁶ **(CC):** `npm pack --dry-run` listet `src/testing/directAccess.ts` (9.2 kB)
> und `src/testing/index.ts` (825 B); 29 Dateien insgesamt.
>
> ⁷ **(CC):** **bestätigt mit Einschränkung.** Statisch geprüft: `src/index.ts`
> erwähnt `testing` nicht, und `typescript`/`@vue/compiler-sfc` werden in `src/`
> **ausschließlich** unter `testing/` importiert. Damit kann der Haupt-Pfad die
> optionalen Peers nicht anfordern. **Nicht geprüft** ist eine echte
> Installation ohne die beiden Pakete — dafür bräuchte es eine App, die das
> Paket frisch zieht. Das gehört in das Folgeticket bei StockPortfolio, wo eine
> solche Installation ohnehin stattfindet.

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
npm pack --dry-run 2>&1 | grep testing
```

---

## Details

### Kontext / Ziel

Der Wächter aus T-18 entstand über **acht nachgewiesene Umgehungen**: Textsuche
gegen Parser, übersprungene Vue-Templates, der Name als Zeichenkette in
Klammernotation, `Reflect.get`. Das steckt jetzt in einer Testdatei des
Schaufensters.

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

### Warum ein eigener Einstiegspunkt

Der Wächter braucht `typescript` und `@vue/compiler-sfc`. Beide dürfen **nicht**
in die Laufzeit des Pakets wandern — ein UI-Fundament schleppt keinen Compiler
mit. Deshalb ein getrennter Einstiegspunkt `@mmit/ux-foundation/testing`, dessen
Abhängigkeiten **optionale Peers** sind, wie `naive-ui` es schon vormacht: Wer
den Wächter nicht nutzt, merkt nichts davon.

Jede Vue-App hat beide ohnehin — `typescript` als Dev-Abhängigkeit, den
SFC-Parser über `vue`.

### Der Helfer ist allgemeiner als `localStorage`

Gesucht wird ein **Name**, nicht ausgerechnet dieser eine. Dasselbe Gerüst trägt
„kein direktes `fetch`" oder „kein `useI18n()` im Paket". Die Signatur nimmt den
Namen deshalb als Parameter; der Speicher ist nur der erste Anwendungsfall.

### Akzeptanzkriterien

- [ ] Der Wächter liegt unter `src/testing/` und wird über `./testing`
      exportiert
- [ ] `typescript` und `@vue/compiler-sfc` sind optionale Peers; das Paket lädt
      ohne sie
- [ ] Die Erkennung ist **unverändert** stark: alle vier Mutanten aus T-18
      werden weiterhin rot
- [ ] `tests/storageAccess.spec.ts` nutzt den ausgelieferten Helfer, statt die
      Logik ein zweites Mal zu führen
- [ ] Die Semantik des Helfers ist im Paket getestet — er ist jetzt
      ausgelieferter Code, kein Testbeiwerk
- [ ] Der Name ist ein Parameter, nicht fest verdrahtet

### Nicht in diesem Ticket

**StockPortfolio zieht nicht hier um.** Das Deliverable liegt in
`ux-foundation`; die Umstellung der anderen App ist ihr eigenes Ticket in ihrem
eigenen Repo — so will es die Regel „ein Ticket lebt dort, wo das Deliverable
liegt". Dieses Ticket macht den Umzug nur möglich.

### Side-Effects

**Erstmals in dieser Ticketreihe betroffen: die ausgelieferte Fläche.** Bisher
galt „`src/` bleibt unberührt"; hier kommt bewusst etwas hinzu. Zwei Folgen:

- Jede einbindende App sieht den neuen Einstiegspunkt. Sie muss ihn nicht
  nutzen, aber er ist Teil der öffentlichen Zusage und kann nicht mehr
  stillschweigend verschwinden.
- Zwei neue optionale Peers. Sie dürfen nichts erzwingen — das ist Zeile #7 der
  Verify-Matrix und der einzige Punkt, an dem dieses Ticket einer App wehtun
  könnte.

### Was der Umzug am Wächter geändert hat

Nichts an der Erkennung — das ist die Zusicherung, und Zeile #5 belegt sie mit
allen vier Mutanten. Geändert hat sich die Form:

- **Der Name ist ein Parameter.** Der Wächter hieß bisher implizit
  „localStorage-Wächter"; er ist keiner. Dasselbe Gerüst trägt „kein direktes
  `fetch`" oder „kein `useI18n()` im Paket". Ein Test dafür steht dabei.
- **Zwei Funktionen statt einer.** `findDirectAccess` durchsucht Bäume,
  `findDirectAccessInFile` eine Datei. Die zweite ist nicht Bequemlichkeit,
  sondern der **Selbstcheck**: „an der erlaubten Stelle *muss* etwas gefunden
  werden". Ohne ihn ist ein Wächter grün, der nichts mehr findet — der Fall, der
  in T-18 drei Fehler verdeckte.
- **Die Semantik wird über die öffentliche Schnittstelle geprüft.** Der Test
  legt echte Dateien an und ruft den Einstiegspunkt auf, statt Interna zu
  greifen. Was dort grün ist, gilt damit auch für eine einbindende App.

### Der Branch hängt an T-18

`t-19-…` ist von `t-18-…` abgezweigt, nicht von `master`: Der gehärtete Wächter
entstand dort und ist noch nicht integriert. Ein Merge von T-19 bringt beide
mit. Das ist eine bewusste Stapelung und keine Nachlässigkeit — die
Integrationsentscheidung für T-18 gehört Mike und wird hier nicht vorweggenommen.

### Auflösung

`ux-foundation` — Handoff-Commit siehe `STATUS.md`. `make test` 25 Dateien /
688 Tests, dazu `typecheck`, `lint` und `npm run build`; Exit-Codes einzeln
geprüft (`0/0/0/0`).

Live geprüft sind **#5** (alle vier Mutanten) und **#6** (`npm pack`). **#1 bis
#4** sind Testlauf und Lesen, also `➖`. **#7** steht auf `⚠️`: Die Trennung ist
statisch bewiesen, eine echte Installation ohne die optionalen Peers steht aus
und gehört ins Folgeticket.
