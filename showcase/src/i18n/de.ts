/**
 * Deutscher Message-Katalog — Source of Truth für die Key-Struktur.
 *
 * Deutsch ist die Basissprache, `en.ts` zieht nach. Diese Datei entscheidet,
 * welche Schlüssel es gibt; der abgeleitete Typ `Katalog` unten hält die
 * Übersetzung daran fest.
 */
export const de = {
  app: {
    title: 'UX-Foundation',
    brandLead: 'UX',
    brandAccent: 'Foundation',
    subtitle: 'Was dieses Paket mitbringt',
    intro:
      'Alles auf dieser Seite kommt aus dem Paket und nicht aus der App. Wer den Anstrich oben rechts wechselt, sieht dieselben Bausteine in jedem Theme — genau dafür ist die Seite da.',
  },

  areas: {
    basics: 'Grundlagen',
    components: 'Komponenten',
    behaviour: 'Verhalten',
  },

  nav: {
    themes: 'Themes',
    tokens: 'Farb-Token',
    scales: 'Skalen',
    typography: 'Schrift',
    icons: 'Symbole',
    components: 'Naive UI',
    own: 'Eigene',
    mobile: 'Mobil',
    patterns: 'Verhalten',
  },

  themes: {
    heading: 'Themes',
    /*
     * Die Zahl kommt aus `THEME_IDS`, sie steht nicht im Text: Ein Katalog, der
     * „Dreizehn Paletten" behauptet, ist beim vierzehnten falsch — und dann
     * gleich in beiden Sprachen.
     */
    hint: '{count} Paletten. Der Anstrich hängt an `data-theme` am Wurzelelement; die Wahl bleibt im Browser gespeichert. Gleicher Name heißt in jeder App dieselbe Farbe — sonst hat der Name keinen Wert.',
    active: 'aktiv',
    barTreatment: 'Leisten',
    switchLabel: 'Theme wählen',
  },

  /*
   * Nur die Beschriftung. Die Sprachnamen selbst sind Endonyme und stehen als
   * Konstante in `i18n/index.ts` — sie dürfen sich mit der Sprache gerade
   * nicht ändern.
   */
  locale: {
    switchLabel: 'Sprache wählen',
  },

  tokens: {
    heading: 'Farb-Token',
    hint: 'Werte stehen als RGB-Tripel ohne Funktion (`10 10 10`), verwendet als `rgb(var(--name))`. Nur so lässt sich Deckkraft nachträglich anlegen.',
    surfaces: 'Flächen',
    text: 'Text',
    borders: 'Ränder',
    accent: 'Akzent',
    status: 'Status',
    assets: 'Kategorien',
    brand: 'Marke',
    bars: 'Leisten',
    contrastAgainstCard: 'Kontrast gegen die Kartenfläche',
    themeIndependent: 'themeunabhängig — ändert sich mit dem Anstrich nicht',
  },

  scales: {
    heading: 'Skalen',
    hint: 'Keine losen Zahlen im Stil. Wer eine Größe braucht, die es hier nicht gibt, hat meistens eine Stufe zu viel erfunden.',
    space: 'Abstände',
    radius: 'Radien',
    fontSizes: 'Schriftgrößen',
    shadows: 'Schatten',
    shadowsHint:
      'Zwei Stufen. Auf hellem Grund trägt der weiche Schatten, auf dunklem die haarfeine helle Kante — dort kann ein Schatten nur abdunkeln, und die Fläche ist schon fast schwarz. Zum Prüfen das Theme wechseln: Beide Kästen müssen in jedem Theme als „darüber" zu lesen sein.',
    shadowToast: 'Toast, Meldung, Menü, Hinweis',
    shadowDialog: 'Dialog',
  },

  typography: {
    heading: 'Schrift',
    hint: 'Zwei Familien mit klar getrennten Rollen — mehr nicht. Zahlen wechseln nie die Familie, sonst wandert die Spalte.',
    ui: 'Oberfläche, Fließtext, alle Zahlen',
    display: 'Wortmarke, Seitentitel, Abschnittsüberschriften',
    roles: 'Größen und Gewichte',
    role: 'Rolle',
    size: 'Größe',
    weight: 'Gewicht',
    note: 'Sonstiges',
    /*
     * Die Rollen-Tabelle. Sie stand einmal als Konstante im Template und war
     * damit halb übersetzt: Kopfzeile aus dem Katalog, Inhalt fest verdrahtet
     * deutsch. Größe und Gewicht bleiben dort — das sind Werte, keine Texte.
     */
    roleWordmark: 'Wortmarke',
    roleNavItem: 'Menüpunkt, Reiter',
    roleCardTitle: 'Kartentitel, Feldbeschriftung',
    roleSectionLabel: 'Abschnittsüberschrift',
    roleTableCell: 'Tabellenzelle',
    roleKpiValue: 'Wert einer Kennzahl',
    noteWordmark: 'leicht negative Laufweite',
    noteNavItem: 'keine Großbuchstaben',
    noteSectionLabel: 'Großbuchstaben, +0.025em',
    noteTableCell: 'Zahlen tabular-nums',
    sample: 'Fast jeder Wunsch bringt Verzicht mit sich — 1234567890',
    /* Probeglyphen der Textfarben-Kachel — „Ag" zeigt Ober- und Unterlänge. */
    glyphSample: 'Ag',
    tabularSample: 'Tabellenziffern',
    tabularHint:
      'Zahlen mit Bedeutung tragen `tabular-nums` und stehen rechtsbündig. Ohne das springen die Ziffern beim Aktualisieren.',
  },

  icons: {
    heading: 'Symbole',
    hint: 'Ein Zeichenstil für alles: Strichsymbole, `currentColor`, Strichstärke 2, runde Enden. Wiederkehrende Menüpunkte tragen über alle Apps dasselbe Symbol.',
    settingsNote:
      'Für die Einstellungen ausdrücklich kein Zahnrad. Das steckt schon in jedem Browser- und Systemmenü und sagt „irgendetwas technisches"; die Schieberegler sagen „hier stellt man Werte ein".',
  },

  components: {
    heading: 'Komponenten',
    hint: 'Naive UI, eingefärbt über die Brücke aus den Token. Ohne sie liefen Tabelle, Dialoge und Eingabefelder farblich neben dem Rest her.',
    buttons: 'Knöpfe',
    inputs: 'Eingaben',
    feedback: 'Rückmeldung',
    table: 'Tabelle',
    openDialog: 'Dialog öffnen',
    dialogTitle: 'Beispiel-Dialog',
    dialogBody:
      'Dialoge kommen aus Naive UI und erben ihre Farben aus denselben Token wie der Rest der Seite.',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    tertiary: 'Tertiär',
    error: 'Fehler',
    inputPlaceholder: 'Text eingeben',
    /*
     * Platzhalter für die Auswahlliste. Auch sie stehen im Katalog: „Alpha"
     * schreibt sich in beiden Sprachen gleich, aber das ist ein Zufall des
     * Wortes und keine Regel — die Ausnahme wäre die Stelle, an der beim
     * nächsten Mal wieder ein deutsches Wort im Template landet.
     */
    optionAlpha: 'Alpha',
    optionBeta: 'Beta',
    tagOk: 'OK',
    tagNear: 'Knapp',
    tagOut: 'Außerhalb',
    alertTitle: 'Hinweis',
    alertBody: 'Die Farben stammen aus denselben Token wie der Rest der Seite.',
  },

  table: {
    symbol: 'Symbol',
    name: 'Name',
    value: 'Wert',
    change: 'Veränderung',
  },

  demo: {
    dashboard: 'Übersicht',
    rebalancing: 'Ausgleichen',
    instruments: 'Papiere',
    settings: 'Einstellungen',
    exchanges: 'Börsen',
    fx: 'Devisen',
    analysis: 'Analyse',
  },

  mobile: {
    heading: 'Mobil-Verhalten der Kopfzeile',
    /*
     * Ohne Klammeraffen formuliert: vue-i18n liest ihn als Marker für eine
     * verknüpfte Nachricht und bricht beim Kompilieren ab — sichtbar nur im
     * Browser, nicht im Build.
     */
    hint: 'Drei echte Fenster, keine verkleinerten Nachbauten: Media-Abfragen richten sich nach dem Fenster, und ein iframe hat ein eigenes. Eine Miniatur zeigte die Regeln der vollen Breite und bewiese damit das Gegenteil.',
    phone: 'Telefon — nur Symbole, keine Wortmarke',
    small: 'unter md — Symbole, Wortmarke wieder da',
    desktop: 'ab md — Beschriftungen sichtbar',
    ruleLabels:
      'Unterhalb md fällt die Beschriftung weg, nicht der Menüpunkt. Vier Symbole passen auf jedes Telefon.',
    ruleWordmark: 'Unterhalb sm fällt zusätzlich die Wortmarke; die Plakette bleibt.',
    ruleHamburger:
      'Kein Hamburger. Er wird erst nötig, wenn die Punkte auch als Symbole nicht mehr in eine Zeile passen — das ist meist ein Zeichen, dass zu viel im Hauptmenü steht.',
    ruleA11y:
      'Die Beschriftung verschwindet nur sichtbar. Für Hilfstechnik bleibt sie stehen — ein Symbol ohne Namen ist ein Knopf ohne Namen.',
  },

  index: {
    label: 'In diesem Abschnitt',
  },

  own: {
    heading: 'Eigene Komponenten',
    hint: 'Was dieses Paket selbst mitbringt. Zwei davon stehen gerade auf dem Bildschirm — die Kopfzeile oben und die Statuszeile unten.',
    inlineHeading: 'Inline-Editing',
    inlineHint:
      'Im Ruhezustand sieht der Wert wie Text aus; ein Eingabefeld je Zelle würde die Tabelle mit Rahmen überziehen. Klick macht daraus ein Feld, Enter oder Wegklicken übernimmt, Escape verwirft. Beim Ziel liegt links ein blasses Kreuz zum Leeren — beim Bestand nicht, dort bedeutet leer nichts.',
    units: 'Bestand',
    target: 'Ziel %',
    targetSum: 'Summe der Ziele',
    edit: 'Bearbeiten',
    clear: 'Leeren',
    navHeading: 'Menüpunkt',
    navHint:
      'UxNavItem — Symbol und Beschriftung, darunter der Strich am aktiven Punkt. Ein eingefärbter Kasten würde mit den Karten darunter konkurrieren, ein Strich tut das nicht. Navigiert wird nicht hier: Die eine App hat einen Router, die andere Hash-Tabs — die Adresse kommt herein, das Ereignis geht hinaus.',
    navResize:
      'Fenster unter 768 px ziehen: Die Beschriftung fällt weg, der Punkt bleibt. Für Vorleseprogramme bleibt sie erhalten — ein Symbol ohne Namen ist ein Knopf ohne Namen.',
    hintHeading: 'Erklärung am Begriff',
    hintHint:
      'UxInfoHint — zwei, drei Sätze dort, wo die Frage entsteht. Wer einen Begriff liest und stutzt, sucht keine Hilfeseite. Im Hinweis stehen bis zu zwei Verweise in einer Zeile: links die Vertiefung, rechts die Stellschraube. Beide sind echte Adressen aus der App — das Paket kennt weder Routen noch Katalog.',
    hintTerm: 'Investitionsreserve',
    hintText:
      'Der Anteil, der bewusst nicht investiert wird — als Puffer für Nachkäufe. Er zählt beim Ausgleichen nicht als Position.',
    hintMore: 'Mehr dazu →',
    hintSetting: 'Zur Einstellung →',
    caretHeading: 'Pfeil für Aufklappbares',
    caretHint:
      'UxCaret — eine Form statt eines Zeichens. Das früher verwendete ⌄ (U+2304) sitzt tief in seinem Em-Quadrat: Der Kasten steht mittig, das Zeichen darin klebt unten — und beim Drehen um 180° kippt es nach oben. Eine feste optische Korrektur trifft deshalb immer nur einen der beiden Zustände. Der Pfad hier liegt symmetrisch um die Kastenmitte, die Drehung verschiebt ihn nicht.',
    caretFlip: 'flip — zu zeigt nach unten, offen nach oben: „hier geht etwas auf"',
    caretTurn: 'turn — offen zeigt nach unten, zu zur Seite: „hier hängt etwas darunter"',
    caretToggle: 'Umschalten',
    caretSizes: 'Zwei Stufen: sm und md. Die Fundstellen hatten vier verschiedene Größen, die niemand entschieden hat.',
    barsHeading: 'Kopf- und Statuszeile',
    topbarNote:
      'Die Kopfzeile oben ist UxTopbar: Plakette mit festem Markenverlauf, Wortmarke als HTML-Text in --font-display, rechts nur, was keine Navigation ist.',
    statusbarNote:
      'Die Statuszeile unten ist UxStatusBar: links Herkunft und Zustand der Daten, rechts der technische Stand. Der Punkt ist anklickbar — wer ein rotes Licht sieht, will wissen, woran es liegt.',
  },

  patterns: {
    heading: 'Verhalten',
    hint: 'Die interessante Regel steckt im Toast: Eine Meldung beschreibt einen Zustand, kein Ereignis. Umschalten und zusehen — sie geht von selbst, sobald die Ursache weg ist.',
    quotesMissingTitle: 'Kurse fehlen',
    quotesMissingBody: '{count} Kurse konnten nicht geladen werden.',
    targetsTitle: 'Ziele über 100 %',
    targetsBody: 'Die Zielanteile ergeben mehr als 100 %. Solange das gilt, gehen auch die Vorschläge nicht auf.',
    missingCount: 'Anzahl',
    seconds: 'Anzeigedauer',
    secondsZero: 'bleibt stehen',
    secondsCount: 'blendet nach {n} s aus',
    closesIn: 'schließt in {n} s',
    reset: 'Alle Zustände zurücksetzen',
    ruleState:
      'Der Toast erscheint, wenn der Zustand eintritt, und verschwindet, sobald die Ursache behoben ist.',
    ruleContent:
      'Ändert sich der Text bei bestehendem Zustand, wird nur der Text nachgezogen — kein neuer Toast bei jedem Tastendruck.',
    ruleDismiss:
      'Weggeklickt bleibt weggeklickt, solange der Zustand anhält. Kehrt er wieder, meldet er sich erneut.',
    ruleZero: 'Anzeigedauer 0 heißt: stehen lassen. Fehler bleiben ohnehin, bis man sie wegklickt.',
    ruleProgress:
      'Die Restzeit läuft als Balken an der Unterkante ab, nicht als Text — das spart eine Zeile und lenkt weniger ab. Für Hilfstechnik steht sie weiterhin als Beschriftung am Balken.',
    ruleStack:
      'Drei gleichzeitig sind das Höchstmaß — kommt eine vierte, weicht die älteste. Im ersten Durchlauf des Versuchs bleiben von fünf also drei.',
    stackTitle: 'Meldung {n}',
    stackBody: 'Die {n}. von {max} — gestaffelt ausgelöst, damit das Nachrücken sichtbar wird.',
    stackTrigger: '{n} Meldungen nacheinander',
    stackHint:
      'Zwei Dinge sieht man nur im Stapel: wo die erste Meldung aufgeht — unter den Bedienelementen der Kopfzeile, nicht auf ihnen —, und was bei mehr Zuständen als Platz passiert. Fünf gegen ein Höchstmaß von drei ist mit Absicht zu viel.',
    statusbar: 'Statuszeile',
    statusbarHint:
      'Links Herkunft und Zustand der Daten, rechts der technische Stand. Der Punkt ist anklickbar — wer ein rotes Licht sieht, will wissen, woran es liegt.',
  },

  status: {
    poweredBy: 'powered by',
    context: 'Beispiel-Depot, 6 Positionen',
    quotes: 'Kurse gerade eben',
    version: 'v0.1.0',
    online: 'erreichbar',
  },

  common: {
    token: 'Token',
    valueLabel: 'Wert',
    copy: 'Kopieren',
    copied: 'Kopiert',
  },
}

/**
 * Die Form, an die jeder weitere Katalog gebunden ist.
 *
 * Bewusst **ohne** `as const`: Damit trüge der Typ die Literale
 * („UX-Foundation"), und gegen die ließe sich keine Übersetzung prüfen — sie
 * müsste wörtlich dasselbe sagen. Verbreitert auf `string` bleibt genau das
 * übrig, was zählt: gleiche Gruppen, gleiche Schlüssel, nichts darüber und
 * nichts darunter. Fehlt einer in `en.ts`, ist `make typecheck` rot.
 *
 * Das ist die Absicherung, die die Repo-Regel für eine zweite Quelle verlangt.
 * Was ein Typ nicht sehen kann — Platzhalter, Klammeraffen, leere Einträge —,
 * prüft `tests/showcaseMessages.spec.ts`.
 */
export type MessageSchema = typeof de
