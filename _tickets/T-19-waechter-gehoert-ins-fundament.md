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
| 1 | `make test` · `make typecheck` · `make lint` · `npm run build` | alle vier grün, Exit-Codes einzeln geprüft | ➖ | |
| 2 | `src/testing/` | der Wächter liegt im Paket, nicht mehr nur im Test des Schaufensters | ➖ | |
| 3 | `package.json` | `./testing` steht in `exports`; `typescript` und `@vue/compiler-sfc` sind **optionale** Peers | ➖ | |
| 4 | `tests/storageAccess.spec.ts` | prüft dieses Repo über den **ausgelieferten** Helfer, nicht über eine eigene Kopie | ➖ | |
| 5 | Mutanten aus T-18, alle vier | Wächter rot, Datei und echte Zeile genannt — die Erkennung hat beim Umzug nichts verloren | ➖ | |
| 6 | `node -e "require('@mmit/ux-foundation/package.json')"` im Paketverzeichnis + Blick in `files` | der neue Ordner wird tatsächlich ausgeliefert (`files` nennt nur `src/`) | ➖ | |
| 7 | eine App **ohne** `typescript`/`@vue/compiler-sfc` bindet das Paket ein | lädt weiter — der optionale Peer wird erst beim Import des Test-Einstiegspunkts gebraucht | ➖ | |

<!-- Fußnoten der AI-Spalte hier -->

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

### Auflösung

Wird zuletzt gefüllt.
