# T-18 · Das Schaufenster greift am Fundament vorbei

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ux-foundation (nur `showcase/` + `tests/`) | ready | ~45 min | Schaufenster-only — `src/` bleibt unberührt | — |

**Löst:** `showcase/src/composables/useTheme.ts` greift direkt auf
`localStorage` zu, statt `safeStorage` aus dem Paket zu nehmen — mit eigenem
`try`/`catch`, das genau dasselbe tut. Ausgerechnet die App, die das Paket
vorführen soll, greift daran vorbei.

<!--
  Repo:     ux-foundation (Deliverable). Kein App-Repo betroffen — siehe Side-Effects.
  Status:   ready | in-progress | blocked | done
  Scope:    Schaufenster-only. Das Paket selbst wird nicht angefasst.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ bestätigt mit Einschränkung (Fußnote) ·
◑ teilweise (Fußnote) · ➖ keine Live-Verifikation (nur Unit/Review).
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make test` · `make typecheck` · `make lint` · `npm run build` | alle vier grün, Exit-Codes einzeln geprüft | ✅¹ | |
| 2 | `showcase/src/composables/useTheme.ts` | kein `window.localStorage` mehr, kein eigenes `try`/`catch`; die Wahl läuft über `safeStorage.read`/`.write` | ✅² | |
| 3 | Der neue Wächter-Test, mit absichtlich wieder eingebautem `window.localStorage` in einer Schaufenster-Datei | **rot**, und er nennt Datei und Zeile | ✅³ | |
| 4 | http://localhost:5177 · Theme wechseln, **Seite neu laden** | das gewählte Theme steht wieder da — die Speicherung funktioniert unverändert | ✅⁴ | |
| 5 | Konsole: `localStorage.getItem('ux-foundation.theme')` nach einem Wechsel | der Wert steht drin, unter **demselben** Schlüssel wie bisher | ✅⁴ | |
| 6 | Konsole: Schreiben werfen lassen (Block unten), dann Theme wechseln | der Anstrich wechselt sichtbar, gespeichert wird nichts, **kein** Absturz | ✅⁵ | |
| 7 | dasselbe, aber schon den **Zugriff** werfen lassen (nicht erst das Schreiben) | ebenfalls kein Absturz — das ist der Fall, für den `safeStorage` überhaupt existiert | ✅⁶ | |

> ¹ **(CC):** 24 Dateien / 678 Tests, Exit-Codes einzeln geprüft:
> `test:0 typecheck:0 lint:0 build:0`.
>
> ² **(CC):** gelesen und vom Wächter bestätigt — der Test durchsucht beide
> Bäume und findet außerhalb von `safeStorage.ts` keinen Zugriff mehr.
>
> ³ **(CC):** Mutant ausgeführt, nicht behauptet: `safeStorage.read(…)` wieder
> durch `window.localStorage?.getItem(…)` ersetzt → der Test wird rot und meldet
> `showcase/src/composables/useTheme.ts:38 → …`. Die Zeilenzahl stimmt mit der
> echten überein; das war beim ersten Anlauf **nicht** so, siehe „Drei Fehler im
> Wächter" unten.
>
> ⁴ **(CC):** live gegen http://localhost:5177. Theme auf `ocean` gestellt →
> `localStorage` führt `ux-foundation.theme: "ocean"`, der Schlüsselsatz ist
> unverändert (`ux-foundation.theme`, `ux-foundation.showcase.locale`). Nach dem
> Neuladen steht `ocean` wieder da.
>
> ⁵ **(CC):** live — `Storage.prototype.setItem` werfen lassen, dann auf `sepia`
> gewechselt. Der Anstrich wechselte sichtbar, die Seite lief weiter, kein
> Fehler am Fenster. Der Beleg, dass wirklich nicht geschrieben wurde: Der
> Speicher stand danach weiter auf `ocean`.
>
> ⁶ **(CC):** live, und zwar der härtere Fall — `window.localStorage` per
> `defineProperty` so gesetzt, dass schon der **Zugriff** wirft; Riegel vorher
> gegengeprüft. Theme wechselte von `ocean` auf `forest`, Seite lief weiter,
> kein Fehler. **Einschränkung:** Live geprüft ist damit der Schreibweg, der bei
> jedem Klick läuft. Der Leseweg beim **Aufbau** der App ließ sich von hier aus
> nicht blockieren — dafür müsste der Riegel vor dem ersten Skript stehen. Er
> ist im Paket durch `tests/safeStorage.spec.ts` abgedeckt, das den werfenden
> Zugriff ausdrücklich prüft.

### Kurz-Testblock

```bash
cd "${DEV_LOCAL}/DevWeb/Production/ux-foundation"
make test        # #1
make typecheck   # #1
make lint        # #1
npm run build    # #1
make dev         # #4–#7 — Schaufenster auf http://localhost:5177
```

Für **#6** in die Browser-Konsole, dann Theme wechseln und neu laden:

```js
// Schreiben schlaegt fehl — wie bei blockierten Cookies
Storage.prototype.setItem = function () { throw new Error('Speicher blockiert') }
```

Für **#7** der härtere Fall — schon der *Zugriff* auf das Objekt wirft. Das ist
die Lage im Privatmodus mancher Browser und der Grund, warum es `safeStorage`
gibt:

```js
Object.defineProperty(window, 'localStorage', {
  get() { throw new Error('Zugriff verweigert') },
  configurable: true,
})
```

---

## Details

### Kontext / Ziel

Der Befund stammt aus der Abnahme von T-17 und ist **kein Fehler im Verhalten**:
Der Code fängt den Wurf korrekt ab und tut funktional dasselbe wie
`safeStorage`. Genau deshalb ist er hartnäckig — eine *richtige* Kopie
verursacht keinen Fehler, also drängt nichts auf ihre Ablösung.

Die Entstehung erklärt ihn vollständig, und es ist Chronologie, kein Urteil:

| | entstanden |
|---|---|
| `showcase/src/composables/useTheme.ts` | 2026-08-16, **11:40** (`601f7a0`) |
| `src/composables/safeStorage.ts` | 2026-08-16, **12:46** (`588e269`) |

Die Datei ist eine Stunde **älter** als der Helfer. Als sie geschrieben wurde,
gab es ihn noch nicht, also löste sie das Problem selbst — der Kommentar darin
nennt sogar denselben Grund, den `safeStorage` später bekam. Nachgezogen wurde
sie nie, weil die Regel dafür „was man ohnehin anfasst, zieht mit" lautet und
`git log` für die Datei **genau einen Commit** zeigt: den, in dem sie entstand.

Zwei Gründe, sie trotzdem abzulösen:

- Zwei Umsetzungen desselben Urteils. Ändert es sich — etwa weil ein Browser
  sich anders verhält —, muss man wissen, dass es die zweite Stelle gibt.
- Ausgerechnet im Schaufenster. Dass die App, die das Paket vorführt, an einer
  Stelle daran vorbeigreift, ist dort auffälliger als anderswo.

### Akzeptanzkriterien

- [ ] `useTheme.ts` nutzt `safeStorage.read` und `safeStorage.write`; die beiden
      eigenen Funktionen samt `try`/`catch` fallen weg
- [ ] Der Speicherschlüssel bleibt **`ux-foundation.theme`** — wer das
      Schaufenster offen hat, verliert seine Wahl nicht
- [ ] Ein **Wächter-Test** verbietet den direkten Zugriff dauerhaft: Er
      durchsucht `showcase/src` und `src` nach `localStorage` und lässt genau
      eine Ausnahme zu — `src/composables/safeStorage.ts` selbst
- [ ] Der Wächter ist per Mutant geprüft: direkter Zugriff wieder eingebaut →
      Test rot, Datei und Zeile genannt

### Der Wächter hat eine Falle

Ein naiver `grep` nach `localStorage` schlägt auch bei **Kommentaren** an, und
davon gibt es reichlich — in `localeDetection.ts` steht das Wort dreimal in
JSDoc, in `i18n/index.ts` zweimal in einer Begründung. Ein Test, der darauf
anspringt, ist nach zwei Tagen abgeschaltet.

Er muss also den Code sehen, nicht die Prosa: Kommentare vorher entfernen oder
auf die Zugriffsform prüfen (`localStorage.` / `localStorage[`) statt auf das
bloße Wort. Die Ausnahmeliste bleibt **eine** Datei; wächst sie, ist der Test
falsch und nicht der Code.

Vorbild ist StockPortfolio — der Skill `ux-standards` nennt genau diesen Test
als „den verlässlicheren Weg als eine Regel, an die sich alle erinnern sollen".

### Nicht in diesem Ticket

Der zweite Nebenbefund aus T-17 — `AGENTS.md` ist eine byte-gleiche, ungetrackte
Kopie von `CLAUDE.md` — bleibt außen vor. Er betrifft die Doku, nicht den Code,
und die Entscheidung darüber gehört Mike.

### Side-Effects

**Keine für einbindende Apps.** `files` in der `package.json` liefert nur
`src/`; das Schaufenster wird nicht ausgeliefert, und kein Paket-Modul wird
angefasst. `safeStorage` ist bereits exportiert (`src/index.ts:68`), es kommt
also nichts Neues an die öffentliche Fläche.

Ein Verhaltensunterschied bleibt und ist gewollt: `safeStorage.write` gibt
`true`/`false` zurück und macht das Misslingen sichtbar, das bisherige
`writeStoredTheme` verschluckte es. Für das Theme ist das folgenlos — die Wahl
gilt dann eben nur für diese Sitzung —, aber der Rückgabewert steht ab jetzt
zur Verfügung, falls jemand darauf reagieren will.

### Drei Fehler im Wächter, und was sie über Wächter sagen

Der Test war dreimal falsch, bevor er stimmte — und keiner der drei Fehler
hätte sich beim Lesen gezeigt. Alle drei ließen ihn **grün** aussehen.

1. **Der Ausdruck schloss den Verstoß aus.** Ich hatte `(?<![\w.])localStorage`
   geschrieben, um `safeStorage` nicht zu treffen. Damit fiel ausgerechnet
   `window.localStorage` heraus — der Punkt davor war verboten.
2. **Er suchte die falsche Form.** Ich hatte auf `localStorage.` oder
   `localStorage[` geprüft. `safeStorage` selbst fasst die Referenz aber nackt
   an (`window.localStorage ?? null`), und `useTheme` nutzte Optional Chaining
   (`?.`). Beides fiel durch. Gesucht wird jetzt jede Erwähnung im Code — was
   sachlich auch das Richtige ist: Gefährlich ist der bloße Zugriff, nicht der
   Eigenschaftszugriff.
3. **Er nannte die falsche Zeile.** Das Entfernen der Kommentare schluckte
   Zeilenumbrüche, also meldete er Zeile 17 statt 32. Ein Wächter, dessen
   Nutzen das Benennen der Stelle ist, schickt einen damit an die falsche.

Aufgedeckt hat alle drei **derselbe zweite Test** — der, der prüft, ob die
Ausnahme überhaupt gesehen wird. Ohne ihn wäre der Wächter grün gewesen und
hätte nichts bewacht; ich hätte ihn committet und mich abgesichert gefühlt.

**Die Lehre:** Ein Wächter braucht selbst einen Wächter. Die billigste Fassung
davon ist ein Test, der behauptet: „an dieser einen Stelle *muss* etwas
gefunden werden". Er kostet vier Zeilen und fängt genau die Klasse Fehler, die
sonst niemand bemerkt.

### Ein Fehler beim Arbeiten, der hierher gehört

Beim ersten Mutanten-Lauf habe ich mit `git checkout --` zurückgesetzt,
**bevor** die Ablösung committet war. Damit stellte git den Stand *vor* meiner
Änderung wieder her und riss sie mit — der Wächter hatte funktioniert, meine
Arbeit war weg.

Ursache ist eine Verwechslung von Sicherungsnetzen: `git checkout --` stellt
den Stand aus HEAD her, nicht den von vor fünf Minuten. Es taugt zum
Zurücknehmen eines Mutanten **nur**, wenn der Ausgangsstand committet ist.
Richtige Reihenfolge, ab jetzt: erst committen, dann mutieren.

### Auflösung

`ux-foundation` — Handoff-Commit siehe `STATUS.md`. `make test` 24 Dateien /
678 Tests, dazu `typecheck`, `lint` und `npm run build`; Exit-Codes einzeln
geprüft (`0/0/0/0`). Live geprüft sind alle sieben Zeilen, die Einschränkung
zum Leseweg beim Aufbau steht in Fußnote ⁶.
