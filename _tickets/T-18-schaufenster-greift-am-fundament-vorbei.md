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
| 2 | `showcase/src/composables/useTheme.ts` | kein `window.localStorage` mehr, kein eigenes `try`/`catch`; die Wahl läuft über `safeStorage.read`/`.write` | ➖² | |
| 3 | Der neue Wächter-Test, mit absichtlich wieder eingebautem `window.localStorage` in einer Schaufenster-Datei | **rot**, und er nennt Datei und Zeile | ✅³ | |
| 4 | http://localhost:5177 · Theme wechseln, **Seite neu laden** | das gewählte Theme steht wieder da — die Speicherung funktioniert unverändert | ✅⁴ | |
| 5 | Konsole: `localStorage.getItem('ux-foundation.theme')` nach einem Wechsel | der Wert steht drin, unter **demselben** Schlüssel wie bisher | ✅⁴ | |
| 6 | Konsole: Schreiben werfen lassen (Block unten), dann Theme wechseln | der Anstrich wechselt sichtbar, gespeichert wird nichts, **kein** Absturz | ✅⁵ | |
| 7 | dasselbe, aber schon den **Zugriff** werfen lassen (nicht erst das Schreiben) | ebenfalls kein Absturz — das ist der Fall, für den `safeStorage` überhaupt existiert | ⚠️⁶ | |

> ¹ **(CC):** 24 Dateien / 695 Tests, Exit-Codes einzeln geprüft:
> `test:0 typecheck:0 lint:0 build:0`.
>
> ² **(CC):** **Keine Live-Verifikation** — gelesen und vom Wächter-Test
> bestätigt, der beide Bäume durchsucht und außerhalb von `safeStorage.ts`
> keinen Zugriff mehr findet. Das ist Unit und Review, nicht Beobachtung; die
> Marke stand zunächst falsch auf ✅.
>
> ³ **(CC):** Mutant ausgeführt, nicht behauptet: `safeStorage.read(…)` wieder
> durch `window.localStorage?.getItem(…)` ersetzt → der Test wird rot und meldet
> `showcase/src/composables/useTheme.ts:22 → …`. Die Zeilenzahl stimmt mit der
> echten überein; das war beim ersten Anlauf **nicht** so, siehe „Sieben Fehler im
> Wächter" unten. Ebenso gefangen werden seit Runde 2 der Template-Mutant in
> einer SFC — `showcase/src/App.vue:141 → $event.view.localStorage.clear()` —
> seit Runde 3 die Klammernotation und seit Runde 4 `Reflect.get` — beide
> zuletzt an derselben Stelle:
> `useTheme.ts:25 → const stored = Reflect.get(window, 'localStorage')?.getItem(STORAGE_KEY)`.
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
> ⁶ **(CC):** **bestätigt mit Einschränkung.** Live gefahren ist der härtere
> Fall auf dem Schreibweg — `window.localStorage` per
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
      durchsucht `showcase/src` und `src` und lässt genau eine Ausnahme zu —
      `src/composables/safeStorage.ts` selbst
- [ ] Er wertet **syntaktisch** aus, nicht über Textsuche, und erfasst in einer
      `.vue`-Datei die Skriptblöcke **und** die Ausdrücke des Templates
- [ ] Er erfasst den Namen als Bezeichner **und** als Zeichenkette dort, wo sie
      einen Zugriff bildet (`window['localStorage']`, berechneter
      Eigenschaftsname); anderswo bleibt eine Zeichenkette Text
- [ ] Er erfasst `Reflect.get(window, 'localStorage')` und Verwandte; ein
      beliebiges anderes Funktionsargument bleibt Text
- [ ] Er ist per Mutant geprüft — in einer `.ts`-Datei, in einem Template, in
      Klammernotation und über `Reflect` —: Test rot, Datei und echte Zeile
      genannt
