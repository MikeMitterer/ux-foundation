/**
 * Bausteine für die ESLint-Konfiguration einbindender Apps.
 *
 * **JavaScript und nicht TypeScript**, entgegen dem übrigen Paket: Eine
 * `eslint.config.js` lädt Node direkt, nicht ein Bündler. Node führt eine
 * `.ts`-Datei erst ab Fassung 22 aus; ältere brechen mit
 * `ERR_UNKNOWN_FILE_EXTENSION` ab. Die Typen liegen daneben in `index.d.ts`.
 *
 * Erzeugt wird Konfiguration für Regeln, die ESLint mitbringt — geprüft wird
 * hier nichts. Erfasst werden:
 *
 * - der nackte Name (`no-restricted-globals`, **mit** Sichtbarkeitsanalyse),
 * - der Zugriff über ein Wirtsobjekt in Punkt- und Klammernotation sowie die
 *   Destrukturierung (`no-restricted-properties`),
 * - die statischen Formen `Reflect.*(host, 'name')` und `Object.*(host, 'name')`
 *   über einen Selektor, der Wirtsobjekt **und** Position der Zeichenkette prüft.
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
 * Regel-Kennungen; zwei Aufrufe nebeneinander überschrieben einander. Nutzt die
 * App `no-restricted-syntax` auch selbst, muss sie ihre Einträge mit den hier
 * erzeugten zusammenführen — eine Regel-Kennung gibt es je Konfigurationsblock
 * nur einmal.
 *
 * Eine Datei vom Verbot auszunehmen geschieht über den Geltungsbereich der
 * Konfiguration (`ignores`), nicht durch Abschalten der Regeln: Das träfe auch
 * Einschränkungen, die die App unabhängig gesetzt hat.
 */

/** Namen, unter denen das globale Objekt im Browser steht. */
const DEFAULT_HOSTS = ['window', 'globalThis', 'self']

/** Statische Formen, die Wirtsobjekt und Eigenschaftsnamen als Argumente nehmen. */
const STATIC_ACCESSORS = ['Reflect', 'Object']

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
 * Geprüft werden **beide** Argumentpositionen: erstes Argument das
 * Wirtsobjekt, zweites die gesuchte Zeichenkette. Ohne die erste Bedingung
 * schlüge auch `Reflect.get(config, 'name')` an, wo `config` ein beliebiger
 * lokaler Wert ist.
 *
 * Aufgezählt wird das Wirtsobjekt, nicht die Methode — `deleteProperty`,
 * `defineProperty` und `getOwnPropertyDescriptor` fallen damit mit hinein.
 *
 * @param {import('./index.d.ts').DirectGlobalOptions} restriction Eine Sperre.
 * @returns {{ selector: string, message: string }[]} Einträge für `no-restricted-syntax`.
 */
function staticAccessorEntries({ name, message, via }) {
  return (via ?? DEFAULT_HOSTS).flatMap((host) =>
    STATIC_ACCESSORS.map((accessor) => ({
      selector:
        `CallExpression[callee.object.name='${accessor}']` +
        `[arguments.0.name='${host}'][arguments.1.value='${name}']`,
      message,
    })),
  )
}
