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
| 6 | `npm-publish.test.sh --run` | `65 Tests, alle gruen`, `rc=0` | ✅ | |
| 7 | Lauf unter echtem PTY (`script -q /dev/null`) | Attrappe meldet `PUBLISH_STDIO_TTY=yes` — **stdin und stdout** | ✅ | |
| 8 | `--publish --registry=…` | **jeder** Schritt spricht mit derselben Registry | ✅ | |
| 9 | Positivliste lehnt ab | `./anderes-paket`, `--dry-run`, `--@scope:registry=…`, `--workspace=…`, fehlender Wert, **`--otp --dry-run`**, leerer `--otp=` → `rc=1`, **kein** Upload, **keine** Erfolgsmeldung | ✅ | |
| 10 | Positivliste lässt durch | `--otp 123456 --tag=next --access public --provenance` kommt unverändert bei `npm` an | ✅ | |
| 11 | `--status` bei `E404` | **nicht** grün; nennt „noch nie veröffentlicht **oder** kein Zugriff" | ✅ | |
| 12 | `--status` bei unlesbarer Antwort | **nicht** grün; nennt „nicht lesbar" | ✅ | |
| 13 | Mutanten A–M | je genau die vorgesehenen Zeilen werden rot | ✅³ | |
| 14 | `bash -n` · `shellcheck -S warning` | beide Dateien ohne Befund | ✅ | |
| 15 | `grep -rn 'npm-login'` über beide Workspaces | keine Fundstelle in Code, Doku oder Makefiles — nur dieses Ticket nennt den alten Namen noch, weil es die Umbenennung beschreibt | ✅ | |
| 16 | `make publish … NPM_ARGS=…` | `NPM_ARGS` erreicht `npm publish` | ✅⁴ | |
| 17 | frische Sitzung im Repo | `@AGENTS.md` lädt den Regeltext in den Startkontext | ✅⁵ | |
| 18 | echter Upload über den neuen Weg | eine Version geht tatsächlich hoch | ➖⁶ | |
| 19 | `--ensure` mit abgelaufener Anmeldung | Browser-Anmeldung startet und wird nachkontrolliert | ➖⁷ | |

¹ `make test` → 24/24 Dateien, 710/710 Tests.
² Echter Lauf gegen `registry.npmjs.org`, angemeldet als `mmit`. Zeile #5
  endete **vor** `npm publish`; hochgeladen wurde nichts.
³ Mutationstest: Die Korrektur wird zurückgedreht, die Suite muss rot werden,
  danach `git checkout --` und Kontrolllauf. Jeder Mutant traf genau die
  vorgesehenen Zeilen, kein Kollateralschaden. Zwei sind Codex' eigene
  Gegenbeispiele: **J** (`tee`-Pipeline — fällt nur unter dem PTY auf,
  `stdout erreicht den Aufrufer` bleibt dabei grün) und **L** (`< /dev/null`
  am Upload — stdout bleibt TTY, stdin nicht; genau deshalb prüft die
  Attrappe beide Deskriptoren).
