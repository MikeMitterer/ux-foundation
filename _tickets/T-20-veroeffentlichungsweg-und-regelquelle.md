# T-20 · Veröffentlichungsweg und Regelquelle

| Repo | Status | Time-box | Scope | GH-Issue |
|---|---|---|---|---|
| ProjectTools (Deliverable) + ux-foundation (Akzeptanz) | in-progress | ~1 h | `src/` **unberührt** — Werkzeug und Doku, kein Paketinhalt | — |

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

| # | Where | Look for | AI | Human |
|---|---|---|:--:|---|
| 1 | `make test` · `make typecheck` · `make lint` | alle drei grün, Exit-Codes **einzeln** geprüft | ✅¹ | |
| 2 | `make publish` ohne `CONFIRM` | Sicherheitscheck greift unverändert, nichts läuft an | ✅² | |
| 3 | `npm-publish.sh --status` im Paket | erkennt, dass `0.7.1` bereits oben liegt | ✅³ | |
| 4 | `npm-publish.sh --status`, Version `99.99.99` | erkennt eine freie Version | ✅⁴ | |
| 5 | `npm-publish.sh --publish` im Paket | bricht **vor** dem Upload ab, weil `0.7.1` oben liegt (`rc=1`) | ✅⁵ | |
| 6 | Attrappe: `409`, kommt nie an | drei Versuche, dann Abbruch mit Originalausgabe (`rc=1`) | ⚠️⁶ | |
| 7 | Attrappe: `409`, liegt danach doch oben | Erfolg ohne Wiederholung (`rc=0`) | ⚠️⁶ | |
| 8 | Attrappe: `403` | sofortiger Abbruch, **kein** zweiter Versuch (`rc=1`) | ⚠️⁶ | |
| 9 | `bash -n` · `shellcheck -S warning` | Syntax sauber, keine Befunde | ✅⁷ | |
| 10 | `grep -rn 'npm-login'` über beide Workspaces | keine Fundstelle mehr | ✅⁸ | |
| 11 | echter Upload über den neuen Weg | eine Version geht tatsächlich hoch | ➖⁹ | |
| 12 | `--ensure` mit abgelaufener Anmeldung | Browser-Anmeldung startet und wird nachkontrolliert | ➖¹⁰ | |
| 13 | frische Sitzung im Repo | `@AGENTS.md` lädt den Regeltext in den Startkontext | ✅¹¹ | |

¹ `make test` 710 Tests / 24 Dateien, `make typecheck`, `make lint` — je
  getrennt ausgewertet, nicht über eine Pipe (Muster aus T-17).
² `make publish` → `Sicherheitscheck: make publish CONFIRM=yes`, Exit 1.
³ Echter Lauf gegen `registry.npmjs.org`: erkennt Anmeldung `mmit`, Paket
  `@mmit/ux-foundation@0.7.1`, meldet „liegt bereits oben".
⁴ Lauf in einem Wegwerf-Verzeichnis mit `version: 99.99.99` → „ist noch frei".
⁵ Echter `--publish`-Lauf gegen die Registry. Er endete **vor** `npm publish`;
  hochgeladen wurde nichts.
⁶ **Einschränkung:** mit einer `npm`-Attrappe auf dem `PATH` geprüft, nicht
  gegen die echte Registry — eine `409` lässt sich nicht bestellen. Die
  Attrappe stellte auch `sleep`, die tatsächlichen Wartezeiten (5 s, 15 s)
  sind damit **nicht** gemessen.
⁷ `shellcheck -S warning` ohne Ausgabe.
⁸ Beide Workspaces, ohne `node_modules`, `.git`, `dist`.
⁹ **Offene Lücke, siehe unten.** Der neue Weg hat noch nie etwas hochgeladen.
¹⁰ Die Anmeldung war durchgehend gültig; der Zweig ist unverändert aus
   `npm-login.sh` übernommen, lief hier aber nie an.
