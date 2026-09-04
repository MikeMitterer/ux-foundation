# Claude-Review-Muster

Diese Datei sammelt wiederkehrende, verallgemeinerbare Fehlermuster aus den
Claude-Implementierungen und den anschließenden Codex-Reviews dieses Repos. Sie
ist die dauerhafte Lernschicht. Einzelne Ticketfehler bleiben grundsätzlich im
Ticket und in git; bestätigte Vorfälle dürfen zusätzlich unten als
**Evidenzinventar** stehen, wenn sie ausdrücklich als Rohstoff für einen
späteren Skill gesammelt werden.

Ein Muster wird erst aufgenommen, wenn mindestens zwei unabhängige Belege
vorliegen oder eine ausdrückliche Vollständigkeitsbehauptung nachweislich falsch
war. Jeder Eintrag enthält:

1. **Erkennungsregel** — woran der Reviewer das Muster findet.
2. **Prüffrage** — welche konkrete Gegenprobe es widerlegt oder bestätigt.
3. **Belege** — Ticket, Review-Runde, Commit und knappe Beobachtung.

Die Datei wird vor jedem inhaltlichen Review vollständig gelesen. Sie enthält
keine offene Arbeitsliste und keine unbestätigten Vermutungen. Das Inventar ist
noch keine neue Regel: Erst ein reifes Muster wird zur Prüfanweisung oder später
zum Skill-Baustein.

## Reife Muster

### Vollständige Sprachumschaltung endet nicht am Dokumentrand

**Erkennungsregel:** Sobald ein Showcase sichtbare Inhalte in iframes oder
anderen eigenständigen Browsing-Kontexten rendert, ist eine persistierte Locale
noch keine synchronisierte Locale. Jede dort erzeugte i18n-Instanz hat eigenen
reaktiven Zustand. Eine Aussage wie „alle sichtbaren Texte wechseln" ist erst
belegt, wenn diese Kontexte einbezogen wurden.

**Prüffrage:** Sekundärkontext zuerst vollständig laden, dann die Sprache im
Hauptdokument ohne Reload wechseln. Folgen sichtbarer Text und das jeweilige
`document.documentElement.lang` in Haupt- und Sekundärkontexten gemeinsam —
auch wenn die optionale Persistenz blockiert ist oder beim Schreiben wirft?

**Beleg:** T-17, Review-Runde 1, Handoff `2175058`: Die drei bereits geladenen
`?demo=nav`-iframes besitzen je eine eigene i18n-Instanz. Der Eltern-Umschalter
ändert nur den Eltern-Ref und `localStorage`; Listener, Nachricht oder Reload
fehlen. Trotzdem beanspruchten Verify #5 und #15 vollständig umgeschaltete
sichtbare Texte.

**Zweiter Beleg:** T-17, Review-Runde 2, Handoff `428345d`: Der erste Fix nutzt
das `storage`-Ereignis zugleich als Synchronisationskanal. Schlägt der über
`safeStorage` ausdrücklich erlaubte Schreibvorgang fehl, entsteht dieses
Ereignis nicht; der Eltern-Ref wechselt, die bereits geladenen iframes nicht.
Der Regressionstest erzeugte das Ereignis direkt und übersprang damit genau
diese Kausalkette.

### Ein Regressionstest muss die Verdrahtung durchlaufen

**Erkennungsregel:** Ein Test stellt eine Fehlerbedingung an einem Eingang her,
ruft danach aber direkt einen tieferen Baustein auf. Dann kann die eigentliche
Produktverdrahtung fehlen, obwohl der Test grün bleibt. Besonders verdächtig:
Ein Mock oder Spy wird installiert, aber vom anschließend ausgeführten Pfad
nie berührt.

**Prüffrage:** Den einen Produktionsaufruf entfernen, der Eingang und Wirkung
verbindet. Wird der Test rot? Falls nicht, prüft er die Bausteine nebeneinander,
nicht die behauptete Integration.

**Beleg:** T-17, Review-Runde 3, Handoff `19a14a3`: Der Test „kommt ohne den
Speicher aus" lässt `Storage.setItem` werfen, sendet dann aber direkt über einen
fremden `BroadcastChannel`. Wird `announceLocale(locale)` aus dem öffentlichen
`setLocale()` entfernt, bleiben alle acht Sync-Tests grün. Damit bewacht der
Test nicht die Verdrahtung, deren Regression er verhindern soll.

