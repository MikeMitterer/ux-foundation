# T-20 · Veröffentlichungsweg und Regelquelle

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ProjectTools (Deliverable) + ux-foundation (Akzeptanz) | in-progress | ~2 h | `src/` **unberührt** — Werkzeug und Doku, kein Paketinhalt | — |

**Löst:** Zwei Änderungen dieser Sitzung, die auf Mikes direkte Ansage ohne
Ticket entstanden und trotzdem ein Review bekommen sollen.

1. **Der Veröffentlichungsweg.** `make publish` scheiterte an einem
   `409 Conflict — Failed to save packument`. Die mitgelieferte Erklärung
   („vorheriges Paket noch nicht verarbeitet") traf nicht zu: Die vorige
   Version lag seit zwei Wochen oben. Die eigentliche Frage — *ist es trotz
   des Fehlers hochgekommen?* — musste von Hand beantwortet werden, mitsamt
   der Falle, dass ein veralteter npm-Cache sie falsch beantwortet.
2. **Die Regelquelle.** `AGENTS.md` war eine byte-gleiche, **ungetrackte**
   Kopie von `CLAUDE.md` — der Nebenbefund, der aus T-19 offen blieb.

<!--
  Repo:     ProjectTools hält das Script (Deliverable), ux-foundation den Aufruf und die Akzeptanz.
  Status:   ready | in-progress | blocked | done
  Scope:    Kein Paketinhalt. `files` in der package.json bleibt unberührt, `src/` ebenso.
-->

---

## Verify

Legende: ✅ live bestätigt · ⚠️ bestätigt mit Einschränkung (Fußnote) ·
◑ teilweise (Fußnote) · ➖ keine Live-Verifikation (nur Unit/Review).
`AI` = nur KI · `Human` = nur Mensch (nie überschreiben).

Alle Befehle stehen vollständig im **Kurz-Testblock** unter der Tabelle, je mit
der Zeilennummer davor.

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make test` · `make typecheck` · `make lint` | alle drei `rc=0`, **einzeln** ausgewertet | ✅¹ | |
| 2 | `make publish` ohne `CONFIRM` | `Sicherheitscheck: make publish CONFIRM=yes`, `rc=2` | ✅ | |
| 3 | `npm-publish.sh --status` im Paket | `0.7.1 liegt bereits oben`, `rc=0` | ✅² | |
| 4 | `--status` mit `version 99.99.99` | `99.99.99 ist noch frei`, `rc=0` | ✅² | |
| 5 | `npm-publish.sh --publish` im Paket | bricht **vor** dem Upload ab, `rc=1` | ✅² | |
| 6 | `npm-publish.test.sh --run` | `31 Tests, alle gruen`, `rc=0` | ✅ | |
| 7 | Mutant A — stdout wieder einfangen | genau `publish: npms stdout erreicht den Aufrufer` wird rot | ✅³ | |
| 8 | Mutant B — nacktes `grep '409'` | genau `E403: genau ein Versuch` wird rot | ✅³ | |
| 9 | Mutant C — `unknown` wieder zu `absent` | die fünf `unbekannt`-Zeilen werden rot | ✅³ | |
| 10 | Mutant D — Hook-Riegel entfernen | die zwei `Lifecycle`-Zeilen werden rot | ✅³ | |
| 11 | Mutant E — Argumente nicht weiterreichen | genau `reicht weitere Argumente … weiter` wird rot | ✅³ | |
| 12 | `bash -n` · `shellcheck -S warning` | beide Dateien ohne Befund | ✅ | |
| 13 | `grep -rn 'npm-login'` über beide Workspaces | keine Fundstelle mehr | ✅ | |
| 14 | `make publish CONFIRM=yes NPM_ARGS=…` | `NPM_ARGS` erreicht `npm publish` | ✅⁴ | |
| 15 | frische Sitzung im Repo | `@AGENTS.md` lädt den Regeltext in den Startkontext | ✅⁵ | |
| 16 | echter Upload über den neuen Weg | eine Version geht tatsächlich hoch | ➖⁶ | |
| 17 | `--ensure` mit abgelaufener Anmeldung | Browser-Anmeldung startet und wird nachkontrolliert | ➖⁷ | |
| 18 | echte OTP-Abfrage beim Upload | npm fragt den zweiten Faktor ab, statt abzubrechen | ➖⁸ | |

¹ `make test` → 24/24 Dateien, 710/710 Tests.
² Echter Lauf gegen `registry.npmjs.org`, angemeldet als `mmit`. Zeile #5
  endete **vor** `npm publish`; hochgeladen wurde nichts.
³ Mutationstest: Die Korrektur wird zurückgedreht, die Suite muss rot werden,
  danach `git checkout --` und Kontrolllauf. Jeder Mutant traf genau die
  vorgesehenen Zeilen, kein Kollateralschaden.
⁴ Über die Attrappe geprüft (`--publish --otp=123456 --tag next` kommt
  unverändert bei `npm` an); der Makefile-Durchstich selbst ist Textvergleich.
⁵ Zwei kopflose Sitzungen mit abgeschalteten Datei-Werkzeugen: im Repo
  „Port 5177", außerhalb „UNBEKANNT". Die Gegenprobe schließt aus, dass die
  Antwort aus dem Modellwissen statt aus dem Startkontext kam.
⁶ **Offene Lücke, siehe unten.** Der neue Weg hat noch nie etwas hochgeladen.
⁷ Die Anmeldung war durchgehend gültig; der Zweig ist unverändert aus
  `npm-login.sh` übernommen, lief hier aber nie an.
⁸ Nicht auslösbar ohne echten Upload. Geprüft ist die **Voraussetzung** —
  npms stdout erreicht den Aufrufer (Zeile #7) —, nicht der Dialog selbst.

### Kurz-Testblock

```bash
# Wurzel beider Repos; DEV_LOCAL ist die verbindliche Angabe, kein fester Pfad.
UXF="${DEV_LOCAL}/DevWeb/Production/ux-foundation"
PT="${DEV_LOCAL}/DevBash/Production/ProjectTools"
PUB="${PT}/src/bash/npm-publish.sh"

cd "${UXF}"
make test;      echo "rc=$?"    # #1  erwartet rc=0, 710/710 Tests
make typecheck; echo "rc=$?"    # #1  erwartet rc=0
make lint;      echo "rc=$?"    # #1  erwartet rc=0
make publish;   echo "rc=$?"    # #2  erwartet Hinweis auf CONFIRM=yes, rc=2 (make meldet Recipe-Fehler als 2)

bash "${PUB}" --status;  echo "rc=$?"   # #3  erwartet "0.7.1 liegt bereits oben", rc=0
bash "${PUB}" --publish; echo "rc=$?"   # #5  erwartet Abbruch VOR dem Upload, rc=1

# #4  freie Version in einem Wegwerf-Verzeichnis
D="$(mktemp -d)"
printf '{"name":"@mmit/ux-foundation","version":"99.99.99"}\n' > "${D}/package.json"
( cd "${D}" && bash "${PUB}" --status ); echo "rc=$?"   # erwartet "ist noch frei", rc=0
rm -rf "${D}"

# #6  die dauerhafte Suite
cd "${PT}"
./tests/bash/npm-publish.test.sh --run; echo "rc=$?"    # erwartet "31 Tests, alle gruen", rc=0

# #12
bash -n src/bash/npm-publish.sh && bash -n tests/bash/npm-publish.test.sh && echo "Syntax ok"
shellcheck -S warning src/bash/npm-publish.sh tests/bash/npm-publish.test.sh && echo "sauber"

# #13
grep -rn 'npm-login' "${DEV_LOCAL}/DevBash" "${DEV_LOCAL}/DevWeb" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist || echo "keine Fundstelle"

# #14  NPM_ARGS erreicht den Aufruf
grep -n 'NPM_ARGS' "${UXF}/Makefile"
```

Die fünf Mutanten (#7–#11). Jeder Block: mutieren, Suite laufen lassen — sie
**muss** rot werden —, zurückdrehen.

```bash
cd "${PT}"; S=src/bash/npm-publish.sh
mutate() { ./tests/bash/npm-publish.test.sh --run | grep -E '✗|gruen|fehlgeschlagen'; git checkout -- "$S"; }

# #7  Mutant A — stdout wieder einfangen
perl -0pi -e 's/npm publish "\$\@" 2>"\$\{ERR_FILE\}" \|\| rc=\$\?/output="\$(npm publish "\$\@" 2>"\$\{ERR_FILE\}")" || rc=\$?/' "$S"; mutate

# #8  Mutant B — nacktes grep '409'
perl -0pi -e 's/if \[\[ "\$\{code\}" != "E409" \]\]; then/if ! grep -q "409" "\$\{ERR_FILE\}"; then/' "$S"; mutate

# #9  Mutant C — unknown wieder zu absent
perl -0pi -e 's/local versions="" errors="" state="unknown"/local versions="" errors="" state="absent"/' "$S"; mutate

# #10 Mutant D — Hook-Riegel entfernen
perl -0pi -e 's/if \[\[ -n "\$\{hooks\}" \]\]; then/if false; then/' "$S"; mutate

# #11 Mutant E — Argumente nicht weiterreichen
perl -0pi -e 's/npm publish "\$\@" 2>"\$\{ERR_FILE\}"/npm publish 2>"\$\{ERR_FILE\}"/' "$S"; mutate

git diff --quiet "$S" && echo "Original unveraendert"
```

---

## Was geändert wurde

### ProjectTools — `npm-login.sh` → `npm-publish.sh` (per `git mv`)

Das Script verantwortet den ganzen Vorgang und ersetzt das nackte
`npm publish` im Makefile: anmelden → **vorher ungecacht prüfen**, ob die
Version schon oben liegt → hochladen → **nach einem Fehlschlag nachsehen**, ob
sie es trotzdem tut → bei `E409` bis zu dreimal erneut (5 s, 15 s Pause).

Die Vorprüfung liest mit `--prefer-online` und frischt damit zugleich den
npm-Cache auf, bevor geschrieben wird — das veraltete Paket-Dokument war der
Grund, warum die Frage „ist es hochgekommen?" zunächst falsch beantwortet
wurde.

**Vier Grenzen, jede aus einem Befund der Runde 1** — ausführlich im Kopf des
Scripts und in der README von ProjectTools:

| Grenze | Warum |
|---|---|
| stdout des Uploads bleibt unangetastet | npm bricht die OTP-Abfrage ab, sobald `stdin` **oder** `stdout` kein TTY ist (`lib/utils/auth.js:10`). Eingefangen wird nur stderr. |
| wiederholt wird nur bei exaktem `E409` | `409` steht auch in einem Paketnamen; einen Exit-Code je HTTP-Status gibt es nicht. |
| „nicht vorhanden" ≠ „nicht feststellbar" | Bei Ausfall der Abfrage wird weder „frei" noch „liegt nicht oben" behauptet; `--status` wird nicht grün. |
| keine Wiederholung bei Lifecycle-Scripten | Ein zweiter Lauf führt `prepare` und Geschwister erneut aus. Die Registry schützt die Version, nicht die lokalen Hooks. |

Alles nach `--publish` geht unverändert an `npm publish` weiter (`--otp=…`,
`--tag …`).

### ProjectTools — `tests/bash/npm-publish.test.sh` (neu)

31 Zusicherungen in 13 Fällen. Das Script läuft als **Prozess** über seinen
öffentlichen Aufruf gegen eine `npm`-Attrappe auf dem `PATH` — keine
gesourcten Funktionen, sonst prüft der Test eine Verdrahtung, die es beim
echten Aufruf nicht gibt.

Der TTY-Fall ist bewusst über die **beobachtbare Folge** geprüft: Die
Attrappe schreibt eine Marke nach stdout, und die muss beim Aufrufer ankommen.
Ein PTY braucht es dafür nicht.

### ux-foundation — `Makefile`

Ein Aufruf statt zweier, plus `$(NPM_ARGS)` für die Zwei-Faktor-Anmeldung:

```bash
make publish CONFIRM=yes NPM_ARGS=--otp=123456
```

Der `CONFIRM=yes`-Riegel bleibt unverändert davor.

### ux-foundation — `CLAUDE.md` / `AGENTS.md`

`AGENTS.md` trägt den Regeltext und ist ab jetzt **versioniert**; `CLAUDE.md`
schrumpft auf die dokumentierte Importzeile `@AGENTS.md` plus einen
Zweizeiler, dass neue Regeln in die andere Datei gehören. Claude Code liest
fest verdrahtet nur `CLAUDE.md` — eine Einstellung dafür gibt es nicht,
belegt in der offiziellen Dokumentation.

## Was ausdrücklich **nicht** geändert wurde

- Kein Paketinhalt. `src/` und `files` in der `package.json` sind unberührt,
  einbindende Apps sehen von alledem nichts.
- Keine neue Abhängigkeit, weder hier noch in ProjectTools.
- Keine Änderung an `pkg-link.sh` oder `repo-status.sh`.

## Korrektur an meiner ersten Diagnose

Ich hatte Mike zunächst berichtet, die `401` vor der `409` sei ein
Anmeldeproblem. Das ist vermutlich falsch: `npm-registry-fetch` handelt die
Authentifizierungsart aus — erster Versuch `401`, zweiter mit dem passenden
Schema. Der zweite PUT war autorisiert, sonst käme wieder `401` statt `409`.
Damit ist die `409` der eigentliche Fehler. **Nachprüfen lässt es sich nicht
mehr**: Meine eigenen `npm`-Aufrufe beim Untersuchen haben das Debug-Log aus
dem Zehnerfenster geschoben.

## Bekannte Lücken

1. **Der neue Weg hat noch nie etwas hochgeladen** (Zeile #16). Mikes
   erfolgreiche Veröffentlichung von `0.7.1` lief noch über das **alte**
   Makefile. Der nächste echte `make publish CONFIRM=yes` ist der erste
   Volllauf — und zugleich die erste echte Probe auf die OTP-Abfrage
   (Zeile #18), deren **Voraussetzung** jetzt getestet ist, nicht deren Dialog.
2. **`0.7.0` ist verbrannt.** Die Registry geht von `0.6.0` direkt auf
   `0.7.1`; die Nummer lässt sich nicht mehr vergeben.
3. Die Wartezeiten der Wiederholung (5 s, 15 s) sind nicht gemessen — die
   Testsuite stellt `sleep` ab, sonst dauerte sie 40 s.
4. Beides ist **nicht gepusht** — weder ux-foundation noch ProjectTools.
5. **Nicht von T-20 verursacht, aber offen:** `pkg-link.test.sh --run` hat
   1/17 rot (`--example`: `PACKAGE_ROOT` unbound). Von Codex in Runde 1
   gefunden. Die T-20-Diffs berühren weder das Script noch seinen Test; ein
   vollständig grüner ProjectTools-Testlauf ist derzeit trotzdem nicht
   belegbar. Braucht ein eigenes kleines Ticket.
