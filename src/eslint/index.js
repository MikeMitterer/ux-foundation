/**
 * Bausteine für die ESLint-Konfiguration einbindender Apps.
 *
 * **JavaScript und nicht TypeScript**, entgegen dem übrigen Paket: Eine
 * `eslint.config.js` lädt **Node** direkt, nicht ein Bündler. Der
 * Runtime-Export muss deshalb von jeder unterstützten Node-Fassung ausführbar
 * sein. Die Typen liegen daneben in `index.d.ts`.
 *
 * Erzeugt wird Konfiguration für Regeln, die ESLint mitbringt — geprüft wird
 * hier nichts. Erfasst werden:
 *
 * - der nackte Name (`no-restricted-globals`, **mit** Sichtbarkeitsanalyse),
 * - der Zugriff über ein Wirtsobjekt in Punkt- und Klammernotation sowie die
 *   Destrukturierung (`no-restricted-properties`),
 * - die statischen Formen wie `Reflect.get(host, 'name')` über einen Selektor,
 *   der Methode, Wirtsobjekt und Position der Zeichenkette prüft.
 *
 * **Zwei Grenzen, beide syntaktisch bedingt:**
 *
 * 1. Nur der nackte Name wird über die Sichtbarkeit aufgelöst. Ein lokal
 *    überdecktes Wirtsobjekt — `function read(window) { return window.x }` —
 *    meldet ESLint weiterhin, weil `no-restricted-properties` rein syntaktisch
 *    arbeitet.
 * 2. Ein zur Laufzeit zusammengesetzter Schlüssel (`window['local' + 'Storage']`)
 *    wird nicht gefunden.
 *
 * **Alle Sperren gehören in *einen* Aufruf.** Die Funktionen belegen feste
 * Regel-Kennungen, und je Konfigurationsblock gibt es eine Kennung nur einmal —
 * ein zweiter Aufruf daneben ersetzt den ersten. Nutzt die App
 * `no-restricted-syntax` auch selbst, führt sie ihre Einträge mit den hier
 * erzeugten zusammen.
 *
 * Eine Datei vom Verbot auszunehmen geschieht über den Geltungsbereich der
 * Konfiguration (`ignores`), nicht durch Abschalten der Regeln: Das träfe auch
 * Einschränkungen, die die App unabhängig gesetzt hat.
 */

/** Namen, unter denen das globale Objekt im Browser steht. */
const DEFAULT_HOSTS = ['window', 'globalThis', 'self']

/**
 * Statische Methoden, deren **zweites** Argument ein Eigenschaftsname ist.
 *
 * Die Liste ist nötig und keine verfallende Kopie: Ob Argument 2 ein
 * Property-Key ist, entscheidet die Methode, nicht das Objekt davor.
 * `Reflect.apply(window, 'x', [])` übergibt an dieser Stelle den `this`-Wert,
 * `Object.assign(window, 'x')` eine Quelle, `Object.is(window, 'x')` einen
 * Vergleichswert — keine davon liest eine Eigenschaft.
 */
const PROPERTY_KEY_METHODS = {
  Reflect: ['get', 'set', 'has', 'deleteProperty', 'defineProperty', 'getOwnPropertyDescriptor'],
  Object: ['defineProperty', 'getOwnPropertyDescriptor', 'hasOwn'],
}

/**
 * Verbietet den direkten Griff auf globale Namen — in Skripten.
 *
 * Gilt für `.ts`/`.js` und den `<script>`-Teil einer SFC. Für den Template-Teil
 * kommt `noDirectGlobalsInTemplates` dazu.
 *
 * @param {import('./index.d.ts').DirectGlobalOptions[]} restrictions
 *   Alle Sperren auf einmal — siehe Hinweis zur Komposition im Kopf.
 * @returns {Record<string, unknown>} Ein `rules`-Objekt für die Flat-Config.
 */
export function noDirectGlobals(restrictions) {
  return {
    'no-restricted-globals': [
      'error',
      ...restrictions.map(({ name, message }) => ({ name, message })),
    ],
    'no-restricted-properties': [
      'error',
      ...restrictions.flatMap(({ name, message, via }) =>
        (via ?? DEFAULT_HOSTS).map((object) => ({ object, property: name, message })),
      ),
    ],
    'no-restricted-syntax': ['error', ...restrictions.flatMap(staticAccessorEntries)],
  }
}

/**
 * Dieselben Sperren für die Ausdrücke eines Vue-Templates.
 *
 * Ein Template ist ausführbarer Code; die Kernregeln greifen dort nicht.
 * Braucht `eslint-plugin-vue` in der Konfiguration der App.
 *
 * @param {import('./index.d.ts').DirectGlobalOptions[]} restrictions Alle Sperren auf einmal.
 * @returns {Record<string, unknown>} Ein `rules`-Objekt für die Flat-Config.
 */
export function noDirectGlobalsInTemplates(restrictions) {
  return {
    'vue/no-restricted-syntax': [
      'error',
      ...restrictions.flatMap((restriction) => {
        const { name, message, via } = restriction
        const hosts = via ?? DEFAULT_HOSTS

        return [
          ...hosts.map((host) => ({
            selector: `MemberExpression[object.name='${host}'][property.name='${name}']`,
            message,
          })),
          ...hosts.map((host) => ({
            selector: `MemberExpression[object.name='${host}'][computed=true] > Literal[value='${name}']`,
            message,
          })),
          ...staticAccessorEntries(restriction),
        ]
      }),
    ],
  }
}

/**
 * Selektoren für `Reflect.get(window, 'name')` und verwandte Formen.
 *
 * Drei Bedingungen müssen zusammenkommen, und jede einzelne ist nötig:
 * die **Methode** aus `PROPERTY_KEY_METHODS`, als **erstes** Argument das
 * Wirtsobjekt und als **zweites** die gesuchte Zeichenkette. Fehlt die erste,
 * schlägt `Reflect.apply(window, 'name', [])` an, wo die Zeichenkette der
 * `this`-Wert ist; fehlt die zweite, schlägt `Reflect.get(config, 'name')` an,
 * wo `config` ein beliebiger lokaler Wert ist.
 *
 * @param {import('./index.d.ts').DirectGlobalOptions} restriction Eine Sperre.
 * @returns {{ selector: string, message: string }[]} Einträge für `no-restricted-syntax`.
 */
function staticAccessorEntries({ name, message, via }) {
  return (via ?? DEFAULT_HOSTS).flatMap((host) =>
    Object.entries(PROPERTY_KEY_METHODS).map(([accessor, methods]) => ({
      selector:
        `CallExpression[callee.object.name='${accessor}']` +
        `[callee.property.name=/^(${methods.join('|')})$/]` +
        `[arguments.0.name='${host}'][arguments.1.value='${name}']`,
      message,
    })),
  )
}