**Zweiter Beleg:** T-17, Runde 3: `happy-dom` stellte gar keinen
`localStorage` bereit. Der installierte Spy wurde deshalb nie berührt und der
vermeintliche Ausfalltest stellte seine Vorbedingung nicht her. Erst ein eigener
Speicher, dessen `setItem` tatsächlich wirft, plus ein Test über
`useLocale().setLocale()` machte die Aussage belastbar. Handoff `e0c2ff0`
schließt die Lücke; der Mutant ohne `announceLocale(locale)` wird dort rot.

### Globale Zustandswechsel dürfen Kindzustand nicht durch Remounting löschen

**Erkennungsregel:** Ein globaler Zustand wie Sprache oder Theme steckt in
einem Vue-`key` weit oben im Baum. Die gewünschte Neuberechnung eines Widgets
erkauft sich damit einen vollständigen Abriss aller Kindansichten samt lokaler
Refs, offenen Dialogen, Toast-Ankern und Eingaben.

**Prüffrage:** In einer Kindansicht einen beobachtbaren Zustand öffnen, dann den
globalen Zustand wechseln. Bleiben Komponentenidentität und Kindzustand
erhalten, während nur die wirklich betroffene Geometrie neu berechnet wird?

**Beleg:** T-17, Entwicklung vor Handoff `2175058`: Der Sprachwechsel stand im
`key` der Reiter. Ein offener Toast blieb verwaist in der alten Sprache, sein
Zustandsschalter sprang auf `false`. Die gezielte Lösung war
`syncBarPosition()` nach `nextTick()`. Besonders relevant: Der damalige
`ux-standards`-Skill empfahl den schädlichen Sprach-`key` selbst; Mike ließ die
Regel nach seiner Abnahme korrigieren.

### Eine Source of Truth muss wirklich alle Verbraucher erfassen

**Erkennungsregel:** Zwei Konfigurationen werden zusammengeführt und die Arbeit
als „eine Quelle" bezeichnet, ohne vorher alle Verbraucher derselben Zuordnung
zu suchen. Ein dritter Spiegel bleibt zurück oder entsteht beim Testen neu.

**Prüffrage:** Projektweit nach jedem Schlüssel und jedem aufgelösten Wert
suchen. Lesen alle technisch fähigen Verbraucher dieselbe Quelle? Bewacht bei
einer unvermeidbaren Spiegelung ein negativer Konsistenztest sowohl Schlüsselmenge
als auch Zielwerte?

**Belege:** T-17, Handoff `e0c2ff0`: Der für den Setter-Test ergänzte `@`-Alias
stand danach unabhängig in Vite und Vitest. Handoff `cd6a750` führte beide über
`aliases.ts` zusammen, übersah aber die dritte Spiegelung unter `paths` in
`showcase/tsconfig.json`. Erst Handoff `4dd5732` ergänzte den Wächter; der Mutant
`./src/*` → `./srcX/*` wird rot.

### Ein Sprachwechsel verändert auch Geometrie und Zustandswahrnehmung

**Erkennungsregel:** Die Prüfung vergleicht nur Textwerte vor und nach dem
Sprachwechsel. Unterschiedliche Wortlängen verschieben aber Tabs, Tabellen und
Bedienelemente; ein aktiver Zustand kann zudem semantisch korrekt markiert und
visuell trotzdem kaum erkennbar sein.

**Prüffrage:** Vor und nach dem Wechsel Bounding-Boxes beziehungsweise
Spaltenbreiten messen und aktive/inaktive Zustände nicht nur per ARIA, sondern
auch visuell vergleichen. Bleibt das Raster ruhig und ist der Zustand ohne
Farbsehen erkennbar?

**Belege:** T-17, Mikes Abnahme nach sechs Codex-Runden: Die Naive-UI-Spalten
wanderten beim Wechsel um bis zu 42 px; die aktive und inaktive Sprachkennung
unterschieden sich nur mit 1,76:1. Commit `6671962` stabilisierte die
vorhersehbaren Spaltenbreiten und ergänzte eine Fläche für die aktive Kennung.
Beide Fehler waren bei reinen Text- und Strukturprüfungen unsichtbar geblieben.

### Verifikation muss ihren Exit-Code und ihre Vorbedingungen beweisen

**Erkennungsregel:** Ein grüner Bericht entsteht aus einer Shell-Pipeline, einer
festen Wartezeit oder einem Mock, dessen Nutzung nicht nachgewiesen wird.
Mutationen werden anschließend über eine Arbeitskopie statt gegen git
zurückgenommen.

**Prüffrage:** Werden die relevanten Befehle einzeln ausgewertet? Wartet ein
asynchroner Test auf die Bedingung statt auf eine geschätzte Anzahl Ticks? Zeigt
eine Assertion, dass der Mock wirklich im geprüften Pfad lag? Ist die Datei nach
einem Mutanten gegen git sauber?