¹¹ Zwei kopflose Sitzungen mit abgeschalteten Datei-Werkzeugen: im Repo
   „Port 5177", außerhalb „UNBEKANNT". Die Gegenprobe schließt aus, dass die
   Antwort aus dem Modellwissen statt aus dem Startkontext kam.

---

## Was geändert wurde

### ProjectTools — `npm-login.sh` → `npm-publish.sh` (per `git mv`)

Das Script verantwortet jetzt den ganzen Vorgang und ersetzt das nackte
`npm publish` im Makefile. Der Ablauf: anmelden → **vorher ungecacht prüfen**,
ob die Version schon oben liegt → hochladen → **nach einem Fehlschlag
nachsehen**, ob sie es trotzdem tut → bei `409` bis zu dreimal erneut (5 s,
15 s Pause).

Die Vorprüfung liest mit `--prefer-online` und frischt damit zugleich den
npm-Cache auf, bevor geschrieben wird — das veraltete Paket-Dokument war der
Grund, warum die Frage „ist es hochgekommen?" zunächst falsch beantwortet
wurde.

**Wiederholt wird ausschließlich bei `409`.** Gefahrlos, weil npm eine
bestehende Version nie überschreibt. Bei `401`, `402` oder `403` bricht das
Script sofort ab; dort ist die Ursache Zugang oder Abo.

`--ensure` (nur anmelden) und `--status` (nur berichten) bleiben erhalten,
`--publish` kommt dazu. `--status` meldet zusätzlich, ob die lokale Version
schon vergeben ist.

### ux-foundation — `Makefile`

Zwei Zeilen werden eine:

```makefile
@bash $(PROJECT_TOOLS)/bash/npm-publish.sh --publish
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

1. **Der neue Weg hat noch nie etwas hochgeladen** (Zeile #11). Mikes
   erfolgreiche Veröffentlichung von `0.7.1` lief noch über das **alte**
   Makefile. Der nächste echte `make publish CONFIRM=yes` ist der erste
   Volllauf.
2. **`0.7.0` ist verbrannt.** Die Registry geht von `0.6.0` direkt auf
   `0.7.1`; die Nummer lässt sich nicht mehr vergeben.
3. Die Wartezeiten der Wiederholung sind nicht gemessen (Fußnote ⁶).
4. Beides ist **nicht gepusht** — weder ux-foundation noch ProjectTools.

## Fragen an das Review

1. **`grep -q '409'` auf der npm-Ausgabe** — tragfähig? Die Zeichenfolge
   könnte auch in einer URL oder einem Paketnamen stehen und dann fälschlich
   eine Wiederholung auslösen. Wäre `npm error code E409` das schärfere
   Merkmal, oder gibt es einen Exit-Code, der das sauber trennt?
2. **`isVersionPublished` behandelt „Registry nicht erreichbar" wie „Version
   nicht vorhanden"** (beide `return 1`). Bei der Vorprüfung ist das harmlos —
   es wird trotzdem versucht. Nach einem Fehlschlag könnte es einen
   erfolgreichen Upload aber als Misserfolg werten. Richtige Abwägung, oder
   sollten die beiden Fälle getrennt werden?
3. **Ist die Wiederholung überhaupt erwünscht?** Sie verdeckt ein
   Registry-Problem, das man vielleicht sehen will. Mike hat sie ausdrücklich
   bestellt — die Frage ist, ob die Grenze bei drei Versuchen und nur `409`
   eng genug gezogen ist.
4. **Ort und Zuschnitt.** Mike wollte ausdrücklich *ein* Script für den ganzen
   Vorgang statt zweier nebeneinander. Trägt das, oder vermischt
   `npm-publish.sh` damit zwei Zuständigkeiten (Anmeldung und Upload)?
5. **Ändert sich für dich etwas** dadurch, dass `AGENTS.md` jetzt die Quelle
   ist und `CLAUDE.md` nur noch importiert?
