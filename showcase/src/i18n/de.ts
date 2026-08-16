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

  nav: {
    themes: 'Themes',
    tokens: 'Farb-Token',
    scales: 'Skalen',
    typography: 'Schrift',
    icons: 'Symbole',
    components: 'Naive UI',
    own: 'Eigene',
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
    reset: 'Alle Zustände zurücksetzen',
    ruleState:
      'Der Toast erscheint, wenn der Zustand eintritt, und verschwindet, sobald die Ursache behoben ist.',
    ruleContent:
      'Ändert sich der Text bei bestehendem Zustand, wird nur der Text nachgezogen — kein neuer Toast bei jedem Tastendruck.',
    ruleDismiss:
      'Weggeklickt bleibt weggeklickt, solange der Zustand anhält. Kehrt er wieder, meldet er sich erneut.',
    ruleZero: 'Anzeigedauer 0 heißt: stehen lassen. Fehler bleiben ohnehin, bis man sie wegklickt.',
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