**Belege:** T-17, Runde 3: `make test | grep … && git commit` übernahm den
Exit-Code von `grep` und ließ einen roten Test bis zum Commit durch. Eine feste
Wartezeit bestand nach warmem Kanal, scheiterte aber beim Kaltstart. Später
schlug das Zurückkopieren mutierter Dateien wegen eines interaktiven `cp`-Alias
fehl; erst der Vergleich gegen git zeigte die stehengebliebene Mutation. Die
finale Praxis waren einzelne Exit-Codes, `waitUntil()` und isolierte Mutanten in
`/tmp`.

### Dauerhafte Ticket-Evidenz veraltet zwischen den Runden

**Erkennungsregel:** Die OUTBOX einer Übergabe nennt den neuen Stand, das Ticket
aber noch den alten. Betroffen sind bevorzugt Zahlen (Testanzahl), Fundstellen
(Datei und Zeile eines Mutanten) und Querverweise auf Abschnitte, deren
Überschrift sich mit dem Inhalt geändert hat. Das Muster entsteht, weil die
OUTBOX beim Übergeben ohnehin neu geschrieben wird, das Ticket dagegen nur
stellenweise angefasst — die unveränderten Stellen wirken deshalb aktuell.

**Prüffrage:** Jede Zahl, jede Datei-Zeilen-Angabe und jeden Abschnittsverweis
im Ticket gegen den aktuellen Handoff prüfen, nicht gegen die OUTBOX. Nennt eine
Fußnote noch eine Zeile aus einer früheren Fassung? Verweist ein Fließtext auf
eine Überschrift, die inzwischen anders heißt? Historische Fußnoten dürfen ihre
damaligen Zahlen behalten — der **Abschluss** darf es nicht.

**Beleg:** T-17, Mikes Abnahme: Auflösung und Kurz-Testblock standen nach sechs
Runden noch auf 21 Dateien / 663 Tests und Verify-Bereich #1–#16, während der
übergebene Stand 22/673 und #1–#19 war.

**Zweiter Beleg:** T-18, Review-Runde 2, Handoff `c51bda9`: Die OUTBOX nannte
korrekt 684 Tests, das Ticket weiter 678. Fußnote ³ nannte die Fundstelle
`useTheme.ts:38` aus der Regex-Fassung, obwohl der Mutant inzwischen Zeile 22
meldete, und ein Verweis zeigte auf „Drei Fehler im Wächter", während der
Abschnitt „Fünf Fehler" hieß. Zusätzlich beschrieb der Abschnitt „Der Wächter
hat eine Falle" noch den widerlegten Regex-Weg als Empfehlung — die
gefährlichste Ausprägung, weil ein veralteter **Rat** weiterwirkt, während eine
veraltete Zahl nur falsch ist.

### Review-Evidenz für Menschen ist ein ausführbarer Ablauf

**Erkennungsregel:** Eine Verify-Zeile beschreibt intern korrekt, was technisch
passieren soll, gibt dem Menschen aber weder einen kopierbaren Befehl noch einen
sichtbaren Sollzustand. Die Human-Spalte bleibt dann nicht wegen eines Fehlers,
sondern wegen unbrauchbarer Anleitung offen.

**Prüffrage:** Kann jemand ohne Kontext jeden Schritt kopieren oder klicken und
danach eindeutig Soll gegen Ist vergleichen? Stehen Vorbereitung,
Rückgängigmachen und beobachtbarer Nachweis vollständig im Ticket?

**Beleg:** T-17, Verify #18 bei Mikes Abnahme: „`Storage.prototype.setItem`
wirft" war für den Reviewer nicht ausführbar; seine Rückmeldung „KA was das
sein soll" war berechtigt. Erst ein vollständiger Konsolenblock im
Kurz-Testblock machte die Prüfung übergabefähig.

## T-18 · bestätigtes Fehlerinventar für einen späteren Skill

Ein Ticket mit einer Zehn-Minuten-Änderung und vier Review-Runden. Die Änderung
selbst — `useTheme.ts` auf `safeStorage` umstellen — war unstrittig; **alle
sieben Fehler steckten im Wächter-Test**, der die Regel dauerhaft sichern soll.
Das macht das Inventar ungewöhnlich einheitlich und dadurch brauchbar: Es ist
ein Datensatz darüber, wie ein statischer Prüfer schrittweise scheitert.

### Der Wächter, in der Reihenfolge seines Scheiterns

1. **Der Ausdruck schloss den Verstoß aus.** `(?<![\w.])localStorage` sollte
   `safeStorage` ausschließen und verbot dabei den Punkt — womit
   `window.localStorage` herausfiel. Selbstcheck.
