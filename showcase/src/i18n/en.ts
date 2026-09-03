/**
 * Englischer Message-Katalog des Schaufensters.
 *
 * Die Struktur gibt `de.ts` vor — `MessageSchema` erzwingt dieselben Gruppen
 * und Schlüssel. Fehlt einer, ist `make typecheck` rot und nicht erst der
 * Browser. Was der Typ nicht sieht, prüft `tests/showcaseMessages.spec.ts`:
 * Platzhalter, Klammeraffen, leere Einträge.
 *
 * **Britisches Englisch**, nicht amerikanisches: Naive UI bekommt aus demselben
 * Grund `enGB` — ein Datum als `08/11/2026` ist für alle außer den USA eine
 * Falle. Wer die Schreibweise mischt, macht aus einer Entscheidung einen
 * Zufall, also hier „colour", „behaviour", „centred".
 */
import type { MessageSchema } from './de'

export const en: MessageSchema = {
  app: {
    title: 'UX-Foundation',
    brandLead: 'UX',
    brandAccent: 'Foundation',
    subtitle: 'What this package brings',
    intro:
      'Everything on this page comes from the package, not from the app. Switch the coat of paint at the top right and the same building blocks appear in every theme — that is what this page is for.',
  },

  areas: {
    basics: 'Basics',
    components: 'Components',
    behaviour: 'Behaviour',
  },

  nav: {
    themes: 'Themes',
    tokens: 'Colour tokens',
    scales: 'Scales',
    typography: 'Type',
    icons: 'Icons',
    components: 'Naive UI',
    own: 'Own',
    mobile: 'Mobile',
    patterns: 'Behaviour',
  },

  themes: {
    heading: 'Themes',
    hint: '{count} palettes. The coat of paint hangs on `data-theme` at the root element; the choice stays in the browser. The same name means the same colour in every app — otherwise the name is worth nothing.',
    active: 'active',
    barTreatment: 'Bars',
    switchLabel: 'Choose theme',
  },

  locale: {
    switchLabel: 'Choose language',
  },

  tokens: {
    heading: 'Colour tokens',
    hint: 'Values are RGB triples without a function (`10 10 10`), used as `rgb(var(--name))`. Only that way can opacity be added afterwards.',
    surfaces: 'Surfaces',
    text: 'Text',
    borders: 'Borders',
    accent: 'Accent',
    status: 'Status',
    assets: 'Categories',
    brand: 'Brand',
    bars: 'Bars',
    contrastAgainstCard: 'Contrast against the card surface',
    themeIndependent: 'theme-independent — does not change with the coat of paint',
  },

  scales: {
    heading: 'Scales',
    hint: 'No loose numbers in the styles. Anyone who needs a size that is not here has usually invented one step too many.',
    space: 'Spacing',
    radius: 'Radii',
    fontSizes: 'Font sizes',
    shadows: 'Shadows',
    shadowsHint:
      'Two steps. On a light ground the soft shadow carries, on a dark one the hairline light edge — there a shadow can only darken, and the surface is nearly black already. To check, switch the theme: both boxes have to read as “above” in every one.',
    shadowToast: 'Toast, message, menu, hint',
    shadowDialog: 'Dialog',
  },

  typography: {
    heading: 'Type',
    hint: 'Two families with clearly separated roles — no more. Numbers never change family, otherwise the column wanders.',
    ui: 'Interface, body text, all numbers',
    display: 'Wordmark, page titles, section headings',
    roles: 'Sizes and weights',
    role: 'Role',
    size: 'Size',
    weight: 'Weight',
    note: 'Other',
    roleWordmark: 'Wordmark',
    roleNavItem: 'Menu item, tab',
    roleCardTitle: 'Card title, field label',
    roleSectionLabel: 'Section heading',
    roleTableCell: 'Table cell',
    roleKpiValue: 'Metric value',
    noteWordmark: 'slightly negative tracking',
    noteNavItem: 'no capitals',
    noteSectionLabel: 'capitals, +0.025em',
    noteTableCell: 'numbers tabular-nums',
    sample: 'The quick brown fox jumps over the lazy dog — 1234567890',
    glyphSample: 'Ag',
    tabularSample: 'Tabular figures',
    tabularHint:
      'Numbers that carry meaning are set in `tabular-nums` and aligned right. Without that the digits jump on every refresh.',
  },

  icons: {
    heading: 'Icons',
    hint: 'One drawing style for everything: line icons, `currentColor`, stroke width 2, round caps. Recurring menu items carry the same icon across every app.',
    settingsNote:
      'For settings explicitly no cog. It already sits in every browser and system menu and says “something technical”; the sliders say “this is where you set values”.',
  },

  components: {
    heading: 'Components',
    hint: 'Naive UI, coloured through the bridge from the tokens. Without it the table, the dialogs and the input fields would run alongside the rest in colours of their own.',
    buttons: 'Buttons',
    inputs: 'Inputs',
    feedback: 'Feedback',
    table: 'Table',
    openDialog: 'Open dialog',
    dialogTitle: 'Example dialog',
    dialogBody:
      'Dialogs come from Naive UI and inherit their colours from the same tokens as the rest of the page.',
    confirm: 'Confirm',
    cancel: 'Cancel',
    tertiary: 'Tertiary',
    error: 'Error',
    inputPlaceholder: 'Enter text',
    optionAlpha: 'Alpha',
    optionBeta: 'Beta',
    tagOk: 'OK',
    /*
     * „Near", nicht „Close": Auf einem knopfähnlichen Etikett liest sich
     * „Close" zuerst als Verb — schließen. Gemeint ist die mittlere Stufe der
     * Reihe ok/near/out, und der Token daneben heißt `--status-near`.
     */
    tagNear: 'Near',
    tagOut: 'Out of range',
    alertTitle: 'Note',
    alertBody: 'The colours come from the same tokens as the rest of the page.',
  },

  table: {
    symbol: 'Symbol',
    name: 'Name',
    value: 'Value',
    change: 'Change',
  },

  demo: {
    dashboard: 'Dashboard',
    rebalancing: 'Rebalancing',
    instruments: 'Instruments',
    settings: 'Settings',
    exchanges: 'Exchanges',
    fx: 'FX',
    analysis: 'Analysis',
  },

  mobile: {
    heading: 'Mobile behaviour of the topbar',
    hint: 'Three real windows, not shrunken replicas: media queries follow the window, and an iframe has one of its own. A thumbnail would show the rules of the full width and prove the opposite.',
    phone: 'Phone — icons only, no wordmark',
    small: 'below md — icons, wordmark back again',
    desktop: 'from md — labels visible',
    ruleLabels:
      'Below md the label goes, not the menu item. Four icons fit on any phone.',
    ruleWordmark: 'Below sm the wordmark goes as well; the badge stays.',
    ruleHamburger:
      'No hamburger. It only becomes necessary once the items no longer fit in one line even as icons — and that usually means too much sits in the main menu.',
    ruleA11y:
      'The label disappears visibly only. For assistive technology it stays — an icon without a name is a button without a name.',
  },

  index: {
    label: 'In this section',
  },

  own: {
    heading: 'Own components',
    hint: 'What this package brings itself. Two of them are on screen right now — the bar at the top and the status bar at the bottom.',
    inlineHeading: 'Inline editing',
    inlineHint:
      'At rest the value looks like text; an input field per cell would cover the table in borders. A click turns it into a field, Enter or clicking away commits, Escape discards. The target carries a pale cross on the left for clearing it — the holding does not, because there an empty field means nothing.',
    units: 'Holding',
    target: 'Target %',
    targetSum: 'Sum of targets',
    edit: 'Edit',
    clear: 'Clear',
    navHeading: 'Menu item',
    navHint:
      'UxNavItem — icon and label, below it the underline on the active item. A coloured box would compete with the cards underneath, an underline does not. Navigation does not happen here: one app has a router, the next one hash tabs — the address comes in, the event goes out.',
    navResize:
      'Drag the window below 768 px: the label goes, the item stays. For screen readers it remains — an icon without a name is a button without a name.',
    hintHeading: 'Explanation at the term',
    hintHint:
      'UxInfoHint — two or three sentences where the question arises. Anyone who reads a term and pauses is not going to look for a help page. A hint holds up to two links in one line: on the left the background, on the right the setting. Both are real addresses from the app — the package knows neither routes nor catalogue.',
    hintTerm: 'Investment reserve',
    hintText:
      'The share deliberately left uninvested — a buffer for buying more later. It does not count as a position when rebalancing.',
    hintMore: 'More on this →',
    hintSetting: 'To the setting →',
    caretHeading: 'Caret for expandable things',
    caretHint:
      'UxCaret — a shape instead of a character. The ⌄ (U+2304) used before sits low in its em square: the box is centred, the character inside clings to the bottom — and turned by 180° it tips upwards. A fixed optical correction therefore only ever fits one of the two states. The path here lies symmetrically around the centre of the box, so the rotation does not move it.',
    caretFlip: 'flip — closed points down, open points up: “something opens here”',
    caretTurn: 'turn — open points down, closed to the side: “something hangs underneath”',
    caretToggle: 'Toggle',
    caretSizes:
      'Two steps: sm and md. The places it was found in had four different sizes that nobody had decided on.',
    barsHeading: 'Topbar and status bar',
    topbarNote:
      'The bar at the top is UxTopbar: badge with a fixed brand gradient, wordmark as HTML text in --font-display, and on the right only what is not navigation.',
    statusbarNote:
      'The bar at the bottom is UxStatusBar: on the left the origin and state of the data, on the right the technical state. The dot is clickable — anyone who sees a red light wants to know why.',
  },

  patterns: {
    heading: 'Behaviour',
    hint: 'The interesting rule sits in the toast: a message describes a state, not an event. Toggle it and watch — it goes by itself as soon as the cause is gone.',
    quotesMissingTitle: 'Quotes missing',
    quotesMissingBody: '{count} quotes could not be loaded.',
    targetsTitle: 'Targets above 100 %',
    targetsBody:
      'The target shares add up to more than 100 %. As long as that holds, the suggestions do not add up either.',
    missingCount: 'Count',
    seconds: 'Display duration',
    secondsZero: 'stays put',
    secondsCount: 'fades after {n} s',
    closesIn: 'closes in {n} s',
    reset: 'Reset every state',
    ruleState:
      'The toast appears when the state occurs and disappears as soon as the cause is fixed.',
    ruleContent:
      'If the text changes while the state holds, only the text is updated — no new toast on every keystroke.',
    ruleDismiss:
      'Dismissed stays dismissed as long as the state lasts. If it returns, it reports again.',
    ruleZero:
      'A display duration of 0 means: leave it standing. Errors stay anyway until they are dismissed.',
    ruleProgress:
      'The remaining time runs as a bar along the bottom edge, not as text — that saves a line and distracts less. For assistive technology it stays on as a label on the bar.',
    ruleStack:
      'Three at once is the maximum — when a fourth arrives, the oldest gives way. In the first run of the experiment three out of five are left.',
    stackTitle: 'Message {n}',
    stackBody: 'Number {n} of {max} — triggered in a staggered way so the shifting becomes visible.',
    stackTrigger: '{n} messages one after another',
    stackHint:
      'Two things are only visible in a stack: where the first message opens — below the controls of the topbar, not on top of them — and what happens when more states hold than there is room for. Five against a maximum of three is deliberately too many.',
    statusbar: 'Status bar',
    statusbarHint:
      'On the left the origin and state of the data, on the right the technical state. The dot is clickable — anyone who sees a red light wants to know why.',
  },

  status: {
    poweredBy: 'powered by',
    context: 'Example portfolio, 6 positions',
    quotes: 'Quotes just now',
    version: 'v0.1.0',
    online: 'reachable',
  },

  common: {
    token: 'Token',
    valueLabel: 'Value',
    copy: 'Copy',
    copied: 'Copied',
  },
}