⁴ Über die Attrappe geprüft (Zeile #10); der Makefile-Durchstich selbst ist
  Textvergleich.
⁵ Zwei kopflose Sitzungen mit abgeschalteten Datei-Werkzeugen: im Repo
  „Port 5177", außerhalb „UNBEKANNT". Die Gegenprobe schließt aus, dass die
  Antwort aus dem Modellwissen statt aus dem Startkontext kam.
⁶ **Offene Lücke, siehe unten.** Der neue Weg hat noch nie etwas hochgeladen.
⁷ Die Anmeldung war durchgehend gültig; der Zweig ist unverändert aus
  `npm-login.sh` übernommen, lief hier aber nie an.

### Kurz-Testblock

```bash
# Wurzel beider Repos; DEV_LOCAL ist die verbindliche Angabe, kein fester Pfad.
UXF="${DEV_LOCAL}/DevWeb/Production/ux-foundation"
PT="${DEV_LOCAL}/DevBash/Production/ProjectTools"
PUB="${PT}/src/bash/npm-publish.sh"

cd "${UXF}"
make test;      echo "rc=$?"    # #1  erwartet rc=0 (Zahlen: Fussnote 1)
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

# #6  die dauerhafte Suite — sie traegt zugleich #7 bis #12 als einzelne
#     Zusicherungen (PTY, Registry-Ziel, Positivliste in beide Richtungen,
#     E404, unlesbare Antwort)
cd "${PT}"
./tests/bash/npm-publish.test.sh --run; echo "rc=$?"    # #6 erwartet "alle gruen", rc=0

# #14
bash -n src/bash/npm-publish.sh && bash -n tests/bash/npm-publish.test.sh && echo "Syntax ok"
shellcheck -S warning src/bash/npm-publish.sh tests/bash/npm-publish.test.sh && echo "sauber"

# #15
grep -rn 'npm-login' "${DEV_LOCAL}/DevBash" "${DEV_LOCAL}/DevWeb" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=_tickets \
  || echo "keine Fundstelle"

# #16  NPM_ARGS erreicht den Aufruf
grep -n 'NPM_ARGS' "${UXF}/Makefile"
```

Die Mutanten A–M (Zeile #13). Jeder Block: mutieren, Suite laufen lassen — sie
**muss** rot werden —, zurückdrehen.

```bash
cd "${PT}"; S=src/bash/npm-publish.sh
mutate() { ./tests/bash/npm-publish.test.sh --run | grep -E '✗|gruen|fehlgeschlagen'; git checkout -- "$S"; }

# ── Runde 1 ──────────────────────────────────────────────────────────────
# A  stdout wieder einfangen
perl -0pi -e 's/npm publish "\$\@" 2>"\$\{ERR_FILE\}" \|\| rc=\$\?/output="\$(npm publish "\$\@" 2>"\$\{ERR_FILE\}")" || rc=\$?/' "$S"; mutate
# B  nacktes grep '409'
perl -0pi -e 's/if \[\[ "\$\{code\}" != "E409" \]\]; then/if ! grep -q "409" "\$\{ERR_FILE\}"; then/' "$S"; mutate
# C  unknown wieder zu absent
perl -0pi -e 's/local versions="" errors="" state="unknown ausfall"/local versions="" errors="" state="absent"/' "$S"; mutate
# D  Hook-Riegel entfernen
perl -0pi -e 's/if \[\[ -n "\$\{hooks\}" \]\]; then/if false; then/' "$S"; mutate
# E  Argumente nicht weiterreichen
perl -0pi -e 's/npm publish "\$\@" 2>"\$\{ERR_FILE\}"/npm publish 2>"\$\{ERR_FILE\}"/' "$S"; mutate

# ── Runde 2 ──────────────────────────────────────────────────────────────
# F  Registry-Override entfernen
perl -0pi -e 's/    override="\$\(registryOverride "\$\@"\)"/    override=""/' "$S"; mutate
# G  Ablehnung abschalten
perl -0pi -e 's/    if ! rejectUnmodelledArgs "\$\@"; then/    if false; then/' "$S"; mutate
# H  unlesbare Antwort wieder als absent
perl -0pi -e 's/            \*\) state="unknown unlesbar" ;;/            *) state="absent" ;;/' "$S"; mutate
# I  E404 wieder als sicheres absent
perl -0pi -e 's/        state="unknown unbekanntes-paket"/        state="absent"/' "$S"; mutate
# J  tee-Pipeline — faellt NUR unter dem PTY auf
perl -0pi -e 's|        npm publish "\$\@" 2>"\$\{ERR_FILE\}" \|\| rc=\$\?|        npm publish "\$\@" 2>"\$\{ERR_FILE\}" \| tee /dev/null || rc=\$?|' "$S"; mutate


# ── Runde 3 ──────────────────────────────────────────────────────────────
# K  Positivliste abschalten
perl -0pi -e 's/    if ! rejectUnsupportedArgs "\$\@"; then/    if false; then/' "$S"; mutate
# L  stdin abklemmen, stdout heil lassen — faellt NUR mit der Zwei-Deskriptor-Probe auf
perl -0pi -e 's{        npm publish "\$\@" 2>"\$\{ERR_FILE\}" \|\| rc=\$\?}{        npm publish "\$\@" < /dev/null 2>"\$\{ERR_FILE\}" || rc=\$?}' "$S"; mutate


# ── Runde 4 ──────────────────────────────────────────────────────────────
# M  Wertpruefung entfernen — `--otp --dry-run` rutscht wieder durch
perl -0pi -e 's/            if \[\[ "\$\{arg\}" == -\* \]\]; then/            if false; then/' "$S"; mutate

git diff --quiet "$S" && echo "Original unveraendert"
```

---

## Was geändert wurde

### ProjectTools — `npm-login.sh` → `npm-publish.sh` (per `git mv`)

Das Script verantwortet den ganzen Vorgang und ersetzt das nackte
`npm publish` im Makefile: anmelden → **vorher ungecacht prüfen**, ob die
Version schon oben liegt → hochladen → **nach einem Fehlschlag nachsehen**, ob
sie es trotzdem tut → bei `E409` erneut, so oft und mit den Pausen, die
`MAX_ATTEMPTS` und `RETRY_DELAYS` im Script führen.

Die Vorprüfung liest mit `--prefer-online` und frischt damit zugleich den
npm-Cache auf, bevor geschrieben wird — das veraltete Paket-Dokument war der
Grund, warum die Frage „ist es hochgekommen?" zunächst falsch beantwortet
wurde.

**Die Grenzen des Vertrags, jede aus einem Review-Befund** — ausführlich im
Kopf des Scripts und in der README von ProjectTools:

| Grenze | Warum | Runde |
|---|---|:--:|
| stdout des Uploads bleibt unangetastet | npm bricht die OTP-Abfrage ab, sobald `stdin` **oder** `stdout` kein TTY ist (`lib/utils/auth.js:10`). Eingefangen wird nur stderr — eine `tee`-Pipeline hilft nicht, sie ist ebenfalls kein TTY. Geprüft werden **beide** Deskriptoren. | 1 + 3 |
| wiederholt wird nur bei exaktem `E409` | `409` steht auch in einem Paketnamen; einen Exit-Code je HTTP-Status gibt es nicht. | 1 |
| „nicht vorhanden" ≠ „nicht feststellbar" | Drei Dinge sind **kein** sicheres „gibt es nicht": Ausfall der Abfrage, unlesbare Antwort und `E404` — letzteres heißt bei einem privaten Paket „gibt es nicht **oder** du darfst nicht". `--status` wird in keinem davon grün. | 1 + 2 |
| ein Ziel für alle Schritte | Ein `--registry` hinter `--publish` verschob nur den Upload; Anmeldung und Prüfung befragten die alte Registry. Es wird jetzt übernommen. | 2 |
| durchgereicht wird eine **Positivliste** | `--otp`, `--tag`, `--access`, `--registry`, `--provenance`/`--no-provenance` — alles andere wird abgelehnt. Eine Sperrliste ist bei jedem npm-Update unvollständig, und was durchrutscht, fällt mit einer **falschen Erfolgsmeldung** aus: `./anderes-paket` lud ein fremdes Paket hoch, `--dry-run` gar keines — beide Male meldete der Wrapper Erfolg. | 3 |
| ein Wert darf keine Option sein | `--otp --dry-run` schlüpfte durch, weil die Wertoption das nächste Token ungeprüft schluckte. npm liest daraus `otp=--dry-run` und `dry-run=false` — aus dem gewollten Trockenlauf wird ein **echter Upload**. Leere `--option=`-Werte ebenso. | 4 |
| keine Wiederholung bei Lifecycle-Scripten | Ein zweiter Lauf führt `prepare` und Geschwister erneut aus. Die Registry schützt die Version, nicht die lokalen Hooks. | 1 |

Weitergereicht wird also **nur**, was in der Positivliste steht. Alles andere
gehört in einen direkten `npm publish`-Aufruf, wo niemand etwas verspricht.

### ProjectTools — `tests/bash/npm-publish.test.sh` (neu)

Wie viele Zusicherungen es sind, führt Zeile #6; hier steht, wie sie
zustande kommen. Das Script läuft als **Prozess** über seinen
öffentlichen Aufruf gegen eine `npm`-Attrappe auf dem `PATH` — keine
gesourcten Funktionen, sonst prüft der Test eine Verdrahtung, die es beim
echten Aufruf nicht gibt.

**Der TTY-Fall läuft unter einem echten PTY** (`script -q /dev/null`, mit
Rückfall auf die GNU-Form). In Runde 1 hatte ich ihn über die beobachtbare
Folge geprüft — „npms Marke erreicht den Aufrufer" —, und Codex hat zu Recht
gezeigt, dass das zu schwach ist: Eine `tee`-Pipeline besteht diese Prüfung
und nimmt npm trotzdem das TTY. Der Mutantenlauf bestätigt es (Zeile #13, Mutant J):
Unter dem PTY fällt `tee` auf, die alte Marke bleibt dabei grün.

Zwei Umwege, die nicht trugen und deshalb hier stehen, damit sie niemand
wiederholt:

- **Pythons `pty.spawn`** liefert ein korrektes PTY, kehrt auf macOS aber
  nach dem Kindprozess nicht aus seiner Kopierschleife zurück — der Testlauf
  hängt endlos. Belegt mit einem isolierten Probelauf.
- **`/dev/fd/1 -ef <datei>`** als plattformunabhängige Ersatzprüfung
  funktioniert auf macOS nicht: `/dev/fd/1` stat't dort als devfs-Knoten
  (`924543234:3780122828`) statt als die Zieldatei (`16777234:69241369`).

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

1. **Der neue Weg hat noch nie etwas hochgeladen** (Zeile #18). Mikes
   erfolgreiche Veröffentlichung von `0.7.1` lief noch über das **alte**
   Makefile. Der nächste echte `make publish CONFIRM=yes` ist der erste
   Volllauf — und zugleich die erste echte Probe auf die OTP-Abfrage selbst.
   Getestet ist bisher nur ihre **Voraussetzung** (Zeile #7: stdin und stdout
   bleiben unter einem PTY ein TTY), nicht der Dialog.
2. **`0.7.0` ist verbrannt.** Die Registry geht von `0.6.0` direkt auf
   `0.7.1`; die Nummer lässt sich nicht mehr vergeben.
3. Die Wartezeiten der Wiederholung (`RETRY_DELAYS`) sind nicht gemessen — die
   Testsuite stellt `sleep` ab, sonst dauerte sie 40 s.
4. Beides ist **nicht gepusht** — weder ux-foundation noch ProjectTools.
5. **Nicht von T-20 verursacht, aber offen:** `pkg-link.test.sh --run` hat
   1/17 rot (`--example`: `PACKAGE_ROOT` unbound). Von Codex in Runde 1
   gefunden. Die T-20-Diffs berühren weder das Script noch seinen Test; ein
   vollständig grüner ProjectTools-Testlauf ist derzeit trotzdem nicht
   belegbar. Braucht ein eigenes kleines Ticket.