2. **Er suchte die falsche Zugriffsform.** Geprüft wurde `localStorage.` und
   `localStorage[`; getroffen wurden weder `window.localStorage ?? null` noch
   Optional Chaining. Selbstcheck.
3. **Er nannte die falsche Zeile.** Das Entfernen der Kommentare schluckte
   Zeilenumbrüche: gemeldet Zeile 17, tatsächlich 32. Selbstcheck.
4. **Ein echter Zugriff zwischen zwei Strings blieb unentdeckt.** `const a =
   '/*'` … `const b = '*/'` ließ den Regex alles dazwischen für einen Kommentar
   halten. Review-Runde 1, Handoff `75485ae`.
5. **Harmlose Prosa wurde gemeldet.** `const name = 'localStorage'` machte den
   Wächter rot. Dieselbe Wurzel wie 4: Textsuche kann Kommentar- und
   Stringgrenzen nur raten. Review-Runde 1.
6. **Vue-Templates wurden komplett übersprungen.** Nur `script` und
   `scriptSetup` gingen an den Parser; `@click="$event.view.localStorage.clear()"`
   blieb unbemerkt, bei einem SFC ohne Skriptblock prüfte der Wächter gar
   nichts. Review-Runde 2, Handoff `c51bda9`.
7. **Die Klammernotation umging den Bezeichner-Treffer.**
   `window['localStorage']` ist dieselbe Eigenschaft, der Name steht dort als
   Zeichenkette. Review-Runde 3, Handoff `9e37c99`.
8. **`Reflect.get(window, 'localStorage')` blieb offen — und ich hatte es selbst
   genannt.** In der Review-Frage zu Runde 4 als Grenzfall aufgeführt und mit
   „fällt beim Lesen auf" weggeredet. Genau diese Begründung ersetzt der
   Wächter. Review-Runde 4, Handoff `4d9f1b4`.

### Was das über statische Prüfer sagt

9. **Vier Vollständigkeitsansprüche, vier Widerlegungen.** Nach dem Regex-Fix,
   dem Parser-Wechsel, den Templates und der Klammernotation galt der Wächter
   jeweils als fertig. Die Grenze eines Prüfers ist nicht seine Technik, sondern
   die Vorstellungskraft dessen, der ihn schreibt.
10. **Der Selbstcheck fand nur eine Fehlerklasse.** „An dieser Stelle *muss*
    etwas gefunden werden" deckte 1–3 auf und war gegen 4–8 blind: Er prüft,
    *dass* erkannt wird, nicht ob sich die Erkennung **täuschen** lässt. Dafür
    braucht es einen Angreifer von außen.
11. **Die brauchbare Grenze wurde am Ende als Test festgehalten.** Ein zur
    Laufzeit zusammengesetzter Schlüssel wird bewusst nicht erkannt; der Test
    hält das fest, statt es zu behaupten. Verschiebt sich die Grenze, wird der
    Test rot.

### Verfahren

12. **`git checkout --` vor dem Commit nahm die eigene Arbeit mit.** Beim
    Zurücknehmen eines Mutanten stellte git den Stand aus HEAD her — die noch
    uncommittete Ablösung war weg. Reihenfolge: erst committen, dann mutieren.
13. **Ein direkter Import war keine direkte Abhängigkeit.**
    `@vue/compiler-sfc` wurde über `vue` hochgezogen; der Test hing damit am
    Abhängigkeitsbaum eines fremden Pakets. Review-Runde 2.
14. **Die Marken der Verify-Matrix überbeanspruchten die Evidenz.** `✅` stand
    auf Zeilen, deren Fußnote nur Lesen und Testlauf nannte, sowie auf einer
    Zeile mit ausdrücklicher Einschränkung. Review-Runde 1.
15. **Kommentare wiederholten die Skill-Regel und fällten ein UX-Urteil im
    Code.** „Eine Meldung wäre lauter als die Sache wert" ist eine Entscheidung
    und gehört nicht in eine Funktionsbeschreibung. Review-Runde 1.
16. **Die Mailbox-Umschreibung schnitt unabhängigen Kontext ab.** Der Abschnitt
    „Zuletzt abgeschlossen" verschwand samt zweier offener Hinweise. Drainieren
    gilt für verarbeitete Nachrichten, nicht für Kontext. Review-Runde 2.

## T-17 · bestätigtes Fehlerinventar für einen späteren Skill

Dieses Inventar konserviert auch einmalige Vorfälle. Es ist absichtlich
vollständiger als die reifen Muster oben und dient später als Datensatz für
Trigger, Negativbeispiele und Gegenproben.

