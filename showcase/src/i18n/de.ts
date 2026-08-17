/**
 * Deutscher Message-Katalog — Source of Truth für die Key-Struktur.
 *
 * Deutsch ist die Basissprache; Englisch wird nachgezogen, sobald es einen
 * Grund gibt. Bis dahin genügt ein Katalog — die Pflicht, allen sichtbaren
 * Text darüber laufen zu lassen, gilt trotzdem ab der ersten Komponente.
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
    hint: 'Dreizehn Paletten. Der Anstrich hängt an `data-theme` am Wurzelelement; die Wahl bleibt im Browser gespeichert. Gleicher Name heißt in jeder App dieselbe Farbe — sonst hat der Name keinen Wert.',
    active: 'aktiv',
    barTreatment: 'Leisten',
    switchLabel: 'Theme wählen',
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
    sample: 'Fast jeder Wunsch bringt Verzicht mit sich — 1234567890',
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
    inputPlaceholder: 'Text eingeben',
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
} as const

export type MessageSchema = typeof de
