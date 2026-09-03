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
| 1 | `make test` · `make typecheck` · `make lint` · `npm run build` | alle vier grün, Exit-Codes einzeln geprüft | ➖ | |
| 2 | `showcase/src/composables/useTheme.ts` | kein `window.localStorage` mehr, kein eigenes `try`/`catch`; die Wahl läuft über `safeStorage.read`/`.write` | ➖ | |
| 3 | Der neue Wächter-Test, mit absichtlich wieder eingebautem `window.localStorage` in einer Schaufenster-Datei | **rot**, und er nennt Datei und Zeile (Gegenprobe zu #6) | ➖ | |
| 4 | http://localhost:5177 · Theme wechseln, **Seite neu laden** | das gewählte Theme steht wieder da — die Speicherung funktioniert unverändert | ➖ | |
| 5 | Konsole: `localStorage.getItem('ux-foundation.theme')` nach einem Wechsel | der Wert steht drin, unter **demselben** Schlüssel wie bisher | ➖ | |
| 6 | Konsole: Speicher lahmlegen (Block unten), dann Theme wechseln und neu laden | die App startet, das Theme fällt auf die Systemvorgabe zurück, **kein** Absturz und keine leere Seite | ➖ | |
| 7 | dasselbe, aber `localStorage` beim **Zugriff** werfen lassen (nicht erst beim Schreiben) | ebenfalls kein Absturz — das ist der Fall, für den `safeStorage` überhaupt existiert | ➖ | |

<!-- Fußnoten der AI-Spalte hier -->

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

### Auflösung

Wird zuletzt gefüllt.