### Implementierung und Laufzeit

1. **Sprach-`key` remountete die gesamte Reiterfläche.** Kindzustand und
   Toast-Anker gingen verloren; gezielte Widget-Synchronisation war nötig.
2. **Die erste Übergabe vergaß eigenständige Dokumente.** Drei sichtbare
   `?demo=nav`-iframes behielten Sprache und `lang`, obwohl Verify #5/#15 „alle
   sichtbaren Texte" beanspruchten. Handoff `2175058`, Review-Runde 1.
3. **`lang` lag im falschen Modul.** Nur Dokumente mit `useLocale()` setzten es;
   die iframes ohne Umschalter hatten gar kein `lang`.
4. **Der erste iframe-Fix koppelte Anzeige an Bequemlichkeitsspeicher.** Bei
   blockiertem `localStorage` entstand kein `storage`-Ereignis und derselbe
   sichtbare Fehler kehrte zurück. Handoff `428345d`, Review-Runde 2.
5. **Basiskatalog und Runtime-Fallback wurden verwechselt.** Trotz vorhandenem
   Englisch blieb `FALLBACK_LOCALE` auf `de`, entgegen `code-standards`.
6. **Der Sprachwechsel ließ Tabellengeometrie springen.** Erst Mikes Bedienung
   zeigte die um bis zu 42 px wandernden Spalten. Behoben in `6671962`.
7. **Der aktive Sprachzustand war visuell zu leise.** ARIA war korrekt, die
   sichtbare Differenz betrug aber nur 1,76:1 und beruhte allein auf Farbe.

### Tests und Arbeitsverfahren

8. **Der erste Sync-Test erzeugte das `storage`-Ereignis selbst.** Er prüfte den
   Empfänger, nicht den echten Weg vom Umschalter zum iframe.
9. **Der zweite Sync-Test mockte einen unbenutzten Eingang.** `Storage.setItem`
   sollte werfen, wurde im Testpfad aber nie aufgerufen; happy-dom hatte ohnehin
   keinen Speicher. Handoff `19a14a3`, Review-Runde 3.
10. **Der Setter war unbewacht.** Entfernen von `announceLocale(locale)` ließ
    alle acht vermeintlichen Sync-Tests grün. Erst Handoff `e0c2ff0` machte den
    Mutanten rot.
11. **Eine feste Tick-Zahl machte den ersten Kanaltest kaltstartabhängig.** Die
    zweite Zustellung war schnell genug, die erste nicht; `waitUntil()` ersetzte
    die geschätzte Frist.
12. **Eine Shell-Pipeline maskierte einen roten Test.** Der Commit-Schritt sah
    den Erfolg von `grep`, nicht den Fehler von `make test`.
13. **Das Zurücknehmen eines Mutanten scheiterte unbemerkt.** Ein interaktiver
    `cp`-Alias verhinderte das Überschreiben; nur `git diff` entdeckte die noch
    mutierte Produktdatei.
14. **`import.meta.url` wurde trotz dokumentierter Repo-Falle auf Modulebene
    ausgewertet.** Unter happy-dom war es keine Datei-URL; der neue Alias-Wächter
    konnte seine eigene Quelle nicht importieren. Handoff `4dd5732` verlagerte
    die Auflösung in `resolveAliases()`.

### Standards, Quellen und Dokumentation

15. **Neuer Code verwendete deutsche Bezeichner.** Unter anderem `Katalog`,
    `nachrichten`, `DEUTSCH` und `NAMEN` widersprachen `code-standards`; nur die
    neu eingeführten Namen wurden umgestellt.
16. **Kommentare überlebten verworfene Entwürfe.** Endonyme sollten angeblich
    noch Konstanten sein, `DemoNav` könne nicht mitwechseln und der Typ heiße
    `Katalog`; alle Aussagen waren nach den Änderungen falsch.
17. **Der Ticket-Abschluss blieb auf Runde 1 stehen.** Testzahlen, Verify-Bereich
    und offene Zeilen wurden nach mehreren Handoffs nicht aktualisiert.
18. **Der Test-Alias erzeugte eine neue zweite Quelle.** Vite und Vitest liefen
    zunächst über getrennte Zuordnungen. Die erste Konsolidierung übersah danach
    `showcase/tsconfig.json`; erst der negative Alias-Wächter schloss alle
    Verbraucher ein.
19. **Eine technisch korrekte Human-Prüfung war nicht ausführbar beschrieben.**
    Verify #18 nannte nur den gewünschten Wurf statt eines vollständigen
    Konsolenablaufs.