- [ ] Seine **Grenze** ist als Test festgehalten, nicht als Behauptung
- [ ] Was er direkt importiert, steht als direkte Abhängigkeit in der
      `package.json`; nichts hängt an einem fremden Abhängigkeitsbaum

### Die Fallen des Wächters

**Erstens: Er muss Code von Text unterscheiden können.** Ein `grep` nach
`localStorage` schlägt auch bei Kommentaren an — in `localeDetection.ts` steht
das Wort dreimal in JSDoc —, und ein Test, der darauf anspringt, ist nach zwei
Tagen abgeschaltet. Umgekehrt kann er echten Code übersehen.

Hier stand zunächst der Rat, Kommentare vorher zu entfernen und auf die
Zugriffsform zu prüfen. **Beides ist widerlegt** (siehe „Sieben Fehler im Wächter"):
Ein Ausdruck über Text kann Kommentar- und Stringgrenzen nicht kennen, und die
Zugriffsform trifft weder `window.localStorage ?? null` noch Optional Chaining.
Richtig ist der **Parser**: TypeScript für Skripte, der SFC-Parser für Vue.

**Und es reicht nicht, nur Bezeichner zu suchen.** `window['localStorage']` ist
dieselbe Eigenschaft in Klammernotation — dort steht der Name als
*Zeichenkette*. Zugleich muss `const storageApiName = 'localStorage'` weiterhin
durchgehen. Es ist dieselbe Zeichenkette; nur **ihr Ort** entscheidet, und genau
den kennt allein der Baum: Argument einer Klammernotation oder berechneter
Eigenschaftsname zählt, alles andere ist Text.

**Zweitens: Ein Vue-Template ist ausführbarer Code.**
`@click="$event.view.localStorage.clear()"` steht in keinem `<script>` und wird
trotzdem zu einem Zugriff kompiliert. Ein Wächter, der nur Skriptblöcke ansieht,
lässt eine ganze Dateiklasse ungeprüft, obwohl er sie zu prüfen behauptet. Die
Ausdrücke des Templates kennt der SFC-Parser einzeln, samt Dateizeile; reiner
Text ist kein Ausdruck und bleibt folgenlos.

Die Ausnahmeliste bleibt **eine** Datei; wächst sie, ist der Test falsch und
nicht der Code.

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

### Sieben Fehler im Wächter, und was sie über Wächter sagen

Der Test war siebenmal falsch, bevor er stimmte — und keiner der Fehler hätte
sich beim Lesen gezeigt. **Drei fand mein eigener Selbstcheck, vier erst Codex
mit einem Mutanten.** Die vier von ihm sind die lehrreicheren, weil sie zeigen,
wo mein Selbstcheck selbst blind war — und weil ich nach jedem einzelnen dachte,
jetzt sei es vollständig.

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

Aufgedeckt hat diese drei **derselbe zweite Test** — der, der prüft, ob die
Ausnahme überhaupt gesehen wird.

Damit war er grün, und ich hielt ihn für fertig. Codex zeigte mit einem
Mutanten, dass er es nicht war:

4. **Ein echter Zugriff blieb unentdeckt.** Zwischen `const a = '/*'` und
   `const b = '*/'` hielt mein Ausdruck alles für einen Kommentar und
   verschluckte die Zeile dazwischen. Nachgestellt und bestätigt: 2/2 grün,
   obwohl der Zugriff dastand.
5. **Harmlose Prosa wurde gemeldet.** `const name = 'localStorage'` machte ihn
   rot.

Beides ist dieselbe Wurzel: **Ein Ausdruck über Text kann Kommentar- und
Stringgrenzen nicht kennen.** Er kann sie nur raten, und beim Raten liegt er in
beide Richtungen falsch. Der Wächter liest den Quelltext seither mit dem
TypeScript-Parser.

Damit war er wieder grün, und ich hielt ihn wieder für fertig — Runde 2 und
Runde 3 fanden je einen weiteren Weg daran vorbei:

6. **Die Klammernotation.** `window['localStorage']` ist dieselbe Eigenschaft;
   dort steht der Name als *Zeichenkette*, und ich suchte nur Bezeichner. Codex
   setzte genau das als echten Produktaufruf ein — 11/11 grün.

Das ist der interessanteste der sieben, weil er den Parser nicht widerlegt,
sondern **schärft**: Es genügt nicht zu wissen, dass etwas eine Zeichenkette
ist. Man muss wissen, **wo sie steht.** `window['localStorage']` und
`const name = 'localStorage'` enthalten dieselbe Zeichenkette; nur ihr Ort im
Baum unterscheidet Zugriff von Text. Gezählt wird sie deshalb als Argument einer
Klammernotation und als berechneter Eigenschaftsname — sonst nicht.

7. **`Reflect.get(window, 'localStorage')`.** Den hatte ich in Runde 4 selbst
   als Grenzfall genannt — und mit „fällt im Schaufenster beim Lesen auf"
   weggeredet. Codex hat die Begründung zurückgewiesen, und zwar zu Recht: Eine
   Regel, die darauf baut, dass jemand beim Lesen stutzt, ist genau die Regel,
   die dieser Wächter ersetzen soll. Aufruf, Ziel und Eigenschaft stehen
   statisch im Baum; das ist keine Verschleierung, sondern eine Leseform.

**Und die Grenze, die bleibt:** Ein zur Laufzeit zusammengesetzter Schlüssel
(`window['local' + 'Storage']`) wird nicht gefunden. Dafür bräuchte es eine
Datenflussanalyse, die unvollständig bliebe. Diese Grenze steht als **Test**
im Wächter, nicht als Satz in einer Datei — schlägt er eines Tages fehl, ist
sie verschoben worden und gehört neu beschrieben.

**Drei Lehren, und die letzte ist die unbequemste:**

- Ein Wächter braucht selbst einen Wächter. Ein Test, der behauptet „an dieser
  Stelle *muss* etwas gefunden werden", kostet vier Zeilen und fängt eine
  Klasse Fehler, die sonst niemand bemerkt.
- **Auch der Selbstcheck hat blinde Flecken.** Meiner prüfte nur, *dass*
  gefunden wird — nicht, ob die Erkennung sich täuschen lässt. Dafür braucht es
  jemanden, der versucht, an ihr vorbeizukommen.
- **„Jetzt ist es vollständig" war viermal falsch.** Nach dem Regex-Fix, nach
  dem Parser-Wechsel, nach den Templates und nach der Klammernotation hielt ich
  den Wächter jeweils für fertig. Beim vierten Mal habe ich die Lücke sogar
  selbst benannt und mich dann entschieden, sie nicht zu schließen. Ein Wächter deckt genau die Umgehungen ab, an die jemand gedacht hat;
  seine Grenze ist nicht die Technik, sondern die Vorstellungskraft dessen, der
  ihn schreibt. Deshalb ist der Mutant von **außen** die einzige ehrliche Probe,
  und deshalb wird ein Vollständigkeitsanspruch hier nicht mehr behauptet.

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
695 Tests, dazu `typecheck`, `lint` und `npm run build`; Exit-Codes einzeln
geprüft (`0/0/0/0`).

**Live geprüft sind die Zeilen #4 bis #6**, #7 mit Einschränkung (der Leseweg
beim Aufbau ließ sich nicht blockieren). **#1 bis #3 sind Unit und Review**, nicht
Beobachtung — Testläufe und ein Mutant, keine Messung am Bild.

Die Zusammenfassung stand nach Runde 1 zunächst auf „alle sieben Zeilen live"
und war damit zu stark. Der Unterschied ist keine Wortklauberei: Die Legende
trennt Beobachtetes von Abgeleitetem, und wer das verwischt, macht die Spalte
wertlos.
